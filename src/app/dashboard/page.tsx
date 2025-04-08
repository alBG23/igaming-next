"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, DollarSign, Activity, Search, Clock, AlertCircle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { supabase, testSupabaseConnection, getDashboardMetrics } from "@/lib/supabase"

interface DashboardData {
  activeUsers: number;
  recentPayments: {
    id: number;
    created_at: string;
    amount_cents: number;
    currency: string;
    action: string;
    success: boolean;
  }[];
  revenueData: {
    date: string;
    deposits_sum: number;
    cashouts_sum: number;
    ggr: number;
    ngr: number;
  }[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    checkConnectionAndFetchData()
  }, [])

  const checkConnectionAndFetchData = async () => {
    console.log('Starting checkConnectionAndFetchData...')
    try {
      setLoading(true)
      setConnectionStatus('checking')
      setError(null)

      // First check the connection
      const { connected, error: connectionError } = await testSupabaseConnection()
      
      if (!connected || connectionError) {
        console.error('Connection error details:', connectionError)
        throw new Error(`Database connection failed: ${connectionError}`)
      }

      console.log('Successfully connected to Supabase')
      setConnectionStatus('connected')
      
      // Fetch dashboard data
      const data = await getDashboardMetrics()
      setDashboardData(data)
      setError(null)
    } catch (err) {
      console.error('Error in checkConnectionAndFetchData:', err)
      setConnectionStatus('disconnected')
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full">
      <div className="text-red-500 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to connect to the database. Please check your connection and try again.</span>
      </div>
    </div>
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[150px] lg:w-[250px]"
          />
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.revenueData?.[0]?.deposits_sum?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }) || '$0'}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GGR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.revenueData?.[0]?.ggr?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }) || '$0'}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NGR</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.revenueData?.[0]?.ngr?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }) || '$0'}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={dashboardData?.revenueData || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="deposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="cashouts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="deposits_sum" stroke="#8884d8" fillOpacity={1} fill="url(#deposits)" />
                    <Area type="monotone" dataKey="cashouts_sum" stroke="#82ca9d" fillOpacity={1} fill="url(#cashouts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dashboardData?.recentPayments?.map((payment) => (
                    <div className="flex items-center" key={payment.id}>
                      <div className={`mr-4 rounded-full p-2 ${payment.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        {payment.action === 'deposit' ? (
                          <DollarSign className={`h-4 w-4 ${payment.success ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <Activity className={`h-4 w-4 ${payment.success ? 'text-green-600' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {payment.action.charAt(0).toUpperCase() + payment.action.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleString()} - 
                          {(payment.amount_cents / 100).toLocaleString('en-US', {
                            style: 'currency',
                            currency: payment.currency
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 