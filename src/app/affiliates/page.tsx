"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DataTable } from '@/components/ui/data-table'
import { getAffiliateReports } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

type DateRange = {
  from?: Date
  to?: Date
}

interface AffiliateData {
  id: string
  date: string
  partner_id: string
  currency: string
  partner_income: number
  traffic: {
    id: string
    date: string
    foreign_partner_id: string
    country: string
    visits: number
    clicks: number
    registrations_count: number
    deposits_count: number
    ftd_count: number
    cr: number
    cd: number
    cftd: number
    rftd: number
  } | null
  api: {
    id: string
    date: string
    partner_id: string
    currency: string
    deposits_sum: number
    cashouts_sum: number
    ggr: number
    ngr: number
    clean_net_revenue: number
    deposits_count: number
    first_deposits_count: number
    qualified_players_count: number
    self_excluded_players_count: number
  } | null
}

interface AffiliateMetrics {
  totalPartners: number
  totalIncome: number
  totalVisits: number
  totalClicks: number
  totalRegistrations: number
  totalDeposits: number
  totalFTDs: number
  avgConversionRate: number
  avgDepositRate: number
  totalGGR: number
  totalNGR: number
}

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [affiliateData, setAffiliateData] = useState<AffiliateData[]>([])
  const [metrics, setMetrics] = useState<AffiliateMetrics>({
    totalPartners: 0,
    totalIncome: 0,
    totalVisits: 0,
    totalClicks: 0,
    totalRegistrations: 0,
    totalDeposits: 0,
    totalFTDs: 0,
    avgConversionRate: 0,
    avgDepositRate: 0,
    totalGGR: 0,
    totalNGR: 0
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data } = await getAffiliateReports({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
        page: 1,
        pageSize: 100
      })

      if (data) {
        setAffiliateData(data)

        const uniquePartners = new Set(data.map(item => item.partner_id)).size
        const totalIncome = data.reduce((sum, item) => sum + item.partner_income, 0)

        let totalVisits = 0
        let totalClicks = 0
        let totalRegistrations = 0
        let totalDeposits = 0
        let totalFTDs = 0
        let totalGGR = 0
        let totalNGR = 0

        data.forEach(item => {
          if (item.traffic) {
            totalVisits += item.traffic.visits
            totalClicks += item.traffic.clicks
            totalRegistrations += item.traffic.registrations_count
            totalDeposits += item.traffic.deposits_count
            totalFTDs += item.traffic.ftd_count
          }
          if (item.api) {
            totalGGR += item.api.ggr
            totalNGR += item.api.ngr
          }
        })

        const avgConversionRate = totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0
        const avgDepositRate = totalRegistrations > 0 ? (totalDeposits / totalRegistrations) * 100 : 0

        setMetrics({
          totalPartners: uniquePartners,
          totalIncome,
          totalVisits,
          totalClicks,
          totalRegistrations,
          totalDeposits,
          totalFTDs,
          avgConversionRate,
          avgDepositRate,
          totalGGR,
          totalNGR
        })
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching affiliate data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const affiliateColumns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => new Date(row.getValue('date')).toLocaleDateString(),
    },
    {
      accessorKey: 'partner_id',
      header: 'Partner ID',
    },
    {
      accessorKey: 'traffic_metrics',
      header: 'Traffic Metrics',
      cell: ({ row }: any) => {
        const traffic = row.original.traffic;
        if (!traffic) return '-';
        return (
          <div className="space-y-1">
            <div className="text-sm">Visits: {traffic.visits}</div>
            <div className="text-sm">Clicks: {traffic.clicks}</div>
            <div className="text-sm">CR: {traffic.cr.toFixed(2)}%</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'conversion_metrics',
      header: 'Conversion Metrics',
      cell: ({ row }: any) => {
        const traffic = row.original.traffic;
        if (!traffic) return '-';
        return (
          <div className="space-y-1">
            <div className="text-sm">Registrations: {traffic.registrations_count}</div>
            <div className="text-sm">Deposits: {traffic.deposits_count}</div>
            <div className="text-sm">FTDs: {traffic.ftd_count}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'revenue_metrics',
      header: 'Revenue Metrics',
      cell: ({ row }: any) => {
        const api = row.original.api;
        if (!api) return '-';
        return (
          <div className="space-y-1">
            <div className="text-sm">GGR: {formatCurrency(api.ggr, 'EUR')}</div>
            <div className="text-sm">NGR: {formatCurrency(api.ngr, 'EUR')}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'partner_income',
      header: 'Partner Income',
      cell: ({ row }: any) => formatCurrency(row.getValue('partner_income'), 'EUR'),
    },
  ];

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
          <h1 className="text-3xl font-bold">Affiliate Reports</h1>
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Partner Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalPartners}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Partner Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalIncome, 'EUR')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total GGR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalGGR, 'EUR')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total NGR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalNGR, 'EUR')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Traffic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Visits</span>
                      <span className="font-medium">{metrics.totalVisits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Clicks</span>
                      <span className="font-medium">{metrics.totalClicks.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Conversion Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Registrations</span>
                      <span className="font-medium">{metrics.totalRegistrations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Deposits</span>
                      <span className="font-medium">{metrics.totalDeposits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">FTDs</span>
                      <span className="font-medium">{metrics.totalFTDs.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Conversion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Click to Registration</span>
                      <span className="font-medium">{metrics.avgConversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Registration to Deposit</span>
                      <span className="font-medium">{metrics.avgDepositRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={fetchData}>Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <DataTable
                  columns={affiliateColumns}
                  data={affiliateData}
                  searchKey="partner_id"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
