'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/date-range-picker'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
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

  // Fetch available affiliates and countries
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        // Get unique s_tag_affiliate values from ad_args_view
        const { data: affiliatesData, error: affiliatesError } = await supabase
          .from('ad_args_view')
          .select('s_tag_affiliate')
          .not('s_tag_affiliate', 'is', null)
          .order('s_tag_affiliate')

        // Get unique countries from users_view
        const { data: countriesData, error: countriesError } = await supabase
          .from('users_view')
          .select('country')
          .not('country', 'is', null)
          .order('country')

        if (affiliatesError) throw affiliatesError
        if (countriesError) throw countriesError

        // Extract unique values
        const uniqueAffiliates = [...new Set(affiliatesData.map(a => a.s_tag_affiliate))].filter(Boolean)
        const uniqueCountries = [...new Set(countriesData.map(c => c.country))].filter(Boolean)

        setAffiliates(uniqueAffiliates)
        setCountries(uniqueCountries)
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

        // First get user_ids from ad_args_view based on affiliate filter
        let userQuery = supabase
          .from('ad_args_view')
          .select('user_id, s_tag_affiliate')

        if (filters.selectedAffiliates.length > 0) {
          userQuery = userQuery.in('s_tag_affiliate', filters.selectedAffiliates)
        }

        const { data: userData, error: userError } = await userQuery

        if (userError) throw userError

        // Get user_ids that match our criteria
        const userIds = userData.map(u => u.user_id)

        // Now fetch payments data for these users
        let query = supabase
          .from('payments_view')
          .select(`
            *,
            user:users_view(*)
          `)
          .in('user_id', userIds)
          .gte('created_at', filters.dateRange?.from?.toISOString() || '')
          .lte('created_at', filters.dateRange?.to?.toISOString() || '')

        if (filters.selectedCountry !== 'all') {
          query = query.eq('user.country', filters.selectedCountry)
        }

        const { data, error } = await query

        if (error) throw error

        // Calculate metrics
        const deposits = data.filter(p => p.action === 'deposit')
        const withdrawals = data.filter(p => p.action === 'withdrawal')
        const ftds = deposits.filter(p => p.is_first_deposit)
        const successfulFtds = ftds.filter(p => p.success)

        const totalDeposits = deposits.reduce((sum, p) => sum + p.amount_cents, 0) / 100
        const totalWithdrawals = withdrawals.reduce((sum, p) => sum + p.amount_cents, 0) / 100
        const ngr = totalDeposits - totalWithdrawals
        const ggr = ngr * 0.95 // Assuming 5% commission rate

        setMetrics({
          totalDeposits,
          totalWithdrawals,
          ngr,
          ggr,
          ftdCount: ftds.length,
          ftdAmount: ftds.reduce((sum, p) => sum + p.amount_cents, 0) / 100,
          ftdSuccessRate: ftds.length ? (successfulFtds.length / ftds.length) * 100 : 0,
          playerCount: new Set(data.map(p => p.user_id)).size,
          averageDeposit: deposits.length ? totalDeposits / deposits.length : 0,
        })
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