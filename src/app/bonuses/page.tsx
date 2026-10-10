"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

interface BaseBonus {
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
}

interface BonusIssue extends BaseBonus {
  type: 'bonus'
  strategy: string
}

interface FreespinIssue extends BaseBonus {
  type: 'freespin'
  game_id: string
  spins_count: number
  spins_used: number
}

type BonusData = BonusIssue | FreespinIssue

interface RawBonusData {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  amount_cents: number | string
  amount_wager_cents: number | string
  amount_locked_cents: number | string
  valid_until: string
  activated_at: string | null
  finished_at: string | null
  game_id?: string
  spins_count?: number | string
  spins_used?: number | string
  strategy?: string
}

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: new Date(Date.now() - 90 * 86400000),
    to: new Date()
  }))
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

      const params = new URLSearchParams()
      if (dateRange?.from) params.set('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.set('endDate', dateRange.to.toISOString())

      const res = await fetch(`/api/bonuses?${params.toString()}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch bonus data (status ${res.status})`)
      }
      const json = await res.json()
      const data = json.data || []

      const transformedData: BonusData[] = data.map((item: any) => {
        const baseData = {
          id: String(item.id),
          created_at: item.created_at,
          account_id: String(item.account_id),
          title: item.title,
          status: item.status,
          amount_cents: Number(item.amount_cents) || 0,
          amount_wager_cents: Number(item.amount_wager_cents) || 0,
          amount_locked_cents: Number(item.amount_locked_cents) || 0,
          valid_until: item.valid_until,
          activated_at: item.activated_at || null,
          finished_at: item.finished_at || null,
        }

        if (item.type === 'freespin' || item.game_id !== undefined || item.spins_count !== undefined) {
          return {
            ...baseData,
            type: 'freespin' as const,
            game_id: String(item.game_id || item.strategy || 'slots'),
            spins_count: Number(item.spins_count) || 0,
            spins_used: Number(item.spins_used) || 0,
          } as FreespinIssue
        } else {
          return {
            ...baseData,
            type: 'bonus' as const,
            strategy: String(item.strategy || 'deposit_match'),
          } as BonusIssue
        }
      })

      setBonusData(transformedData)

      if (json.metrics) {
        setMetrics(json.metrics)
      } else {
        const bonuses = transformedData.filter((item): item is BonusIssue => item.type === 'bonus')
        const freespins = transformedData.filter((item): item is FreespinIssue => item.type === 'freespin')

        const totalBonusAmount = bonuses.reduce((sum, bonus) => sum + bonus.amount_cents, 0)
        const totalFreespinsWinAmount = freespins.reduce((sum, spin) => sum + spin.amount_cents, 0)
        const activeWageringAmount = bonuses.reduce((sum, bonus) =>
          bonus.status === 'active' ? sum + bonus.amount_wager_cents : sum, 0)

        const completedBonuses = transformedData.filter(item => item.status === 'completed').length
        const completionRate = transformedData.length > 0 ? (completedBonuses / transformedData.length) * 100 : 0

        setMetrics({
          totalBonusesIssued: bonuses.length,
          totalBonusAmount,
          totalFreespinsIssued: freespins.reduce((sum, spin) => sum + spin.spins_count, 0),
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
      cell: ({ row }: any) => new Date(row.getValue('created_at')).toLocaleString()
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
      cell: ({ row }: any) => (
        <Badge variant={row.getValue('type') === 'bonus' ? 'default' : 'secondary'}>
          {row.getValue('type')}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
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
      cell: ({ row }: any) => {
        const item = row.original as BonusData
        if (item.type === 'bonus') {
          return formatCurrency(item.amount_cents)
        } else {
          return `${item.spins_count} spins`
        }
      }
    },
    {
      accessorKey: 'wagering',
      header: 'Wagering',
      cell: ({ row }: any) => {
        const item = row.original as BonusData
        if (item.type === 'bonus') {
          return formatCurrency(item.amount_wager_cents)
        } else {
          return formatCurrency(item.amount_cents)
        }
      }
    },
    {
      accessorKey: 'valid_until',
      header: 'Valid Until',
      cell: ({ row }: any) => new Date(row.getValue('valid_until')).toLocaleDateString()
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
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Bonuses Issued</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBonusesIssued}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Bonus Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalBonusAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Free Spins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalFreespinsIssued}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Free Spins Win Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalFreespinsWinAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Active Wagering</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.activeWageringAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
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
                  data={bonusData.filter((item) => {
                    if (!searchQuery.trim()) return true
                    const q = searchQuery.toLowerCase()
                    return (
                      item.title.toLowerCase().includes(q) ||
                      item.account_id.toLowerCase().includes(q) ||
                      item.status.toLowerCase().includes(q) ||
                      item.type.toLowerCase().includes(q)
                    )
                  })}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
