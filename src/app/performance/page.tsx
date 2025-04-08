"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, DollarSign, Activity, Search, Filter, BarChart2 } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// Sample data for the charts
const performanceData = [
  { name: 'Jan', revenue: 40000, profit: 24000, margin: 60 },
  { name: 'Feb', revenue: 30000, profit: 18000, margin: 60 },
  { name: 'Mar', revenue: 20000, profit: 12000, margin: 60 },
  { name: 'Apr', revenue: 27800, profit: 16680, margin: 60 },
  { name: 'May', revenue: 18900, profit: 11340, margin: 60 },
  { name: 'Jun', revenue: 23900, profit: 14340, margin: 60 },
]

// Sample performance metrics data
const metrics = [
  { 
    id: 1, 
    name: 'Revenue Growth', 
    value: 15.5,
    change: 2.3,
    trend: 'up',
    target: 12.0
  },
  { 
    id: 2, 
    name: 'Player Retention', 
    value: 78.2,
    change: -1.2,
    trend: 'down',
    target: 80.0
  },
  { 
    id: 3, 
    name: 'Average Bet Size', 
    value: 25.50,
    change: 3.1,
    trend: 'up',
    target: 24.00
  },
  { 
    id: 4, 
    name: 'Conversion Rate', 
    value: 3.2,
    change: 0.4,
    trend: 'up',
    target: 3.0
  },
]

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Performance</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$160,600</div>
                  <p className="text-xs text-muted-foreground">
                    +15.5% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$96,360</div>
                  <p className="text-xs text-muted-foreground">
                    +15.5% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margin</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">60%</div>
                  <p className="text-xs text-muted-foreground">
                    +0% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,450</div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={performanceData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" />
                      <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#82ca9d" />
                      <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{metric.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Target: {metric.target}%
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {metric.value}% ({metric.change > 0 ? '+' : ''}{metric.change}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="metrics" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search metrics..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.name}</TableCell>
                        <TableCell>{metric.value}%</TableCell>
                        <TableCell>
                          <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </TableCell>
                        <TableCell>{metric.target}%</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            metric.value >= metric.target ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {metric.value >= metric.target ? 'On Target' : 'Below Target'}
                          </span>
                        </TableCell>
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
  )
} 