"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { getBonusData } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface BonusIssue {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  amount_cents: number
  amount_wager_cents: number
  amount_locked_cents: number
  valid_until: string
  activated_at: string | null
  finished_at: string | null
  strategy: string
  type: 'bonus'
}

interface FreespinIssue {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  freespins_total: number
  freespins_performed: number
  win_amount_cents: number
  valid_until: string
  provider: string
  games: string[]
  type: 'freespin'
}

type BonusData = BonusIssue | FreespinIssue

interface BonusMetrics {
  totalBonusesIssued: number
  totalBonusAmount: number
  totalFreespinsIssued: number
  totalFreespinsWinAmount: number
  activeWageringAmount: number
  completionRate: number
}

export default function BonusesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bonusData, setBonusData] = useState<BonusData[]>([])
  const [metrics, setMetrics] = useState<BonusMetrics>({
    totalBonusesIssued: 0,
    totalBonusAmount: 0,
    totalFreespinsIssued: 0,
    totalFreespinsWinAmount: 0,
    activeWageringAmount: 0,
    completionRate: 0
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data } = await getBonusData({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
        page: 1,
        pageSize: 100
      })

      if (data) {
        setBonusData(data)

        // Calculate metrics
        const bonuses = data.filter(item => item.type === 'bonus') as BonusIssue[]
        const freespins = data.filter(item => item.type === 'freespin') as FreespinIssue[]

        const totalBonusAmount = bonuses.reduce((sum, bonus) => sum + bonus.amount_cents, 0)
        const totalFreespinsWinAmount = freespins.reduce((sum, spin) => sum + spin.win_amount_cents, 0)
        const activeWageringAmount = bonuses.reduce((sum, bonus) => 
          bonus.status === 'active' ? sum + bonus.amount_wager_cents : sum, 0)
        
        const completedBonuses = data.filter(item => item.status === 'completed').length
        const completionRate = (completedBonuses / data.length) * 100

        setMetrics({
          totalBonusesIssued: bonuses.length,
          totalBonusAmount,
          totalFreespinsIssued: freespins.reduce((sum, spin) => sum + spin.freespins_total, 0),
          totalFreespinsWinAmount,
          activeWageringAmount,
          completionRate
        })
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching bonus data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const bonusColumns = [
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleString()
    },
    {
      accessorKey: 'title',
      header: 'Title'
    },
    {
      accessorKey: 'account_id',
      header: 'Player'
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.getValue('type') === 'bonus' ? 'default' : 'secondary'}>
          {row.getValue('type')}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={
          row.getValue('status') === 'completed' ? 'success' :
          row.getValue('status') === 'active' ? 'default' :
          row.getValue('status') === 'expired' ? 'destructive' : 'secondary'
        }>
          {row.getValue('status')}
        </Badge>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const item = row.original as BonusData
        if (item.type === 'bonus') {
          return formatCurrency(item.amount_cents)
        } else {
          return `${item.freespins_total} spins`
        }
      }
    },
    {
      accessorKey: 'wagering',
      header: 'Wagering',
      cell: ({ row }) => {
        const item = row.original as BonusData
        if (item.type === 'bonus') {
          return formatCurrency(item.amount_wager_cents)
        } else {
          return formatCurrency(item.win_amount_cents)
        }
      }
    },
    {
      accessorKey: 'valid_until',
      header: 'Valid Until',
      cell: ({ row }) => new Date(row.getValue('valid_until')).toLocaleDateString()
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
          <h1 className="text-3xl font-bold">Bonuses</h1>
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="list">Bonus List</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bonuses Issued</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBonusesIssued}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bonus Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalBonusAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Free Spins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalFreespinsIssued}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Free Spins Win Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalFreespinsWinAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Wagering</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.activeWageringAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search bonuses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={fetchData}>Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <DataTable
                  columns={bonusColumns}
                  data={bonusData}
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