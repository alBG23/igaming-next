"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface AffiliateMetrics {
  partner_id: string
  partner_name: string
  total_income: number
  traffic: {
    visits: number
    clicks: number
    registrations: number
    deposits: number
    ftd: number
  }
  conversion_rates: {
    cr: number
    cd: number
    cftd: number
    rftd: number
  }
}

export default function AffiliatesPage() {
  const [metrics, setMetrics] = useState<AffiliateMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Get income reports
        const { data: incomeData, error: incomeError } = await supabase
          .from('income_reports')
          .select('partner_id, partner_income')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (incomeError) throw incomeError

        // Get traffic reports
        const { data: trafficData, error: trafficError } = await supabase
          .from('traffic_reports')
          .select('*')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (trafficError) throw trafficError

        // Aggregate data by partner
        const partnerMetrics = new Map<string, AffiliateMetrics>()

        // Process income data
        incomeData.forEach(report => {
          if (!partnerMetrics.has(report.partner_id)) {
            partnerMetrics.set(report.partner_id, {
              partner_id: report.partner_id,
              partner_name: `Partner ${report.partner_id}`,
              total_income: 0,
              traffic: {
                visits: 0,
                clicks: 0,
                registrations: 0,
                deposits: 0,
                ftd: 0
              },
              conversion_rates: {
                cr: 0,
                cd: 0,
                cftd: 0,
                rftd: 0
              }
            })
          }
          const metrics = partnerMetrics.get(report.partner_id)!
          metrics.total_income += report.partner_income
        })

        // Process traffic data
        trafficData.forEach(report => {
          if (!partnerMetrics.has(report.foreign_partner_id)) {
            partnerMetrics.set(report.foreign_partner_id, {
              partner_id: report.foreign_partner_id,
              partner_name: `Partner ${report.foreign_partner_id}`,
              total_income: 0,
              traffic: {
                visits: 0,
                clicks: 0,
                registrations: 0,
                deposits: 0,
                ftd: 0
              },
              conversion_rates: {
                cr: 0,
                cd: 0,
                cftd: 0,
                rftd: 0
              }
            })
          }
          const metrics = partnerMetrics.get(report.foreign_partner_id)!
          metrics.traffic.visits += report.visits
          metrics.traffic.clicks += report.clicks
          metrics.traffic.registrations += report.registrations_count
          metrics.traffic.deposits += report.deposits_count
          metrics.traffic.ftd += report.ftd_count

          // Calculate conversion rates
          metrics.conversion_rates.cr = metrics.traffic.visits > 0 
            ? (metrics.traffic.registrations / metrics.traffic.visits) * 100 
            : 0
          metrics.conversion_rates.cd = metrics.traffic.registrations > 0 
            ? (metrics.traffic.deposits / metrics.traffic.registrations) * 100 
            : 0
          metrics.conversion_rates.cftd = metrics.traffic.registrations > 0 
            ? (metrics.traffic.ftd / metrics.traffic.registrations) * 100 
            : 0
          metrics.conversion_rates.rftd = metrics.traffic.deposits > 0 
            ? (metrics.traffic.ftd / metrics.traffic.deposits) * 100 
            : 0
        })

        setMetrics(Array.from(partnerMetrics.values()))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!metrics.length) return <div>No data available</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Affiliates</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.length)}</div>
            <p className="text-xs text-muted-foreground">Active in last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.reduce((sum, m) => sum + m.total_income, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. CR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics.reduce((sum, m) => sum + m.conversion_rates.cr, 0) / metrics.length)}
            </div>
            <p className="text-xs text-muted-foreground">Average conversion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. FTD Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics.reduce((sum, m) => sum + m.conversion_rates.cftd, 0) / metrics.length)}
            </div>
            <p className="text-xs text-muted-foreground">Average FTD rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>FTD</TableHead>
                <TableHead>CR</TableHead>
                <TableHead>CD</TableHead>
                <TableHead>CFTD</TableHead>
                <TableHead>RFTD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.partner_id}>
                  <TableCell>{metric.partner_name}</TableCell>
                  <TableCell>{formatCurrency(metric.total_income)}</TableCell>
                  <TableCell>{formatNumber(metric.traffic.visits)}</TableCell>
                  <TableCell>{formatNumber(metric.traffic.registrations)}</TableCell>
                  <TableCell>{formatNumber(metric.traffic.deposits)}</TableCell>
                  <TableCell>{formatNumber(metric.traffic.ftd)}</TableCell>
                  <TableCell>{formatPercentage(metric.conversion_rates.cr)}</TableCell>
                  <TableCell>{formatPercentage(metric.conversion_rates.cd)}</TableCell>
                  <TableCell>{formatPercentage(metric.conversion_rates.cftd)}</TableCell>
                  <TableCell>{formatPercentage(metric.conversion_rates.rftd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
