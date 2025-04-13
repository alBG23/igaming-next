'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface CohortMetrics {
  cohorts: {
    month: string
    users: number
    retention: number[]
    ltv: number
    arpu: number
  }[]
}

export default function CohortPage() {
  const [metrics, setMetrics] = useState<CohortMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Get users data for the last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        
        const { data: usersData, error: usersError } = await supabase
          .from('users_view')
          .select('id, created_at, last_sign_in_at')
          .gte('created_at', sixMonthsAgo.toISOString())

        if (usersError) throw usersError

        // Get payment data
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments_view')
          .select('user_id, amount_cents, created_at')
          .eq('action', 'deposit')
          .gte('created_at', sixMonthsAgo.toISOString())

        if (paymentsError) throw paymentsError

        // Group users by cohort (month of registration)
        const cohorts = new Map<string, {
          users: number
          retention: Map<number, number> // month -> count
          totalRevenue: number
        }>()

        usersData.forEach(user => {
          const cohortMonth = new Date(user.created_at).toISOString().slice(0, 7) // YYYY-MM
          if (!cohorts.has(cohortMonth)) {
            cohorts.set(cohortMonth, {
              users: 0,
              retention: new Map(),
              totalRevenue: 0
            })
          }
          const cohort = cohorts.get(cohortMonth)!
          cohort.users++

          // Calculate retention
          if (user.last_sign_in_at) {
            const monthsSinceRegistration = Math.floor(
              (new Date(user.last_sign_in_at).getTime() - new Date(user.created_at).getTime()) / 
              (30 * 24 * 60 * 60 * 1000)
            )
            cohort.retention.set(
              monthsSinceRegistration,
              (cohort.retention.get(monthsSinceRegistration) || 0) + 1
            )
          }
        })

        // Calculate revenue per cohort
        paymentsData.forEach(payment => {
          const user = usersData.find(u => u.id === payment.user_id)
          if (user) {
            const cohortMonth = new Date(user.created_at).toISOString().slice(0, 7)
            const cohort = cohorts.get(cohortMonth)
            if (cohort) {
              cohort.totalRevenue += payment.amount_cents
            }
          }
        })

        // Format cohort data
        const formattedCohorts = Array.from(cohorts.entries()).map(([month, data]) => {
          const retention = Array(6).fill(0).map((_, i) => {
            const retained = data.retention.get(i) || 0
            return data.users > 0 ? (retained / data.users) * 100 : 0
          })

          return {
            month,
            users: data.users,
            retention,
            ltv: data.totalRevenue / 100 / data.users, // Convert cents to currency
            arpu: data.totalRevenue / 100 / data.users // Average Revenue Per User
          }
        })

        setMetrics({ cohorts: formattedCohorts })
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
      <h1 className="text-2xl font-bold mb-6">Cohort Analysis</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.cohorts.length)}</div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                metrics.cohorts.reduce((sum, c) => sum + c.ltv, 0) / metrics.cohorts.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">Average lifetime value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. ARPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                metrics.cohorts.reduce((sum, c) => sum + c.arpu, 0) / metrics.cohorts.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">Average revenue per user</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retention Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>LTV</TableHead>
                <TableHead>ARPU</TableHead>
                <TableHead>M0</TableHead>
                <TableHead>M1</TableHead>
                <TableHead>M2</TableHead>
                <TableHead>M3</TableHead>
                <TableHead>M4</TableHead>
                <TableHead>M5</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.cohorts.map((cohort) => (
                <TableRow key={cohort.month}>
                  <TableCell>{cohort.month}</TableCell>
                  <TableCell>{formatNumber(cohort.users)}</TableCell>
                  <TableCell>{formatCurrency(cohort.ltv)}</TableCell>
                  <TableCell>{formatCurrency(cohort.arpu)}</TableCell>
                  {cohort.retention.map((rate, i) => (
                    <TableCell key={i}>{formatPercentage(rate)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 