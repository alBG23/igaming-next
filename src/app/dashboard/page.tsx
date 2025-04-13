"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
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

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>('thisMonth')
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>(TIME_RANGES.custom.getRange())
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentRange = timeRange === 'custom' ? customRange : TIME_RANGES[timeRange].getRange()

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching metrics for range:', {
          start: currentRange.start.toISOString(),
          end: currentRange.end.toISOString()
        })

        // Get the latest available data if no data in the selected range
        const { data: latestRevenue, error: latestError } = await supabase
          .from('revenue_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)

        if (latestError) {
          console.error('Error fetching latest revenue:', latestError)
          throw latestError
        }

        if (!latestRevenue || latestRevenue.length === 0) {
          throw new Error('No revenue data available')
        }

        const latestDate = new Date(latestRevenue[0].created_at)
        console.log('Latest available data date:', latestDate)

        // Adjust the date range to include the latest available data
        const adjustedStart = new Date(Math.min(currentRange.start.getTime(), latestDate.getTime()))
        const adjustedEnd = new Date(Math.min(currentRange.end.getTime(), latestDate.getTime()))

        console.log('Adjusted date range:', {
          start: adjustedStart.toISOString(),
          end: adjustedEnd.toISOString()
        })

        // Get active users
        console.log('Fetching active users...')
        const { data: usersData, error: usersError } = await supabase
          .from('users_view')
          .select('id, last_sign_in_at')
          .gte('last_sign_in_at', adjustedStart.toISOString())
          .lte('last_sign_in_at', adjustedEnd.toISOString())

        if (usersError) {
          console.error('Error fetching users:', usersError)
          throw usersError
        }
        console.log('Active users fetched:', usersData?.length)

        // Get revenue metrics
        console.log('Fetching revenue metrics...')
        const { data: revenueData, error: revenueError } = await supabase
          .from('revenue_metrics')
          .select('total_revenue, net_revenue')
          .gte('created_at', adjustedStart.toISOString())
          .lte('created_at', adjustedEnd.toISOString())
          .order('created_at', { ascending: false })

        if (revenueError) {
          console.error('Error fetching revenue:', revenueError)
          throw revenueError
        }
        console.log('Revenue metrics fetched:', revenueData)

        // Get payment success rate
        console.log('Fetching payment success rate...')
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments_view')
          .select('success, amount_cents, created_at, action')
          .gte('created_at', adjustedStart.toISOString())
          .lte('created_at', adjustedEnd.toISOString())

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError)
          throw paymentsError
        }
        console.log('Payments fetched:', paymentsData?.length)

        // Get game metrics
        console.log('Fetching game metrics...')
        const { data: gamesData, error: gamesError } = await supabase
          .from('casino_games_view')
          .select('bet_amount, win_amount, created_at')
          .gte('created_at', adjustedStart.toISOString())
          .lte('created_at', adjustedEnd.toISOString())

        if (gamesError) {
          console.error('Error fetching games:', gamesError)
          throw gamesError
        }
        console.log('Games fetched:', gamesData?.length)

        // Calculate metrics
        const activeUsers = usersData?.length || 0
        const totalRevenue = revenueData?.[0]?.total_revenue || 0
        const netRevenue = revenueData?.[0]?.net_revenue || 0

        const successfulPayments = paymentsData?.filter(p => p.success).length || 0
        const totalPayments = paymentsData?.length || 0
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

        const totalAmount = paymentsData?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
        const avgTransactionValue = totalPayments > 0 ? totalAmount / totalPayments / 100 : 0

        // Calculate daily trends
        const dailyTrends = new Map<string, {
          deposits: number
          withdrawals: number
          ggr: number
          ngr: number
        }>()

        // Process payments for daily trends
        paymentsData?.forEach(payment => {
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
          if (payment.action === 'deposit') {
            trend.deposits += payment.amount_cents / 100
          } else if (payment.action === 'withdrawal') {
            trend.withdrawals += payment.amount_cents / 100
          }
        })

        // Process games for daily trends
        gamesData?.forEach(game => {
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
          const betAmount = Number(game.bet_amount) || 0
          const winAmount = Number(game.win_amount) || 0
          trend.ggr += betAmount - winAmount
          trend.ngr += betAmount - winAmount // In a real implementation, subtract bonuses
        })

        const formattedDailyTrends = Array.from(dailyTrends.entries())
          .map(([date, data]) => ({
            date,
            ...data
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        console.log('Calculated metrics:', {
          activeUsers,
          totalRevenue,
          netRevenue,
          successRate,
          avgTransactionValue,
          dailyTrends: formattedDailyTrends
        })

        setMetrics({
          activeUsers,
          totalRevenue,
          netRevenue,
          successRate,
          avgTransactionValue,
          dailyTrends: formattedDailyTrends
        })
      } catch (err) {
        console.error('Error in fetchMetrics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [currentRange])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!metrics) return <div>No data available</div>

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
            <DateRangePicker
              value={customRange}
              onChange={setCustomRange}
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