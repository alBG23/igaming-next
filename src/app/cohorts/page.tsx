'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LineChart, BarChart } from '@tremor/react';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';

interface CohortData {
  id: number;
  cohortDate: string;
  playerCount: number;
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  metrics: {
    avgFirstDeposit: number;
    avgLifetimeValue: number;
    conversionRate: number;
  };
}

export default function CohortsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [retentionTrends, setRetentionTrends] = useState<any[]>([]);
  const [valueTrends, setValueTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch cohort data
      const { data: cohortData, error: cohortError } = await supabase
        .from('player_cohorts')
        .select('*')
        .order('cohort_date', { ascending: false });

      if (cohortError) throw cohortError;

      if (cohortData) {
        const processedCohorts = cohortData.map((item: any) => ({
          id: item.id,
          cohortDate: item.cohort_date,
          playerCount: item.player_count,
          retentionRates: {
            day1: Number(item.retention_d1),
            day7: Number(item.retention_d7),
            day30: Number(item.retention_d30),
            day90: Number(item.retention_d90)
          },
          metrics: {
            avgFirstDeposit: Number(item.avg_first_deposit) || 0,
            avgLifetimeValue: Number(item.avg_lifetime_value) || 0,
            conversionRate: Number(item.conversion_rate) || 0
          }
        }));

        setCohorts(processedCohorts);

        // Prepare retention trends data
        const retentionData = processedCohorts.map((cohort: any) => ({
          date: formatDate(cohort.cohortDate),
          "Day 1": cohort.retentionRates.day1,
          "Day 7": cohort.retentionRates.day7,
          "Day 30": cohort.retentionRates.day30,
          "Day 90": cohort.retentionRates.day90
        }));

        setRetentionTrends(retentionData);

        // Prepare value trends data
        const valueData = processedCohorts.map((cohort: any) => ({
          date: formatDate(cohort.cohortDate),
          "Avg First Deposit": cohort.metrics.avgFirstDeposit,
          "Avg Lifetime Value": cohort.metrics.avgLifetimeValue
        }));

        setValueTrends(valueData);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load live cohort analytics:', err);
      setCohorts([]);
      setRetentionTrends([]);
      setValueTrends([]);
      setError(err instanceof Error ? err.message : 'Unable to load cohort analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 4000);

    fetchData().finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  const handleRefresh = () => {
    void fetchData();
  };

  const filteredCohorts = cohorts.filter(cohort =>
    formatDate(cohort.cohortDate).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cohort Analysis</h1>
          <p className="text-sm text-muted-foreground">Retention and player value from reported cohorts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by date..."
            className="w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" onClick={handleRefresh} disabled={loading} aria-label="Refresh cohort analytics">
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>Unable to load live cohort analytics: {error}</p>
          </div>
        </div>
      ) : filteredCohorts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {cohorts.length === 0
              ? 'No cohort records are available from the live data source.'
              : 'No cohorts match this date search.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retention Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <LineChart
                    data={retentionTrends}
                    index="date"
                    categories={["Day 1", "Day 7", "Day 30", "Day 90"]}
                    colors={["blue", "green", "yellow", "red"]}
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    yAxisWidth={60}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Value Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Value Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <LineChart
                    data={valueTrends}
                    index="date"
                    categories={["Avg First Deposit", "Avg Lifetime Value"]}
                    colors={["purple", "indigo"]}
                    valueFormatter={formatCurrency}
                    yAxisWidth={100}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cohorts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Cohort Date</TableHeaderCell>
                      <TableHeaderCell>Players</TableHeaderCell>
                      <TableHeaderCell>D1 Retention</TableHeaderCell>
                      <TableHeaderCell>D7 Retention</TableHeaderCell>
                      <TableHeaderCell>D30 Retention</TableHeaderCell>
                      <TableHeaderCell>D90 Retention</TableHeaderCell>
                      <TableHeaderCell>Avg First Deposit</TableHeaderCell>
                      <TableHeaderCell>Avg Lifetime Value</TableHeaderCell>
                      <TableHeaderCell>Conversion Rate</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCohorts.map((cohort) => (
                      <TableRow key={cohort.id}>
                        <TableCell>{formatDate(cohort.cohortDate)}</TableCell>
                        <TableCell>{cohort.playerCount.toLocaleString()}</TableCell>
                        <TableCell>{formatPercentage(cohort.retentionRates.day1)}</TableCell>
                        <TableCell>{formatPercentage(cohort.retentionRates.day7)}</TableCell>
                        <TableCell>{formatPercentage(cohort.retentionRates.day30)}</TableCell>
                        <TableCell>{formatPercentage(cohort.retentionRates.day90)}</TableCell>
                        <TableCell>{formatCurrency(cohort.metrics.avgFirstDeposit)}</TableCell>
                        <TableCell>{formatCurrency(cohort.metrics.avgLifetimeValue)}</TableCell>
                        <TableCell>{formatPercentage(cohort.metrics.conversionRate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 