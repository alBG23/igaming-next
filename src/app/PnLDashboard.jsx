import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Download, Settings, DollarSign, PlusCircle, AlertTriangle, Trash2, Check, Save, Target, ArrowRight, Calculator, Zap, Shuffle, RefreshCw, HelpCircle, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Sample data for the P&L Dashboard
const pnlData = [
  { month: 'Jan', revenue: 520000, expenses: 470000, profit: 50000 },
  { month: 'Feb', revenue: 580000, expenses: 490000, profit: 90000 },
  { month: 'Mar', revenue: 550000, expenses: 480000, profit: 70000 },
  { month: 'Apr', revenue: 620000, expenses: 520000, profit: 100000 },
  { month: 'May', revenue: 640000, expenses: 550000, profit: 90000 },
  { month: 'Jun', revenue: 720000, expenses: 600000, profit: 120000 },
];

const costDistributionData = [
  { name: 'Player Acquisition', value: 35 },
  { name: 'Marketing', value: 20 },
  { name: 'Software', value: 15 },
  { name: 'Operations', value: 12 },
  { name: 'Compliance', value: 10 },
  { name: 'Other', value: 8 },
];

const ngrPercentageData = [
  { name: 'Slots', value: 45 },
  { name: 'Live Casino', value: 25 },
  { name: 'Sports Betting', value: 20 },
  { name: 'Table Games', value: 10 },
];

// Enhanced affiliate data with LTV and capacity information
const affiliateData = [
  { 
    id: 1, 
    name: 'TopAffiliates', 
    cpa: 150, 
    revshare: 25, 
    ftds_monthly: 65, 
    avg_ftd_value: 120, 
    retention: 'Medium',
    ltv_6month: 380,
    max_capacity: 120,
    expected_cpa_at_max: 170,
    roi: 2.53,
    payback_months: 3.2,
    profit_per_player: 230
  },
  { 
    id: 2, 
    name: 'CasinoPartners', 
    cpa: 180, 
    revshare: 30, 
    ftds_monthly: 45, 
    avg_ftd_value: 140, 
    retention: 'High',
    ltv_6month: 450,
    max_capacity: 90,
    expected_cpa_at_max: 200,
    roi: 2.50,
    payback_months: 2.8,
    profit_per_player: 270
  },
  { 
    id: 3, 
    name: 'GamingAffiliates', 
    cpa: 120, 
    revshare: 20, 
    ftds_monthly: 80, 
    avg_ftd_value: 100, 
    retention: 'Low',
    ltv_6month: 290,
    max_capacity: 150,
    expected_cpa_at_max: 130,
    roi: 2.42,
    payback_months: 3.8,
    profit_per_player: 170
  },
  { 
    id: 4, 
    name: 'BetPromoters', 
    cpa: 160, 
    revshare: 28, 
    ftds_monthly: 55, 
    avg_ftd_value: 130, 
    retention: 'Medium',
    ltv_6month: 400,
    max_capacity: 100,
    expected_cpa_at_max: 180,
    roi: 2.50,
    payback_months: 3.1,
    profit_per_player: 240
  },
  { 
    id: 5, 
    name: 'SlotPartners', 
    cpa: 140, 
    revshare: 22, 
    ftds_monthly: 70, 
    avg_ftd_value: 110, 
    retention: 'Medium',
    ltv_6month: 320,
    max_capacity: 130,
    expected_cpa_at_max: 150,
    roi: 2.29,
    payback_months: 3.5,
    profit_per_player: 180
  },
];

