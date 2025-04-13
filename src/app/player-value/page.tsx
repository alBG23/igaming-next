"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, Activity, Search, Filter, Clock, AlertCircle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { supabase, testSupabaseConnection } from "@/lib/supabase"
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { createClient } from '@/lib/supabase'
import { BarChart, DonutChart } from '@tremor/react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface PlayerValueMetrics {
  avg_lifetime_value: number
  avg_monthly_value: number
  avg_acquisition_cost: number
  avg_roi: number
}

const fallbackMetrics: PlayerValueMetrics = {
  avg_lifetime_value: 1250,
  avg_monthly_value: 150,
  avg_acquisition_cost: 200,
  avg_roi: 625
}

const fallbackChartData = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 1300 },
  { month: 'Mar', value: 1400 },
  { month: 'Apr', value: 1350 },
  { month: 'May', value: 1500 },
  { month: 'Jun', value: 1600 }
]

interface PlayerSegment {
  id: string
  segment: string
  playerCount: number
  totalDeposits: number
  totalWithdrawals: number
  netGaming: number
  avgLifetimeValue: number
  retentionRate: number
  churnRate: number
}

const valueCategories = {
  'High Value': { min: 10000, color: 'emerald' },
  'Mid Value': { min: 1000, color: 'blue' },
  'Low Value': { min: 100, color: 'yellow' },
  'Micro Value': { min: 0, color: 'gray' }
}

export default function PlayerValuePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [metrics, setMetrics] = useState<PlayerValueMetrics>(fallbackMetrics)
  const [chartData, setChartData] = useState(fallbackChartData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [segments, setSegments] = useState<PlayerSegment[]>([])
  const [distributionData, setDistributionData] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { connected, error: connectionError } = await testSupabaseConnection()
      
      if (!connected) {
        throw new Error(connectionError || 'Unable to connect to database')
      }

      const { data: metricsData, error: metricsError } = await supabase
        .from('player_value_metrics')
        .select('*')
        .single()

      if (metricsError) throw metricsError

      const { data: chartData, error: chartError } = await supabase
        .from('player_value_trend')
        .select('*')
        .order('month', { ascending: true })

      if (chartError) throw chartError

      const startDate = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = dateRange?.to || new Date()

      // Fetch players data
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (playersError) throw playersError

      // Fetch payments data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments_view')
        .select('user_id, amount, type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (paymentsError) throw paymentsError

      // Fetch gaming data
      const { data: gamingData, error: gamingError } = await supabase
        .from('casino_games_view')
        .select('player_id, bet_amount, win_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (gamingError) throw gamingError

      // Process data by player
      const playerMetrics = new Map<string, {
        deposits: number
        withdrawals: number
        bets: number
        wins: number
        lastActivity: Date
      }>()

      // Process payments
      paymentsData?.forEach(payment => {
        const playerId = payment.user_id
        if (!playerId) return

        const current = playerMetrics.get(playerId) || {
          deposits: 0,
          withdrawals: 0,
          bets: 0,
          wins: 0,
          lastActivity: new Date(0)
        }

        if (payment.type === 'deposit') {
          current.deposits += payment.amount
        } else if (payment.type === 'withdrawal') {
          current.withdrawals += payment.amount
        }

        playerMetrics.set(playerId, current)
      })

      // Process gaming activity
      gamingData?.forEach(game => {
        const playerId = game.player_id
        if (!playerId) return

        const current = playerMetrics.get(playerId) || {
          deposits: 0,
          withdrawals: 0,
          bets: 0,
          wins: 0,
          lastActivity: new Date(0)
        }

        current.bets += game.bet_amount
        current.wins += game.win_amount
        current.lastActivity = new Date(game.created_at)

        playerMetrics.set(playerId, current)
      })

      // Calculate segments
      const segments: PlayerSegment[] = []
      const distribution = new Map<string, number>()

      playerMetrics.forEach((metrics, playerId) => {
        const ltv = metrics.deposits - metrics.withdrawals + (metrics.bets - metrics.wins)
        let segment = 'Micro Value'

        for (const [category, { min }] of Object.entries(valueCategories)) {
          if (ltv >= min) {
            segment = category
            break
          }
        }

        distribution.set(segment, (distribution.get(segment) || 0) + 1)

        const existingSegment = segments.find(s => s.segment === segment)
        if (existingSegment) {
          existingSegment.playerCount++
          existingSegment.totalDeposits += metrics.deposits
          existingSegment.totalWithdrawals += metrics.withdrawals
          existingSegment.netGaming += metrics.bets - metrics.wins
          existingSegment.avgLifetimeValue = (existingSegment.totalDeposits - existingSegment.totalWithdrawals + existingSegment.netGaming) / existingSegment.playerCount
        } else {
          segments.push({
            id: segment.toLowerCase().replace(' ', '-'),
            segment,
            playerCount: 1,
            totalDeposits: metrics.deposits,
            totalWithdrawals: metrics.withdrawals,
            netGaming: metrics.bets - metrics.wins,
            avgLifetimeValue: metrics.deposits - metrics.withdrawals + (metrics.bets - metrics.wins),
            retentionRate: 0, // Will be calculated below
            churnRate: 0 // Will be calculated below
          })
        }
      })

      // Calculate retention and churn rates
      const totalPlayers = playersData?.length || 0
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      segments.forEach(segment => {
        const activePlayers = Array.from(playerMetrics.entries())
          .filter(([_, metrics]) => {
            const ltv = metrics.deposits - metrics.withdrawals + (metrics.bets - metrics.wins)
            const isInSegment = ltv >= valueCategories[segment.segment as keyof typeof valueCategories].min
            const isActive = metrics.lastActivity >= thirtyDaysAgo
            return isInSegment && isActive
          })
          .length

        segment.retentionRate = (activePlayers / segment.playerCount) * 100
        segment.churnRate = 100 - segment.retentionRate
      })

      setSegments(segments)

      // Prepare distribution data for the donut chart
      const distributionData = Array.from(distribution.entries()).map(([segment, count]) => ({
        name: segment,
        value: count,
        color: valueCategories[segment as keyof typeof valueCategories].color
      }))

      setDistributionData(distributionData)
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
        <h1 className="text-2xl font-semibold">Player Value</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            className="w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
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
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Lifetime Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.avg_lifetime_value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Monthly Value</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.avg_monthly_value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+8.3% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Acquisition Cost</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.avg_acquisition_cost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+3.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.avg_roi}%</div>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Player Value Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                            dataKey="value"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="players" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Lifetime Value</TableHead>
                        <TableHead>Monthly Value</TableHead>
                        <TableHead>Acquisition Cost</TableHead>
                        <TableHead>ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Players content */}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trends" className="space-y-4">
              {/* Trends content */}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
} 