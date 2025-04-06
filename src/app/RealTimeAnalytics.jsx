import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  DollarSign, 
  Download, 
  Eye, 
  FileText, 
  LayoutGrid, 
  MapPin, 
  PieChart, 
  Play, 
  RefreshCw, 
  Users,
  Zap,
  BarChart3,
  Calendar,
  Shuffle,
  Globe,
  Banknote,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import LivePlayerMap from '../components/real-time/LivePlayerMap';
import RealtimeHeatmap from '../components/real-time/RealtimeHeatmap';
import LiveMetricsCards from '../components/real-time/LiveMetricsCards';
import LiveTransactionsFeed from '../components/real-time/LiveTransactionsFeed';
import EventDistributionChart from '../components/real-time/EventDistributionChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function RealTimeAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('15min');
  const [refreshRate, setRefreshRate] = useState('5');
  const [liveDataConnection, setLiveDataConnection] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 0,
    activeGames: 0,
    depositRate: 0,
    wagerRate: 0,
    currentGGR: 0,
    transactionsPerMinute: 0
  });
  const [playerActivities, setPlayerActivities] = useState([]);
  const [transactionFeed, setTransactionFeed] = useState([]);
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [eventsByLocation, setEventsByLocation] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef(null);

  // Sample data for charts
  const [realtimeChartData, setRealtimeChartData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  
  // Initialize with some data when component mounts
  useEffect(() => {
    initializeData();
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // Effect to update data when refresh rate changes
  useEffect(() => {
    if (isSimulating) {
      startSimulation();
    }
  }, [refreshRate, isSimulating]);

  const initializeData = () => {
    // Initial realtime chart data
    const initialChartData = Array(20).fill().map((_, i) => {
      const timestamp = new Date(Date.now() - (19 - i) * 30000);
      return {
        timestamp: timestamp.toISOString(),
        timeLabel: timestamp.toLocaleTimeString(),
        activeUsers: Math.floor(Math.random() * 100) + 200,
        depositRate: Math.floor(Math.random() * 20) + 10,
        wagerRate: Math.floor(Math.random() * 100) + 150,
        ggr: Math.floor(Math.random() * 500) + 1000
      };
    });
    setRealtimeChartData(initialChartData);

    // Initial heatmap data (24 hours x 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heatmapInitialData = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        const hourFormatted = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        let value = Math.floor(Math.random() * 150);
        // Weekend and evening pattern
        if (day >= 5) value = Math.floor(value * 1.5);
        if (hour >= 18 && hour <= 23) value = Math.floor(value * 1.3);
        
        heatmapInitialData.push({
          hour: hourFormatted,
          day: days[day],
          value: value,
          dayIndex: day
        });
      }
    }
    setHeatmapData(heatmapInitialData);

    // Initial transaction feed
    generateTransactionFeed(5);
    
    // Initial metrics
    updateLiveMetrics();
    
    // Initial events
    updateRealtimeEvents();
    
    // Initial location data
    generateLocationData();
  };

  const generateLocationData = () => {
    const locations = [
      { country: 'Germany', coordinates: [10.4515, 51.1657], players: Math.floor(Math.random() * 50) + 20 },
      { country: 'UK', coordinates: [-3.4359, 55.3781], players: Math.floor(Math.random() * 40) + 15 },
      { country: 'France', coordinates: [2.2137, 46.2276], players: Math.floor(Math.random() * 35) + 10 },
      { country: 'Spain', coordinates: [-3.7492, 40.4637], players: Math.floor(Math.random() * 30) + 12 },
      { country: 'Italy', coordinates: [12.5674, 41.8719], players: Math.floor(Math.random() * 25) + 8 },
      { country: 'Sweden', coordinates: [18.6435, 60.1282], players: Math.floor(Math.random() * 15) + 5 },
      { country: 'Finland', coordinates: [25.7482, 61.9241], players: Math.floor(Math.random() * 10) + 3 },
      { country: 'Denmark', coordinates: [9.5018, 56.2639], players: Math.floor(Math.random() * 12) + 4 },
      { country: 'Norway', coordinates: [8.4689, 60.4720], players: Math.floor(Math.random() * 8) + 2 },
      { country: 'Netherlands', coordinates: [5.2913, 52.1326], players: Math.floor(Math.random() * 20) + 7 }
    ];
    
    setEventsByLocation(locations);
  };

  const updateLiveMetrics = () => {
    // Simulate updating metrics with random changes
    setLiveMetrics({
      activeUsers: Math.floor(Math.random() * 50) + 250,
      activeGames: Math.floor(Math.random() * 20) + 30,
      depositRate: Math.floor(Math.random() * 8) + 12,
      wagerRate: Math.floor(Math.random() * 50) + 150,
      currentGGR: Math.floor(Math.random() * 200) + 1200,
      transactionsPerMinute: Math.floor(Math.random() * 15) + 25
    });
  };

  const generateTransactionFeed = (count = 1) => {
    const newTransactions = Array(count).fill().map((_, i) => {
      const transactionTypes = ['deposit', 'withdrawal', 'bet', 'win'];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * (transactionType === 'bet' || transactionType === 'win' ? 200 : 500)) + 10;
      
      const countries = ['DE', 'UK', 'FR', 'ES', 'IT', 'SE', 'FI', 'DK', 'NO', 'NL'];
      const country = countries[Math.floor(Math.random() * countries.length)];
      
      const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Skrill', 'Bank Transfer'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const games = ['Slots', 'Blackjack', 'Roulette', 'Poker', 'Baccarat', 'Sports Betting', 'Live Casino'];
      const game = transactionType === 'bet' || transactionType === 'win' ? games[Math.floor(Math.random() * games.length)] : null;
      
      return {
        id: Math.random().toString(36).substring(2, 10),
        type: transactionType,
        amount: amount,
        currency: 'EUR',
        country: country,
        timestamp: new Date().toISOString(),
        playerID: `player${Math.floor(Math.random() * 10000)}`,
        paymentMethod: transactionType === 'deposit' || transactionType === 'withdrawal' ? paymentMethod : null,
        game: game,
        status: Math.random() > 0.05 ? 'success' : 'failed'
      };
    });
    
    setTransactionFeed(prev => [...newTransactions, ...prev].slice(0, 100));
  };

  const updateRealtimeEvents = () => {
    const eventTypes = [
      'login', 'registration', 'game_start', 'game_end', 
      'deposit', 'withdrawal', 'bet_placed', 'win_recorded',
      'bonus_claimed', 'account_verified'
    ];
    
    // Generate random events distribution
    const newEvents = eventTypes.map(type => ({
      type,
      count: Math.floor(Math.random() * 50) + (type === 'login' ? 100 : 10)
    }));
    
    setRealtimeEvents(newEvents);
  };

  const startSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    
    const refreshSeconds = parseInt(refreshRate);
    setLiveDataConnection(true);
    
    simulationIntervalRef.current = setInterval(() => {
      // Update chart data with a new point
      setRealtimeChartData(prev => {
        const timestamp = new Date();
        const newPoint = {
          timestamp: timestamp.toISOString(),
          timeLabel: timestamp.toLocaleTimeString(),
          activeUsers: prev.length ? (prev[prev.length-1].activeUsers + Math.floor(Math.random() * 20) - 10) : 250,
          depositRate: prev.length ? (prev[prev.length-1].depositRate + Math.floor(Math.random() * 4) - 2) : 15,
          wagerRate: prev.length ? (prev[prev.length-1].wagerRate + Math.floor(Math.random() * 20) - 10) : 180,
          ggr: prev.length ? (prev[prev.length-1].ggr + Math.floor(Math.random() * 100) - 50) : 1200
        };
        
        // Ensure values stay positive
        newPoint.activeUsers = Math.max(150, newPoint.activeUsers);
        newPoint.depositRate = Math.max(5, newPoint.depositRate);
        newPoint.wagerRate = Math.max(100, newPoint.wagerRate);
        newPoint.ggr = Math.max(500, newPoint.ggr);
        
        return [...prev.slice(1), newPoint];
      });
      
      // Update metrics
      updateLiveMetrics();
      
      // Add new transactions
      const transactionCount = Math.floor(Math.random() * 3) + 1;
      generateTransactionFeed(transactionCount);
      
      // Update events distribution
      updateRealtimeEvents();
      
      // Update location data occasionally
      if (Math.random() > 0.7) {
        generateLocationData();
      }
      
      // Update heatmap data occasionally
      if (Math.random() > 0.8) {
        setHeatmapData(prev => {
          return prev.map(cell => ({
            ...cell,
            value: Math.max(10, cell.value + Math.floor(Math.random() * 20) - 10)
          }));
        });
      }
      
    }, refreshSeconds * 1000);
    
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
    setLiveDataConnection(false);
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    // Would normally adjust data fetch based on time range
  };

  const handleRefreshRateChange = (value) => {
    setRefreshRate(value);
    if (isSimulating) {
      startSimulation(); // Restart with new refresh rate
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real-time Analytics</h1>
            <p className="text-gray-500">
              {liveDataConnection ? 
                'Live monitoring of player activity and revenue metrics' : 
                'Connect to see real-time player activity and revenue metrics'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15min">Last 15 minutes</SelectItem>
                <SelectItem value="1hour">Last hour</SelectItem>
                <SelectItem value="6hours">Last 6 hours</SelectItem>
                <SelectItem value="24hours">Last 24 hours</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={refreshRate} onValueChange={handleRefreshRateChange}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Refresh rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Refresh every second</SelectItem>
                <SelectItem value="5">Refresh every 5 seconds</SelectItem>
                <SelectItem value="10">Refresh every 10 seconds</SelectItem>
                <SelectItem value="30">Refresh every 30 seconds</SelectItem>
              </SelectContent>
            </Select>
            
            {isSimulating ? (
              <Button variant="outline" onClick={stopSimulation} className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Stop Live Data
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" onClick={startSimulation}>
                <Zap className="h-4 w-4 mr-2" /> Start Live Data
              </Button>
            )}
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
        
        {liveDataConnection && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="flex items-center gap-2 text-green-800">
              <Activity className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                Live data connection established. Refreshing every {refreshRate} seconds.
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="player-activity">Player Activity</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="heatmaps">Activity Heatmap</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Live metrics cards */}
            <LiveMetricsCards metrics={liveMetrics} />
            
            {/* Main chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Real-time Metrics Trend</span>
                  {liveDataConnection && <Badge variant="outline" className="bg-green-50 text-green-700 flex gap-1 items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span> Live
                  </Badge>}
                </CardTitle>
                <CardDescription>
                  Live metrics for the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realtimeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="timeLabel" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                      />
                      <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        labelFormatter={(label) => `Time: ${label}`}
                        formatter={(value, name) => {
                          if (name === 'ggr') return [`€${value}`, 'GGR'];
                          if (name === 'activeUsers') return [value, 'Active Users'];
                          if (name === 'depositRate') return [`${value}/min`, 'Deposit Rate'];
                          if (name === 'wagerRate') return [`${value}/min`, 'Wager Rate'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="activeUsers" 
                        stroke="#4f46e5" 
                        name="Active Users"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="depositRate" 
                        stroke="#10b981" 
                        name="Deposit Rate"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="wagerRate" 
                        stroke="#f59e0b" 
                        name="Wager Rate"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="ggr" 
                        stroke="#ef4444" 
                        name="GGR (€)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Distribution</CardTitle>
                  <CardDescription>Types of events occurring in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <EventDistributionChart events={realtimeEvents} />
                </CardContent>
              </Card>
              
              {/* Live Transactions Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Transaction Feed</CardTitle>
                  <CardDescription>Most recent player transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveTransactionsFeed transactions={transactionFeed.slice(0, 8)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="player-activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Players by Game Type</CardTitle>
                  <CardDescription>Distribution of players across different game categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Slots', players: Math.floor(Math.random() * 50) + 100 },
                        { name: 'Live Casino', players: Math.floor(Math.random() * 30) + 50 },
                        { name: 'Table Games', players: Math.floor(Math.random() * 20) + 30 },
                        { name: 'Sports Betting', players: Math.floor(Math.random() * 40) + 70 },
                        { name: 'Poker', players: Math.floor(Math.random() * 25) + 40 },
                        { name: 'Bingo', players: Math.floor(Math.random() * 15) + 20 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(value, name) => [`${value} players`, 'Active Players']} />
                        <Bar dataKey="players" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Duration</CardTitle>
                  <CardDescription>Current player session times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { duration: '0-5 min', count: Math.floor(Math.random() * 20) + 40 },
                        { duration: '5-15 min', count: Math.floor(Math.random() * 30) + 60 },
                        { duration: '15-30 min', count: Math.floor(Math.random() * 40) + 80 },
                        { duration: '30-60 min', count: Math.floor(Math.random() * 30) + 50 },
                        { duration: '1-2 hours', count: Math.floor(Math.random() * 20) + 30 },
                        { duration: '2+ hours', count: Math.floor(Math.random() * 10) + 20 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="duration" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(value, name) => [`${value} players`, 'Players']} />
                        <Area type="monotone" dataKey="count" stroke="#10b981" fill="#d1fae5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Player Engagement Metrics</CardTitle>
                <CardDescription>Real-time activity tracking for currently active players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number" 
                        dataKey="sessionTime" 
                        name="Session Time" 
                        unit=" min" 
                        domain={[0, 120]}
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Session Time (minutes)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="activity" 
                        name="Activity Level" 
                        unit=" actions" 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Actions Per Minute', angle: -90, position: 'insideLeft' }}
                      />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => {
                          if (name === 'sessionTime') return [`${value} minutes`, 'Session Time'];
                          if (name === 'activity') return [`${value} actions/min`, 'Activity Level'];
                          if (name === 'betSize') return [`€${value}`, 'Avg. Bet Size'];
                          return [value, name];
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border rounded shadow-sm">
                                <p className="font-medium text-sm">{data.game}</p>
                                <p className="text-xs text-gray-600">Player ID: {data.playerId}</p>
                                <p className="text-xs">Session: {data.sessionTime} minutes</p>
                                <p className="text-xs">Activity: {data.activity} actions/min</p>
                                <p className="text-xs">Avg. Bet: €{data.betSize}</p>
                                <p className="text-xs text-gray-600">{data.country}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        name="Players" 
                        data={Array(50).fill().map((_, i) => ({
                          playerId: `player${Math.floor(Math.random() * 10000)}`,
                          sessionTime: Math.floor(Math.random() * 120),
                          activity: Math.floor(Math.random() * 100),
                          betSize: Math.floor(Math.random() * 50) + 5,
                          game: ['Slots', 'Blackjack', 'Roulette', 'Poker', 'Live Casino'][Math.floor(Math.random() * 5)],
                          country: ['DE', 'UK', 'FR', 'ES', 'IT'][Math.floor(Math.random() * 5)]
                        }))} 
                        fill="#4f46e5"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Each point represents a player's current session activity level and duration
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deposits vs Withdrawals</CardTitle>
                  <CardDescription>Real-time transaction flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array(24).fill().map((_, i) => {
                        const minutesAgo = 24 - i;
                        return {
                          time: `${minutesAgo} min ago`,
                          deposits: Math.floor(Math.random() * 30) + 10,
                          withdrawals: Math.floor(Math.random() * 15) + 5
                        };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} tickFormatter={(value, index) => index % 4 === 0 ? value : ''} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="deposits" stroke="#10b981" fill="#d1fae5" stackId="1" />
                        <Area type="monotone" dataKey="withdrawals" stroke="#f59e0b" fill="#fef3c7" stackId="2" />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transactions Per Minute</CardTitle>
                  <CardDescription>Volume of transactions processed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Array(15).fill().map((_, i) => {
                        return {
                          minute: 15 - i,
                          transactions: Math.floor(Math.random() * 40) + 20
                        };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="minute" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value} min ago`} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(value) => [`${value} transactions`, 'Volume']} />
                        <Line type="monotone" dataKey="transactions" stroke="#4f46e5" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of deposit methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={[
                        { method: 'Credit Card', value: Math.floor(Math.random() * 50) + 30 },
                        { method: 'PayPal', value: Math.floor(Math.random() * 40) + 20 },
                        { method: 'Bank Transfer', value: Math.floor(Math.random() * 30) + 15 },
                        { method: 'Skrill', value: Math.floor(Math.random() * 25) + 10 },
                        { method: 'Neteller', value: Math.floor(Math.random() * 20) + 8 },
                        { method: 'Crypto', value: Math.floor(Math.random() * 15) + 5 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="method" type="category" tick={{ fontSize: 12 }} width={100} />
                        <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Live Transaction Feed</CardTitle>
                <CardDescription>Real-time player transactions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <LiveTransactionsFeed transactions={transactionFeed} fullView={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="heatmaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Player Activity Heatmap</CardTitle>
                <CardDescription>
                  Player activity distribution by hour and day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <RealtimeHeatmap data={heatmapData} />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Game Popularity Heatmap</CardTitle>
                  <CardDescription>
                    Most active game categories by time of day
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <RealtimeHeatmap 
                    data={
                      (() => {
                        const games = ['Slots', 'Live Casino', 'Table Games', 'Sports', 'Poker', 'Bingo'];
                        const hours = Array(24).fill().map((_, i) => i < 10 ? `0${i}:00` : `${i}:00`);
                        const data = [];
                        
                        games.forEach((game, gameIndex) => {
                          hours.forEach((hour, hourIndex) => {
                            let value = Math.floor(Math.random() * 100);
                            // Prime time pattern
                            if (hourIndex >= 18 && hourIndex <= 23) value = Math.floor(value * 1.4);
                            // Weekend pattern for sports
                            if (game === 'Sports' && (hourIndex >= 14 && hourIndex <= 20)) {
                              value = Math.floor(value * 1.6);
                            }
                            
                            data.push({
                              hour,
                              day: game,
                              value,
                              dayIndex: gameIndex
                            });
                          });
                        });
                        
                        return data;
                      })()
                    }
                    xAxisLabel="Time of Day"
                    yAxisLabel="Game Type"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Success Rate Heatmap</CardTitle>
                  <CardDescription>
                    Deposit success rate by method and time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <RealtimeHeatmap 
                    data={
                      (() => {
                        const methods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Skrill', 'Neteller', 'Crypto'];
                        const hours = Array(24).fill().map((_, i) => i < 10 ? `0${i}:00` : `${i}:00`);
                        const data = [];
                        
                        methods.forEach((method, methodIndex) => {
                          hours.forEach((hour, hourIndex) => {
                            // Base success rate between 80-98%
                            let value = 80 + Math.floor(Math.random() * 18);
                            
                            // Reduce bank transfer success on weekends/evenings
                            if (method === 'Bank Transfer' && (hourIndex >= 18 || hourIndex <= 8)) {
                              value = Math.max(75, value - 15);
                            }
                            
                            data.push({
                              hour,
                              day: method,
                              value,
                              dayIndex: methodIndex
                            });
                          });
                        });
                        
                        return data;
                      })()
                    }
                    xAxisLabel="Time of Day"
                    yAxisLabel="Payment Method"
                    colorRange={["#ef4444", "#f59e0b", "#10b981"]}
                    valueSuffix="%"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Player Map</CardTitle>
                <CardDescription>
                  Geographic distribution of current player activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <LivePlayerMap locations={eventsByLocation} />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Players by Country</CardTitle>
                  <CardDescription>Current player distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventsByLocation.sort((a, b) => b.players - a.players)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(value) => [`${value} players`, 'Active Now']} />
                        <Bar dataKey="players" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Region</CardTitle>
                  <CardDescription>Live GGR distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventsByLocation.map(loc => ({
                        country: loc.country,
                        revenue: loc.players * (Math.floor(Math.random() * 5) + 3)
                      })).sort((a, b) => b.revenue - a.revenue)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(value) => [`€${value}`, 'Revenue/min']} />
                        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {!liveDataConnection && (
          <div className="p-8 bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Data Feed Not Connected</h3>
            <p className="text-gray-600 max-w-lg mb-4">
              Click "Start Live Data" to simulate a real-time data feed. In a production environment, 
              this would connect to your live gaming platform database or API stream.
            </p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={startSimulation}>
              <Zap className="h-4 w-4 mr-2" /> Start Live Data Simulation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}