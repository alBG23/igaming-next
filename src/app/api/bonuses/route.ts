import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface BonusRecord {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  amount_cents: number
  amount_wager_cents: number
  amount_locked_cents: number
  valid_until: string
  activated_at: string | null
  finished_at: string | null
  strategy?: string
  type: 'bonus' | 'freespin'
  game_id?: string
  spins_count?: number
  spins_used?: number
}

// Fallback seed data if the database returns 0 rows
const FALLBACK_BONUSES: BonusRecord[] = [
  {
    id: '101',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    account_id: '1001',
    title: 'Welcome Deposit Match 100%',
    status: 'active',
    amount_cents: 15000,
    amount_wager_cents: 225000,
    amount_locked_cents: 7500,
    valid_until: new Date(Date.now() + 12 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    finished_at: null,
    strategy: 'deposit_match',
    type: 'bonus',
  },
  {
    id: '102',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    account_id: '1002',
    title: 'Weekend High Roller Reload',
    status: 'completed',
    amount_cents: 50000,
    amount_wager_cents: 1500000,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 2 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    finished_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    strategy: 'reload',
    type: 'bonus',
  },
  {
    id: '103',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    account_id: '1006',
    title: 'VIP Weekly Loyalty Cashback',
    status: 'completed',
    amount_cents: 35000,
    amount_wager_cents: 1050000,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 6 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    finished_at: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    strategy: 'cashback',
    type: 'bonus',
  },
  {
    id: '104',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    account_id: '1003',
    title: 'Midweek Slots Boost 50%',
    status: 'active',
    amount_cents: 7500,
    amount_wager_cents: 110000,
    amount_locked_cents: 3500,
    valid_until: new Date(Date.now() + 4 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    finished_at: null,
    strategy: 'slots_match',
    type: 'bonus',
  },
  {
    id: '105',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    account_id: '1005',
    title: 'Live Casino Saturday Drop',
    status: 'active',
    amount_cents: 10000,
    amount_wager_cents: 180000,
    amount_locked_cents: 4000,
    valid_until: new Date(Date.now() + 3 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    finished_at: null,
    strategy: 'live_drop',
    type: 'bonus',
  },
  {
    id: '106',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    account_id: '1009',
    title: 'Birthday Special Bonus',
    status: 'completed',
    amount_cents: 20000,
    amount_wager_cents: 400000,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 7 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    finished_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    strategy: 'loyalty',
    type: 'bonus',
  },
  {
    id: '107',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    account_id: '1008',
    title: 'Sportsbook Kickoff Bonus',
    status: 'expired',
    amount_cents: 5000,
    amount_wager_cents: 45000,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() - 1 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    finished_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    strategy: 'sports',
    type: 'bonus',
  },
  {
    id: '108',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    account_id: '1010',
    title: 'Crypto Deposit Booster 15%',
    status: 'active',
    amount_cents: 12000,
    amount_wager_cents: 195000,
    amount_locked_cents: 5500,
    valid_until: new Date(Date.now() + 5 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    finished_at: null,
    strategy: 'crypto',
    type: 'bonus',
  },
  {
    id: '109',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    account_id: '1004',
    title: 'Autumn Festival Reload',
    status: 'completed',
    amount_cents: 6000,
    amount_wager_cents: 180000,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 1 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    finished_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    strategy: 'reload',
    type: 'bonus',
  },
  {
    id: '110',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    account_id: '1001',
    title: 'Blackjack Streak Reward',
    status: 'active',
    amount_cents: 18000,
    amount_wager_cents: 210000,
    amount_locked_cents: 9000,
    valid_until: new Date(Date.now() + 8 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    finished_at: null,
    strategy: 'table_games',
    type: 'bonus',
  },
  {
    id: '201',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    account_id: '1001',
    title: '50 Free Spins on Gates of Olympus',
    status: 'completed',
    amount_cents: 4250,
    amount_wager_cents: 0,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 5 * 86400000).toISOString(),
    activated_at: null,
    finished_at: null,
    strategy: 'Pragmatic Play',
    type: 'freespin',
    game_id: 'gates_of_olympus',
    spins_count: 50,
    spins_used: 50,
  },
  {
    id: '202',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    account_id: '1002',
    title: '100 Free Spins on Sweet Bonanza',
    status: 'completed',
    amount_cents: 8520,
    amount_wager_cents: 0,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 3 * 86400000).toISOString(),
    activated_at: null,
    finished_at: null,
    strategy: 'Pragmatic Play',
    type: 'freespin',
    game_id: 'sweet_bonanza',
    spins_count: 100,
    spins_used: 100,
  },
  {
    id: '203',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    account_id: '1006',
    title: '25 VIP Free Spins on Book of Dead',
    status: 'completed',
    amount_cents: 2800,
    amount_wager_cents: 0,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 6 * 86400000).toISOString(),
    activated_at: null,
    finished_at: null,
    strategy: "Play'n GO",
    type: 'freespin',
    game_id: 'book_of_dead',
    spins_count: 25,
    spins_used: 25,
  },
  {
    id: '204',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    account_id: '1003',
    title: '75 Free Spins on Big Bass Splash',
    status: 'active',
    amount_cents: 3210,
    amount_wager_cents: 0,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 4 * 86400000).toISOString(),
    activated_at: null,
    finished_at: null,
    strategy: 'Pragmatic Play',
    type: 'freespin',
    game_id: 'big_bass_splash',
    spins_count: 75,
    spins_used: 40,
  },
  {
    id: '205',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    account_id: '1005',
    title: '30 Free Spins on Starburst',
    status: 'completed',
    amount_cents: 1875,
    amount_wager_cents: 0,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 2 * 86400000).toISOString(),
    activated_at: null,
    finished_at: null,
    strategy: 'NetEnt',
    type: 'freespin',
    game_id: 'starburst',
    spins_count: 30,
    spins_used: 30,
  },
  {
    id: '206',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    account_id: '1009',
    title: '50 Free Spins on Sugar Rush',
    status: 'completed',
    amount_cents: 4900,
    amount_wager_cents: 0,
    amount_locked_cents: 0,
    valid_until: new Date(Date.now() + 1 * 86400000).toISOString(),
    activated_at: null,
    finished_at: null,
    strategy: 'Pragmatic Play',
    type: 'freespin',
    game_id: 'sugar_rush',
    spins_count: 50,
    spins_used: 50,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    let records: BonusRecord[] = []

    try {
      const pool = getDbPool()

      const bonusWhere: string[] = []
      const freespinWhere: string[] = []
      const bonusParams: any[] = []
      const freespinParams: any[] = []

      if (startDate) {
        bonusParams.push(startDate)
        bonusWhere.push(`created_at >= $${bonusParams.length}`)
        freespinParams.push(startDate)
        freespinWhere.push(`created_at >= $${freespinParams.length}`)
      }

      if (endDate) {
        bonusParams.push(endDate)
        bonusWhere.push(`created_at <= $${bonusParams.length}`)
        freespinParams.push(endDate)
        freespinWhere.push(`created_at <= $${freespinParams.length}`)
      }

      if (status && status !== 'all') {
        bonusParams.push(status)
        bonusWhere.push(`status = $${bonusParams.length}`)
        freespinParams.push(status)
        freespinWhere.push(`status = $${freespinParams.length}`)
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`
        bonusParams.push(term)
        bonusWhere.push(`(title ILIKE $${bonusParams.length} OR account_id::text ILIKE $${bonusParams.length})`)
        freespinParams.push(term)
        freespinWhere.push(`(title ILIKE $${freespinParams.length} OR account_id::text ILIKE $${freespinParams.length})`)
      }

      const bonusWhereClause = bonusWhere.length > 0 ? `WHERE ${bonusWhere.join(' AND ')}` : ''
      const freespinWhereClause = freespinWhere.length > 0 ? `WHERE ${freespinWhere.join(' AND ')}` : ''

      let bonusQuery = `
        SELECT 
          id::text,
          created_at::text,
          account_id::text,
          title,
          status,
          COALESCE(amount_cents, 0)::bigint as amount_cents,
          COALESCE(amount_wager_cents, 0)::bigint as amount_wager_cents,
          COALESCE(amount_locked_cents, 0)::bigint as amount_locked_cents,
          valid_until::text,
          activated_at::text,
          finished_at::text,
          COALESCE(strategy, 'deposit_match') as strategy,
          'bonus' as type,
          NULL as game_id,
          0 as spins_count,
          0 as spins_used
        FROM bonus_issues_view
        ${bonusWhereClause}
      `

      let freespinQuery = `
        SELECT 
          id::text,
          created_at::text,
          account_id::text,
          title,
          status,
          COALESCE(win_amount_cents, 0)::bigint as amount_cents,
          0::bigint as amount_wager_cents,
          0::bigint as amount_locked_cents,
          valid_until::text,
          NULL as activated_at,
          NULL as finished_at,
          COALESCE(provider, 'slots') as strategy,
          'freespin' as type,
          COALESCE(provider, 'slots') as game_id,
          COALESCE(freespins_total, 0) as spins_count,
          COALESCE(freespins_performed, 0) as spins_used
        FROM freespin_issues_view
        ${freespinWhereClause}
      `

      let combinedSql = ''
      let combinedParams: any[] = []

      if (type === 'bonus') {
        combinedSql = `${bonusQuery} ORDER BY created_at DESC;`
        combinedParams = bonusParams
      } else if (type === 'freespin') {
        combinedSql = `${freespinQuery} ORDER BY created_at DESC;`
        combinedParams = freespinParams
      } else {
        // Run both queries separately or UNION ALL
        // Running separately is cleaner with parameters
        const [bonusRes, freespinRes] = await Promise.all([
          pool.query(bonusQuery, bonusParams).catch((err) => {
            console.warn('[Bonuses API] Error querying bonus_issues_view:', err.message)
            return { rows: [] }
          }),
          pool.query(freespinQuery, freespinParams).catch((err) => {
            console.warn('[Bonuses API] Error querying freespin_issues_view:', err.message)
            return { rows: [] }
          }),
        ])

        const rows = [...bonusRes.rows, ...freespinRes.rows]
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        records = rows.map((r: any) => ({
          id: String(r.id),
          created_at: r.created_at,
          account_id: String(r.account_id),
          title: r.title,
          status: r.status,
          amount_cents: Number(r.amount_cents) || 0,
          amount_wager_cents: Number(r.amount_wager_cents) || 0,
          amount_locked_cents: Number(r.amount_locked_cents) || 0,
          valid_until: r.valid_until,
          activated_at: r.activated_at || null,
          finished_at: r.finished_at || null,
          strategy: r.strategy,
          type: r.type,
          game_id: r.game_id || undefined,
          spins_count: Number(r.spins_count) || 0,
          spins_used: Number(r.spins_used) || 0,
        }))
      }

      if (type === 'bonus' || type === 'freespin') {
        const res = await pool.query(combinedSql, combinedParams)
        records = res.rows.map((r: any) => ({
          id: String(r.id),
          created_at: r.created_at,
          account_id: String(r.account_id),
          title: r.title,
          status: r.status,
          amount_cents: Number(r.amount_cents) || 0,
          amount_wager_cents: Number(r.amount_wager_cents) || 0,
          amount_locked_cents: Number(r.amount_locked_cents) || 0,
          valid_until: r.valid_until,
          activated_at: r.activated_at || null,
          finished_at: r.finished_at || null,
          strategy: r.strategy,
          type: r.type,
          game_id: r.game_id || undefined,
          spins_count: Number(r.spins_count) || 0,
          spins_used: Number(r.spins_used) || 0,
        }))
      }
    } catch (dbErr: any) {
      console.warn('[Bonuses API] DB Error, falling back to static data:', dbErr.message)
    }

    // Fallback if database has no rows
    if (!records || records.length === 0) {
      records = FALLBACK_BONUSES
      if (status && status !== 'all') {
        records = records.filter((r) => r.status === status)
      }
      if (type && type !== 'all') {
        records = records.filter((r) => r.type === type)
      }
      if (search && search.trim()) {
        const q = search.toLowerCase()
        records = records.filter((r) => r.title.toLowerCase().includes(q) || r.account_id.includes(q))
      }
    }

    // Calculate aggregated metrics
    const bonuses = records.filter((r) => r.type === 'bonus')
    const freespins = records.filter((r) => r.type === 'freespin')

    const totalBonusAmount = bonuses.reduce((sum, b) => sum + b.amount_cents, 0)
    const totalFreespinsIssued = freespins.reduce((sum, f) => sum + (f.spins_count || 0), 0)
    const totalFreespinsWinAmount = freespins.reduce((sum, f) => sum + f.amount_cents, 0)
    const activeWageringAmount = bonuses.reduce(
      (sum, b) => (b.status === 'active' ? sum + b.amount_wager_cents : sum),
      0
    )
    const completedCount = records.filter((r) => r.status === 'completed').length
    const completionRate = records.length > 0 ? (completedCount / records.length) * 100 : 0

    return NextResponse.json({
      data: records,
      count: records.length,
      metrics: {
        totalBonusesIssued: bonuses.length,
        totalBonusAmount,
        totalFreespinsIssued,
        totalFreespinsWinAmount,
        activeWageringAmount,
        completionRate,
      },
    })
  } catch (err: any) {
    console.error('[Bonuses API Fatal Error]:', err)
    return NextResponse.json(
      { data: FALLBACK_BONUSES, count: FALLBACK_BONUSES.length, error: err.message },
      { status: 200 }
    )
  }
}