// Colors for charts
const COLORS = ['#4F46E5', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export default function PnLDashboard() {
  const [period, setPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [customCosts, setCustomCosts] = useState([
    { id: 1, name: 'Software Licensing', amount: 25000, category: 'fixed' },
    { id: 2, name: 'Compliance Fees', amount: 15000, category: 'fixed' },
    { id: 3, name: 'Staffing', amount: 45000, category: 'fixed' },
  ]);
  
  // Target Calculator State
  const [targetNGR, setTargetNGR] = useState(800000);
  const [targetProfitMargin, setTargetProfitMargin] = useState(15);
  const [timeframe, setTimeframe] = useState(6); // months
  const [acquisitionCost, setAcquisitionCost] = useState(150); // average CPA
  const [avgDepositValue, setAvgDepositValue] = useState(120); // average first deposit
  const [retentionRate, setRetentionRate] = useState(30); // 30% retained after first month
  
  // Enhanced affiliate planning
  const [affiliates, setAffiliates] = useState(affiliateData.map(aff => ({
    ...aff,
    allocatedFTDs: 0,
    suggestedFTDs: 0, // New field for AI suggested optimal allocation
    availableFTDs: aff.max_capacity, // User-editable field for available FTDs
    customExpectedCPA: aff.expected_cpa_at_max, // User-editable eCPA field
    isExpanded: false // For displaying more details
  })));
  
  const [optimizationCriteria, setOptimizationCriteria] = useState('balanced');
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);
  const [planScore, setPlanScore] = useState({
    roi: 0,
    profitability: 0,
    payback: 0,
    overall: 0
  });

  // Summary calculations
  const totalRevenue = pnlData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = pnlData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = (totalProfit / totalRevenue) * 100;
  
  // Calculated values for target calculator
  const targetProfit = targetNGR * (targetProfitMargin / 100);
  const estimatedCosts = targetNGR - targetProfit;
  const requiredFTDs = Math.ceil((targetNGR * 0.5) / avgDepositValue); // Assuming 50% of NGR comes from first deposits
  const requiredFTDsPerMonth = Math.ceil(requiredFTDs / timeframe);
  const totalAllocatedFTDs = affiliates.reduce((sum, affiliate) => sum + affiliate.allocatedFTDs, 0);
  const ftdGap = requiredFTDs - totalAllocatedFTDs;
  const acquisitionBudget = affiliates.reduce((sum, affiliate) => 
    sum + (affiliate.allocatedFTDs * (affiliate.allocatedFTDs >= affiliate.ftds_monthly ? 
      affiliate.customExpectedCPA : affiliate.cpa)), 0);
  const acquisitionBudgetPerMonth = Math.ceil(acquisitionBudget / timeframe);

  // Enhanced optimal allocation calculation based on multiple factors
  useEffect(() => {
    // Calculate optimal allocation on initial load and when required FTDs changes
    calculateOptimalAllocation();
  }, [requiredFTDs, optimizationCriteria]);
  
  // Recalculate plan score whenever allocations change
  useEffect(() => {
    recalculatePlanScore();
  }, [affiliates]);

  // Calculate optimal allocation based on affiliate performance and selected criteria
  const calculateOptimalAllocation = () => {
    // Weight factors differently based on selected optimization criteria
    let roiWeight = 1.0;
    let paybackWeight = 1.0;
    let profitWeight = 1.0;
    
    switch(optimizationCriteria) {
      case 'roi':
        roiWeight = 2.0;
        paybackWeight = 0.5;
        profitWeight = 0.8;
        break;
      case 'fast-payback':
        roiWeight = 0.8;
        paybackWeight = 2.0;
        profitWeight = 0.5;
        break;
      case 'profitability':
        roiWeight = 0.8;
        paybackWeight = 0.5;
        profitWeight = 2.0;
        break;
      case 'balanced':
      default:
        // Keep default weights
        break;
    }
    
    // Calculate a weighted score for each affiliate
    const affiliatesWithScore = affiliateData.map(aff => {
      // Normalize the factors (payback is inverse - lower is better)
      const normalizedROI = aff.roi / 3.0; // Assuming max ROI is around 3
      const normalizedPayback = 1 - (aff.payback_months / 6.0); // Assuming 6 months is worst payback time
      const normalizedProfit = aff.profit_per_player / 300; // Assuming max profit is around 300
      
      const overallScore = (normalizedROI * roiWeight) + 
                           (normalizedPayback * paybackWeight) + 
                           (normalizedProfit * profitWeight);
      
      return {
        ...aff,
        overallScore,
        availableCapacity: aff.max_capacity
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore); // Sort by overall score, best first
    
    // Start with current monthly FTDs as baseline
    let remainingFTDs = requiredFTDs;
    const newAllocation = affiliateData.map(aff => {
      const currentAff = affiliates.find(a => a.id === aff.id) || {
        allocatedFTDs: 0,
        availableFTDs: aff.max_capacity,
        customExpectedCPA: aff.expected_cpa_at_max,
        isExpanded: false
      };
      
      return {
        ...aff,
        allocatedFTDs: currentAff.allocatedFTDs,
        suggestedFTDs: 0, // Will be filled in next step
        availableFTDs: currentAff.availableFTDs,
        customExpectedCPA: currentAff.customExpectedCPA,
        isExpanded: currentAff.isExpanded
      };
    });
    
    // First, set all suggested FTDs to monthly FTDs as baseline
    newAllocation.forEach(aff => {
      aff.suggestedFTDs = aff.ftds_monthly;
      remainingFTDs -= aff.ftds_monthly;
    });
    
    // Then, allocate additional FTDs based on score, respecting available capacity
    if (remainingFTDs > 0) {
      // Sort by score for allocation
      const sortedForAllocation = [...newAllocation].sort((a, b) => {
        const scoreA = affiliatesWithScore.find(x => x.id === a.id)?.overallScore || 0;
        const scoreB = affiliatesWithScore.find(x => x.id === b.id)?.overallScore || 0;
        return scoreB - scoreA;
      });
      
      for (const aff of sortedForAllocation) {
        if (remainingFTDs <= 0) break;
        
        const additionalCapacity = aff.max_capacity - aff.suggestedFTDs;
        if (additionalCapacity <= 0) continue;
        
        const additionalFTDs = Math.min(additionalCapacity, remainingFTDs);
        aff.suggestedFTDs += additionalFTDs;
        remainingFTDs -= additionalFTDs;
      }
    }
    
    setAffiliates(newAllocation);
  };
  
  const recalculatePlanScore = () => {
    if (totalAllocatedFTDs === 0) {
      setPlanScore({
        roi: 0,
        profitability: 0,
        payback: 0,
        overall: 0
      });
      return;
    }
    
    // Calculate weighted averages of key metrics based on allocated FTDs
    const totalAllocated = affiliates.reduce((sum, aff) => sum + aff.allocatedFTDs, 0);
    
    let weightedROI = 0;
    let weightedPayback = 0;
    let weightedProfit = 0;
    
    affiliates.forEach(aff => {
      if (aff.allocatedFTDs > 0) {
        const weight = aff.allocatedFTDs / totalAllocated;
        weightedROI += aff.roi * weight;
        weightedPayback += aff.payback_months * weight;
        weightedProfit += aff.profit_per_player * weight;
      }
    });
    
    // Normalize scores to 0-100 scale
    const roiScore = Math.min(100, (weightedROI / 3) * 100);
    const paybackScore = Math.min(100, (1 - (weightedPayback / 6)) * 100);
    const profitScore = Math.min(100, (weightedProfit / 300) * 100);
    
    // Calculate overall score (equal weights for simplicity)
    const overallScore = (roiScore + paybackScore + profitScore) / 3;
    
    setPlanScore({
      roi: roiScore,
      profitability: profitScore,
      payback: paybackScore,
      overall: overallScore
    });
  };
  
  const applyOptimalAllocation = () => {
    setAffiliates(prev => prev.map(aff => ({
      ...aff,
      allocatedFTDs: aff.suggestedFTDs
    })));
    
    setShowOptimizationPanel(false);
  };
  
  const updateAffiliateAllocation = (id, ftds) => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === id ? { ...aff, allocatedFTDs: parseInt(ftds) || 0 } : aff
    ));
  };
  
  const updateAffiliateAvailableFTDs = (id, ftds) => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === id ? { ...aff, availableFTDs: parseInt(ftds) || 0 } : aff
    ));
  };
  
  const updateAffiliateExpectedCPA = (id, cpa) => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === id ? { ...aff, customExpectedCPA: parseInt(cpa) || 0 } : aff
    ));
  };
  
  const toggleAffiliateDetails = (id) => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === id ? { ...aff, isExpanded: !aff.isExpanded } : aff
    ));
  };

  // Handle custom costs
  const addCustomCost = () => {
    const newCost = {
      id: Date.now(),
      name: "New Cost Item",
      amount: 0,
      category: "fixed"
    };
    setCustomCosts([...customCosts, newCost]);
  };
  
  const removeCustomCost = (id) => {
    setCustomCosts(customCosts.filter(cost => cost.id !== id));
  };
  
  const updateCustomCost = (id, field, value) => {
    setCustomCosts(customCosts.map(cost => 
      cost.id === id ? { ...cost, [field]: value } : cost
    ));
  };
  
  const saveSettings = () => {
    // In a real app, this would save the settings to backend
    setShowSettings(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">P&L Dashboard</h1>
            <p className="text-gray-500">
              Track, analyze, and optimize your profit and loss
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="q1">Q1 2023</SelectItem>
                <SelectItem value="q2">Q2 2023</SelectItem>
                <SelectItem value="q3">Q3 2023</SelectItem>
                <SelectItem value="q4">Q4 2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">P&L Overview</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Details</TabsTrigger>
            <TabsTrigger value="cost-settings">Cost Settings</TabsTrigger>
            <TabsTrigger value="target-calculator">Target Calculator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600">
                    +12.3% from previous period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</div>
                  <p className="text-xs text-red-600">
                    +8.7% from previous period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Profit
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{totalProfit.toLocaleString()}</div>
                  <p className="text-xs text-green-600">
                    Profit Margin: {profitMargin.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={pnlData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#4F46E5" />
                        <Bar dataKey="expenses" name="Expenses" fill="#EC4899" />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          name="Profit" 
                          stroke="#10B981"
                          strokeWidth={2} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {costDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NGR by Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        layout="vertical" 
                        data={ngrPercentageData}
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="value" fill="#8884d8">
                          {ngrPercentageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly P&L Details</CardTitle>
                <CardDescription>
                  Detailed breakdown of revenue, expenses and profit by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pnlData.map((month) => {
                      const margin = (month.profit / month.revenue) * 100;
                      return (
                        <TableRow key={month.month}>
                          <TableCell className="font-medium">{month.month}</TableCell>
                          <TableCell className="text-right">€{month.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right">€{month.expenses.toLocaleString()}</TableCell>
                          <TableCell className="text-right">€{month.profit.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{margin.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">€{totalRevenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">€{totalExpenses.toLocaleString()}</TableCell>
                      <TableCell className="text-right">€{totalProfit.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{profitMargin.toFixed(1)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cost-settings">
            <Card>
              <CardHeader>
                <CardTitle>Cost Configuration</CardTitle>
                <CardDescription>
                  Manage fixed and variable costs for your P&L calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Custom Cost Items</h3>
                    <Button size="sm" onClick={addCustomCost}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Cost Item
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cost Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customCosts.map((cost) => (
                        <TableRow key={cost.id}>
                          <TableCell>
                            <Input 
                              value={cost.name} 
                              onChange={(e) => updateCustomCost(cost.id, 'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={cost.category} 
                              onValueChange={(value) => updateCustomCost(cost.id, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Cost</SelectItem>
                                <SelectItem value="variable">Variable Cost</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="operational">Operational</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center">
                              <span className="mr-2">€</span>
                              <Input 
                                className="text-right w-32"
                                type="number"
                                value={cost.amount} 
                                onChange={(e) => updateCustomCost(cost.id, 'amount', Number(e.target.value))}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeCustomCost(cost.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="flex justify-end">
                    <Button onClick={saveSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="target-calculator">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    Target Calculator
                  </CardTitle>
                  <CardDescription>
                    Set financial targets and calculate required FTDs to achieve profitability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="target-ngr">Target NGR</Label>
                        <div className="flex items-center">
                          <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">€</span>
                          <Input 
                            id="target-ngr"
                            type="number" 
                            value={targetNGR}
                            onChange={(e) => setTargetNGR(Number(e.target.value))}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="profit-margin">Target Profit Margin</Label>
                          <Badge variant="outline">{targetProfitMargin}%</Badge>
                        </div>
                        <Slider 
                          id="profit-margin"
                          min={-10}
                          max={30}
                          step={1}
                          value={[targetProfitMargin]}
                          onValueChange={(value) => setTargetProfitMargin(value[0])}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>-10%</span>
                          <span>0%</span>
                          <span>+30%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeframe">Timeframe (Months)</Label>
                        <Select 
                          value={timeframe.toString()} 
                          onValueChange={(value) => setTimeframe(parseInt(value))}
                        >
                          <SelectTrigger id="timeframe">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="9">9 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                            <SelectItem value="18">18 Months</SelectItem>
                            <SelectItem value="24">24 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avg-deposit">Average First Deposit Value</Label>
                        <div className="flex items-center">
                          <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">€</span>
                          <Input 
                            id="avg-deposit"
                            type="number" 
                            value={avgDepositValue}
                            onChange={(e) => setAvgDepositValue(Number(e.target.value))}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="acquisition-cost">Average Acquisition Cost (CPA)</Label>
                        <div className="flex items-center">
                          <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">€</span>
                          <Input 
                            id="acquisition-cost"
                            type="number" 
                            value={acquisitionCost}
                            onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="retention-rate">Player Retention Rate</Label>
                          <Badge variant="outline">{retentionRate}%</Badge>
                        </div>
                        <Slider 
                          id="retention-rate"
                          min={10}
                          max={60}
                          step={5}
                          value={[retentionRate]}
                          onValueChange={(value) => setRetentionRate(value[0])}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Poor (10%)</span>
                          <span>Good (35%)</span>
                          <span>Excellent (60%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 mt-4 border-t">
                    <Card className="bg-indigo-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-indigo-800">Target Profit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">€{targetProfit.toLocaleString()}</div>
                        <p className="text-xs text-indigo-700 mt-1">Over {timeframe} months</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-800">Estimated Costs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-900">€{estimatedCosts.toLocaleString()}</div>
                        <p className="text-xs text-purple-700 mt-1">Based on target margin</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-amber-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-amber-800">Required FTDs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{requiredFTDs.toLocaleString()}</div>
                        <p className="text-xs text-amber-700 mt-1">{requiredFTDsPerMonth} per month</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-emerald-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-emerald-800">Acquisition Budget</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">€{acquisitionBudget.toLocaleString()}</div>
                        <p className="text-xs text-emerald-700 mt-1">€{acquisitionBudgetPerMonth.toLocaleString()} per month</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Affiliate Capacity Planner
                  </CardTitle>
                  <CardDescription>
                    Allocate FTDs across affiliates to meet your target
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="font-medium">Total Required FTDs: {requiredFTDs}</h4>
                        <p className="text-sm text-gray-500">
                          Currently allocated: {totalAllocatedFTDs} ({Math.round((totalAllocatedFTDs / requiredFTDs) * 100) || 0}%)
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowOptimizationPanel(!showOptimizationPanel)}
                        >
                          {showOptimizationPanel ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Hide Options
                            </>
                          ) : (
                            <>
                              <Shuffle className="h-4 w-4 mr-2" />
                              Optimization Options
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant={showOptimizationPanel ? "default" : "outline"} 
                          size="sm" 
                          onClick={calculateOptimalAllocation}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Optimal Allocation
                        </Button>
                      </div>
                    </div>
                    
                    {showOptimizationPanel && (
                      <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Optimization Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Optimization Strategy</Label>
                              <RadioGroup 
                                value={optimizationCriteria} 
                                onValueChange={setOptimizationCriteria}
                                className="flex flex-wrap gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="balanced" id="balanced" />
                                  <Label htmlFor="balanced" className="cursor-pointer">Balanced</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="roi" id="roi" />
                                  <Label htmlFor="roi" className="cursor-pointer">Maximize ROI</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="fast-payback" id="fast-payback" />
                                  <Label htmlFor="fast-payback" className="cursor-pointer">Fastest Payback</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="profitability" id="profitability" />
                                  <Label htmlFor="profitability" className="cursor-pointer">Highest Profit</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">ROI Focus</Label>
                                  <span className="text-xs font-medium">{planScore.roi.toFixed(0)}%</span>
                                </div>
                                <Progress value={planScore.roi} className="h-2" />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Payback Speed</Label>
                                  <span className="text-xs font-medium">{planScore.payback.toFixed(0)}%</span>
                                </div>
                                <Progress value={planScore.payback} className="h-2" />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Profitability</Label>
                                  <span className="text-xs font-medium">{planScore.profitability.toFixed(0)}%</span>
                                </div>
                                <Progress value={planScore.profitability} className="h-2" />
                              </div>
                            </div>
                            
                            <div className="flex justify-end pt-2">
                              <Button 
                                onClick={applyOptimalAllocation}
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Apply Suggested Allocation
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {ftdGap > 0 && (
                      <Alert className="bg-amber-50 border-amber-200 mb-4">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          You still need to allocate {ftdGap} more FTDs to meet your target
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {ftdGap <= 0 && totalAllocatedFTDs > 0 && (
                      <Alert className="bg-green-50 border-green-200 mb-4">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Target allocation complete! You've allocated all {requiredFTDs} required FTDs
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Affiliate</TableHead>
                            <TableHead className="text-right">Current Monthly</TableHead>
                            <TableHead className="text-right">
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-end gap-1 cursor-help">
                                      Suggested
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>AI-suggested optimal allocation based on ROI, payback time, and profitability</p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right">
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-end gap-1 cursor-help">
                                      Available FTDs
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>How many FTDs can actually be purchased from this affiliate</p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right">
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-end gap-1 cursor-help">
                                      Expected CPA
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Expected CPA when buying the planned volume</p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right">Allocated FTDs</TableHead>
                            <TableHead className="text-right">Est. Cost</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {affiliates.map((affiliate) => {
                            const isOverCapacity = affiliate.allocatedFTDs > affiliate.availableFTDs;
                            const estimatedCost = affiliate.allocatedFTDs * affiliate.customExpectedCPA;
                            
                            return (
                              <React.Fragment key={affiliate.id}>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-0 h-5 w-5"
                                        onClick={() => toggleAffiliateDetails(affiliate.id)}
                                      >
                                        {affiliate.isExpanded ? 
                                          <ArrowDownRight className="h-4 w-4" /> : 
                                          <ArrowUpRight className="h-4 w-4" />
                                        }
                                      </Button>
                                      {affiliate.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {affiliate.ftds_monthly}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-amber-600">
                                    {affiliate.suggestedFTDs}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input
                                      type="number"
                                      value={affiliate.availableFTDs}
                                      onChange={(e) => updateAffiliateAvailableFTDs(
                                        affiliate.id, e.target.value
                                      )}
                                      className="w-20 text-right"
                                    />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end">
                                      <span className="mr-1">€</span>
                                      <Input
                                        type="number"
                                        value={affiliate.customExpectedCPA}
                                        onChange={(e) => updateAffiliateExpectedCPA(
                                          affiliate.id, e.target.value
                                        )}
                                        className="w-20 text-right"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end">
                                      <Input
                                        type="number"
                                        value={affiliate.allocatedFTDs}
                                        onChange={(e) => updateAffiliateAllocation(
                                          affiliate.id, e.target.value
                                        )}
                                        min={0}
                                        max={9999}
                                        className={`w-20 text-right ${isOverCapacity ? 'border-orange-500' : ''}`}
                                      />
                                    </div>
                                    {isOverCapacity && (
                                      <p className="text-xs text-orange-600 mt-1">
                                        Over capacity
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    €{estimatedCost.toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateAffiliateAllocation(
                                        affiliate.id, affiliate.suggestedFTDs
                                      )}
                                      className="text-amber-600 hover:text-amber-700"
                                    >
                                      Apply
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                
                                {affiliate.isExpanded && (
                                  <TableRow className="bg-slate-50">
                                    <TableCell colSpan={8} className="py-2">
                                      <div className="grid grid-cols-4 gap-4 px-8">
                                        <div>
                                          <p className="text-sm font-medium">ROI</p>
                                          <p className="text-lg">{affiliate.roi.toFixed(2)}x</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Payback Period</p>
                                          <p className="text-lg">{affiliate.payback_months} months</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Avg. FTD Value</p>
                                          <p className="text-lg">€{affiliate.avg_ftd_value}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">6-month LTV</p>
                                          <p className="text-lg">€{affiliate.ltv_6month}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Cost Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Total Acquisition Cost:</span>
                            <span className="font-medium">€{acquisitionBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Acquisition Cost per FTD:</span>
                            <span className="font-medium">€{
                              totalAllocatedFTDs > 0 ?
                              Math.round(acquisitionBudget / totalAllocatedFTDs) :
                              0
                            }</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Estimated FTD Value:</span>
                            <span className="font-medium">€{(totalAllocatedFTDs * avgDepositValue).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Target Progress</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">FTDs Allocation:</span>
                            <span className="font-medium">{totalAllocatedFTDs} / {requiredFTDs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Allocation Percentage:</span>
                            <span className="font-medium">{Math.round((totalAllocatedFTDs / requiredFTDs) * 100) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Gap to Target:</span>
                            <span className={`font-medium ${ftdGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {ftdGap > 0 ? ftdGap : 'Complete'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Revenue Potential</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Est. Monthly NGR:</span>
                            <span className="font-medium">€{Math.round(totalAllocatedFTDs * avgDepositValue * (1 + retentionRate/100) / timeframe).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Est. {timeframe}-month NGR:</span>
                            <span className="font-medium">€{Math.round(totalAllocatedFTDs * avgDepositValue * (1 + retentionRate/100)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Plan Score:</span>
                            <span className={`font-medium ${
                              planScore.overall >= 70 ? 'text-green-600' :
                              planScore.overall >= 50 ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {planScore.overall.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}