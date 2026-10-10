import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'All'

    const pool = getDbPool()

    let whereConditions: string[] = []
    let queryParams: any[] = []

    if (status === 'Active') {
      whereConditions.push('(u.disabled = false AND u.suspended = false)')
    } else if (status === 'Inactive') {
      whereConditions.push('(u.disabled = true OR u.suspended = true)')
    }

    if (search.trim()) {
      queryParams.push(`%${search.trim()}%`)
      const paramIdx = queryParams.length
      whereConditions.push(`(
        u.email ILIKE $${paramIdx} OR 
        p.first_name ILIKE $${paramIdx} OR 
        p.last_name ILIKE $${paramIdx} OR 
        p.full_name ILIKE $${paramIdx} OR
        u.ctag ILIKE $${paramIdx}
      )`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const sql = `
      SELECT 
        u.id,
        COALESCE(
          NULLIF(p.full_name, ''), 
          NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''), 
          split_part(u.email, '@', 1)
        ) as name,
        u.email,
        CASE WHEN (u.disabled = true OR u.suspended = true) THEN 'Inactive' ELSE 'Active' END as status,
        COALESCE(u.tags, 'Bronze') as "vipTier",
        (COALESCE(a.amount_cents, 0)::numeric / 100.0) as balance,
        COALESCE(a.currency, 'EUR') as currency,
        COALESCE(p.country, u.ctag, 'EU') as country,
        COALESCE(TO_CHAR(u.last_sign_in_at, 'YYYY-MM-DD HH24:MI:SS'), TO_CHAR(u.updated_at, 'YYYY-MM-DD'), 'Never') as "lastLogin",
        COALESCE(TO_CHAR(u.created_at, 'YYYY-MM-DD'), '2026-01-01') as "registeredAt"
      FROM users_view u
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, amount_cents, currency 
        FROM accounts_view 
        ORDER BY user_id, id DESC NULLS LAST
      ) a ON a.user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, first_name, last_name, full_name, country 
        FROM profiles_view 
        ORDER BY user_id, id DESC NULLS LAST
      ) p ON p.user_id = u.id
      ${whereClause}
      ORDER BY u.id DESC
      LIMIT 200;
    `

    const res = await pool.query(sql, queryParams)

    return NextResponse.json({
      success: true,
      data: res.rows,
      total: res.rowCount,
      source: 'postgresql'
    })
  } catch (err: any) {
    console.warn('[GET /api/players Warning]:', err.message)
    return NextResponse.json({
      success: false,
      error: err.message,
      data: []
    }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pool = getDbPool()

    const {
      name = 'New Player',
      email,
      status = 'Active',
      vip_tier = 'Bronze',
      balance = 0,
      currency = 'EUR',
      country = 'EU'
    } = body

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const disabled = status === 'Inactive'
    const amountCents = Math.round(Number(balance || 0) * 100)

    // Name parts
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || 'Player'
    const lastName = nameParts.slice(1).join(' ') || ''

    // Insert or update users_view
    const userRes = await pool.query(`
      INSERT INTO users_view (id, email, disabled, suspended, tags, ctag, created_at, updated_at, last_sign_in_at)
      VALUES (
        COALESCE((SELECT MAX(id) FROM users_view), 1000) + 1,
        $1, $2, false, $3, $4, NOW(), NOW(), NOW()
      )
      RETURNING id;
    `, [email, disabled, vip_tier, country])

    const userId = userRes.rows[0].id

    // Insert accounts_view
    await pool.query(`
      INSERT INTO accounts_view (id, user_id, amount_cents, currency, created_at, updated_at)
      VALUES (
        COALESCE((SELECT MAX(id) FROM accounts_view), 5000) + 1,
        $1, $2, $3, NOW(), NOW()
      );
    `, [userId, amountCents, currency])

    // Insert profiles_view
    await pool.query(`
      INSERT INTO profiles_view (id, user_id, first_name, last_name, full_name, country, created_at, updated_at)
      VALUES (
        COALESCE((SELECT MAX(id) FROM profiles_view), 5000) + 1,
        $1, $2, $3, $4, $5, NOW(), NOW()
      );
    `, [userId, firstName, lastName, name, country])

    return NextResponse.json({
      success: true,
      id: userId,
      message: 'Player successfully added to database'
    })
  } catch (err: any) {
    console.error('[POST /api/players Error]:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
