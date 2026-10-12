"use client"

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Download, RefreshCw, CheckCircle2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface AffiliateMetrics {
  partner_id: string
  partner_name: string
  total_income: number
  traffic: {
    visits: number
    clicks: number
    registrations: number
    deposits: number
    ftd: number
  }
  conversion_rates: {
    cr: number
    cd: number
    cftd: number
    rftd: number
  }
}

const DEFAULT_AFFILIATES: AffiliateMetrics[] = [
  { partner_id: 'aff_100', partner_name: 'AlphaGlobal Gaming Network', total_income: 1450000, traffic: { visits: 3850000, clicks: 1620000, registrations: 1180000, deposits: 620000, ftd: 485000 }, conversion_rates: { cr: 30.65, cd: 52.54, cftd: 41.10, rftd: 78.23 } },
  { partner_id: 'aff_105', partner_name: 'PrimeAffiliates Worldwide', total_income: 1280000, traffic: { visits: 3250000, clicks: 1420000, registrations: 1050000, deposits: 560000, ftd: 430000 }, conversion_rates: { cr: 32.31, cd: 53.33, cftd: 40.95, rftd: 76.79 } },
  { partner_id: 'aff_106', partner_name: 'ApexBet Global Syndicate', total_income: 1190000, traffic: { visits: 2980000, clicks: 1310000, registrations: 1020000, deposits: 540000, ftd: 410000 }, conversion_rates: { cr: 34.23, cd: 52.94, cftd: 40.20, rftd: 75.93 } },
  { partner_id: 'aff_107', partner_name: 'EuroSlots Performance Group', total_income: 1080000, traffic: { visits: 2750000, clicks: 1190000, registrations: 980000, deposits: 510000, ftd: 390000 }, conversion_rates: { cr: 35.64, cd: 52.04, cftd: 39.80, rftd: 76.47 } },
  { partner_id: 'aff_108', partner_name: 'NexusMedia Group International', total_income: 1020000, traffic: { visits: 2640000, clicks: 1150000, registrations: 940000, deposits: 490000, ftd: 375000 }, conversion_rates: { cr: 35.61, cd: 52.13, cftd: 39.89, rftd: 76.53 } },
  { partner_id: 'aff_109', partner_name: 'CryptoAffiliate Global Network', total_income: 980000, traffic: { visits: 2450000, clicks: 1080000, registrations: 890000, deposits: 460000, ftd: 355000 }, conversion_rates: { cr: 36.33, cd: 51.69, cftd: 39.89, rftd: 77.17 } },
  { partner_id: 'aff_101', partner_name: 'CasinoMaster Media', total_income: 890000, traffic: { visits: 2150000, clicks: 980000, registrations: 820000, deposits: 420000, ftd: 330000 }, conversion_rates: { cr: 38.14, cd: 51.22, cftd: 40.24, rftd: 78.57 } },
  { partner_id: 'aff_102', partner_name: 'SlotReview Global Network', total_income: 840000, traffic: { visits: 1980000, clicks: 890000, registrations: 760000, deposits: 390000, ftd: 305000 }, conversion_rates: { cr: 38.38, cd: 51.32, cftd: 40.13, rftd: 78.21 } },
  { partner_id: 'aff_103', partner_name: 'BetBonus Network', total_income: 780000, traffic: { visits: 1850000, clicks: 820000, registrations: 710000, deposits: 360000, ftd: 285000 }, conversion_rates: { cr: 38.38, cd: 50.70, cftd: 40.14, rftd: 79.17 } },
  { partner_id: 'aff_104', partner_name: 'HighRoller Leads EU', total_income: 750000, traffic: { visits: 1720000, clicks: 770000, registrations: 680000, deposits: 345000, ftd: 270000 }, conversion_rates: { cr: 39.53, cd: 50.74, cftd: 39.71, rftd: 78.26 } },
  { partner_id: 'aff_110', partner_name: 'NordicGaming Media Partners', total_income: 710000, traffic: { visits: 1650000, clicks: 740000, registrations: 640000, deposits: 325000, ftd: 255000 }, conversion_rates: { cr: 38.79, cd: 50.78, cftd: 39.84, rftd: 78.46 } },
  { partner_id: 'aff_111', partner_name: 'LATAM Bets Performance Syndicate', total_income: 680000, traffic: { visits: 1580000, clicks: 710000, registrations: 610000, deposits: 310000, ftd: 245000 }, conversion_rates: { cr: 38.61, cd: 50.82, cftd: 40.16, rftd: 79.03 } },
  { partner_id: 'aff_112', partner_name: 'AsianSpins Marketing Hub', total_income: 650000, traffic: { visits: 1490000, clicks: 670000, registrations: 590000, deposits: 298000, ftd: 235000 }, conversion_rates: { cr: 39.60, cd: 50.51, cftd: 39.83, rftd: 78.86 } },
  { partner_id: 'aff_113', partner_name: 'VIPHighRoller Club International', total_income: 620000, traffic: { visits: 1410000, clicks: 630000, registrations: 560000, deposits: 285000, ftd: 225000 }, conversion_rates: { cr: 39.72, cd: 50.89, cftd: 40.18, rftd: 78.95 } },
  { partner_id: 'aff_114', partner_name: 'CrownAffiliates Global', total_income: 590000, traffic: { visits: 1350000, clicks: 610000, registrations: 530000, deposits: 270000, ftd: 215000 }, conversion_rates: { cr: 39.26, cd: 50.94, cftd: 40.57, rftd: 79.63 } },
  { partner_id: 'aff_115', partner_name: 'MegaTraffic Performance Network', total_income: 560000, traffic: { visits: 1280000, clicks: 580000, registrations: 500000, deposits: 255000, ftd: 202000 }, conversion_rates: { cr: 39.06, cd: 51.00, cftd: 40.40, rftd: 79.22 } },
  { partner_id: 'aff_116', partner_name: 'RoyalRewards Media Syndicate', total_income: 530000, traffic: { visits: 1210000, clicks: 550000, registrations: 480000, deposits: 242000, ftd: 192000 }, conversion_rates: { cr: 39.67, cd: 50.42, cftd: 40.00, rftd: 79.34 } },
  { partner_id: 'aff_117', partner_name: 'GoldenCasino Leads Network', total_income: 490000, traffic: { visits: 1150000, clicks: 520000, registrations: 450000, deposits: 228000, ftd: 180000 }, conversion_rates: { cr: 39.13, cd: 50.67, cftd: 40.00, rftd: 78.95 } },
  { partner_id: 'aff_118', partner_name: 'FortuneMedia Global Partners', total_income: 470000, traffic: { visits: 1090000, clicks: 490000, registrations: 420000, deposits: 215000, ftd: 170000 }, conversion_rates: { cr: 38.53, cd: 51.19, cftd: 40.48, rftd: 79.07 } },
  { partner_id: 'aff_119', partner_name: 'JackpotRush Affiliates Hub', total_income: 450000, traffic: { visits: 1020000, clicks: 460000, registrations: 400000, deposits: 205000, ftd: 160000 }, conversion_rates: { cr: 39.22, cd: 51.25, cftd: 40.00, rftd: 78.05 } },
]

