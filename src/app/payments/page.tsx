'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MetricsData } from '@/api/entities';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { CreditCard, Calendar, Search, Filter, Download, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface PaymentMetrics {
  id: string;
  date: string;
  totalTransactions: number;
  successRate: number;
  totalVolume: number;
  avgTransactionValue: number;
}

interface Transaction {
  id: string;
  player: string;
  method: string;
  amount: number;
  status: 'success' | 'failed';
  date: string;
  reason?: string;
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('30d');
  const [metrics, setMetrics] = useState<PaymentMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: 'all',
    paymentMethod: 'all',
    status: 'all'
  });

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const metricsData = await MetricsData.list('-date');
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
    setIsLoading(false);
  };

  // Prepare data for visualizations
  const acceptanceRatioData = [
    { name: 'Visa', ftd: 86, std: 92 },
    { name: 'Mastercard', ftd: 82, std: 90 },
    { name: 'PayPal', ftd: 94, std: 96 },
    { name: 'Skrill', ftd: 91, std: 93 },
    { name: 'Neteller', ftd: 88, std: 92 }
  ];

  const declineReasons = [
    { name: 'Card Blocked', value: 38 },
    { name: '3D Secure Failure', value: 27 },
    { name: 'Fraud Suspicion', value: 16 },
    { name: 'Insufficient Funds', value: 14 },
    { name: 'Technical Error', value: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const pieData = declineReasons.map(item => ({
    name: item.name,
    value: item.value
  }));

  // Transaction data
  const transactions: Transaction[] = [
    { id: 'TX789012', player: 'Player123', method: 'Visa', amount: 200, status: 'success', date: '2024-01-20' },
    { id: 'TX789013', player: 'Player456', method: 'PayPal', amount: 150, status: 'success', date: '2024-01-20' },
    { id: 'TX789014', player: 'Player789', method: 'Mastercard', amount: 75, status: 'failed', date: '2024-01-19', reason: 'Card Blocked' },
    { id: 'TX789015', player: 'Player321', method: 'Skrill', amount: 300, status: 'success', date: '2024-01-19' },
    { id: 'TX789016', player: 'Player654', method: 'Mastercard', amount: 125, status: 'failed', date: '2024-01-18', reason: '3D Secure Failure' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Transactions</h1>
            <p className="text-gray-500">Monitor payment performance and transaction status</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="acceptance">Acceptance Ratio</TabsTrigger>
            <TabsTrigger value="declines">Decline Analysis</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Transactions</p>
                        <div className="flex items-end gap-2 mt-2">
                          <p className="text-2xl font-bold">3,254</p>
                          <span className="text-green-600 text-sm">+12.5%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Success Rate</p>
                        <div className="flex items-end gap-2 mt-2">
                          <p className="text-2xl font-bold">88.3%</p>
                          <span className="text-red-600 text-sm">-2.1%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-green-100">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Volume</p>
                        <div className="flex items-end gap-2 mt-2">
                          <p className="text-2xl font-bold">$186,420</p>
                          <span className="text-green-600 text-sm">+8.4%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-violet-100">
                        <DollarSign className="h-5 w-5 text-violet-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Avg. Transaction Value</p>
                        <div className="flex items-end gap-2 mt-2">
                          <p className="text-2xl font-bold">$57.29</p>
                          <span className="text-green-600 text-sm">+3.2%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-orange-100">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Volume Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { date: 'Jan 15', deposits: 450, withdrawals: 180 },
                            { date: 'Jan 16', deposits: 520, withdrawals: 230 },
                            { date: 'Jan 17', deposits: 490, withdrawals: 210 },
                            { date: 'Jan 18', deposits: 580, withdrawals: 250 },
                            { date: 'Jan 19', deposits: 610, withdrawals: 270 },
                            { date: 'Jan 20', deposits: 590, withdrawals: 240 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="deposits" stroke="#4F46E5" strokeWidth={2} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="withdrawals" stroke="#FB7185" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Success by Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Visa', success: 88, failed: 12 },
                            { name: 'MasterCard', success: 85, failed: 15 },
                            { name: 'PayPal', success: 94, failed: 6 },
                            { name: 'Skrill', success: 92, failed: 8 },
                            { name: 'Neteller', success: 90, failed: 10 }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="success" stackId="a" fill="#10B981" />
                          <Bar dataKey="failed" stackId="a" fill="#F43F5E" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="acceptance">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Deposit Acceptance Ratio</CardTitle>
                    <CardDescription>First-time deposit (FTD) vs. subsequent deposit (STD) acceptance rates</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={acceptanceRatioData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ftd" fill="#4F46E5" name="First-time Deposit" />
                      <Bar dataKey="std" fill="#10B981" name="Subsequent Deposit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="declines">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Payment Decline Analysis</CardTitle>
                    <CardDescription>Breakdown of payment decline reasons</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Detailed view of payment transactions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-8 w-[200px]"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.player}</TableCell>
                        <TableCell>{transaction.method}</TableCell>
                        <TableCell>${transaction.amount}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'success' ? 'success' : 'destructive'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.reason || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 