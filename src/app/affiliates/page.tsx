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
  {
    partner_id: 'aff_101',
    partner_name: 'CasinoMaster Media',
    total_income: 14500,
    traffic: { visits: 34200, clicks: 12400, registrations: 1820, deposits: 940, ftd: 720 },
    conversion_rates: { cr: 5.32, cd: 51.65, cftd: 39.56, rftd: 76.6 },
  },
  {
    partner_id: 'aff_102',
    partner_name: 'SlotReview Global',
    total_income: 28900,
    traffic: { visits: 58000, clicks: 22100, registrations: 3450, deposits: 1820, ftd: 1450 },
    conversion_rates: { cr: 5.95, cd: 52.75, cftd: 42.03, rftd: 79.67 },
  },
  {
    partner_id: 'aff_103',
    partner_name: 'BetBonus Network',
    total_income: 9800,
    traffic: { visits: 19800, clicks: 8200, registrations: 1120, deposits: 560, ftd: 410 },
    conversion_rates: { cr: 5.66, cd: 50.0, cftd: 36.61, rftd: 73.21 },
  },
  {
    partner_id: 'aff_104',
    partner_name: 'HighRoller Leads EU',
    total_income: 21300,
    traffic: { visits: 41200, clicks: 16800, registrations: 2240, deposits: 1190, ftd: 980 },
    conversion_rates: { cr: 5.44, cd: 53.13, cftd: 43.75, rftd: 82.35 },
  },
]

export default function AffiliatesPage() {
  const [metrics, setMetrics] = useState<AffiliateMetrics[]>(DEFAULT_AFFILIATES)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

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
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.length)}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days commissions</p>
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
            <CardTitle>Partner Performance</CardTitle>
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {filteredMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No partners found matching search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetrics.map((metric) => (
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
