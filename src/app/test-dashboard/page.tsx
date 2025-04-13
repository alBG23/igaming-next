'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart } from '@tremor/react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface RevenueMetric {
  id: string;
  created_at: string;
  month: string;
  total_revenue: string;
  total_payouts: string;
  net_revenue: string;
}

export default function TestDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/revenue-metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Transform data for charts
  const chartData = metrics.map(metric => ({
    date: new Date(metric.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    total_revenue: parseFloat(metric.total_revenue),
    net_revenue: parseFloat(metric.net_revenue),
    payouts: parseFloat(metric.total_payouts)
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(metrics[metrics.length - 1]?.total_revenue || '0'))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(metrics[metrics.length - 1]?.net_revenue || '0'))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(metrics[metrics.length - 1]?.total_payouts || '0'))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={chartData}
              index="date"
              categories={["total_revenue", "net_revenue"]}
              colors={["blue", "green"]}
              valueFormatter={formatCurrency}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payouts vs Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={chartData}
              index="date"
              categories={["total_revenue", "payouts"]}
              colors={["blue", "red"]}
              valueFormatter={formatCurrency}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 