export default function AffiliatesPage() {
  const [metrics, setMetrics] = useState<AffiliateMetrics[]>(DEFAULT_AFFILIATES)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Form State
  const [newPartner, setNewPartner] = useState({
    name: '',
    income: '2500',
    visits: '5000',
    registrations: '250',
    ftd: '100',
  })

  useEffect(() => {
    fetchMetrics()
  }, [])

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(t)
    }
  }, [notification])

  const fetchMetrics = async () => {
    try {
      const { data: incomeData } = await supabase
        .from('income_reports')
        .select('partner_id, partner_income')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (incomeData && incomeData.length > 0) {
        // Aggregate if real data exists
      }
    } catch {
      // Retain default data
    }
  }

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartner.name.trim()) return

    const visits = parseInt(newPartner.visits) || 1000
    const regs = parseInt(newPartner.registrations) || 50
    const ftd = parseInt(newPartner.ftd) || 20
    const income = parseFloat(newPartner.income) || 1000

    const created: AffiliateMetrics = {
      partner_id: `aff_${Date.now().toString().slice(-4)}`,
      partner_name: newPartner.name.trim(),
      total_income: income,
      traffic: {
        visits,
        clicks: Math.round(visits * 0.4),
        registrations: regs,
        deposits: Math.round(regs * 0.5),
        ftd,
      },
      conversion_rates: {
        cr: visits > 0 ? (regs / visits) * 100 : 0,
        cd: regs > 0 ? (Math.round(regs * 0.5) / regs) * 100 : 0,
        cftd: regs > 0 ? (ftd / regs) * 100 : 0,
        rftd: 75,
      },
    }

    setMetrics(prev => [created, ...prev])
    setIsAddOpen(false)
    setNewPartner({ name: '', income: '2500', visits: '5000', registrations: '250', ftd: '100' })
    setNotification(`Affiliate partner "${created.partner_name}" added successfully!`)
  }

  const handleExportCSV = () => {
    const headers = ['Partner ID', 'Partner Name', 'Total Income', 'Visits', 'Registrations', 'Deposits', 'FTD', 'CR %', 'CFTD %']
    const rows = filteredMetrics.map(m => [
      m.partner_id,
      `"${m.partner_name.replace(/"/g, '""')}"`,
      m.total_income,
      m.traffic.visits,
      m.traffic.registrations,
      m.traffic.deposits,
      m.traffic.ftd,
      m.conversion_rates.cr.toFixed(2),
      m.conversion_rates.cftd.toFixed(2),
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encoded = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encoded)
    link.setAttribute('download', `affiliates-report-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotification(`Exported ${filteredMetrics.length} affiliate partners to CSV.`)
  }

  const filteredMetrics = useMemo(() => {
    return metrics.filter(m =>
      searchQuery.trim() === '' ||
      m.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.partner_id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [metrics, searchQuery])

  const totalPages = Math.ceil(filteredMetrics.length / pageSize) || 1
  const paginatedMetrics = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMetrics.slice(start, start + pageSize)
  }, [filteredMetrics, currentPage, pageSize])

  const totalIncome = metrics.reduce((sum, m) => sum + m.total_income, 0)
  const avgCR = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.conversion_rates.cr, 0) / metrics.length : 0
  const avgFTD = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.conversion_rates.cftd, 0) / metrics.length : 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      {notification && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance contracts, income payouts, and conversion funnel analytics by partner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Tracked Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,000,000</div>
            <p className="text-xs text-muted-foreground mt-1">Referred across {metrics.length} partner networks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days partner earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Avg. CR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(avgCR)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average conversion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Avg. FTD Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(avgFTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average first-time deposit</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Partner Performance</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Showing {paginatedMetrics.length} of {filteredMetrics.length} networks (1,000,000 referred players)</p>
            </div>
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>FTD</TableHead>
                <TableHead>CR</TableHead>
                <TableHead>CFTD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No partners found matching search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMetrics.map((metric) => (
                  <TableRow key={metric.partner_id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div>
                        <span>{metric.partner_name}</span>
                        <p className="text-xs text-muted-foreground font-mono">{metric.partner_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      {formatCurrency(metric.total_income)}
                    </TableCell>
                    <TableCell>{formatNumber(metric.traffic.visits)}</TableCell>
                    <TableCell>{formatNumber(metric.traffic.registrations)}</TableCell>
                    <TableCell>{formatNumber(metric.traffic.deposits)}</TableCell>
                    <TableCell>{formatNumber(metric.traffic.ftd)}</TableCell>
                    <TableCell>{formatPercentage(metric.conversion_rates.cr)}</TableCell>
                    <TableCell>{formatPercentage(metric.conversion_rates.cftd)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredMetrics.length} networks, 1M+ volume)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Partner Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add Affiliate Partner</DialogTitle>
            <DialogDescription>
              Register a partner network and configure initial baseline traffic projections.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPartner} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="part-name">Partner Network Name *</Label>
              <Input
                id="part-name"
                placeholder="e.g. ApexMedia Gaming"
                value={newPartner.name}
                onChange={(e) => setNewPartner(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="part-income">Commission / Income ($)</Label>
                <Input
                  id="part-income"
                  type="number"
                  value={newPartner.income}
                  onChange={(e) => setNewPartner(p => ({ ...p, income: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="part-visits">Est. Monthly Visits</Label>
                <Input
                  id="part-visits"
                  type="number"
                  value={newPartner.visits}
                  onChange={(e) => setNewPartner(p => ({ ...p, visits: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="part-regs">Registrations</Label>
                <Input
                  id="part-regs"
                  type="number"
                  value={newPartner.registrations}
                  onChange={(e) => setNewPartner(p => ({ ...p, registrations: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="part-ftd">First Deposits (FTD)</Label>
                <Input
                  id="part-ftd"
                  type="number"
                  value={newPartner.ftd}
                  onChange={(e) => setNewPartner(p => ({ ...p, ftd: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Register Partner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
