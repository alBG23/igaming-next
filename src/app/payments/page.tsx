"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { supabase, testSupabaseConnection } from "@/lib/supabase"

interface PaymentMetrics {
  total_revenue: number
  total_payouts: number
  net_revenue: number
  success_rate: number
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  method: string
  player_id: string
  player_name: string
}

interface Report {
  id: string
  title: string
  period: string
  total_transactions: number
  total_amount: number
  status: 'ready' | 'processing' | 'failed'
  created_at: string
}

const fallbackMetrics: PaymentMetrics = {
  total_revenue: 50000,
  total_payouts: 20000,
  net_revenue: 30000,
  success_rate: 98.5
}

const fallbackChartData = [
  { month: 'Jan', revenue: 40000, payouts: 12000, net: 28000 },
  { month: 'Feb', revenue: 30000, payouts: 9000, net: 21000 },
  { month: 'Mar', revenue: 20000, payouts: 6000, net: 14000 },
  { month: 'Apr', revenue: 27800, payouts: 8340, net: 19460 },
  { month: 'May', revenue: 18900, payouts: 5670, net: 13230 },
  { month: 'Jun', revenue: 23900, payouts: 7170, net: 16730 }
]

const fallbackTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 1000,
    status: 'completed',
    date: '2024-03-15',
    method: 'Credit Card',
    player_id: 'P001',
    player_name: 'John Doe'
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 500,
    status: 'pending',
    date: '2024-03-14',
    method: 'Bank Transfer',
    player_id: 'P002',
    player_name: 'Jane Smith'
  },
  {
    id: '3',
    type: 'deposit',
    amount: 2000,
    status: 'completed',
    date: '2024-03-13',
    method: 'Crypto',
    player_id: 'P003',
    player_name: 'Mike Johnson'
  }
]

const fallbackReports: Report[] = [
  {
    id: '1',
    title: 'Monthly Revenue Report',
    period: 'March 2024',
    total_transactions: 150,
    total_amount: 50000,
    status: 'ready',
    created_at: '2024-03-01'
  },
  {
    id: '2',
    title: 'Weekly Transaction Summary',
    period: 'Week 11, 2024',
    total_transactions: 45,
    total_amount: 15000,
    status: 'processing',
    created_at: '2024-03-11'
  }
]

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [metrics, setMetrics] = useState<PaymentMetrics>(fallbackMetrics)
  const [chartData, setChartData] = useState(fallbackChartData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(fallbackTransactions)
  const [reports, setReports] = useState<Report[]>(fallbackReports)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { connected, error: connectionError } = await testSupabaseConnection()
      
      if (!connected) {
        throw new Error(connectionError || 'Unable to connect to database')
      }

      const { data: metricsData, error: metricsError } = await supabase
        .from('payment_metrics')
        .select('*')
        .single()

      if (metricsError) throw metricsError

      const { data: chartData, error: chartError } = await supabase
        .from('payment_trend')
        .select('*')
        .order('month', { ascending: true })

      if (chartError) throw chartError

      setMetrics(metricsData)
      setChartData(chartData)
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setMetrics(fallbackMetrics)
      setChartData(fallbackChartData)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || fallbackTransactions)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setTransactions(fallbackTransactions)
    }
  }

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || fallbackReports)
    } catch (err) {
      console.error('Error fetching reports:', err)
      setReports(fallbackReports)
    }
  }

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions()
    } else if (activeTab === 'reports') {
      fetchReports()
    }
  }, [activeTab])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            className="w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>Failed to connect to the database. Please check your connection and try again.</p>
          </div>
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.total_revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.total_payouts.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+8.3% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.net_revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.success_rate}%</div>
                    <p className="text-xs text-muted-foreground">+0.5% from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="transactions" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search transactions..."
                    className="w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Player</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{transaction.id}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium">{transaction.player_name}</div>
                              <div className="text-muted-foreground">{transaction.player_id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                transaction.type === 'deposit' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm">{transaction.method}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {reports.map((report) => (
                  <Card 
                    key={report.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedReport === report.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Period</span>
                          <span className="text-sm font-medium">{report.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Transactions</span>
                          <span className="text-sm font-medium">{report.total_transactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Amount</span>
                          <span className="text-sm font-medium">${report.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            report.status === 'ready' 
                              ? 'bg-green-100 text-green-800' 
                              : report.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <span className="text-sm font-medium">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
} 