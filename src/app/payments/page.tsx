'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage, formatDateTime } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/date-range-picker'
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
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { DateRange } from "react-day-picker"

interface PaymentMetrics {
  // Overall metrics
  totalDeposits: number
  totalWithdrawals: number
  depositSuccessRate: number
  withdrawalSuccessRate: number
  ftdAcceptanceRatio: number
  stdAcceptanceRatio: number
  ftdAttempts: number
  stdAttempts: number
  // Daily trends
  dailyTrends: {
    date: string
    deposits: number
    withdrawals: number
    successRate: number
  }[]
  // Payment systems
  paymentSystems: {
    name: string
    count: number
    successRate: number
    declineReasons: {
      reason: string
      count: number
    }[]
  }[]
  // Countries
  countries: {
    code: string
    name: string
    count: number
    successRate: number
  }[]
  // Devices
  devices: {
    type: string
    count: number
    successRate: number
  }[]
  // Affiliates
  affiliates: {
    id: string
    name: string
    deposits: number
    withdrawals: number
    successRate: number
  }[]
}

interface Transaction {
  id: string
  player: string
  type: 'deposit' | 'withdrawal'
  amount: number
  currency: string
  method: string
  status: 'success' | 'failed' | 'pending'
  declineReason?: string
  affiliate?: string
  createdAt: string
}

interface Report {
  id: string
  date: string
  deposits: number
  withdrawals: number
  successRate: number
}

// Predefined time ranges
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

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('transactions')
  const [searchQuery, setSearchQuery] = useState('')
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>('thisMonth')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  const [selectedView, setSelectedView] = useState<'total' | 'country' | 'payment' | 'device'>('total')
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  const currentRange = timeRange === 'custom' && dateRange 
    ? { start: dateRange.from, end: dateRange.to }
    : TIME_RANGES[timeRange].getRange()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([
          fetchMetrics(),
          fetchTransactions(),
          fetchReports()
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, timeRange, dateRange])

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)
        
        // Use the imported supabase client
        const { data, error } = await supabase
          .from('payments_view')
          .select('*')
          .gte('created_at', date?.from?.toISOString() || '')
          .lte('created_at', date?.to?.toISOString() || '')
        
        if (error) throw error
        
        // Process the data and update metrics
        // ... rest of your metrics calculation logic ...
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [date])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payments_view')
        .select(`
          *,
          user:users_view(*),
          affiliate:affiliates_view(*)
        `)
        .gte('created_at', currentRange.start.toISOString())
        .lte('created_at', currentRange.end.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setTransactions(data.map(payment => ({
        id: payment.id,
        player: payment.user?.email || 'Unknown',
        type: payment.action,
        amount: payment.amount_cents / 100,
        currency: payment.currency,
        method: payment.payment_system,
        status: payment.success ? 'success' : payment.decline_reason ? 'failed' : 'pending',
        declineReason: payment.decline_reason,
        affiliate: payment.affiliate?.name,
        createdAt: payment.created_at
      })))
    } catch (err) {
      console.error('Error fetching transactions:', err)
      throw err
    }
  }

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('income_reports')
        .select('*')
        .gte('date', currentRange.start.toISOString())
        .lte('date', currentRange.end.toISOString())
        .order('date', { ascending: false })

      if (error) throw error

      setReports(data.map(report => ({
        id: report.id,
        date: report.date,
        deposits: report.deposits_sum / 100,
        withdrawals: report.cashouts_sum / 100,
        successRate: report.deposits_count ? (report.first_deposits_count / report.deposits_count) * 100 : 0
      })))
    } catch (err) {
      console.error('Error fetching reports:', err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments Dashboard</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as keyof typeof TIME_RANGES)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeRange === 'custom' && (
            <DateRangePicker
              date={dateRange}
              onDateChange={(range) => setDateRange(range)}
            />
          )}
        </div>
      </div>

      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalDeposits)}</div>
                <p className="text-xs text-muted-foreground">
                  Success Rate: {formatPercentage(metrics.depositSuccessRate / 100)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalWithdrawals)}</div>
                <p className="text-xs text-muted-foreground">
                  Success Rate: {formatPercentage(metrics.withdrawalSuccessRate / 100)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FTD Acceptance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.ftdAcceptanceRatio / 100)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(metrics.ftdAttempts)} attempts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">STD Acceptance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.stdAcceptanceRatio / 100)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(metrics.stdAttempts)} attempts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trends */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Daily Payment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={metrics.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="deposits" name="Deposits" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="withdrawals" name="Withdrawals" fill="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="successRate" name="Success Rate" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Systems */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.paymentSystems}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {metrics.paymentSystems.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="space-y-4">
                    {metrics.paymentSystems.map((system) => (
                      <div key={system.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{system.name}</span>
                          <span className="text-muted-foreground">
                            {formatPercentage(system.successRate / 100)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${system.successRate}%` }}
                          />
                        </div>
                        {system.declineReasons.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Top decline reason: {system.declineReasons[0].reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countries */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.countries}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {metrics.countries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="space-y-4">
                    {metrics.countries.map((country) => (
                      <div key={country.code} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{country.name}</span>
                          <span className="text-muted-foreground">
                            {formatPercentage(country.successRate / 100)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${country.successRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devices */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.devices}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {metrics.devices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="space-y-4">
                    {metrics.devices.map((device) => (
                      <div key={device.type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{device.type}</span>
                          <span className="text-muted-foreground">
                            {formatPercentage(device.successRate / 100)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${device.successRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affiliates */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Affiliates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.affiliates.map((affiliate) => (
                  <div key={affiliate.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{affiliate.name}</span>
                      <span className="text-muted-foreground">
                        {formatPercentage(affiliate.successRate / 100)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Deposits</div>
                        <div className="font-medium">{formatCurrency(affiliate.deposits)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Withdrawals</div>
                        <div className="font-medium">{formatCurrency(affiliate.withdrawals)}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${affiliate.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm mb-4"
                />
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Player</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Method</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Affiliate</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {transactions
                          .filter(t => 
                            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.method.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((transaction) => (
                            <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-4 align-middle">{transaction.id}</td>
                              <td className="p-4 align-middle">{transaction.player}</td>
                              <td className="p-4 align-middle">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  transaction.type === 'deposit' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="p-4 align-middle">{formatCurrency(transaction.amount, transaction.currency)}</td>
                              <td className="p-4 align-middle">{transaction.method}</td>
                              <td className="p-4 align-middle">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  transaction.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="p-4 align-middle">{transaction.affiliate || '-'}</td>
                              <td className="p-4 align-middle">{formatDateTime(transaction.createdAt)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 