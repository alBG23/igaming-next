"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getCasinoGamesData, getGamesCatalog } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { DateRange } from 'react-day-picker'

interface GameSession {
  id: string
  created_at: string
  finished_at: string
  account_id: string
  game_id: string
  bets_sum: number
  payoff_sum: number
  balance_before: number
  balance_after: number
  jackpot_win_cents: number
}

interface Game {
  id: string
  title: string
  provider: string
  producer: string
  category: string
  devices: string[]
  payout: number
  jackpot: boolean
  freespins: boolean
  live: boolean
  feature_group: string
  released_at: string
}

interface GameMetrics {
  totalBets: number
  totalPayouts: number
  totalJackpots: number
  uniquePlayers: number
  avgSessionDuration: number
  rtp: number
}

export function CasinoGamesClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [metrics, setMetrics] = useState<GameMetrics>({
    totalBets: 0,
    totalPayouts: 0,
    totalJackpots: 0,
    uniquePlayers: 0,
    avgSessionDuration: 0,
    rtp: 0
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch game sessions
      const { data: sessionsData } = await getCasinoGamesData({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
        page: 1,
        pageSize: 100
      })

      // Fetch games catalog
      const { data: gamesData } = await getGamesCatalog({
        page: 1,
        pageSize: 100
      })

      if (sessionsData && gamesData) {
        setSessions(sessionsData)
        setGames(gamesData)

        // Calculate metrics
        const totalBets = sessionsData.reduce((sum, session) => sum + session.bets_sum, 0)
        const totalPayouts = sessionsData.reduce((sum, session) => sum + session.payoff_sum, 0)
        const totalJackpots = sessionsData.reduce((sum, session) => sum + session.jackpot_win_cents, 0)
        const uniquePlayers = new Set(sessionsData.map(session => session.account_id)).size
        
        const avgDuration = sessionsData.reduce((sum, session) => {
          const start = new Date(session.created_at)
          const end = new Date(session.finished_at)
          return sum + (end.getTime() - start.getTime())
        }, 0) / sessionsData.length / 1000 / 60 // Convert to minutes

        setMetrics({
          totalBets,
          totalPayouts,
          totalJackpots,
          uniquePlayers,
          avgSessionDuration: avgDuration,
          rtp: totalPayouts / totalBets * 100
        })
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching casino data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<GameSession>[] = [
    {
      accessorKey: 'created_at',
      header: 'Start Time',
      cell: ({ row }: { row: any }) => new Date(row.getValue('created_at')).toLocaleString()
    },
    {
      accessorKey: 'game_id',
      header: 'Game ID',
      cell: ({ row }: { row: any }) => row.getValue('game_id')
    },
    {
      accessorKey: 'account_id',
      header: 'Player',
      cell: ({ row }: { row: any }) => row.getValue('account_id')
    },
    {
      accessorKey: 'bet_amount_cents',
      header: 'Bet Amount',
      cell: ({ row }: { row: any }) => formatCurrency(Number(row.getValue('bet_amount_cents')))
    },
    {
      accessorKey: 'win_amount_cents',
      header: 'Win Amount',
      cell: ({ row }: { row: any }) => formatCurrency(Number(row.getValue('win_amount_cents')))
    },
    {
      accessorKey: 'currency',
      header: 'Currency',
      cell: ({ row }: { row: any }) => row.getValue('currency')
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <Badge variant={row.getValue('status') === 'completed' ? 'success' : 'default'}>
          {row.getValue('status')}
        </Badge>
      )
    }
  ]

  const gameColumns: ColumnDef<Game>[] = [
    {
      accessorKey: 'title',
      header: 'Game Title'
    },
    {
      accessorKey: 'provider',
      header: 'Provider'
    },
    {
      accessorKey: 'category',
      header: 'Category'
    },
    {
      accessorKey: 'payout',
      header: 'Payout %',
      cell: ({ row }: { row: any }) => `${row.getValue('payout')}%`
    },
    {
      accessorKey: 'features',
      header: 'Features',
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          {row.original.jackpot && <Badge>Jackpot</Badge>}
          {row.original.freespins && <Badge>Free Spins</Badge>}
          {row.original.live && <Badge>Live</Badge>}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Casino Games</h1>
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Game Sessions</TabsTrigger>
            <TabsTrigger value="catalog">Game Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalBets)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalPayouts)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RTP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.rtp.toFixed(2)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jackpots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalJackpots)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.uniquePlayers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(metrics.avgSessionDuration)} min</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={fetchData}>Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={sessions}
                  searchKey="game_id"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <DataTable
                  columns={gameColumns}
                  data={games}
                  searchKey="title"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 