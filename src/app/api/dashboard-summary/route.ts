import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 8000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('QUERY_TIMEOUT')), ms)
    promise.then(
      (value) => { clearTimeout(timeout); resolve(value) },
      (error: unknown) => { clearTimeout(timeout); reject(error) }
    )
  })
}

// Date helpers
const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const firstOfCurrentMonth = new Date().toISOString().slice(0, 8) + '01'
const firstOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10)
const lastDayOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0).toISOString().slice(0, 10)

interface MetricsParams {
  startDate: string
  endDate: string
  isMTD: boolean
  isYTD: boolean
  isLastMonth: boolean
}

async function computeMetrics(params: MetricsParams): Promise<{
  ggr: number; ngr: number; ggrEur: number; ngrEur: number
  deposits: number; withdrawals: number
  totalDepositingPlayers: number
  totalActivePlayers: number; ftds: number; registrations: number
}> {
  const pool = getDbPool()
  const { startDate, endDate, isMTD, isYTD, isLastMonth } = params

  // Revenue metrics from player_daily_revenue (covers all periods)
  const revenueSql = `
    SELECT
      COALESCE(SUM(gross_game_revenue), 0)::numeric AS ggr,
      COALESCE(SUM(net_game_revenue), 0)::numeric AS ngr,
      COALESCE(SUM(gross_game_revenue_eur), 0)::numeric AS ggr_eur,
      COALESCE(SUM(net_game_revenue_eur), 0)::numeric AS ngr_eur,
      COALESCE(SUM(deposits), 0)::numeric AS deposits,
      COALESCE(SUM(withdrawals), 0)::numeric AS withdrawals,
      COALESCE(SUM(ftds), 0)::int AS ftds,
      COALESCE(SUM(registrations), 0)::int AS registrations
    FROM player_daily_revenue
    WHERE report_date BETWEEN $1 AND $2
  `

  // Depositing players and active players from player_daily_revenue
  const playerSql = `
    SELECT
      COUNT(DISTINCT CASE WHEN deposit_count > 0 THEN player_id END) AS total_depositing_players,
      COUNT(DISTINCT CASE WHEN activity_flag = 'active' THEN player_id END) AS total_active_players
    FROM player_daily_revenue
    WHERE report_date BETWEEN $1 AND $2
  `

  // Registrations from users_view (total count)
  const regSql = `SELECT COUNT(*)::int AS total_registrations FROM users_view`

  // FTD count from affilka traffic (for the attention band)
  const ftdSql = `
    SELECT COUNT(*)::int AS total_ftds
    FROM traffic_reports
    WHERE first_deposit_date BETWEEN $1 AND $2
  `

  const [revenueResult, playerResult] = await Promise.all([
    withTimeout(pool.query(revenueSql, [startDate, endDate]), QUERY_TIMEOUT_MS),
    withTimeout(pool.query(playerSql, [startDate, endDate]), QUERY_TIMEOUT_MS),
  ])

  const r = revenueResult.rows[0]
  const p = playerResult.rows[0]

  return {
    ggr: Number(r.ggr) / 100,  // cents → euros
    ngr: Number(r.ngr) / 100,
    ggrEur: Number(r.ggr_eur),
    ngrEur: Number(r.ngr_eur),
    deposits: Number(r.deposits) / 100,
    withdrawals: Number(r.withdrawals) / 100,
    totalDepositingPlayers: Number(p.total_depositing_players),
    totalActivePlayers: Number(p.total_active_players),
    ftds: Number(r.ftds),
    registrations: Number(r.registrations),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'

    let metricsParams: MetricsParams

    switch (period) {
      case 'today':
        metricsParams = { startDate: today, endDate: today, isMTD: false, isYTD: false, isLastMonth: false }
        break
      case 'yesterday':
        metricsParams = { startDate: yesterday, endDate: yesterday, isMTD: false, isYTD: false, isLastMonth: false }
        break
      case 'mtd':
        metricsParams = { startDate: firstOfCurrentMonth, endDate: today, isMTD: true, isYTD: false, isLastMonth: false }
        break
      case 'ytd':
        metricsParams = { startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10), endDate: today, isMTD: false, isYTD: true, isLastMonth: false }
        break
      case 'last_month':
        metricsParams = { startDate: firstOfPrevMonth, endDate: lastDayOfPrevMonth, isMTD: false, isYTD: false, isLastMonth: true }
        break
      default:
        metricsParams = { startDate: today, endDate: today, isMTD: false, isYTD: false, isLastMonth: false }
    }

    const metrics = await computeMetrics(metricsParams)

    return NextResponse.json({
      success: true,
      period,
      metrics,
      source: 'postgresql',
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'QUERY_TIMEOUT'
    console.error('[Dashboard Summary API] Failed to load dashboard summary:', error)
    return NextResponse.json(
      { success: false, error: timedOut ? 'Dashboard query timed out.' : 'Dashboard data source is unavailable.' },
      { status: timedOut ? 504 : 503 }
    )
  }
}
