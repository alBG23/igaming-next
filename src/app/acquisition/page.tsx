"use client"

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatNumber, formatPercentage } from '@/lib/utils'

interface AcquisitionSource {
  source: string
  visits: number
  registrations: number
  deposits: number
  firstDeposits: number
}

interface AcquisitionMetrics {
  totalUsers: number | null
  newUsers: number | null
  trafficRegistrations: number | null
  firstDeposits: number | null
  ftdRate: number | null
  sources: AcquisitionSource[]
}

export default function AcquisitionPage() {
  const [metrics, setMetrics] = useState<AcquisitionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startIso = startDate.toISOString()
    const dateFrom = startIso.slice(0, 10)
    const dateTo = endDate.toISOString().slice(0, 10)

    try {
      const [totalUsersResult, newUsersResult, trafficResult] = await Promise.all([
        supabase.from('users_view').select('id', { count: 'exact', head: true }),
        supabase
          .from('users_view')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startIso)
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('traffic_reports')
          .select('foreign_partner_id, visits, registrations_count, deposits_count, ftd_count')
          .gte('date', dateFrom)
          .lte('date', dateTo),
      ])

      if (totalUsersResult.error) {
        throw new Error(`Could not load total users: ${totalUsersResult.error.message}`)
      }
      if (newUsersResult.error) {
        throw new Error(`Could not load new users: ${newUsersResult.error.message}`)
      }
      if (trafficResult.error) {
        throw new Error(`Could not load traffic reports: ${trafficResult.error.message}`)
      }

      const sourceTotals = new Map<string, AcquisitionSource>()
      for (const report of trafficResult.data ?? []) {
        const sourceName = String(report.foreign_partner_id ?? 'Unattributed')
        const source = sourceTotals.get(sourceName) ?? {
          source: sourceName,
          visits: 0,
          registrations: 0,
          deposits: 0,
          firstDeposits: 0,
        }

        source.visits += Number(report.visits) || 0
        source.registrations += Number(report.registrations_count) || 0
        source.deposits += Number(report.deposits_count) || 0
        source.firstDeposits += Number(report.ftd_count) || 0
        sourceTotals.set(sourceName, source)
      }

      const sources = Array.from(sourceTotals.values()).sort((a, b) => b.visits - a.visits)
      const trafficRegistrations = trafficResult.data?.length
        ? sources.reduce((total, source) => total + source.registrations, 0)
        : null
      const firstDeposits = trafficResult.data?.length
        ? sources.reduce((total, source) => total + source.firstDeposits, 0)
        : null

      setMetrics({
        totalUsers: totalUsersResult.count,
        newUsers: newUsersResult.count,
        trafficRegistrations,
        firstDeposits,
        ftdRate: firstDeposits !== null && trafficRegistrations !== null && trafficRegistrations > 0
          ? (firstDeposits / trafficRegistrations) * 100
          : null,
        sources,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load acquisition analytics.'
      console.error('Failed to load acquisition analytics:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchMetrics()
  }, [fetchMetrics])

  const handleRefresh = () => {
    void fetchMetrics()
  }

  const handleExportCSV = () => {
    if (!metrics?.sources.length) {
      setNotification('No traffic-source records are available to export.')
      return
    }

    const headers = ['Source', 'Visits', 'Registrations', 'Deposits', 'FTD', 'FTD Conversion Rate %']
    const rows = metrics.sources.map(source => [
      `"${source.source.replace(/"/g, '""')}"`,
      source.visits,
      source.registrations,
      source.deposits,
      source.firstDeposits,
      source.registrations > 0
        ? ((source.firstDeposits / source.registrations) * 100).toFixed(2)
        : '',
    ])
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`
    link.download = `acquisition-sources-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotification(`Exported ${metrics.sources.length} traffic sources.`)
  }

  const metricText = (value: number | null, format: (number: number) => string = formatNumber) =>
    value === null ? '—' : format(value)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {notification && (
        <p role="status" className="rounded-lg border p-3 text-sm text-muted-foreground">
          {notification}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acquisition</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Traffic, registrations, and first-time deposits reported in the last 30 days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" onClick={handleRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>Acquisition analytics could not be loaded: {error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricText(metrics?.totalUsers ?? null)}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricText(metrics?.newUsers ?? null)}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">First Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricText(metrics?.firstDeposits ?? null)}</div>
            <p className="text-xs text-muted-foreground mt-1">From reported traffic sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">FTD Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.ftdRate === null || metrics?.ftdRate === undefined ? '—' : formatPercentage(metrics.ftdRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.trafficRegistrations === null || metrics?.trafficRegistrations === undefined
                ? 'First deposits / reported traffic registrations'
                : `${formatNumber(metrics.firstDeposits ?? 0)} first deposits / ${formatNumber(metrics.trafficRegistrations)} reported traffic registrations`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Channels & Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Channel</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>First Deposits</TableHead>
                <TableHead>FTD / Registration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.sources.length ? metrics.sources.map(source => (
                <TableRow key={source.source}>
                  <TableCell className="font-medium">{source.source}</TableCell>
                  <TableCell>{formatNumber(source.visits)}</TableCell>
                  <TableCell>{formatNumber(source.registrations)}</TableCell>
                  <TableCell>{formatNumber(source.deposits)}</TableCell>
                  <TableCell>{formatNumber(source.firstDeposits)}</TableCell>
                  <TableCell>
                    {source.registrations > 0
                      ? formatPercentage((source.firstDeposits / source.registrations) * 100)
                      : '—'}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {loading ? 'Loading traffic reports…' : 'No traffic reports are available for the last 30 days.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
