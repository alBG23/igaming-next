'use client'

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Activity, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Implement your own data loading logic here
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const overviewData = [
    { date: "Jan 15", ggr: 2400, ngr: 1800, deposits: 112 },
    { date: "Jan 16", ggr: 1800, ngr: 1300, deposits: 98 },
    { date: "Jan 17", ggr: 3200, ngr: 2800, deposits: 140 },
    { date: "Jan 18", ggr: 2800, ngr: 2300, deposits: 121 },
    { date: "Jan 19", ggr: 3600, ngr: 3100, deposits: 160 },
    { date: "Jan 20", ggr: 3200, ngr: 2700, deposits: 145 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">iGaming Analytics</h1>
            <p className="text-gray-500">
              Track, analyze, and optimize your gaming operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
                <SelectItem value="py">Last Year</SelectItem>
                <SelectItem value="cy">Current Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setIsLoading(false)}>Refresh Data</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
            </TabsList>
          
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        GGR (Gross Gaming Revenue)
                      </CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$24,560</div>
                      <p className="text-xs text-green-600">
                        +12.5% from previous period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        NGR (Net Gaming Revenue)
                      </CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$18,935</div>
                      <p className="text-xs text-green-600">
                        +8.2% from previous period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Deposits
                      </CardTitle>
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,258</div>
                      <p className="text-xs text-red-600">
                        -2.3% from previous period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Players
                      </CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4,562</div>
                      <p className="text-xs text-green-600">
                        +5.8% from previous period
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={overviewData}>
                            <defs>
                              <linearGradient id="colorGgr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorNgr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="ggr"
                              stroke="#4F46E5"
                              fillOpacity={1}
                              fill="url(#colorGgr)"
                            />
                            <Area
                              type="monotone"
                              dataKey="ngr"
                              stroke="#06B6D4"
                              fillOpacity={1}
                              fill="url(#colorNgr)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="acquisition">
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-bold mb-4">Acquisition Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Key Highlights</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <span>Organic traffic increased 23% QoQ</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <span>Affiliate conversions up 12% MoM</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowDownRight className="h-5 w-5 text-red-600 mr-2 shrink-0 mt-0.5" />
                        <span>CPA costs rising for social media</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">
                      Acquisition data shows strong performance in organic channels with room for optimization in paid social media. 
                      SEO improvements have resulted in 35% higher landing page conversion rates.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-bold mb-4">Revenue Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Key Highlights</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <span>Slots revenue increased 15% YoY</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <span>Live dealer games growing at 28% YoY</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowDownRight className="h-5 w-5 text-red-600 mr-2 shrink-0 mt-0.5" />
                        <span>Table games showing 5% decline</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">
                      Revenue data indicates strong performance in slots and live dealer verticals, with opportunities to revitalize table games through new promotions and UI improvements.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="players">
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-bold mb-4">Player Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Key Highlights</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <span>New player registrations up 18%</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <span>Player retention improved by 12%</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowDownRight className="h-5 w-5 text-red-600 mr-2 shrink-0 mt-0.5" />
                        <span>VIP player activity down 3%</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">
                      Player analytics show positive trends in new player acquisition and retention, though VIP engagement needs attention. 
                      New loyalty program features are expected to improve VIP metrics in the coming quarter.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 