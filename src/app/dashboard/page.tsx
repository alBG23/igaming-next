"use client"

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { addDays, addMonths, addYears, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

interface DashboardMetrics {
  activeUsers: number
  totalRevenue: number
  netRevenue: number
  successRate: number
  avgTransactionValue: number
  dailyTrends: {
    date: string
    deposits: number
    withdrawals: number
    ggr: number
    ngr: number
  }[]
}

const TIME_RANGES = {
  today: {
    label: 'Today',
    getRange: () => ({
      start: startOfDay(new Date()),
      end: new Date()
    })
  },
  yesterday: {
    label: 'Yesterday',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 1)),
      end: startOfDay(new Date())
    })
  },
  thisWeek: {
    label: 'This Week',
    getRange: () => ({
      start: startOfWeek(new Date()),
      end: new Date()
    })
  },
  lastWeek: {
    label: 'Last Week',
    getRange: () => ({
      start: startOfWeek(subWeeks(new Date(), 1)),
      end: startOfWeek(new Date())
    })
  },
  thisMonth: {
    label: 'This Month',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: new Date()
    })
  },
  lastMonth: {
    label: 'Last Month',
    getRange: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: startOfMonth(new Date())
    })
  },
  thisYear: {
    label: 'This Year',
    getRange: () => ({
      start: startOfYear(new Date()),
      end: new Date()
    })
  },
  lastYear: {
    label: 'Last Year',
    getRange: () => ({
      start: startOfYear(subYears(new Date(), 1)),
      end: startOfYear(new Date())
    })
  },
  custom: {
    label: 'Custom Range',
    getRange: () => ({
      start: subDays(new Date(), 30),
      end: new Date()
    })
  }
}

