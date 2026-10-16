'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { addDays, format } from 'date-fns'

interface CommissionRow {
  key: string
  partner: string
  currency: string
  income: number
  reports: number
}

interface TrafficRow {
  source: string
  visits: number
  clicks: number
  registrations: number
  deposits: number
  firstDeposits: number
}

export default function AffiliatesPage() {
  const [commissions, setCommissions] = useState<CommissionRow[]>([])
  const [traffic, setTraffic] = useState<TrafficRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [affiliateSummary, setAffiliateSummary] = useState({
    totalAffiliates: 0,
    totalRevenueCents: 0,
    totalConversions: 0,
    formattedRevenue: '',
  })

  const fetchAffiliateData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const end = new Date()
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startDateStr = format(start, 'yyyy-MM-dd')
    const endDateStr = format(end, 'yyyy-MM-dd')

    try {
      const res = await fetch(
        `/api/affiliates?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`,
      )

      if (!res.ok) throw new Error(`Affiliate API returned ${res.status}`)
      const json = await res.json()

      if (json.success && json.data) {
        const { incomeReports, trafficReports, topAffiliates, summary } = json.data

        // Map income_reports to CommissionRow
        const commissionTotals = new Map<string, CommissionRow>()
        for (const report of incomeReports) {
          const currency = 'EUR'
          const partner = report.partner_name || `Partner #${report.partner_id}`
          const key = `${partner}:${currency}`
          const aggregate = commissionTotals.get(key) ?? {
            key,
            partner,
            currency,
            income: 0,
            reports: 0,
          }
          aggregate.income += Number(report.revenue_cents) || 0
          aggregate.reports += 1
          commissionTotals.set(key, aggregate)
        }
        setCommissions(Array.from(commissionTotals.values()).sort((a, b) => b.income - a.income))

        // Map traffic_reports to TrafficRow
        const trafficTotals = new Map<string, TrafficRow>()
        for (const report of trafficReports) {
          const source = report.partner_name || `Partner #${report.partner_id}`
          const aggregate = trafficTotals.get(source) ?? {
            source,
            visits: 0,
            clicks: 0,
            registrations: 0,
            deposits: 0,
            firstDeposits: 0,
          }
          aggregate.visits += Number(report.clicks) || 0
          aggregate.clicks += Number(report.clicks) || 0
          aggregate.registrations += Number(report.registrations) || 0
          aggregate.deposits += Number(report.ftds) || 0
          aggregate.firstDeposits += Number(report.ftds) || 0
          trafficTotals.set(source, aggregate)
        }
        setTraffic(Array.from(trafficTotals.values()).sort((a, b) => b.visits - a.visits))

        // Store summary data
        setAffiliateSummary({
          totalAffiliates: summary.totalAffiliates,
          totalRevenueCents: summary.totalRevenueCents,
          totalConversions: summary.totalConversions,
          formattedRevenue: formatCurrency(summary.totalRevenueCents),
        })
      } else {
        throw new Error(json.error || 'Failed to load affiliate data')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load affiliate analytics.'
      console.error('Failed to load affiliate analytics:', err)
      setError(message)
      setCommissions([])
      setTraffic([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAffiliateData()
  }, [fetchAffiliateData])

  const handleRefresh = () => {
    void fetchAffiliateData()
  }

  const filteredCommissions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return commissions.filter(row =>
      `${row.partner} ${row.currency}`.toLowerCase().includes(term)
    )
  }, [commissions, search])
  const filteredTraffic = useMemo(() => {
    const term = search.trim().toLowerCase()
    return traffic.filter(row => row.source.toLowerCase().includes(term))
  }, [traffic, search])

  const exportCsv = () => {
    if (commissions.length === 0 && traffic.length === 0) {
      setNotification('No affiliate report records are available to export.')
      return
    }

    const rows: Array<Array<string | number>> = [
      ['Record Type', 'Partner / Source', 'Currency', 'Income', 'Visits', 'Clicks', 'Registrations', 'Deposits', 'First Deposits'],
      ...commissions.map(row => ['Commission', row.partner, row.currency, row.income, '', '', '', '', '']),
      ...traffic.map(row => ['Traffic', row.source, '', '', row.visits, row.clicks, row.registrations, row.deposits, row.firstDeposits]),
    ]
    const csv = rows.map(row => row.map(value => {
      const text = String(value)
      return `"${text.replace(/"/g, '""')}"`
    }).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = `affiliate-reports-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotification('Exported the available commission and traffic reports.')
  }

  const eurIncome = commissions
    .filter(row => row.currency === 'EUR')
    .reduce((sum, row) => sum + row.income, 0)
  const totalVisits = traffic.reduce((sum, row) => sum + row.visits, 0)
  const totalRegistrations = traffic.reduce((sum, row) => sum + row.registrations, 0)
  const totalFirstDeposits = traffic.reduce((sum, row) => sum + row.firstDeposits, 0)

  return (
    <div className="container mx-auto space-y-6 py-6">
      {notification && <p role="status" className="rounded-lg border p-3 text-sm text-muted-foreground">{notification}</p>}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reported affiliate income and acquisition traffic for the last 30 days.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
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
          <p>Affiliate analytics could not be loaded: {error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Commission Income (EUR)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(eurIncome, 'EUR')}</div>
            <p className="mt-1 text-xs text-muted-foreground">EUR reports only; other currencies remain separate below.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Reported Visits</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalVisits)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Traffic reports, last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Registration to FTD</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRegistrations > 0 ? formatPercentage((totalFirstDeposits / totalRegistrations) * 100) : '—'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatNumber(totalFirstDeposits)} first deposits / {formatNumber(totalRegistrations)} registrations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex max-w-sm items-center gap-2">
        <Input
          aria-label="Search affiliate reports"
          placeholder="Search partner or traffic source..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Commission Reports</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner ID</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Reported Income</TableHead>
                <TableHead>Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.length ? filteredCommissions.map(row => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.partner}</TableCell>
                  <TableCell>{row.currency}</TableCell>
                  <TableCell>{row.currency === 'Unknown' ? formatNumber(row.income) : formatCurrency(row.income, row.currency)}</TableCell>
                  <TableCell>{formatNumber(row.reports)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {loading ? 'Loading commission reports…' : 'No commission reports match this search for the last 30 days.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Traffic Reports</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Traffic Source ID</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>First Deposits</TableHead>
                <TableHead>FTD / Registration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTraffic.length ? filteredTraffic.map(row => (
                <TableRow key={row.source}>
                  <TableCell className="font-medium">{row.source}</TableCell>
                  <TableCell>{formatNumber(row.visits)}</TableCell>
                  <TableCell>{formatNumber(row.clicks)}</TableCell>
                  <TableCell>{formatNumber(row.registrations)}</TableCell>
                  <TableCell>{formatNumber(row.deposits)}</TableCell>
                  <TableCell>{formatNumber(row.firstDeposits)}</TableCell>
                  <TableCell>{row.registrations > 0 ? formatPercentage((row.firstDeposits / row.registrations) * 100) : '—'}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    {loading ? 'Loading traffic reports…' : 'No traffic reports match this search for the last 30 days.'}
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
