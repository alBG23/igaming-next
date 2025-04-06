import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Users, 
  Search, 
  UserPlus, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Percent,
  CreditCard,
  Radio,
  Award,
  Clock,
  Gamepad2,
  Ban,
  Filter,
  Download
} from 'lucide-react';

export default function PlayerAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data based on your database schema
  const cohortData = [
    { month: 'Jan', retention_7: 68, retention_30: 42, retention_90: 28 },
    { month: 'Feb', retention_7: 72, retention_30: 45, retention_90: 32 },
    { month: 'Mar', retention_7: 65, retention_30: 38, retention_90: 25 },
    { month: 'Apr', retention_7: 70, retention_30: 44, retention_90: 30 },
    { month: 'May', retention_7: 74, retention_30: 48, retention_90: 33 },
    { month: 'Jun', retention_7: 71, retention_30: 46, retention_90: 31 }
  ];
  
  const ltvData = [
    { month: '1', value: 45 },
    { month: '2', value: 72 },
    { month: '3', value: 95 },
    { month: '4', value: 120 },
    { month: '5', value: 142 },
    { month: '6', value: 160 }
  ];
  
  const churnPredictionData = [
    { risk: 'High Risk', value: 24, color: '#ef4444' },
    { risk: 'Medium Risk', value: 32, color: '#f97316' },
    { risk: 'Low Risk', value: 44, color: '#22c55e' }
  ];
  
  const revenueSegmentData = [
    { name: 'VIP', value: 45, color: '#8b5cf6' },
    { name: 'High Value', value: 25, color: '#3b82f6' },
    { name: 'Regular', value: 20, color: '#14b8a6' },
    { name: 'Low Value', value: 10, color: '#a3a3a3' }
  ];
  
  const playerSegments = [
    { 
      id: 1, 
      name: 'New Players', 
      count: 1423, 
      criteria: 'Registered in last 7 days',
      trend: +12.4,
      color: '#3b82f6'
    },
    { 
      id: 2, 
      name: 'VIP Players', 
      count: 267, 
      criteria: 'Lifetime deposits > $1000',
      trend: +3.7,
      color: '#8b5cf6'
    },
    { 
      id: 3, 
      name: 'Churning Risk', 
      count: 845, 
      criteria: 'No login in 14+ days, previously active',
      trend: -5.2,
      color: '#ef4444'
    },
    { 
      id: 4, 
      name: 'Bonus Hunters', 
      count: 632, 
      criteria: 'High bonus/deposit ratio',
      trend: +8.1,
      color: '#f97316'
    },
    { 
      id: 5, 
      name: 'Slot Players', 
      count: 2156, 
      criteria: '90%+ gameplay on slots',
      trend: +2.3,
      color: '#14b8a6'
    }
  ];
  
  const behaviorMetrics = [
    { 
      axis: 'Deposit Frequency', 
      vip: 95, 
      high: 70, 
      regular: 40, 
      risk: 15 
    },
    { 
      axis: 'Session Length', 
      vip: 85, 
      high: 75, 
      regular: 60, 
      risk: 30 
    },
    { 
      axis: 'Bet Size', 
      vip: 90, 
      high: 65, 
      regular: 35, 
      risk: 20 
    },
    { 
      axis: 'Game Variety', 
      vip: 80, 
      high: 60, 
      regular: 45, 
      risk: 25 
    },
    { 
      axis: 'Bonus Usage', 
      vip: 75, 
      high: 85, 
      regular: 65, 
      risk: 90 
    }
  ];
  
  const topPlayers = [
    { 
      id: 'P84752', 
      registration: '2023-03-12', 
      deposits: 28, 
      total_deposit: 8450, 
      total_bonus: 1200, 
      total_wagered: 42500, 
      net_win: -3200, 
      last_activity: '2023-06-18', 
      preferred_game: 'Slots', 
      risk_score: 'Low' 
    },
    { 
      id: 'P12378', 
      registration: '2023-01-05', 
      deposits: 45, 
      total_deposit: 12750, 
      total_bonus: 2100, 
      total_wagered: 86000, 
      net_win: -6500, 
      last_activity: '2023-06-19', 
      preferred_game: 'Blackjack', 
      risk_score: 'Low' 
    },
    { 
      id: 'P39845', 
      registration: '2022-11-18', 
      deposits: 32, 
      total_deposit: 9800,
      total_bonus: 1750, 
      total_wagered: 52000, 
      net_win: -4100, 
      last_activity: '2023-06-15', 
      preferred_game: 'Roulette', 
      risk_score: 'Medium' 
    },
    { 
      id: 'P67234', 
      registration: '2023-04-22', 
      deposits: 12, 
      total_deposit: 3600, 
      total_bonus: 800, 
      total_wagered: 18000, 
      net_win: +1200, 
      last_activity: '2023-06-20', 
      preferred_game: 'Slots', 
      risk_score: 'Medium' 
    },
    { 
      id: 'P45612', 
      registration: '2022-08-30', 
      deposits: 58, 
      total_deposit: 18500, 
      total_bonus: 3200, 
      total_wagered: 112000, 
      net_win: -8900, 
      last_activity: '2023-06-19', 
      preferred_game: 'Poker', 
      risk_score: 'Low' 
    }
  ];
  
  const churnReasons = [
    { reason: 'Losing streak', percentage: 42 },
    { reason: 'No engagement with bonuses', percentage: 28 },
    { reason: 'Technical issues', percentage: 12 },
    { reason: 'Payment problems', percentage: 10 },
    { reason: 'Other', percentage: 8 }
  ];
  
  const gamePreferences = [
    { game: 'Slots', percentage: 58, arpu: 82 },
    { game: 'Blackjack', percentage: 15, arpu: 120 },
    { game: 'Roulette', percentage: 12, arpu: 95 },
    { game: 'Poker', percentage: 8, arpu: 145 },
    { game: 'Other', percentage: 7, arpu: 65 }
  ];
  
  const deviceUsage = [
    { device: 'Mobile', percentage: 65, color: '#3b82f6' },
    { device: 'Desktop', percentage: 30, color: '#8b5cf6' },
    { device: 'Tablet', percentage: 5, color: '#14b8a6' }
  ];
  
  const sessionData = [
    { time: '00:00', sessions: 320 },
    { time: '03:00', sessions: 120 },
    { time: '06:00', sessions: 90 },
    { time: '09:00', sessions: 280 },
    { time: '12:00', sessions: 450 },
    { time: '15:00', sessions: 580 },
    { time: '18:00', sessions: 720 },
    { time: '21:00', sessions: 650 }
  ];

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [timeframe, segment]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Player Analysis</h1>
            <p className="text-gray-500">Analyze player behavior, performance, and lifecycle</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search player ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full md:w-56"
              />
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Segmentation
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Lifecycle
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-1">
              <Gamepad2 className="h-4 w-4" />
              Behavior
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Players
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4,285</div>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Revenue Per User
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$86.42</div>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +4.5% from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Churn Rate
                  </CardTitle>
                  <Percent className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18.3%</div>
                  <p className="text-xs text-red-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1% from previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average LTV (6-month)
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$160.75</div>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +7.8% from previous period
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Player Lifetime Value</CardTitle>
                    <CardDescription>Average value per player over 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ltvData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                          <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', offset: 10 }} />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip formatter={(value) => [`$${value}`, 'LTV']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="LTV" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Churn Prediction</CardTitle>
                    <CardDescription>Risk level distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={churnPredictionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {churnPredictionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Players']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <CardDescription>Highest value players based on lifetime deposits</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player ID</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Deposits</TableHead>
                      <TableHead>Total Deposit</TableHead>
                      <TableHead>Total Wagered</TableHead>
                      <TableHead>Net Win/Loss</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPlayers.map((player) => (
                      <TableRow key={player.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">{player.id}</TableCell>
                        <TableCell>{player.registration}</TableCell>
                        <TableCell>{player.deposits}</TableCell>
                        <TableCell>${player.total_deposit.toLocaleString()}</TableCell>
                        <TableCell>${player.total_wagered.toLocaleString()}</TableCell>
                        <TableCell className={player.net_win > 0 ? "text-green-600" : "text-red-600"}>
                          {player.net_win > 0 ? "+" : ""}{player.net_win.toLocaleString()}
                        </TableCell>
                        <TableCell>{player.last_activity}</TableCell>
                        <TableCell>
                          <Badge className={
                            player.risk_score === 'Low' 
                              ? 'bg-green-100 text-green-800'
                              : player.risk_score === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }>
                            {player.risk_score}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'segments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Player Segments</CardTitle>
                        <CardDescription>Key player segments and their size</CardDescription>
                      </div>
                      <Select value={segment} onValueChange={setSegment}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Segments</SelectItem>
                          <SelectItem value="vip">VIP Players</SelectItem>
                          <SelectItem value="risk">Churn Risk</SelectItem>
                          <SelectItem value="new">New Players</SelectItem>
                          <SelectItem value="game">By Game Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={playerSegments}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`${value} players`, 'Count']} />
                          <Bar 
                            dataKey="count" 
                            fill="#8884d8" 
                            radius={[0, 4, 4, 0]}
                          >
                            {playerSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Segment</CardTitle>
                    <CardDescription>Distribution of revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueSegmentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {revenueSegmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Revenue']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Behavior Patterns by Segment</CardTitle>
                  <CardDescription>Comparing key player segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={behaviorMetrics}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="axis" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="VIP" dataKey="vip" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                        <Radar name="High Value" dataKey="high" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                        <Radar name="Regular" dataKey="regular" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.5} />
                        <Radar name="Churn Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Segment Details</CardTitle>
                  <CardDescription>Key player segments and criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Segment</TableHead>
                        <TableHead>Players</TableHead>
                        <TableHead>Criteria</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerSegments.map((seg) => (
                        <TableRow key={seg.id}>
                          <TableCell className="font-medium">{seg.name}</TableCell>
                          <TableCell>{seg.count}</TableCell>
                          <TableCell className="max-w-xs truncate">{seg.criteria}</TableCell>
                          <TableCell className={seg.trend > 0 ? "text-green-600" : "text-red-600"}>
                            {seg.trend > 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                            {Math.abs(seg.trend)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Targeted marketing and retention activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-amber-800">Churn Prevention</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-amber-700">
                      <p className="mb-2">Proactively engage with 845 at-risk players showing reduced activity.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Send personalized reactivation bonuses</li>
                        <li>Offer cashback on next deposit</li>
                        <li>Implement win-back email campaign</li>
                      </ul>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="bg-white text-amber-800 border-amber-300">
                          Create Campaign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-purple-800">VIP Nurturing</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-purple-700">
                      <p className="mb-2">Special attention needed for 267 VIP players driving 45% of revenue.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Assign dedicated VIP managers</li>
                        <li>Create exclusive tournament</li>
                        <li>Send personalized birthday offers</li>
                      </ul>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="bg-white text-purple-800 border-purple-300">
                          VIP Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-blue-800">New Player Conversion</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-700">
                      <p className="mb-2">Focus on converting 1,423 new players from the past week.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>First deposit bonus optimization</li>
                        <li>Guided onboarding improvements</li>
                        <li>Early free spin rewards</li>
                      </ul>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="bg-white text-blue-800 border-blue-300">
                          Conversion Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Retention</CardTitle>
                  <CardDescription>Player retention by registration month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cohortData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                        <Legend />
                        <Bar dataKey="retention_7" name="7-Day Retention" fill="#3b82f6" />
                        <Bar dataKey="retention_30" name="30-Day Retention" fill="#8b5cf6" />
                        <Bar dataKey="retention_90" name="90-Day Retention" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Churn Analysis</CardTitle>
                  <CardDescription>Main reasons for player churn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={churnReasons}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" unit="%" />
                        <YAxis dataKey="reason" type="category" width={120} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Bar 
                          dataKey="percentage" 
                          fill="#ef4444" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Activity</CardTitle>
                  <CardDescription>Player activity by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sessionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sessions" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Device Usage</CardTitle>
                  <CardDescription>Sessions by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {deviceUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Reactivation Success</CardTitle>
                  <CardDescription>Effectiveness of win-back campaigns</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-center h-[250px]">
                  <div className="text-center">
                    <div className="relative mx-auto w-32 h-32 mb-4">
                      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full border-8 border-blue-500" style={{ 
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                          transform: 'rotate(126deg)'
                        }}></div>
                        <span className="text-2xl font-bold">35%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Overall reactivation rate</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="font-medium text-sm">Email</p>
                        <p className="text-blue-600 font-bold">28%</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="font-medium text-sm">SMS</p>
                        <p className="text-blue-600 font-bold">42%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Stage Analysis</CardTitle>
                <CardDescription>Player distribution across lifecycle stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md border relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-medium mb-1">New</h3>
                      <p className="text-2xl font-bold mb-1">18%</p>
                      <p className="text-sm text-gray-500">
                        First 7 days
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-medium mb-1">Exploring</h3>
                      <p className="text-2xl font-bold mb-1">24%</p>
                      <p className="text-sm text-gray-500">
                        8-30 days
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-medium mb-1">Establishing</h3>
                      <p className="text-2xl font-bold mb-1">22%</p>
                      <p className="text-sm text-gray-500">
                        31-90 days
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-medium mb-1">Loyal</h3>
                      <p className="text-2xl font-bold mb-1">25%</p>
                      <p className="text-sm text-gray-500">
                        91+ days active
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-medium mb-1">At Risk</h3>
                      <p className="text-2xl font-bold mb-1">11%</p>
                      <p className="text-sm text-gray-500">
                        Declining activity
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Retention Opportunities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-blue-700">New Player Bonus</h4>
                      <p className="text-sm text-blue-600">
                        18% drop-off after welcome bonus. Consider extending initial bonuses.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-700">90-Day Milestone</h4>
                      <p className="text-sm text-blue-600">
                        Loyalty recognition at 90 days increases retention by 15%.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-700">Reactivation</h4>
                      <p className="text-sm text-blue-600">
                        SMS campaigns show 42% success rate for at-risk players.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'behavior' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Game Preferences</CardTitle>
                  <CardDescription>Popular game types by player percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={gamePreferences}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="game" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => [name === 'percentage' ? `${value}%` : `$${value}`, name === 'percentage' ? 'Players' : 'ARPU']} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="percentage" name="Players %" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="arpu" name="ARPU ($)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Behavior</CardTitle>
                  <CardDescription>Deposit frequency and amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Deposit</h3>
                      <p className="text-2xl font-bold mb-1">$78.50</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +5.2% from previous period
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Deposit Frequency</h3>
                      <p className="text-2xl font-bold mb-1">1.8/month</p>
                      <p className="text-xs text-red-600 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -3.1% from previous period
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">One-time depositors</span>
                      <span className="text-sm font-medium">48%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">2-5 deposits</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">6-10 deposits</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">10+ deposits</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Duration</CardTitle>
                  <CardDescription>Average time spent playing</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-center">
                    <div className="mb-4 relative pt-6">
                      <Clock className="h-10 w-10 mx-auto mb-2 text-blue-500" />
                      <div className="text-3xl font-bold">36m 12s</div>
                      <p className="text-sm text-gray-500">Average session</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mt-6">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="font-medium">28m 44s</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-sm text-gray-500">Desktop</p>
                        <p className="font-medium">42m 18s</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-sm text-gray-500">Tablet</p>
                        <p className="font-medium">38m 05s</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">VIP players</span>
                        <span className="text-xs font-medium">68m 24s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Bonus Engagement</CardTitle>
                  <CardDescription>Bonus usage patterns</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm font-medium">62.4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '62.4%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Wagering Completion</span>
                      <span className="text-sm font-medium">48.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '48.2%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Deposit After Bonus</span>
                      <span className="text-sm font-medium">38.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '38.7%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-sm text-gray-500">Most Effective Bonus</span>
                      <Badge>Free Spins</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Best Conversion</span>
                      <Badge>100% Match</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Worst Performer</span>
                      <Badge variant="outline">Cashback</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Responsible Gaming</CardTitle>
                  <CardDescription>Player self-limitation usage</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-center mb-4">
                    <Ban className="h-10 w-10 mx-auto mb-2 text-red-500" />
                    <div className="text-lg font-bold">18.6%</div>
                    <p className="text-sm text-gray-500">Players using limits</p>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deposit Limits</span>
                      <span className="text-sm font-medium">12.3%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '12.3%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time Limits</span>
                      <span className="text-sm font-medium">8.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '8.7%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loss Limits</span>
                      <span className="text-sm font-medium">5.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '5.2%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Self-exclusion</span>
                      <span className="text-sm font-medium">2.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '2.1%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Behavioral Insights</CardTitle>
                    <CardDescription>AI-detected patterns in player behavior</CardDescription>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <Radio className="h-5 w-5 text-purple-500 mb-2" />
                      <h3 className="font-medium mb-1">Game Switching Pattern</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        62% of players who lost more than 3 consecutive slot games switch to table games.
                      </p>
                      <div className="text-xs text-purple-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                        Opportunity for cross-selling
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <Radio className="h-5 w-5 text-blue-500 mb-2" />
                      <h3 className="font-medium mb-1">Deposit Timing</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Players are 3.2x more likely to deposit on Fridays and during evening hours (8-11pm).
                      </p>
                      <div className="text-xs text-blue-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                        Optimize promotion timing
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <Radio className="h-5 w-5 text-green-500 mb-2" />
                      <h3 className="font-medium mb-1">Win-triggered Activity</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Players who win over $50 show 68% longer session duration in the same gaming session.
                      </p>
                      <div className="text-xs text-green-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                        Early win experience important
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}