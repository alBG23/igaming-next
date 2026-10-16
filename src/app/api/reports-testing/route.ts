import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 10000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('REPORTS_QUERY_TIMEOUT')), ms)
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

function parsePositiveInteger(value: string | null, fallback: number, maximum?: number) {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1) return null
  return maximum ? Math.min(parsed, maximum) : parsed
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const limit = parsePositiveInteger(searchParams.get('limit'), 50, 200)

  if (limit === null) {
    return NextResponse.json({ success: false, error: 'Invalid limit parameter.' }, { status: 400 })
  }

  const pool = getDbPool()

  const dateFilter = startDate && endDate
    ? `WHERE date >= '${startDate}' AND date <= '${endDate}'`
    : ''

  try {
    const [
      adArgs,
      playerStats,
      paymentStats,
      funnelAnalysis,
    ] = await Promise.all([
      // Signup args / ad_args_view (affiliate click tracking)
      withTimeout(pool.query(`
        SELECT
          id,
          date::text AS date,
          campaign,
          utm_source,
          utm_medium,
          utm_campaign,
          btag,
          s_tag,
          foreign_partner_id,
          ip_address,
          user_agent,
          landing_url,
          created_at
        FROM ad_args_view
        ${dateFilter}
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]), QUERY_TIMEOUT_MS),

      // Player stats from users_view
      withTimeout(pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE disabled IS FALSE AND suspended IS FALSE)::int AS active,
          COUNT(*) FILTER (WHERE disabled IS TRUE OR suspended IS TRUE)::int AS inactive,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::int AS newToday
        FROM users_view
      `), QUERY_TIMEOUT_MS),

      // Payment stats from payments_view
      withTimeout(pool.query(`
        SELECT
          COUNT(*)::int AS total_transactions,
          COALESCE(SUM(amount_cents), 0)::bigint AS total_amount_cents,
          COALESCE(SUM(amount_cents) FILTER (WHERE LOWER(payment_system) NOT IN ('cashout', 'withdrawal', 'refund')), 0)::bigint AS deposit_cents,
          COALESCE(SUM(amount_cents) FILTER (WHERE LOWER(payment_system) IN ('cashout', 'withdrawal', 'refund')), 0)::bigint AS withdrawal_cents,
          COUNT(*) FILTER (WHERE success IS TRUE)::int AS successful
        FROM payments_view
      `), QUERY_TIMEOUT_MS),

      // Funnel analysis
      withTimeout(pool.query(`
        WITH daily_stats AS (
          SELECT
            u.created_at::date AS day,
            COUNT(DISTINCT u.id) AS registrations,
            COUNT(DISTINCT CASE WHEN p.payment_system IS NOT NULL AND NOT p.success THEN p.id END) AS failed,
            COUNT(DISTINCT CASE WHEN p.payment_system IS NOT NULL AND p.success THEN p.id END) AS successful_payments
          FROM users_view u
          LEFT JOIN payments_view p ON p.user_id = u.id AND p.created_at >= u.created_at
          GROUP BY u.created_at::date
        )
        SELECT
          day::text AS date,
          registrations,
          successful_payments,
          failed,
          CASE WHEN registrations > 0 THEN ROUND((successful_payments::float / registrations * 100), 2) ELSE 0 END AS registration_rate
        FROM daily_stats
        ORDER BY day DESC
        LIMIT 30
      `), QUERY_TIMEOUT_MS),
    ])

    function formatCurrency(cents: bigint | number, currency: string = 'EUR'): string {
      const value = Number(cents) / 100
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(value)
    }

    const paymentStatsRow = paymentStats.rows[0]
    const playerStatsRow = playerStats.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        adArgs: adArgs.rows.map((row: any) => ({
          ...row,
          utmCampaign: row.utm_campaign || 'N/A',
          utmSource: row.utm_source || 'N/A',
          utmMedium: row.utm_medium || 'N/A',
          partnerId: row.foreign_partner_id || row.s_tag || row.btag || 'N/A',
        })),
        playerStats: {
          total: playerStatsRow.total,
          active: playerStatsRow.active,
          inactive: playerStatsRow.inactive,
          newToday: playerStatsRow.newToday,
        },
        paymentStats: {
          totalTransactions: paymentStatsRow.total_transactions,
          depositCents: Number(paymentStatsRow.deposit_cents),
          withdrawalCents: Number(paymentStatsRow.withdrawal_cents),
          totalAmountCents: Number(paymentStatsRow.total_amount_cents),
          successful: paymentStatsRow.successful,
          formatted: {
            deposits: formatCurrency(paymentStatsRow.deposit_cents),
            withdrawals: formatCurrency(paymentStatsRow.withdrawal_cents),
            total: formatCurrency(paymentStatsRow.total_amount_cents),
          },
        },
        dateRange: { startDate, endDate },
      },
      source: 'postgresql',
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'REPORTS_QUERY_TIMEOUT'
    console.error('[GET /api/reports-testing] Reports data query failed:', error)
    return NextResponse.json(
      { success: false, error: timedOut ? 'Reports query timed out.' : 'Reports data source is unavailable.' },
      { status: timedOut ? 504 : 503 },
    )
  }
}
