import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 10000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('ACQUISITION_QUERY_TIMEOUT')), ms)
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
  const startDateStr = searchParams.get('startDate')
  const endDateStr = searchParams.get('endDate')
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  if (limit < 1 || limit > 200) {
    return NextResponse.json({ success: false, error: 'Invalid limit parameter.' }, { status: 400 })
  }

  // Default to last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  const start = startDateStr || thirtyDaysAgo.toISOString().split('T')[0]
  const end = endDateStr || today.toISOString().split('T')[0]

  const pool = getDbPool()

  const startDateFilter = `AND created_at >= '${start}' AND created_at <= '${end} 23:59:59'`

  try {
    const [
      totalUsersResult,
      newUsersResult,
      sourcesResult,
    ] = await Promise.all([
      // Total users count
      withTimeout(pool.query(`
        SELECT COUNT(*)::int AS total FROM users_view
      `), QUERY_TIMEOUT_MS),

      // New users in date range
      withTimeout(pool.query(`
        SELECT COUNT(*)::int AS total FROM users_view
        WHERE created_at >= '${start}' AND created_at <= '${end} 23:59:59'
      `), QUERY_TIMEOUT_MS),

      // Traffic sources — try income_reports first, fall back to ad_args_view
      withTimeout(
        (async () => {
          try {
            return await pool.query(`
              SELECT
                COALESCE(ir.partner_name, 'Partner #' || ir.partner_id::text) AS source,
                COALESCE(SUM(ir.clicks), 0) AS visits,
                COALESCE(SUM(ir.registrations), 0) AS registrations,
                COALESCE(SUM(ir.ftds), 0) AS firstDeposits
              FROM income_reports ir
              WHERE ir.report_date >= '${start}' AND ir.report_date <= '${end}'
              GROUP BY ir.partner_id, ir.partner_name
              ORDER BY visits DESC
              LIMIT ${limit}
            `)
          } catch {
            // Fallback to ad_args_view
            return pool.query(`
              SELECT
                s_tag_affiliate AS source,
                COUNT(*) AS visits,
                COUNT(*) FILTER (WHERE action = 'registration') AS registrations,
                COUNT(*) FILTER (WHERE action = 'first_deposit') AS firstDeposits
              FROM ad_args_view
              WHERE s_tag_affiliate IS NOT NULL
              GROUP BY s_tag_affiliate
              ORDER BY visits DESC
              LIMIT ${limit}
            `)
          }
        })(),
        QUERY_TIMEOUT_MS
      ),
    ])

    const sources = (sourcesResult.rows ?? []).map((row: any) => ({
      source: row.source || 'Unknown',
      visits: Number(row.visits) || 0,
      registrations: Number(row.registrations) || 0,
      deposits: 0,
      firstDeposits: Number(row.firstDeposits) || 0,
    }))

    const totalRegistrations = sources.reduce((sum: number, s: any) => sum + s.registrations, 0)
    const totalFirstDeposits = sources.reduce((sum: number, s: any) => sum + s.firstDeposits, 0)

    const newUsers = newUsersResult.rows?.[0]?.total ?? 0
    const totalUsers = totalUsersResult.rows?.[0]?.total ?? 0
    const ftdRate = totalRegistrations > 0 ? (totalFirstDeposits / totalRegistrations) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        newUsers,
        trafficRegistrations: totalRegistrations,
        firstDeposits: totalFirstDeposits,
        ftdRate,
        sources,
        dateRange: { start, end },
      },
    })
  } catch (error: unknown) {
    const timedOut = error instanceof Error && error.message === 'ACQUISITION_QUERY_TIMEOUT'
    console.error('[GET /api/acquisition] Acquisition data query failed:', error)
    return NextResponse.json(
      { success: false, error: timedOut ? 'Acquisition query timed out.' : 'Acquisition data source is unavailable.' },
      { status: timedOut ? 504 : 503 },
    )
  }
}
