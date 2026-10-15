'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CreditCard, DollarSign, RefreshCw, TrendingUp } from 'lucide-react'
import { addDays, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns'
import { DateRange } from 'react-day-picker'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/lib/utils'

const TIME_RANGES = {
  today: { label: 'Today', getRange: () => ({ start: startOfDay(new Date()), end: new Date() }) },
  yesterday: { label: 'Yesterday', getRange: () => ({ start: startOfDay(subDays(new Date(), 1)), end: startOfDay(new Date()) }) },
  thisWeek: { label: 'This Week', getRange: () => ({ start: startOfWeek(new Date()), end: new Date() }) },
  lastWeek: { label: 'Last Week', getRange: () => ({ start: startOfWeek(subWeeks(new Date(), 1)), end: startOfWeek(new Date()) }) },
  thisMonth: { label: 'This Month', getRange: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  lastMonth: { label: 'Last Month', getRange: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: startOfMonth(new Date()) }) },
  thisYear: { label: 'This Year', getRange: () => ({ start: startOfYear(new Date()), end: new Date() }) },
  lastYear: { label: 'Last Year', getRange: () => ({ start: startOfYear(subYears(new Date(), 1)), end: startOfYear(new Date()) }) },
  custom: { label: 'Custom Range', getRange: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
} as const

type TimeRangeKey = keyof typeof TIME_RANGES
type SqlValue = string | number | null

interface QueryResponse<T> {
  data: T[] | null
  error: string | null
}

interface CurrencySummaryRow {
  currency: string | null
  total_deposits: SqlValue
  total_withdrawals: SqlValue
  deposit_attempts: SqlValue
  successful_deposits: SqlValue
  withdrawal_attempts: SqlValue
  successful_withdrawals: SqlValue
}

interface FtdSummaryRow {
  ftd_attempts: SqlValue
  ftd_successes: SqlValue
  std_attempts: SqlValue
  std_successes: SqlValue
}

interface DailyTrendRow {
  day: string
  attempts: SqlValue
  successes: SqlValue
}

interface PaymentSystemRow {
  name: string
  attempts: SqlValue
  successes: SqlValue
}

interface TransactionRow {
  id: number | string
  user_id: number | string | null
  action: string | null
  amount_cents: SqlValue
  currency: string | null
  payment_system: string | null
  psp_system: string | null
  success: boolean | null
  processing: boolean | null
  created_at: string | null
}

interface PaymentMetrics {
  currencies: Array<{
    currency: string
    deposits: number
    withdrawals: number
  }>
  depositAttempts: number
  depositSuccesses: number
  withdrawalAttempts: number
  withdrawalSuccesses: number
  ftdAttempts: number
  ftdSuccesses: number
  stdAttempts: number
  stdSuccesses: number
  dailyTrends: Array<{ date: string; attempts: number; successRate: number }>
  paymentSystems: Array<{ name: string; attempts: number; successRate: number }>
  transactions: TransactionRow[]
}

const WITHDRAWAL_ACTIONS = `('cashout', 'withdrawal', 'withdraw')`

function numeric(value: SqlValue): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

function successRate(successes: number, attempts: number): number | null {
  return attempts > 0 ? (successes / attempts) * 100 : null
}

function moneyByCurrency(value: number, currency: string): string {
  return /^[A-Z]{3}$/.test(currency)
    ? formatCurrency(value, currency)
    : `${formatNumber(value)} ${currency}`
}

async function runQuery<T>(sql: string, params: string[]): Promise<T[]> {
  const response = await fetch('/api/pg-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  })

  const result = await response.json() as QueryResponse<T>
  if (!response.ok || result.error) {
    throw new Error(result.error || `Payment query failed with status ${response.status}.`)
  }
  return result.data ?? []
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('thisMonth')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const currentRange = useMemo(() => (
    timeRange === 'custom' && dateRange?.from && dateRange?.to
      ? { start: dateRange.from, end: dateRange.to }
      : TIME_RANGES[timeRange].getRange()
  ), [timeRange, dateRange])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = currentRange.start.toISOString()
    const to = timeRange === 'custom'
      ? addDays(startOfDay(currentRange.end), 1).toISOString()
      : currentRange.end.toISOString()

    try {
      const [summaryRows, ftdRows, trendRows, systemRows, transactionRows] = await Promise.all([
        runQuery<CurrencySummaryRow>(
          `SELECT
             COALESCE(currency, 'Unknown') AS currency,
             COALESCE(SUM(CASE WHEN action = 'deposit' AND success IS TRUE THEN amount_cents ELSE 0 END), 0)::numeric / 100 AS total_deposits,
             COALESCE(SUM(CASE WHEN action IN ${WITHDRAWAL_ACTIONS} AND success IS TRUE THEN amount_cents ELSE 0 END), 0)::numeric / 100 AS total_withdrawals,
             COUNT(*) FILTER (WHERE action = 'deposit') AS deposit_attempts,
             COUNT(*) FILTER (WHERE action = 'deposit' AND success IS TRUE) AS successful_deposits,
             COUNT(*) FILTER (WHERE action IN ${WITHDRAWAL_ACTIONS}) AS withdrawal_attempts,
             COUNT(*) FILTER (WHERE action IN ${WITHDRAWAL_ACTIONS} AND success IS TRUE) AS successful_withdrawals
           FROM payments_view
           WHERE created_at >= $1 AND created_at < $2
           GROUP BY COALESCE(currency, 'Unknown')
           ORDER BY COALESCE(currency, 'Unknown')`,
          [from, to],
        ),
        runQuery<FtdSummaryRow>(
          `WITH ordered_deposits AS (
             SELECT user_id, success, created_at, id,
               COUNT(*) FILTER (WHERE success IS TRUE) OVER (
                 PARTITION BY user_id
                 ORDER BY created_at, id
                 ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
               ) AS prior_successful_deposits
             FROM payments_view
             WHERE action = 'deposit' AND user_id IS NOT NULL AND created_at IS NOT NULL
           )
           SELECT
             COUNT(*) FILTER (WHERE prior_successful_deposits = 0) AS ftd_attempts,
             COUNT(*) FILTER (WHERE prior_successful_deposits = 0 AND success IS TRUE) AS ftd_successes,
             COUNT(*) FILTER (WHERE prior_successful_deposits > 0) AS std_attempts,
             COUNT(*) FILTER (WHERE prior_successful_deposits > 0 AND success IS TRUE) AS std_successes
           FROM ordered_deposits
           WHERE created_at >= $1 AND created_at < $2`,
          [from, to],
        ),
        runQuery<DailyTrendRow>(
          `SELECT
             DATE_TRUNC('day', created_at)::date::text AS day,
             COUNT(*) AS attempts,
             COUNT(*) FILTER (WHERE success IS TRUE) AS successes
           FROM payments_view
           WHERE created_at >= $1 AND created_at < $2
           GROUP BY DATE_TRUNC('day', created_at)::date
           ORDER BY day`,
          [from, to],
        ),
        runQuery<PaymentSystemRow>(
          `SELECT
             COALESCE(NULLIF(payment_system, ''), NULLIF(psp_system, ''), 'Unknown') AS name,
             COUNT(*) AS attempts,
             COUNT(*) FILTER (WHERE success IS TRUE) AS successes
           FROM payments_view
           WHERE created_at >= $1 AND created_at < $2
           GROUP BY COALESCE(NULLIF(payment_system, ''), NULLIF(psp_system, ''), 'Unknown')
           ORDER BY attempts DESC
           LIMIT 10`,
          [from, to],
        ),
        runQuery<TransactionRow>(
          `SELECT id, user_id, action, amount_cents, currency, payment_system, psp_system, success, processing, created_at
           FROM payments_view
           WHERE created_at >= $1 AND created_at < $2
           ORDER BY created_at DESC, id DESC
           LIMIT 100`,
          [from, to],
        ),
      ])

      const summary = summaryRows.map(row => ({
        currency: row.currency || 'Unknown',
        deposits: numeric(row.total_deposits),
        withdrawals: numeric(row.total_withdrawals),
      }))
      const counts = summaryRows.reduce((totals, row) => ({
        depositAttempts: totals.depositAttempts + numeric(row.deposit_attempts),
        depositSuccesses: totals.depositSuccesses + numeric(row.successful_deposits),
        withdrawalAttempts: totals.withdrawalAttempts + numeric(row.withdrawal_attempts),
        withdrawalSuccesses: totals.withdrawalSuccesses + numeric(row.successful_withdrawals),
      }), { depositAttempts: 0, depositSuccesses: 0, withdrawalAttempts: 0, withdrawalSuccesses: 0 })
      const ftd = ftdRows[0]

      setMetrics({
        currencies: summary,
        ...counts,
        ftdAttempts: numeric(ftd?.ftd_attempts ?? 0),
        ftdSuccesses: numeric(ftd?.ftd_successes ?? 0),
        stdAttempts: numeric(ftd?.std_attempts ?? 0),
        stdSuccesses: numeric(ftd?.std_successes ?? 0),
        dailyTrends: trendRows.map(row => {
          const attempts = numeric(row.attempts)
          return {
            date: row.day,
            attempts,
            successRate: successRate(numeric(row.successes), attempts) ?? 0,
          }
        }),
        paymentSystems: systemRows.map(row => {
          const attempts = numeric(row.attempts)
          return {
            name: row.name,
            attempts,
            successRate: successRate(numeric(row.successes), attempts) ?? 0,
          }
        }),
        transactions: transactionRows,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load payment analytics.'
      console.error('Failed to load payment analytics:', err)
      setError(message)
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }, [currentRange, timeRange])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    void fetchData()
  }

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (metrics?.transactions ?? []).filter(transaction => [
      String(transaction.id),
      transaction.user_id === null ? '' : String(transaction.user_id),
      transaction.action ?? '',
      transaction.payment_system ?? '',
      transaction.psp_system ?? '',
    ].some(value => value.toLowerCase().includes(term)))
  }, [metrics, search])

  const metric = metrics
  const formatAcceptance = (successes: number, attempts: number) => {
    const rate = successRate(successes, attempts)
    return rate === null ? '—' : formatPercentage(rate)
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transaction performance and first-time/repeat deposit acceptance from live payment records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={value => setTimeRange(value as TimeRangeKey)}>
            <SelectTrigger className="w-[180px]" aria-label="Payment date range">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key, range]) => (
                <SelectItem key={key} value={key}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeRange === 'custom' && (
            <DatePickerWithRange value={dateRange} onChange={setDateRange} />
          )}
          <Button variant="outline" onClick={handleRefresh} disabled={loading} aria-label="Refresh payment analytics">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>Payment analytics could not be loaded: {error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {metric?.currencies.length ? metric.currencies.map(row => (
                <p key={row.currency} className="text-xl font-bold">{moneyByCurrency(row.deposits, row.currency)}</p>
              )) : <p className="text-2xl font-bold">{loading ? 'Loading…' : '—'}</p>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric ? `${formatNumber(metric.depositSuccesses)} of ${formatNumber(metric.depositAttempts)} attempts succeeded` : 'Selected date range'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Withdrawals</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {metric?.currencies.length ? metric.currencies.map(row => (
                <p key={row.currency} className="text-xl font-bold">{moneyByCurrency(row.withdrawals, row.currency)}</p>
              )) : <p className="text-2xl font-bold">{loading ? 'Loading…' : '—'}</p>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric ? `${formatNumber(metric.withdrawalSuccesses)} of ${formatNumber(metric.withdrawalAttempts)} attempts succeeded` : 'Selected date range'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FTD Acceptance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric ? formatAcceptance(metric.ftdSuccesses, metric.ftdAttempts) : loading ? 'Loading…' : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric ? `${formatNumber(metric.ftdSuccesses)} successful / ${formatNumber(metric.ftdAttempts)} attempts` : 'First successful deposit per player'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">STD Acceptance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric ? formatAcceptance(metric.stdSuccesses, metric.stdAttempts) : loading ? 'Loading…' : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric ? `${formatNumber(metric.stdSuccesses)} successful / ${formatNumber(metric.stdAttempts)} attempts` : 'Deposits after a previous successful deposit'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Daily Transaction Attempts & Success Rate</CardTitle></CardHeader>
        <CardContent>
          {metric?.dailyTrends.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="attempts" name="Attempts" stroke="#6366f1" />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" name="Success Rate %" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              {loading ? 'Loading payment activity…' : 'No payment activity is available for this date range.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment Systems</CardTitle></CardHeader>
        <CardContent>
          {metric?.paymentSystems.length ? (
            <div className="space-y-4">
              {metric.paymentSystems.map(system => (
                <div key={system.name} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4">
                  <span className="truncate font-medium">{system.name}</span>
                  <span className="text-sm text-muted-foreground">{formatNumber(system.attempts)} attempts</span>
                  <span className="w-20 text-right text-sm">{formatPercentage(system.successRate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {loading ? 'Loading payment system breakdown…' : 'No payment system data is available for this date range.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Input
            aria-label="Search transactions"
            placeholder="Search by transaction, user, action, or payment method..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="mb-4 max-w-md"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length ? filteredTransactions.map(transaction => {
                const amount = numeric(transaction.amount_cents) / 100
                const currency = transaction.currency || 'Unknown'
                const status = transaction.success ? 'Success' : transaction.processing ? 'Pending' : 'Failed'
                return (
                  <TableRow key={String(transaction.id)}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.user_id === null ? '—' : transaction.user_id}</TableCell>
                    <TableCell className="capitalize">{transaction.action || '—'}</TableCell>
                    <TableCell>{moneyByCurrency(amount, currency)}</TableCell>
                    <TableCell>{transaction.payment_system || transaction.psp_system || '—'}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    {loading
                      ? 'Loading transactions…'
                      : search
                        ? 'No transactions match this search.'
                        : 'No transactions are available for this date range.'}
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
