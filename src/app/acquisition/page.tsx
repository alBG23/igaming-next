"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface AcquisitionMetrics {
  total_users: number
  new_users: number
  first_deposits: number
  ftd_rate: number
  avg_first_deposit: number
  sources: {
    source: string
    users: number
    deposits: number
    ftd: number
    conversion_rate: number
  }[]
}

export default function AcquisitionPage() {
  const [metrics, setMetrics] = useState<AcquisitionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Get users data
        const { data: usersData, error: usersError } = await supabase
          .from('users_view')
          .select('id, created_at, last_sign_in_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (usersError) throw usersError

        // Get first deposits
        const { data: depositsData, error: depositsError } = await supabase
          .from('payments_view')
          .select('user_id, amount_cents, created_at')
          .eq('action', 'deposit')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (depositsError) throw depositsError

        // Get traffic sources
        const { data: trafficData, error: trafficError } = await supabase
          .from('traffic_reports')
          .select('*')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (trafficError) throw trafficError

        // Calculate metrics
        const totalUsers = usersData.length
        const newUsers = usersData.filter(u => 
          new Date(u.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length

        // Find first deposits
        const firstDeposits = new Map<number, number>()
        depositsData.forEach(deposit => {
          if (!firstDeposits.has(deposit.user_id)) {
            firstDeposits.set(deposit.user_id, deposit.amount_cents)
          }
        })

        const ftdCount = firstDeposits.size
        const avgFirstDeposit = ftdCount > 0 
          ? Array.from(firstDeposits.values()).reduce((sum, amount) => sum + amount, 0) / ftdCount / 100 
          : 0

        // Aggregate traffic sources
        const sourceMetrics = new Map<string, {
          source: string
          users: number
          deposits: number
          ftd: number
        }>()

        trafficData.forEach(report => {
          const source = report.foreign_partner_id
          if (!sourceMetrics.has(source)) {
            sourceMetrics.set(source, {
              source,
              users: 0,
              deposits: 0,
              ftd: 0
            })
          }
          const metrics = sourceMetrics.get(source)!
          metrics.users += report.registrations_count
          metrics.deposits += report.deposits_count
          metrics.ftd += report.ftd_count
        })

        // Calculate conversion rates for each source
        const sources = Array.from(sourceMetrics.values()).map(source => ({
          ...source,
          conversion_rate: source.users > 0 ? (source.ftd / source.users) * 100 : 0
        }))

        setMetrics({
          total_users: totalUsers,
          new_users: newUsers,
          first_deposits: ftdCount,
          ftd_rate: newUsers > 0 ? (ftdCount / newUsers) * 100 : 0,
          avg_first_deposit,
          sources
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!metrics) return <div>No data available</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Acquisition</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.total_users)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.new_users)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>First Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.first_deposits)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>FTD Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.ftd_rate)}</div>
            <p className="text-xs text-muted-foreground">New user to FTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. First Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avg_first_deposit)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>FTD</TableHead>
                <TableHead>Conversion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.sources.map((source) => (
                <TableRow key={source.source}>
                  <TableCell>{source.source}</TableCell>
                  <TableCell>{formatNumber(source.users)}</TableCell>
                  <TableCell>{formatNumber(source.deposits)}</TableCell>
                  <TableCell>{formatNumber(source.ftd)}</TableCell>
                  <TableCell>{formatPercentage(source.conversion_rate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 