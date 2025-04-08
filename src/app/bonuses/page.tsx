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
import { formatCurrency, formatDate } from '@/lib/utils'

interface BonusIssue {
  type: 'bonus'
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
}

interface FreespinIssue {
  type: 'freespin'
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
  game_id: string
  spins_count: number
  spins_used: number
}

type BonusData = BonusIssue | FreespinIssue

interface BonusMetrics {
  totalIssued: number
  totalAmount: number
  totalWagered: number
  completionRate: number
  activeCount: number
  expiredCount: number
}

export default function BonusesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bonusData, setBonusData] = useState<BonusData[]>([])
  const [metrics, setMetrics] = useState<BonusMetrics>({
    totalIssued: 0,
    totalAmount: 0,
    totalWagered: 0,
    completionRate: 0,
    activeCount: 0,
    expiredCount: 0
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getBonusData(dateRange)
      setBonusData(data)
      
      // Calculate metrics
      const totalIssued = data.length
      const totalAmount = data.reduce((sum, bonus) => sum + bonus.amount_cents, 0)
      const totalWagered = data.reduce((sum, bonus) => sum + bonus.amount_wager_cents, 0)
      const completed = data.filter(bonus => bonus.status === 'completed').length
      const active = data.filter(bonus => bonus.status === 'active').length
      const expired = data.filter(bonus => bonus.status === 'expired').length
      
      setMetrics({
        totalIssued,
        totalAmount,
        totalWagered,
        completionRate: totalIssued > 0 ? (completed / totalIssued) * 100 : 0,
        activeCount: active,
        expiredCount: expired
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: { row: { original: BonusData } }) => (
        <Badge variant={row.original.type === 'bonus' ? 'default' : 'secondary'}>
          {row.original.type}
        </Badge>
      )
    },
    {
      accessorKey: 'title',
      header: 'Title'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: BonusData } }) => (
        <Badge variant={
          row.original.status === 'active' ? 'success' :
          row.original.status === 'completed' ? 'default' :
          row.original.status === 'expired' ? 'destructive' : 'secondary'
        }>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'amount_cents',
      header: 'Amount',
      cell: ({ row }: { row: { original: BonusData } }) => formatCurrency(row.original.amount_cents / 100)
    },
    {
      accessorKey: 'amount_wager_cents',
      header: 'Wagered',
      cell: ({ row }: { row: { original: BonusData } }) => formatCurrency(row.original.amount_wager_cents / 100)
    },
    {
      accessorKey: 'valid_until',
      header: 'Valid Until',
      cell: ({ row }: { row: { original: BonusData } }) => formatDate(row.original.valid_until)
    }
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Bonus Report</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalIssued}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalAmount / 100)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="flex items-center gap-4 mb-4">
            <DatePickerWithRange
              value={dateRange}
              onChange={setDateRange}
            />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <DataTable
            columns={columns}
            data={bonusData}
            searchKey="title"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 