import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 10000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('AFFILIATE_QUERY_TIMEOUT')), ms)
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

function formatCurrency(cents: bigint | number): string {
  const value = Number(cents) / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const limit = parsePositiveInteger(searchParams.get('limit'), 20, 100)

  if (limit === null) {
    return NextResponse.json({ success: false, error: 'Invalid limit parameter.' }, { status: 400 })
  }

  const pool = getDbPool()

  const dateFilter = startDate && endDate
    ? `WHERE report_date >= '${startDate}' AND report_date <= '${endDate}'`
    : ''

  try {
    const [
      affiliatesSummary,
      incomeReports,
      trafficReports,
      topAffiliates,
      revenueByDay,
      conversionStats,
    ] = await Promise.all([
      // Affiliate overview summary
      withTimeout(pool.query(`
        SELECT
          COUNT(DISTINCT partner_id)::int AS total_affiliates,
          COUNT(*)::int AS total_reports,
          COALESCE(SUM(revenue_cents), 0)::bigint AS total_revenue_cents,
          COALESCE(SUM(conversions), 0)::int AS total_conversions
        FROM income_reports
        ${dateFilter}
      `), QUERY_TIMEOUT_MS),

      // Income reports (affiliate commissions)
      withTimeout(pool.query(`
        SELECT
          partner_id,
          partner_name,
          report_date,
          revenue_cents,
          conversions,
          clicks,
          revenue_rate
        FROM income_reports
        ${dateFilter}
        ORDER BY report_date DESC
        LIMIT $1
      `, [limit]), QUERY_TIMEOUT_MS),

      // Traffic reports
      withTimeout(pool.query(`
        SELECT
          partner_id,
          partner_name,
          report_date,
          clicks,
          registrations,
          ftds,
          conversion_rate,
          revenue_cents
        FROM traffic_reports
        ${dateFilter}
        ORDER BY report_date DESC
        LIMIT $1
      `, [limit]), QUERY_TIMEOUT_MS),

      // Top affiliates by revenue
      withTimeout(pool.query(`
        SELECT
          partner_id,
          partner_name,
          SUM(revenue_cents)::bigint AS total_revenue_cents,
          SUM(conversions)::int AS total_conversions,
          COUNT(*)::int AS report_count
        FROM income_reports
        ${dateFilter}
        GROUP BY partner_id, partner_name
        ORDER BY total_revenue_cents DESC
        LIMIT 10
      `), QUERY_TIMEOUT_MS),

      // Daily revenue trend
      withTimeout(pool.query(`
        SELECT
          report_date::text AS date,
          COALESCE(SUM(revenue_cents), 0)::bigint AS revenue_cents,
          COALESCE(SUM(conversions), 0)::int AS conversions,
          COALESCE(SUM(clicks), 0)::int AS clicks
        FROM income_reports
        ${dateFilter}
        GROUP BY report_date
        ORDER BY report_date DESC
        LIMIT 30
      `), QUERY_TIMEOUT_MS),

      // Conversion funnel stats
      withTimeout(pool.query(`
        SELECT
          COALESCE(SUM(clicks), 0)::bigint AS total_clicks,
          COALESCE(SUM(registrations), 0)::int AS total_registrations,
          COALESCE(SUM(ftds), 0)::int AS total_ftds
        FROM traffic_reports
        ${dateFilter}
      `), QUERY_TIMEOUT_MS),
    ])

    const summary = affiliatesSummary.rows[0]
    const conversion = conversionStats.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAffiliates: summary.total_affiliates,
          totalReports: summary.total_reports,
          totalRevenueCents: Number(summary.total_revenue_cents),
          totalConversions: summary.total_conversions,
          formatted: {
            revenue: formatCurrency(summary.total_revenue_cents),
          },
        },
        incomeReports: incomeReports.rows.map((row: any) => ({
          ...row,
          revenue: formatCurrency(row.revenue_cents),
        })),
        trafficReports: trafficReports.rows.map((row: any) => ({
          ...row,
          revenue: formatCurrency(row.revenue_cents),
        })),
        topAffiliates: topAffiliates.rows.map((row: any) => ({
          ...row,
          totalRevenue: formatCurrency(row.total_revenue_cents),
        })),
        revenueByDay: revenueByDay.rows.map((row: any) => ({
          date: row.date,
          revenueCents: Number(row.revenue_cents),
          conversions: row.conversions,
          clicks: row.clicks,
          revenue: formatCurrency(row.revenue_cents),
        })),
        conversionFunnel: {
          totalClicks: Number(conversion.total_clicks),
          totalRegistrations: conversion.total_registrations,
          totalFTDs: conversion.total_ftds,
          registrationRate: conversion.total_clicks > 0
            ? ((conversion.total_registrations / Number(conversion.total_clicks)) * 100).toFixed(2)
            : '0',
          ftdConversionRate: conversion.total_registrations > 0
            ? ((conversion.total_ftds / conversion.total_registrations) * 100).toFixed(2)
            : '0',
        },
        dateRange: { startDate, endDate },
      },
      source: 'postgresql',
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'AFFILIATE_QUERY_TIMEOUT'
    console.error('[GET /api/affiliates] Affiliate data query failed:', error)
    return NextResponse.json(
      { success: false, error: timedOut ? 'Affiliate query timed out.' : 'Affiliate data source is unavailable.' },
      { status: timedOut ? 504 : 503 },
    )
  }
}