const DEFAULT_METRICS: DashboardMetrics = {
  activeUsers: 0,
  totalRevenue: 0,
  netRevenue: 0,
  successRate: 0,
  avgTransactionValue: 0,
  dailyTrends: []
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>('thisMonth')
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>(() => TIME_RANGES.custom.getRange())
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentRange = useMemo(() => {
    return timeRange === 'custom' ? customRange : TIME_RANGES[timeRange].getRange()
  }, [timeRange, customRange])

  const startKey = currentRange.start.getTime()
  const endKey = currentRange.end.getTime()

  useEffect(() => {
    let isCancelled = false
    const abortController = new AbortController()

    // Safety timeout: abort slow queries after 5 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      abortController.abort()
      if (!isCancelled) {
        setLoading(false)
      }
    }, 5000)

    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)

        const adjustedStart = currentRange.start
        const adjustedEnd = currentRange.end

        console.log('Query date range:', {
          start: adjustedStart.toISOString(),
          end: adjustedEnd.toISOString()
        })

        // Fetch users, payments, and games concurrently with abortSignal
        const fetchUsers = async () => {
          try {
            const res = await supabase
              .from('users_view')
              .select('id', { count: 'exact' })
              .gte('last_sign_in_at', adjustedStart.toISOString())
              .lte('last_sign_in_at', adjustedEnd.toISOString())
              .limit(1)
              .abortSignal(abortController.signal)
            return { count: res.count ?? 0, error: res.error }
          } catch (err: any) {
            if (err?.name === 'AbortError') return { count: 0, error: null }
            console.warn('Failed to fetch active users:', err)
            return { count: 0, error: err }
          }
        }

        const fetchPayments = async () => {
          try {
            const res = await supabase
              .from('payments_view')
              .select('success, amount_cents, created_at, action')
              .gte('created_at', adjustedStart.toISOString())
              .lte('created_at', adjustedEnd.toISOString())
              .order('created_at', { ascending: false })
              .limit(5000)
              .abortSignal(abortController.signal)
            return { data: res.data || [], error: res.error }
          } catch (err: any) {
            if (err?.name === 'AbortError') return { data: [], error: null }
            console.warn('Failed to fetch payments:', err)
            return { data: [], error: err }
          }
        }

        const fetchGames = async () => {
          try {
            const res = await supabase
              .from('casino_games_view')
              .select('bets_sum, payoff_sum, created_at')
              .gte('created_at', adjustedStart.toISOString())
              .lte('created_at', adjustedEnd.toISOString())
              .order('created_at', { ascending: false })
              .limit(5000)
              .abortSignal(abortController.signal)
            return { data: res.data || [], error: res.error }
          } catch (err: any) {
            if (err?.name === 'AbortError') return { data: [], error: null }
            console.warn('Failed to fetch game metrics:', err)
            return { data: [], error: err }
          }
        }

        const [usersRes, paymentsRes, gamesRes] = await Promise.all([
          fetchUsers(),
          fetchPayments(),
          fetchGames()
        ])

        if (isCancelled) return

        if (usersRes.error) {
          console.warn('users_view query warning:', usersRes.error.message)
        }
        if (paymentsRes.error) {
          console.warn('payments_view query warning:', paymentsRes.error.message)
        }
        if (gamesRes.error) {
          console.warn('casino_games_view query warning:', gamesRes.error.message)
        }

        const activeUsers = usersRes.count || 0
        const paymentsData = paymentsRes.data || []
        const gamesData = gamesRes.data || []

        console.log('Metrics fetched:', {
          activeUsers,
          paymentsCount: paymentsData.length,
          gamesCount: gamesData.length
        })

        // Calculate metrics
        const successfulPayments = paymentsData.filter(p => p.success).length
        const totalPayments = paymentsData.length
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

        const totalAmount = paymentsData.reduce((sum, p) => sum + (p.amount_cents || 0), 0)
        const avgTransactionValue = totalPayments > 0 ? totalAmount / totalPayments / 100 : 0

        // Derive revenue from payments
        const depositsSum = (paymentsData.filter(p => p.action === 'deposit' && p.success)
          .reduce((sum, p) => sum + (p.amount_cents || 0), 0)) / 100
        const withdrawalsSum = (paymentsData.filter(p => p.action === 'withdrawal' && p.success)
          .reduce((sum, p) => sum + (p.amount_cents || 0), 0)) / 100

        const totalRevenue = depositsSum
        const netRevenue = depositsSum - withdrawalsSum

        // Calculate daily trends
        const dailyTrends = new Map<string, {
          deposits: number
          withdrawals: number
          ggr: number
          ngr: number
        }>()

        // Process payments for daily trends
        paymentsData.forEach(payment => {
          if (!payment.created_at) return
          const date = format(new Date(payment.created_at), 'yyyy-MM-dd')
          if (!dailyTrends.has(date)) {
            dailyTrends.set(date, {
              deposits: 0,
              withdrawals: 0,
              ggr: 0,
              ngr: 0
            })
          }
          const trend = dailyTrends.get(date)!
          const amt = (payment.amount_cents || 0) / 100
          if (payment.action === 'deposit' && payment.success) {
            trend.deposits += amt
          } else if (payment.action === 'withdrawal' && payment.success) {
            trend.withdrawals += amt
          }
        })

        // Process games for daily trends
        gamesData.forEach((game: any) => {
          if (!game.created_at) return
          const date = format(new Date(game.created_at), 'yyyy-MM-dd')
          if (!dailyTrends.has(date)) {
            dailyTrends.set(date, {
              deposits: 0,
              withdrawals: 0,
              ggr: 0,
              ngr: 0
            })
          }
          const trend = dailyTrends.get(date)!
          const betAmount = (Number(game.bets_sum ?? game.bet_amount) || 0) / 100
          const winAmount = (Number(game.payoff_sum ?? game.win_amount) || 0) / 100
          trend.ggr += betAmount - winAmount
          trend.ngr += betAmount - winAmount
        })

        const formattedDailyTrends = Array.from(dailyTrends.entries())
          .map(([date, data]) => ({
            date,
            ...data
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        if (!isCancelled) {
          setMetrics({
            activeUsers,
            totalRevenue,
            netRevenue,
            successRate,
            avgTransactionValue,
            dailyTrends: formattedDailyTrends
          })
        }
      } catch (err) {
        console.error('Error in fetchMetrics:', err)
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchMetrics()

    return () => {
      clearTimeout(timeoutId)
      isCancelled = true
      abortController.abort()
    }
  }, [timeRange, startKey, endKey])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as keyof typeof TIME_RANGES)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeRange === 'custom' && (
            <DatePickerWithRange
              value={{ from: customRange.start, to: customRange.end } as any}
              onChange={(range: any) => range && setCustomRange({ start: range.from, end: range.to })}
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.netRevenue)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.successRate)}</div>
            <p className="text-xs text-muted-foreground">Payment success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avgTransactionValue)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends Charts */}
      <div className="grid gap-6 mb-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => formatPercentage(value)}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Margin') {
                        return [formatPercentage(value), name]
                      }
                      return [formatCurrency(value), name]
                    }}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="ggr" 
                    name="GGR" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="ngr" 
                    name="NGR" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Bar dataKey="deposits" name="Deposits" fill="#8884d8" />
                  <Bar dataKey="withdrawals" name="Withdrawals" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => formatPercentage(value)}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Margin') {
                        return [formatPercentage(value), name]
                      }
                      return [formatCurrency(value), name]
                    }}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="deposits" 
                    name="Deposits" 
                    fill="#8884d8" 
                    stackId="a"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="withdrawals" 
                    name="Withdrawals" 
                    fill="#82ca9d" 
                    stackId="a"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="ggr" 
                    name="GGR" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 