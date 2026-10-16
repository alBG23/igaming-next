'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/date-range-picker'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'
import { MultiSelect } from '@/components/ui/multi-select'

interface ReportMetrics {
  totalDeposits: number
  totalWithdrawals: number
  ngr: number
  ggr: number
  ftdCount: number
  ftdAmount: number
  ftdSuccessRate: number
  playerCount: number
  averageDeposit: number
}

interface FilterState {
  dateRange: DateRange | undefined
  selectedAffiliates: string[]
  selectedCountry: string
}

export default function ReportsTestingPage() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: addDays(new Date(), -7),
      to: new Date(),
    },
    selectedAffiliates: [],
    selectedCountry: 'all',
  })
  const [affiliates, setAffiliates] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])

  // Fetch available affiliates and countries via API
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const res = await fetch('/api/reports-testing?limit=200')
        if (!res.ok) throw new Error(`Reports API returned ${res.status}`)
        const json = await res.json()

        if (json.success && json.data) {
          const { affiliateOptions, countryOptions } = json.data
          setAffiliates(affiliateOptions || [])
          setCountries(countryOptions || [])
        }
      } catch (err) {
        console.error('Error fetching filter options:', err)
      }
    }

    fetchFilterOptions()
  }, [])

  // Fetch metrics based on filters
  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)

        const from = filters.dateRange?.from
        const to = filters.dateRange?.to
        const startDateStr = from ? format(from, 'yyyy-MM-dd') : format(addDays(new Date(), -7), 'yyyy-MM-dd')
        const endDateStr = to ? format(to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')

        const params = new URLSearchParams({
          startDate: startDateStr,
          endDate: endDateStr,
          limit: '500',
        })
        if (filters.selectedAffiliates.length > 0) {
          params.set('affiliate', filters.selectedAffiliates.join(','))
        }
        if (filters.selectedCountry !== 'all') {
          params.set('country', filters.selectedCountry)
        }

        const res = await fetch(`/api/reports-testing?${params}`)
        if (!res.ok) throw new Error(`Reports API returned ${res.status}`)
        const json = await res.json()

        if (json.success && json.data) {
          const m = json.data.metrics
          setMetrics({
            totalDeposits: Number(m.totalDepositsCents) / 100,
            totalWithdrawals: Number(m.totalWithdrawalsCents) / 100,
            ngr: (Number(m.totalDepositsCents) - Number(m.totalWithdrawalsCents)) / 100,
            ggr: ((Number(m.totalDepositsCents) - Number(m.totalWithdrawalsCents)) / 100) * 0.95,
            ftdCount: m.ftdCount || 0,
            ftdAmount: Number(m.ftdAmountCents) / 100,
            ftdSuccessRate: m.ftdSuccessRate || 0,
            playerCount: m.playerCount || 0,
            averageDeposit: m.averageDepositCents ? Number(m.averageDepositCents) / 100 : 0,
          })
        } else {
          setError(json.error || 'Failed to load reports data')
          setMetrics(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [filters])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports Testing</h2>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <DateRangePicker
            date={filters.dateRange}
            setDate={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Affiliates</label>
          <MultiSelect
            options={affiliates.map(affiliate => ({ label: affiliate, value: affiliate }))}
            selected={filters.selectedAffiliates}
            onChange={(selected) => setFilters(prev => ({ ...prev, selectedAffiliates: selected }))}
            placeholder="Select affiliates..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select
            value={filters.selectedCountry}
            onValueChange={(value) => setFilters(prev => ({ ...prev, selectedCountry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          {error}
        </div>
      ) : metrics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalDeposits)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NGR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.ngr)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GGR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.ggr)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FTDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.ftdCount)}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(metrics.ftdAmount)} total • {formatPercentage(metrics.ftdSuccessRate)} success rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.playerCount)}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(metrics.averageDeposit)} avg. deposit
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
