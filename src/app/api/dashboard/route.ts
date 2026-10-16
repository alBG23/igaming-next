import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 10000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('DASHBOARD_QUERY_TIMEOUT')), ms)
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

function parseDateRange(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  return { startDate, endDate }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const { startDate: startDateStr, endDate: endDateStr } = parseDateRange(searchParams)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  if (limit < 1 || limit > 100) {
    return NextResponse.json({ success: false, error: 'Invalid limit parameter.' }, { status: 400 })
  }

  const pool = getDbPool()

  // Build date filters
  const startDateFilter = startDateStr
    ? `AND u.created_at >= '${startDateStr}'`
    : ''
  const endDateFilter = endDateStr
    ? `AND u.created_at <= '${endDateStr} 23:59:59'`
    : ''

  const paymentsDateFilter = startDateStr && endDateStr
    ? `AND (COALESCE(p.finished_at, p.created_at)) >= '${startDateStr}' AND (COALESCE(p.finished_at, p.created_at)) <= '${endDateStr} 23:59:59'`
    : ''

  const gamesDateFilter = startDateStr && endDateStr
    ? `AND gs.date >= '${startDateStr}' AND gs.date <= '${endDateStr}'`
    : ''

  try {
    const [
      totalPlayers,
      activePlayers,
      newPlayersToday,
      paymentsSummary,
      recentPayments,
      revenueMetrics,
      gameStats,
      revenueOverTime,
      platformSplit,
    ] = await Promise.all([
      // Total players
      withTimeout(pool.query(`
        SELECT COUNT(*)::int AS total FROM users_view
      `), QUERY_TIMEOUT_MS),

      // Active players (disabled=false AND suspended=false)
      withTimeout(pool.query(`
        SELECT COUNT(*)::int AS total FROM users_view
        WHERE disabled IS FALSE AND suspended IS FALSE
      `), QUERY_TIMEOUT_MS),

      // New players today
      withTimeout(pool.query(`
        SELECT COUNT(*)::int AS total FROM users_view
        WHERE DATE(created_at) = CURRENT_DATE
      `), QUERY_TIMEOUT_MS),

      // Payments summary (deposits and withdrawals)
      withTimeout(pool.query(`
        SELECT
          COALESCE(SUM(amount_cents) FILTER (WHERE payment_system IS NOT NULL AND success IS TRUE), 0)::bigint AS total_deposits_cents,
          COALESCE(SUM(amount_cents) FILTER (WHERE payment_system IS NOT NULL AND success IS TRUE AND LOWER(payment_system) NOT IN ('cashout', 'withdrawal', 'refund')), 0)::bigint AS total_deposits_cents_filtered,
          COALESCE(SUM(amount_cents) FILTER (WHERE LOWER(payment_system) IN ('cashout', 'withdrawal', 'refund')), 0)::bigint AS total_withdrawals_cents,
          COUNT(*)::int AS total_transactions
        FROM payments_view
        ${paymentsDateFilter}
      `), QUERY_TIMEOUT_MS),

      // Recent payments
      withTimeout(pool.query(`
        SELECT
          id,
          amount_cents,
          currency,
          payment_system,
          success,
          created_at,
          finished_at
        FROM payments_view
        ${paymentsDateFilter}
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]), QUERY_TIMEOUT_MS),

      // Revenue metrics (GGR from casino_games_view aggregates)
      withTimeout(pool.query(`
        SELECT
          COALESCE(SUM(bets_sum), 0) AS total_bets,
          COALESCE(SUM(payoff_sum), 0) AS total_payoffs,
          COALESCE(SUM(bets_sum) - SUM(payoff_sum), 0) AS ggr
        FROM casino_games_view
        ${gamesDateFilter}
      `), QUERY_TIMEOUT_MS),

      // Game category stats
      withTimeout(pool.query(`
        SELECT
          game_name,
          game_provider,
          COUNT(*)::int AS spin_count,
          COALESCE(SUM(bets_sum), 0) AS total_bets,
          COALESCE(SUM(payoff_sum), 0) AS total_payoffs,
          COALESCE(SUM(bets_sum) - SUM(payoff_sum), 0) AS ggr
        FROM casino_games_view
        ${gamesDateFilter}
        GROUP BY game_name, game_provider
        ORDER BY ggr DESC NULLS LAST
        LIMIT 10
      `), QUERY_TIMEOUT_MS),

      // Revenue over time (daily GGR)
      withTimeout(pool.query(`
        SELECT
          gs.date::text AS date,
          COALESCE(SUM(gs.bets_sum), 0) AS bets,
          COALESCE(SUM(gs.payoff_sum), 0) AS payoffs,
          COALESCE(SUM(gs.bets_sum) - SUM(gs.payoff_sum), 0) AS ggr
        FROM casino_games_view gs
        ${gamesDateFilter}
        GROUP BY gs.date
        ORDER BY gs.date DESC
        LIMIT 30
      `), QUERY_TIMEOUT_MS),

      // Platform split (by game_provider)
      withTimeout(pool.query(`
        SELECT
          COALESCE(game_provider, 'Unknown') AS provider,
          COUNT(*)::int AS game_count,
          COALESCE(SUM(bets_sum) - SUM(payoff_sum), 0) AS ggr
        FROM casino_games_view
        ${gamesDateFilter}
        GROUP BY game_provider
        ORDER BY ggr DESC NULLS LAST
      `), QUERY_TIMEOUT_MS),
    ])

    const payments = paymentsSummary.rows[0]
    const revenue = revenueMetrics.rows[0]

    // Format currency from cents to display units
    const formatCurrency = (cents: bigint | number, currency: string = 'EUR'): string => {
      const value = Number(cents) / 100
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(value)
    }

    return NextResponse.json({
      success: true,
      data: {
        players: {
          total: totalPlayers.rows[0].total,
          active: activePlayers.rows[0].total,
          newToday: newPlayersToday.rows[0].total,
        },
        payments: {
          totalDepositsCents: Number(payments.total_deposits_cents),
          totalWithdrawalsCents: Number(payments.total_withdrawals_cents),
          totalTransactions: payments.total_transactions,
          formatted: {
            deposits: formatCurrency(payments.total_deposits_cents),
            withdrawals: formatCurrency(payments.total_withdrawals_cents),
          },
        },
        recentPayments: recentPayments.rows.map((row: any) => ({
          ...row,
          amount: formatCurrency(row.amount_cents, row.currency),
          status: row.success ? 'success' : 'pending',
          type: row.payment_system ? (
            ['cashout', 'withdrawal', 'refund'].includes(row.payment_system.toLowerCase())
              ? 'withdrawal'
              : 'deposit'
          ) : 'deposit',
        })),
        revenue: {
          totalBets: Number(revenue.total_bets),
          totalPayoffs: Number(revenue.total_payoffs),
          ggr: Number(revenue.ggr),
          formatted: {
            bets: formatCurrency(revenue.total_bets),
            payoffs: formatCurrency(revenue.total_payoffs),
            ggr: formatCurrency(revenue.ggr),
          },
        },
        topGames: gameStats.rows.map((row: any) => ({
          name: row.game_name,
          provider: row.game_provider,
          spinCount: row.spin_count,
          totalBets: Number(row.total_bets),
          totalPayoffs: Number(row.total_payoffs),
          ggr: Number(row.ggr),
        })),
        revenueOverTime: revenueOverTime.rows.map((row: any) => ({
          date: row.date,
          bets: Number(row.bets),
          payoffs: Number(row.payoffs),
          ggr: Number(row.ggr),
        })),
        platformSplit: platformSplit.rows.map((row: any) => ({
          provider: row.provider,
          gameCount: row.game_count,
          ggr: Number(row.ggr),
        })),
        dateRange: { startDate: startDateStr, endDate: endDateStr },
      },
      source: 'postgresql',
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'DASHBOARD_QUERY_TIMEOUT'
    console.error('[GET /api/dashboard] Dashboard data query failed:', error)
    return NextResponse.json(
      { success: false, error: timedOut ? 'Dashboard query timed out.' : 'Dashboard data source is unavailable.' },
      { status: timedOut ? 504 : 503 },
    )
  }
}
