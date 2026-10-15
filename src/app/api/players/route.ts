import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 5000
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

function parsePositiveInteger(value: string | null, fallback: number, maximum?: number) {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1) return null
  return maximum ? Math.min(parsed, maximum) : parsed
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('PLAYER_QUERY_TIMEOUT')), ms)
    promise.then(
      (value) => {
        clearTimeout(timeout)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timeout)
        reject(error)
      },
    )
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parsePositiveInteger(searchParams.get('page'), 1)
  const limit = parsePositiveInteger(searchParams.get('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
  const search = (searchParams.get('search') || '').trim()
  const status = searchParams.get('status') || 'All'

  if (
    page === null ||
    limit === null ||
    !Number.isSafeInteger((page - 1) * limit) ||
    !['All', 'Active', 'Inactive', 'Unknown'].includes(status)
  ) {
    return NextResponse.json({ success: false, error: 'Invalid player query parameters.' }, { status: 400 })
  }

  const offset = (page - 1) * limit
  const parameters: (string | number)[] = []
  const conditions: string[] = []

  if (status === 'Active') {
    conditions.push('u.disabled IS FALSE AND u.suspended IS FALSE')
  } else if (status === 'Inactive') {
    conditions.push('(u.disabled IS TRUE OR u.suspended IS TRUE)')
  } else if (status === 'Unknown') {
    conditions.push(
      'u.disabled IS NOT TRUE AND u.suspended IS NOT TRUE AND (u.disabled IS NULL OR u.suspended IS NULL)',
    )
  }

  if (search) {
    parameters.push(`%${search}%`)
    const searchParameter = `$${parameters.length}`
    conditions.push(`(
      u.email ILIKE ${searchParameter}
      OR p.first_name ILIKE ${searchParameter}
      OR p.last_name ILIKE ${searchParameter}
      OR p.full_name ILIKE ${searchParameter}
      OR u.ctag ILIKE ${searchParameter}
      OR u.tags ILIKE ${searchParameter}
    )`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const limitParameter = `$${parameters.length + 1}`
  const offsetParameter = `$${parameters.length + 2}`

  try {
    const pool = getDbPool()
    const [playersResult, countResult, summaryResult, balancesResult] = await Promise.all([
      withTimeout(pool.query(`
        SELECT
          u.id,
          COALESCE(
            NULLIF(p.full_name, ''),
            NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''),
            NULLIF(split_part(u.email, '@', 1), '')
          ) AS name,
          u.email,
          CASE
            WHEN u.disabled IS TRUE OR u.suspended IS TRUE THEN 'Inactive'
            WHEN u.disabled IS FALSE AND u.suspended IS FALSE THEN 'Active'
            ELSE 'Unknown'
          END AS status,
          NULLIF(u.tags, '') AS "vipTier",
          COALESCE(account_balances.balances, '[]'::json) AS balances,
          COALESCE(NULLIF(p.country, ''), NULLIF(u.ctag, '')) AS country,
          TO_CHAR(u.last_sign_in_at, 'YYYY-MM-DD HH24:MI:SS') AS "lastLogin",
          TO_CHAR(u.created_at, 'YYYY-MM-DD') AS "registeredAt"
        FROM users_view u
        LEFT JOIN LATERAL (
          SELECT json_agg(
            json_build_object('currency', currency, 'amount', amount)
            ORDER BY currency
          ) AS balances
          FROM (
            SELECT currency, SUM(amount_cents)::numeric / 100.0 AS amount
            FROM accounts_view
            WHERE user_id = u.id AND amount_cents IS NOT NULL AND NULLIF(currency, '') IS NOT NULL
            GROUP BY currency
          ) AS per_currency
        ) AS account_balances ON true
        LEFT JOIN LATERAL (
          SELECT first_name, last_name, full_name, country
          FROM profiles_view
          WHERE user_id = u.id
          ORDER BY id DESC NULLS LAST
          LIMIT 1
        ) p ON true
        ${whereClause}
        ORDER BY u.id DESC
        LIMIT ${limitParameter} OFFSET ${offsetParameter}
      `, [...parameters, limit, offset]), QUERY_TIMEOUT_MS),
      withTimeout(pool.query(`
        SELECT COUNT(*)::int AS total
        FROM users_view u
        LEFT JOIN LATERAL (
          SELECT first_name, last_name, full_name, country
          FROM profiles_view
          WHERE user_id = u.id
          ORDER BY id DESC NULLS LAST
          LIMIT 1
        ) p ON true
        ${whereClause}
      `, parameters), QUERY_TIMEOUT_MS),
      withTimeout(pool.query(`
        SELECT
          COUNT(*)::int AS total_players,
          COUNT(*) FILTER (WHERE disabled IS FALSE AND suspended IS FALSE)::int AS active_players,
          COUNT(*) FILTER (WHERE disabled IS TRUE OR suspended IS TRUE)::int AS inactive_players,
          COUNT(*) FILTER (
            WHERE disabled IS NOT TRUE AND suspended IS NOT TRUE
              AND (disabled IS NULL OR suspended IS NULL)
          )::int AS unknown_status_players
        FROM users_view
      `), QUERY_TIMEOUT_MS),
      withTimeout(pool.query(`
        SELECT currency, ROUND(AVG(balance), 2) AS average_balance, COUNT(*)::int AS player_count
        FROM (
          SELECT user_id, currency, SUM(amount_cents)::numeric / 100.0 AS balance
          FROM accounts_view
          WHERE amount_cents IS NOT NULL AND NULLIF(currency, '') IS NOT NULL
          GROUP BY user_id, currency
        ) AS player_balances
        GROUP BY currency
        ORDER BY currency
      `), QUERY_TIMEOUT_MS),
    ])

    const total = countResult.rows[0].total
    const summary = summaryResult.rows[0]

    return NextResponse.json({
      success: true,
      data: playersResult.rows,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + playersResult.rows.length < total,
      },
      summary: {
        totalPlayers: summary.total_players,
        activePlayers: summary.active_players,
        inactivePlayers: summary.inactive_players,
        unknownStatusPlayers: summary.unknown_status_players,
        averageBalanceByCurrency: balancesResult.rows.map((row) => ({
          currency: row.currency,
          averageBalance: row.average_balance,
          playerCount: row.player_count,
        })),
      },
      source: 'postgresql',
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'PLAYER_QUERY_TIMEOUT'
    console.error('[GET /api/players] Player data query failed:', error)
    return NextResponse.json(
      { success: false, error: timedOut ? 'Player data query timed out.' : 'Player data source is unavailable.' },
      { status: timedOut ? 504 : 503 },
    )
  }
}
