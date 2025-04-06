import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InvokeLLM } from "@/api/integrations";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, ArrowRight, Brain, Calculator, DollarSign, Download, BarChart as BarChartIcon, LineChart as LineChartIcon, Loader2, Save, Zap, Users } from 'lucide-react';

export default function MarketingPlanner() {
  const [activeTab, setActiveTab] = useState('budgetAllocation');
  const [isLoading, setIsLoading] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [targetType, setTargetType] = useState('ngr');
  const [targetAmount, setTargetAmount] = useState(500000);
  const [targetTimeframe, setTargetTimeframe] = useState(6);
  const [strategy, setStrategy] = useState('balanced');
  const [isGeneratedPlan, setIsGeneratedPlan] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Data states
  const [affiliateData, setAffiliateData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [acquisitionPlan, setAcquisitionPlan] = useState(null);
  const [budgetDistribution, setBudgetDistribution] = useState(null);

  const COLORS = ['#4f46e5', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981'];
  
  // Sample data for initial render
  useEffect(() => {
    if (!dataLoaded) {
      const initialAffiliateData = [
        { id: 1, name: 'BetFinderPro', roi: 2.4, paybackMonths: 2.1, avgCPA: 65, retention: 0.68, ltv: 240, spend: 42500, status: 'performing' },
        { id: 2, name: 'CasinoCompare', roi: 2.1, paybackMonths: 2.3, avgCPA: 80, retention: 0.62, ltv: 215, spend: 38000, status: 'performing' },
        { id: 3, name: 'GamingAffiliates', roi: 2.7, paybackMonths: 1.9, avgCPA: 55, retention: 0.71, ltv: 258, spend: 46200, status: 'high_performing' },
        { id: 4, name: 'SlotPartners', roi: 1.9, paybackMonths: 2.8, avgCPA: 70, retention: 0.55, ltv: 188, spend: 28000, status: 'performing' },
        { id: 5, name: 'CasinoHunter', roi: 1.8, paybackMonths: 3.1, avgCPA: 90, retention: 0.51, ltv: 167, spend: 27000, status: 'underperforming' },
        { id: 6, name: 'GamblingPro', roi: 2.2, paybackMonths: 2.2, avgCPA: 75, retention: 0.64, ltv: 220, spend: 33750, status: 'performing' },
        { id: 7, name: 'BonusFinder', roi: 2.0, paybackMonths: 2.4, avgCPA: 85, retention: 0.58, ltv: 198, spend: 25500, status: 'performing' },
        { id: 8, name: 'SlotMatrix', roi: 1.6, paybackMonths: 3.2, avgCPA: 95, retention: 0.48, ltv: 152, spend: 19000, status: 'underperforming' },
        { id: 9, name: 'CasinoGrounds', roi: 2.5, paybackMonths: 2.0, avgCPA: 60, retention: 0.70, ltv: 245, spend: 36000, status: 'high_performing' },
        { id: 10, name: 'AffiliateKings', roi: 1.7, paybackMonths: 3.0, avgCPA: 88, retention: 0.50, ltv: 158, spend: 22000, status: 'underperforming' }
      ];
    
      const initialChannelData = [
        { channel: 'SEO', roi: 2.8, paybackMonths: 1.8, avgCPA: 50, spend: 85000, status: 'high_performing' },
        { channel: 'PPC', roi: 2.1, paybackMonths: 2.5, avgCPA: 75, spend: 56250, status: 'performing' },
        { channel: 'Social Media', roi: 1.9, paybackMonths: 2.7, avgCPA: 80, spend: 48000, status: 'performing' },
        { channel: 'Email Marketing', roi: 2.5, paybackMonths: 2.0, avgCPA: 55, spend: 41250, status: 'high_performing' },
        { channel: 'Display Ads', roi: 1.7, paybackMonths: 3.1, avgCPA: 90, spend: 36000, status: 'underperforming' },
        { channel: 'Content Marketing', roi: 2.3, paybackMonths: 2.2, avgCPA: 65, spend: 39000, status: 'performing' }
      ];
    
      const initialGeoData = [
        { geo: 'Germany', roi: 2.6, paybackMonths: 1.9, avgCPA: 58, spend: 87000, status: 'high_performing' },
        { geo: 'Finland', roi: 2.3, paybackMonths: 2.1, avgCPA: 62, spend: 62000, status: 'performing' },
        { geo: 'Canada', roi: 2.0, paybackMonths: 2.5, avgCPA: 80, spend: 48000, status: 'performing' },
        { geo: 'New Zealand', roi: 2.4, paybackMonths: 2.0, avgCPA: 60, spend: 42000, status: 'performing' },
        { geo: 'Denmark', roi: 1.8, paybackMonths: 2.8, avgCPA: 85, spend: 34000, status: 'underperforming' },
        { geo: 'Netherlands', roi: 2.2, paybackMonths: 2.3, avgCPA: 70, spend: 56000, status: 'performing' }
      ];
    
      setAffiliateData(initialAffiliateData);
      setChannelData(initialChannelData);
      setGeoData(initialGeoData);
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  const generateAcquisitionPlan = async () => {
    setGeneratingStrategy(true);
    setIsGeneratedPlan(false);
    
    try {
      // Simulate AI processing with a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Calculate required FTDs based on target
      let totalBudget, requiredFTDs;
      
      if (strategy === 'aggressive') {
        totalBudget = targetType === 'ngr' ? targetAmount * 0.4 : targetAmount * 0.8;
        requiredFTDs = Math.ceil(targetType === 'ngr' ? targetAmount / 225 : targetAmount / 85);
      } else if (strategy === 'balanced') {
        totalBudget = targetType === 'ngr' ? targetAmount * 0.3 : targetAmount * 0.65;
        requiredFTDs = Math.ceil(targetType === 'ngr' ? targetAmount / 200 : targetAmount / 75);
      } else { // conservative
        totalBudget = targetType === 'ngr' ? targetAmount * 0.25 : targetAmount * 0.5;
        requiredFTDs = Math.ceil(targetType === 'ngr' ? targetAmount / 175 : targetAmount / 65);
      }
      
      // Select top performing affiliates and channels
      const sortedAffiliates = [...affiliateData].sort((a, b) => b.roi - a.roi);
      const topAffiliates = sortedAffiliates.slice(0, 5);
      
      const sortedChannels = [...channelData].sort((a, b) => b.roi - a.roi);
      const topChannels = sortedChannels.slice(0, 3);
      
      const sortedGeos = [...geoData].sort((a, b) => b.roi - a.roi);
      const topGeos = sortedGeos.slice(0, 3);
      
      // Create budget allocation
      const affiliateBudget = totalBudget * 0.65; // 65% to affiliates
      const channelBudget = totalBudget * 0.35; // 35% to channels
      
      // Distribute affiliate budget based on ROI weight
      const totalAffiliateRoi = topAffiliates.reduce((sum, aff) => sum + aff.roi, 0);
      const affiliateAllocation = topAffiliates.map(aff => ({
        ...aff,
        budget: Math.round(affiliateBudget * (aff.roi / totalAffiliateRoi)),
        ftds: Math.round((affiliateBudget * (aff.roi / totalAffiliateRoi)) / aff.avgCPA)
      }));
      
      // Distribute channel budget based on ROI weight
      const totalChannelRoi = topChannels.reduce((sum, ch) => sum + ch.roi, 0);
      const channelAllocation = topChannels.map(ch => ({
        ...ch,
        budget: Math.round(channelBudget * (ch.roi / totalChannelRoi)),
        ftds: Math.round((channelBudget * (ch.roi / totalChannelRoi)) / ch.avgCPA)
      }));
      
      // Calculate geo distribution (this is just informational)
      const geoAllocation = topGeos.map(geo => ({
        ...geo,
        percentage: Math.round((geo.roi / sortedGeos.reduce((sum, g) => sum + g.roi, 0)) * 100)
      }));
      
      // Create plan details
      const totalFTDs = [...affiliateAllocation, ...channelAllocation].reduce((sum, item) => sum + item.ftds, 0);
      const avgCPA = totalBudget / totalFTDs;
      const expectedRevenue = targetType === 'ngr' ? targetAmount : targetAmount * 2.8;
      const expectedProfit = targetType === 'ngr' ? targetAmount * 0.35 : targetAmount;
      
      const monthlyBreakdown = Array(targetTimeframe).fill(0).map((_, i) => {
        const month = i + 1;
        const monthlyBudget = totalBudget / targetTimeframe;
        const monthlyFTDs = requiredFTDs / targetTimeframe;
        const expectedMonthlyNGR = expectedRevenue / targetTimeframe;
        const expectedMonthlyProfit = expectedProfit / targetTimeframe;
        
        return {
          month,
          budget: Math.round(monthlyBudget),
          ftds: Math.round(monthlyFTDs),
          ngr: Math.round(expectedMonthlyNGR),
          profit: Math.round(expectedMonthlyProfit)
        };
      });
      
      const plan = {
        targetType,
        targetAmount,
        targetTimeframe,
        strategy,
        totalBudget: Math.round(totalBudget),
        requiredFTDs,
        avgCPA: Math.round(avgCPA),
        expectedRevenue: Math.round(expectedRevenue),
        expectedProfit: Math.round(expectedProfit),
        paybackPeriod: strategy === 'aggressive' ? 2.5 : strategy === 'balanced' ? 3 : 3.5,
        monthlyBreakdown,
        recommendation: {
          affiliates: affiliateAllocation,
          channels: channelAllocation,
          geos: geoAllocation
        }
      };
      
      // Budget distribution data for pie chart
      const budgetDist = [
        ...affiliateAllocation.map(aff => ({ name: aff.name, value: aff.budget, type: 'affiliate' })),
        ...channelAllocation.map(ch => ({ name: ch.channel, value: ch.budget, type: 'channel' }))
      ];
      
      setAcquisitionPlan(plan);
      setBudgetDistribution(budgetDist);
      setIsGeneratedPlan(true);
    } catch (error) {
      console.error("Error generating acquisition plan:", error);
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'high_performing': return 'bg-green-100 text-green-800';
      case 'performing': return 'bg-blue-100 text-blue-800';
      case 'underperforming': return 'bg-amber-100 text-amber-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'high_performing': return 'High Performing';
      case 'performing': return 'Performing';
      case 'underperforming': return 'Underperforming';
      case 'at_risk': return 'At Risk';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Budget & Acquisition Planner</h1>
            <p className="text-gray-500">
              AI-powered tool to optimize marketing budgets and plan acquisition strategy
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="budgetAllocation" className="flex items-center gap-1">
              <BarChartIcon className="h-4 w-4" /> Budget Allocation
            </TabsTrigger>
            <TabsTrigger value="acquisitionPlanner" className="flex items-center gap-1">
              <Calculator className="h-4 w-4" /> Acquisition Planner
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="budgetAllocation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Marketing Budget Allocation</CardTitle>
                  <CardDescription>
                    AI-driven analysis of traffic sources and budget recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-indigo-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-700">Total Marketing Budget</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(affiliateData.reduce((sum, aff) => sum + aff.spend, 0) + channelData.reduce((sum, ch) => sum + ch.spend, 0))}</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-indigo-500" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-indigo-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-700">Avg. Cost Per Acquisition</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(affiliateData.reduce((sum, aff) => sum + aff.avgCPA, 0) / affiliateData.length)}</p>
                          </div>
                          <Users className="h-8 w-8 text-indigo-500" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-indigo-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-700">Average ROI</p>
                            <p className="text-2xl font-bold mt-1">{((affiliateData.reduce((sum, aff) => sum + aff.roi, 0) / affiliateData.length)).toFixed(1)}x</p>
                          </div>
                          <BarChartIcon className="h-8 w-8 text-indigo-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Affiliate Performance</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Affiliate</TableHead>
                            <TableHead className="text-right">ROI</TableHead>
                            <TableHead className="text-right">Payback (Months)</TableHead>
                            <TableHead className="text-right">Avg. CPA</TableHead>
                            <TableHead className="text-right">Current Spend</TableHead>
                            <TableHead className="text-right">Retention</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {affiliateData.sort((a, b) => b.roi - a.roi).map((affiliate) => (
                            <TableRow key={affiliate.id}>
                              <TableCell className="font-medium">{affiliate.name}</TableCell>
                              <TableCell className="text-right">{affiliate.roi.toFixed(1)}x</TableCell>
                              <TableCell className="text-right">{affiliate.paybackMonths.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(affiliate.avgCPA)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(affiliate.spend)}</TableCell>
                              <TableCell className="text-right">{(affiliate.retention * 100).toFixed(0)}%</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(affiliate.status)}>
                                  {getStatusLabel(affiliate.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {affiliate.status === 'underperforming' && (
                                  <Button variant="outline" size="sm">Optimize</Button>
                                )}
                                {affiliate.status === 'high_performing' && (
                                  <Button variant="outline" size="sm">Increase Budget</Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Channel</TableHead>
                              <TableHead className="text-right">ROI</TableHead>
                              <TableHead className="text-right">Current Spend</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {channelData.sort((a, b) => b.roi - a.roi).map((channel) => (
                              <TableRow key={channel.channel}>
                                <TableCell className="font-medium">{channel.channel}</TableCell>
                                <TableCell className="text-right">{channel.roi.toFixed(1)}x</TableCell>
                                <TableCell className="text-right">{formatCurrency(channel.spend)}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(channel.status)}>
                                    {getStatusLabel(channel.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Geo Performance</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Geo</TableHead>
                              <TableHead className="text-right">ROI</TableHead>
                              <TableHead className="text-right">Current Spend</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {geoData.sort((a, b) => b.roi - a.roi).map((geo) => (
                              <TableRow key={geo.geo}>
                                <TableCell className="font-medium">{geo.geo}</TableCell>
                                <TableCell className="text-right">{geo.roi.toFixed(1)}x</TableCell>
                                <TableCell className="text-right">{formatCurrency(geo.spend)}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(geo.status)}>
                                    {getStatusLabel(geo.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Budget Recommendations</h3>
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <div className="flex items-start gap-4">
                          <Brain className="h-5 w-5 text-indigo-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-indigo-900">AI-Generated Budget Recommendations</h4>
                            <ul className="mt-2 space-y-2 text-sm text-indigo-800">
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Increase spending on <b>GamingAffiliates</b> and <b>CasinoGrounds</b> by 20%, which could yield additional 125 FTDs per month.</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Boost <b>SEO</b> and <b>Email Marketing</b> channels with additional €15,000 combined budget.</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500"></span>
                                <span>Reduce spending on <b>CasinoHunter</b>, <b>SlotMatrix</b>, and <b>AffiliateKings</b> by 30%, reallocating €20,400.</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>Renegotiate CPA rates with <b>CasinoCompare</b> from €80 to €72 based on volume increase.</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500"></span>
                                <span>Increase focus on <b>Germany</b> and <b>Finland</b>, with potential to improve overall ROI by 0.3x.</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <Button size="sm">Apply Recommendations</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="acquisitionPlanner">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className={isGeneratedPlan ? 'lg:col-span-1' : 'lg:col-span-3'}>
                <CardHeader>
                  <CardTitle>Target-Based Acquisition Planner</CardTitle>
                  <CardDescription>
                    Set your financial targets and get an AI-driven marketing plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Target Type</Label>
                      <RadioGroup
                        value={targetType}
                        onValueChange={setTargetType}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ngr" id="ngr" />
                          <Label htmlFor="ngr">NGR Target</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pnl" id="pnl" />
                          <Label htmlFor="pnl">Profit Target</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Target Amount (EUR)</Label>
                      <div className="flex items-center">
                        <span className="mr-2">€</span>
                        <Input
                          type="number"
                          value={targetAmount}
                          onChange={(e) => setTargetAmount(parseInt(e.target.value) || 0)}
                          placeholder={targetType === 'ngr' ? '500,000' : '100,000'}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {targetType === 'ngr' 
                          ? 'Net Gaming Revenue target to achieve' 
                          : 'Profit target to achieve'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Timeframe (Months)</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[targetTimeframe]}
                          min={1}
                          max={12}
                          step={1}
                          onValueChange={(value) => setTargetTimeframe(value[0])}
                        />
                        <span className="w-8 text-center">{targetTimeframe}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Risk Strategy</Label>
                      <Select value={strategy} onValueChange={setStrategy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="conservative">Conservative</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        {strategy === 'aggressive' 
                          ? 'Higher spend, shorter payback, more risk' 
                          : strategy === 'balanced' 
                            ? 'Balanced approach with moderate risk' 
                            : 'Slower growth with lower risk'}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      disabled={generatingStrategy}
                      onClick={generateAcquisitionPlan}
                    >
                      {generatingStrategy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Strategy...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Generate Acquisition Plan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {isGeneratedPlan && (
                <Card className="lg: col-span-2">
                  <CardHeader>
                    <CardTitle>
                      {targetType === 'ngr' ? `€${acquisitionPlan.targetAmount.toLocaleString()} NGR` : `€${acquisitionPlan.targetAmount.toLocaleString()} Profit`} in {acquisitionPlan.targetTimeframe} Months
                    </CardTitle>
                    <CardDescription>
                      {acquisitionPlan.strategy.charAt(0).toUpperCase() + acquisitionPlan.strategy.slice(1)} growth strategy with {formatCurrency(acquisitionPlan.totalBudget)} marketing budget
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-indigo-800">Required FTDs</h3>
                          <p className="text-2xl font-bold mt-1">{acquisitionPlan.requiredFTDs}</p>
                          <p className="text-sm text-indigo-600 mt-1">{Math.round(acquisitionPlan.requiredFTDs / acquisitionPlan.targetTimeframe)} per month</p>
                        </div>
                        
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-indigo-800">Marketing Budget</h3>
                          <p className="text-2xl font-bold mt-1">{formatCurrency(acquisitionPlan.totalBudget)}</p>
                          <p className="text-sm text-indigo-600 mt-1">{formatCurrency(acquisitionPlan.totalBudget / acquisitionPlan.targetTimeframe)} per month</p>
                        </div>
                        
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-indigo-800">Average CPA</h3>
                          <p className="text-2xl font-bold mt-1">{formatCurrency(acquisitionPlan.avgCPA)}</p>
                          <p className="text-sm text-indigo-600 mt-1">Payback in {acquisitionPlan.paybackPeriod} months</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Budget Distribution</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={budgetDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {budgetDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [formatCurrency(value), 'Budget']}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Monthly Projection</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={acquisitionPlan.monthlyBreakdown}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                              <YAxis tickFormatter={(value) => `€${(value/1000)}k`} />
                              <Tooltip 
                                formatter={(value) => [formatCurrency(value), undefined]}
                              />
                              <Legend />
                              <Bar dataKey="budget" name="Budget" fill="#4f46e5" />
                              <Bar dataKey="ngr" name="NGR" fill="#10b981" />
                              <Bar dataKey="profit" name="Profit" fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Top Affiliates to Target</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Affiliate</TableHead>
                              <TableHead className="text-right">Budget</TableHead>
                              <TableHead className="text-right">Target FTDs</TableHead>
                              <TableHead className="text-right">Average CPA</TableHead>
                              <TableHead className="text-right">ROI</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {acquisitionPlan.recommendation.affiliates.map((aff) => (
                              <TableRow key={aff.id}>
                                <TableCell className="font-medium">{aff.name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(aff.budget)}</TableCell>
                                <TableCell className="text-right">{aff.ftds}</TableCell>
                                <TableCell className="text-right">{formatCurrency(aff.avgCPA)}</TableCell>
                                <TableCell className="text-right">{aff.roi.toFixed(1)}x</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <div className="flex items-start gap-4">
                          <Brain className="h-5 w-5 text-indigo-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-indigo-900">AI Strategy Recommendations</h4>
                            <ul className="mt-2 space-y-2 text-sm text-indigo-800">
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span>Focus {acquisitionPlan.recommendation.channels.length > 0 ? `on ${acquisitionPlan.recommendation.channels[0].channel} and ${acquisitionPlan.recommendation.channels[1].channel}` : 'on top performing channels'} to maximize ROI.</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span>Allocate {formatCurrency(acquisitionPlan.totalBudget * 0.65)} to affiliate marketing with focus on {acquisitionPlan.recommendation.affiliates.slice(0, 2).map(a => a.name).join(' and ')}.</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span>Geographic focus: {acquisitionPlan.recommendation.geos[0].geo} ({acquisitionPlan.recommendation.geos[0].percentage}%), {acquisitionPlan.recommendation.geos[1].geo} ({acquisitionPlan.recommendation.geos[1].percentage}%), and {acquisitionPlan.recommendation.geos[2].geo} ({acquisitionPlan.recommendation.geos[2].percentage}%).</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span>Expected payback period of {acquisitionPlan.paybackPeriod} months, with projected profit of {formatCurrency(acquisitionPlan.expectedProfit)}.</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4 gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Plan
                          </Button>
                          <Button size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Implement Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}