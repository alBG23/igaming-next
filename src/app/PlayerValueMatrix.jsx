import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { CohortData } from '@/api/entities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, Filter, Calculator, Info } from 'lucide-react';

// Sample data for development (will be replaced by real data)
const sampleCohortData = [
  // January 2023 Cohort - Month 0 (FTD month)
  {
    ftd_month: "2023-01", cohort_size: 100, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 0, deposits_amount: 15000, ngr: 10000, 
    unique_depositors: 100, active_players: 100, marketing_spend: 12000
  },
  // January 2023 Cohort - Month 1
  {
    ftd_month: "2023-01", cohort_size: 100, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 1, deposits_amount: 6000, ngr: 2000, 
    unique_depositors: 40, active_players: 30, marketing_spend: 0
  },
  // January 2023 Cohort - Month 2
  {
    ftd_month: "2023-01", cohort_size: 100, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 2, deposits_amount: 3000, ngr: 1000, 
    unique_depositors: 25, active_players: 18, marketing_spend: 0
  },
  // January 2023 Cohort - Month 3
  {
    ftd_month: "2023-01", cohort_size: 100, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 3, deposits_amount: 1500, ngr: 700, 
    unique_depositors: 15, active_players: 10, marketing_spend: 0
  },
  // January 2023 Cohort - Month 4
  {
    ftd_month: "2023-01", cohort_size: 100, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 4, deposits_amount: 1200, ngr: 800, 
    unique_depositors: 10, active_players: 7, marketing_spend: 0
  },
  
  // February 2023 Cohort - Month 0 (FTD month)
  {
    ftd_month: "2023-02", cohort_size: 110, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 0, deposits_amount: 16500, ngr: 12000, 
    unique_depositors: 110, active_players: 110, marketing_spend: 11000
  },
  // February 2023 Cohort - Month 1
  {
    ftd_month: "2023-02", cohort_size: 110, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 1, deposits_amount: 6300, ngr: 2500, 
    unique_depositors: 45, active_players: 35, marketing_spend: 0
  },
  // February 2023 Cohort - Month 2
  {
    ftd_month: "2023-02", cohort_size: 110, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 2, deposits_amount: 3200, ngr: 1200, 
    unique_depositors: 28, active_players: 20, marketing_spend: 0
  },
  // February 2023 Cohort - Month 3
  {
    ftd_month: "2023-02", cohort_size: 110, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 3, deposits_amount: 1800, ngr: 710, 
    unique_depositors: 18, active_players: 11, marketing_spend: 0
  },
  
  // March 2023 Cohort - Month 0 (FTD month)
  {
    ftd_month: "2023-03", cohort_size: 120, affiliate_id: "AFF003", affiliate_name: "GamingPartners",
    stag: "email", brand: "Lucky Casino", month_number: 0, deposits_amount: 18000, ngr: 15000, 
    unique_depositors: 120, active_players: 120, marketing_spend: 14000
  },
  // March 2023 Cohort - Month 1
  {
    ftd_month: "2023-03", cohort_size: 120, affiliate_id: "AFF003", affiliate_name: "GamingPartners",
    stag: "email", brand: "Lucky Casino", month_number: 1, deposits_amount: 5800, ngr: 2800, 
    unique_depositors: 48, active_players: 33, marketing_spend: 0
  },
  // March 2023 Cohort - Month 2
  {
    ftd_month: "2023-03", cohort_size: 120, affiliate_id: "AFF003", affiliate_name: "GamingPartners",
    stag: "email", brand: "Lucky Casino", month_number: 2, deposits_amount: 3500, ngr: 1500, 
    unique_depositors: 30, active_players: 22, marketing_spend: 0
  },
  
  // April 2023 Cohort - Month 0 (FTD month)
  {
    ftd_month: "2023-04", cohort_size: 130, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 0, deposits_amount: 19500, ngr: 20000, 
    unique_depositors: 130, active_players: 130, marketing_spend: 13000
  },
  // April 2023 Cohort - Month 1
  {
    ftd_month: "2023-04", cohort_size: 130, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 1, deposits_amount: 7000, ngr: 3000, 
    unique_depositors: 52, active_players: 38, marketing_spend: 0
  },
  
  // May 2023 Cohort - Month 0 (FTD month)
  {
    ftd_month: "2023-05", cohort_size: 140, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 0, deposits_amount: 21000, ngr: 30000, 
    unique_depositors: 140, active_players: 140, marketing_spend: 15000
  }
];

export default function PlayerValueMatrix() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('retention');
  const [cohortData, setCohortData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState({
    stag: 'all',
    affiliateId: 'all',
    brand: 'all'
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    stags: [],
    affiliateIds: [],
    brands: []
  });

  // Processed data for matrices
  const [processedData, setProcessedData] = useState({
    cohorts: [],
    monthNumbers: [],
    retentionMatrix: {},
    arpuMatrix: {},
    ltValueMatrix: {},
    aggregatedRetention: [],
    aggregatedARPU: [],
    aggregatedLTV: [],
    cumulativeLTV: [],
    playerValueMatrix: [],
    totals: {
      activePlayers: {},
      totalNGR: {},
      arpu: {}
    }
  });

  useEffect(() => {
    // Load data (sample data for development)
    setTimeout(() => {
      setCohortData(sampleCohortData);
      setFilteredData(sampleCohortData);
      
      // Extract filter options
      const stags = [...new Set(sampleCohortData.map(d => d.stag))];
      const affiliateIds = [...new Set(sampleCohortData.map(d => d.affiliate_id))];
      const brands = [...new Set(sampleCohortData.map(d => d.brand))];
      
      setFilterOptions({
        stags,
        affiliateIds,
        brands
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (filteredData.length > 0) {
      processPlayerValueData();
    }
  }, [filteredData]);

  const applyFilters = (currentFilter) => {
    let filtered = [...cohortData];
    
    if (currentFilter.stag !== 'all') {
      filtered = filtered.filter(d => d.stag === currentFilter.stag);
    }
    
    if (currentFilter.affiliateId !== 'all') {
      filtered = filtered.filter(d => d.affiliate_id === currentFilter.affiliateId);
    }
    
    if (currentFilter.brand !== 'all') {
      filtered = filtered.filter(d => d.brand === currentFilter.brand);
    }
    
    setFilteredData(filtered);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilter(prev => {
      const newFilter = { ...prev, [filterKey]: value };
      applyFilters(newFilter);
      return newFilter;
    });
  };

  const processPlayerValueData = () => {
    if (filteredData.length === 0) return;
    
    // Get unique cohorts (FTD months) and sort chronologically
    const cohorts = [...new Set(filteredData.map(d => d.ftd_month))].sort();
    
    // Get all month numbers
    const monthNumbers = [...new Set(filteredData.map(d => d.month_number))].sort((a, b) => a - b);
    
    // Matrices to calculate
    const retentionMatrix = {}; // % of initial cohort still active
    const arpuMatrix = {};      // Average revenue per active user
    const ltValueMatrix = {};   // Lifetime value = retention % * ARPU
    
    // Track totals for each month of player lifecycle
    const totalActivePlayers = {};
    const totalNGR = {};
    
    monthNumbers.forEach(month => {
      totalActivePlayers[month] = 0;
      totalNGR[month] = 0;
    });
    
    // For each cohort, calculate retention, ARPU and LTV per month
    cohorts.forEach(cohort => {
      retentionMatrix[cohort] = {};
      arpuMatrix[cohort] = {};
      ltValueMatrix[cohort] = {};
      
      const cohortData = filteredData.filter(d => d.ftd_month === cohort);
      const initialCohortSize = cohortData.find(d => d.month_number === 0)?.cohort_size || 0;
      
      if (initialCohortSize === 0) return; // Skip cohorts with no data
      
      monthNumbers.forEach(month => {
        const monthData = cohortData.find(d => d.month_number === month);
        
        // Retention calculation: % of initial cohort still active
        const activePlayers = monthData?.active_players || 0;
        const retentionRate = (activePlayers / initialCohortSize) * 100;
        retentionMatrix[cohort][month] = retentionRate;
        
        // Add to month totals for weighted averages later
        totalActivePlayers[month] += activePlayers;
        
        // ARPU calculation: NGR / active players
        const monthlyNGR = monthData?.ngr || 0;
        const arpu = activePlayers > 0 ? monthlyNGR / activePlayers : 0;
        arpuMatrix[cohort][month] = arpu;
        
        // Add to NGR totals
        totalNGR[month] += monthlyNGR;
        
        // LTV calculation: retention % * ARPU
        const ltv = (retentionRate / 100) * arpu;
        ltValueMatrix[cohort][month] = ltv;
      });
    });
    
    // Calculate ARPU for each month across all cohorts
    const arpu = {};
    monthNumbers.forEach(month => {
      arpu[month] = totalActivePlayers[month] > 0 ? totalNGR[month] / totalActivePlayers[month] : 0;
    });
    
    // Calculate retention vector - what % of players are still active in each month of their lifecycle
    const totalFTDs = cohorts.reduce((sum, cohort) => {
      const cohortSize = filteredData.find(d => d.ftd_month === cohort && d.month_number === 0)?.cohort_size || 0;
      return sum + cohortSize;
    }, 0);
    
    const aggregatedRetention = monthNumbers.map(month => {
      // For each month in player lifecycle, what % of initial FTDs are still active
      const activeInThisMonth = totalActivePlayers[month];
      const retentionRate = totalFTDs > 0 ? (activeInThisMonth / totalFTDs) * 100 : 0;
      
      return {
        month: month === 0 ? 'Month 0' : `M+${month}`,
        value: retentionRate,
        label: `${retentionRate.toFixed(1)}%`
      };
    });
    
    // Calculate ARPU vector - what is the average revenue per active player in each month
    const aggregatedARPU = monthNumbers.map(month => {
      const monthArpu = arpu[month];
      
      return {
        month: month === 0 ? 'Month 0' : `M+${month}`,
        value: monthArpu,
        label: formatCurrency(monthArpu)
      };
    });
    
    // Calculate LTV vector - retention vector * ARPU vector
    const aggregatedLTV = monthNumbers.map(month => {
      const retentionRate = totalFTDs > 0 ? (totalActivePlayers[month] / totalFTDs) : 0;
      const monthArpu = arpu[month];
      const ltv = retentionRate * monthArpu;
      
      return {
        month: month === 0 ? 'Month 0' : `M+${month}`,
        value: ltv,
        label: formatCurrency(ltv)
      };
    });
    
    // Calculate cumulative LTV
    const cumulativeLTV = [];
    let runningTotal = 0;
    
    aggregatedLTV.forEach((item, index) => {
      runningTotal += item.value;
      cumulativeLTV.push({
        month: item.month,
        value: runningTotal,
        label: formatCurrency(runningTotal)
      });
    });
    
    // Prepare player value matrix for display
    const playerValueMatrix = [];
    
    // For each month in player lifecycle
    monthNumbers.forEach(month => {
      const retentionPct = totalFTDs > 0 ? (totalActivePlayers[month] / totalFTDs) * 100 : 0;
      const monthArpu = arpu[month];
      const monthLTV = (retentionPct / 100) * monthArpu;
      
      playerValueMatrix.push({
        month: month === 0 ? 'Month 0' : `Month ${month}`,
        retention: retentionPct,
        arpu: monthArpu,
        ltv: monthLTV
      });
    });
    
    setProcessedData({
      cohorts,
      monthNumbers,
      retentionMatrix,
      arpuMatrix,
      ltValueMatrix,
      aggregatedRetention,
      aggregatedARPU,
      aggregatedLTV,
      cumulativeLTV,
      playerValueMatrix,
      totals: {
        activePlayers: totalActivePlayers,
        totalNGR,
        arpu
      }
    });
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage values
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Format cohort date
  const formatCohortDate = (dateStr) => {
    try {
      const [year, month] = dateStr.split('-');
      return `${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Player Value Matrix</h1>
            <p className="text-gray-500">
              Analyze player retention, ARPU, and lifetime value across cohorts
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter.stag} onValueChange={(value) => handleFilterChange('stag', value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sub-Affiliate Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {filterOptions.stags.map(stag => (
                  <SelectItem key={stag} value={stag}>{stag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter.affiliateId} onValueChange={(value) => handleFilterChange('affiliateId', value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Affiliate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Affiliates</SelectItem>
                {filterOptions.affiliateIds.map(id => (
                  <SelectItem key={id} value={id}>
                    {cohortData.find(d => d.affiliate_id === id)?.affiliate_name || id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {filterOptions.brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="retention">Retention Rates</TabsTrigger>
            <TabsTrigger value="arpu">ARPU</TabsTrigger>
            <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="matrix">PV Matrix</TabsTrigger>
          </TabsList>
          
          <TabsContent value="retention">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Players Retention by Month</CardTitle>
                  <CardDescription>
                    Percentage of initial cohort still active each month in their lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="h-[300px] mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={processedData.aggregatedRetention}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis 
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value.toFixed(1)}%`, 'Retention Rate']}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              name="Retention Rate" 
                              stroke="#4f46e5" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                        <Info className="h-4 w-4" />
                        <span>Active player = player who made a deposit or bet during the month</span>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">FTD Cohort</TableHead>
                            {processedData.monthNumbers.map(month => (
                              <TableHead key={month} className="text-right">
                                {month === 0 ? 'Month 0' : `M+${month}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedData.cohorts.map(cohort => (
                            <TableRow key={cohort}>
                              <TableCell className="font-medium">
                                {formatCohortDate(cohort)}
                              </TableCell>
                              {processedData.monthNumbers.map(month => (
                                <TableCell key={month} className="text-right">
                                  {processedData.retentionMatrix[cohort][month] !== undefined 
                                    ? formatPercent(processedData.retentionMatrix[cohort][month]) 
                                    : '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-medium">
                            <TableCell>All Cohorts Average</TableCell>
                            {processedData.monthNumbers.map(month => (
                              <TableCell key={month} className="text-right">
                                {processedData.aggregatedRetention.find(d => d.month === (month === 0 ? 'Month 0' : `M+${month}`))?.label || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Players By Cohort and Month</CardTitle>
                  <CardDescription>
                    Number of active players from each cohort in each month of their lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">FTD Cohort</TableHead>
                            {processedData.monthNumbers.map(month => (
                              <TableHead key={month} className="text-right">
                                {month === 0 ? 'Month 0' : `M+${month}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedData.cohorts.map(cohort => {
                            const cohortSize = filteredData.find(d => d.ftd_month === cohort && d.month_number === 0)?.cohort_size || 0;
                            
                            return (
                              <TableRow key={cohort}>
                                <TableCell className="font-medium">
                                  {formatCohortDate(cohort)} ({cohortSize} FTDs)
                                </TableCell>
                                {processedData.monthNumbers.map(month => {
                                  const activePlayers = filteredData.find(
                                    d => d.ftd_month === cohort && d.month_number === month
                                  )?.active_players || 0;
                                  
                                  return (
                                    <TableCell key={month} className="text-right">
                                      {activePlayers > 0 ? activePlayers.toLocaleString() : '-'}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-gray-50 font-medium">
                            <TableCell>Total Active Players</TableCell>
                            {processedData.monthNumbers.map(month => (
                              <TableCell key={month} className="text-right">
                                {processedData.totals.activePlayers[month] > 0 
                                  ? processedData.totals.activePlayers[month].toLocaleString() 
                                  : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="arpu">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average Revenue Per Active Player (ARPU)</CardTitle>
                  <CardDescription>
                    Average NGR per active player for each month in their lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="h-[300px] mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={processedData.aggregatedARPU}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis 
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value) => [formatCurrency(value), 'ARPU']}
                            />
                            <Legend />
                            <Bar 
                              dataKey="value" 
                              name="ARPU" 
                              fill="#06b6d4" 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">FTD Cohort</TableHead>
                            {processedData.monthNumbers.map(month => (
                              <TableHead key={month} className="text-right">
                                {month === 0 ? 'Month 0' : `M+${month}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedData.cohorts.map(cohort => (
                            <TableRow key={cohort}>
                              <TableCell className="font-medium">
                                {formatCohortDate(cohort)}
                              </TableCell>
                              {processedData.monthNumbers.map(month => (
                                <TableCell key={month} className="text-right">
                                  {processedData.arpuMatrix[cohort][month] !== undefined 
                                    ? formatCurrency(processedData.arpuMatrix[cohort][month]) 
                                    : '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-medium">
                            <TableCell>All Cohorts Average</TableCell>
                            {processedData.monthNumbers.map(month => (
                              <TableCell key={month} className="text-right">
                                {processedData.aggregatedARPU.find(d => d.month === (month === 0 ? 'Month 0' : `M+${month}`))?.label || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total NGR By Cohort and Month</CardTitle>
                  <CardDescription>
                    Total Net Gaming Revenue from each cohort in each month of their lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">FTD Cohort</TableHead>
                            {processedData.monthNumbers.map(month => (
                              <TableHead key={month} className="text-right">
                                {month === 0 ? 'Month 0' : `M+${month}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedData.cohorts.map(cohort => {
                            return (
                              <TableRow key={cohort}>
                                <TableCell className="font-medium">
                                  {formatCohortDate(cohort)}
                                </TableCell>
                                {processedData.monthNumbers.map(month => {
                                  const ngr = filteredData.find(
                                    d => d.ftd_month === cohort && d.month_number === month
                                  )?.ngr || 0;
                                  
                                  return (
                                    <TableCell key={month} className="text-right">
                                      {ngr > 0 ? formatCurrency(ngr) : '-'}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-gray-50 font-medium">
                            <TableCell>Total NGR</TableCell>
                            {processedData.monthNumbers.map(month => (
                              <TableCell key={month} className="text-right">
                                {processedData.totals.totalNGR[month] > 0 
                                  ? formatCurrency(processedData.totals.totalNGR[month]) 
                                  : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ltv">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lifetime Value by Month</CardTitle>
                  <CardDescription>
                    Monthly and cumulative value per player (NGR) by cohort
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="h-[300px] mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              type="category" 
                              allowDuplicatedCategory={false} 
                              data={processedData.aggregatedLTV}
                            />
                            <YAxis 
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value) => [formatCurrency(value), undefined]}
                            />
                            <Legend />
                            <Line 
                              data={processedData.aggregatedLTV} 
                              type="monotone" 
                              dataKey="value" 
                              name="Monthly LTV" 
                              stroke="#4f46e5" 
                              strokeWidth={2}
                            />
                            <Line 
                              data={processedData.cumulativeLTV} 
                              type="monotone" 
                              dataKey="value" 
                              name="Cumulative LTV" 
                              stroke="#f43f5e" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">FTD Cohort</TableHead>
                            {processedData.monthNumbers.map(month => (
                              <TableHead key={month} className="text-right">
                                {month === 0 ? 'Month 0' : `M+${month}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedData.cohorts.map(cohort => (
                            <TableRow key={cohort}>
                              <TableCell className="font-medium">
                                {formatCohortDate(cohort)}
                              </TableCell>
                              {processedData.monthNumbers.map(month => (
                                <TableCell key={month} className="text-right">
                                  {processedData.ltValueMatrix[cohort][month] !== undefined 
                                    ? formatCurrency(processedData.ltValueMatrix[cohort][month]) 
                                    : '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-medium">
                            <TableCell>Monthly Average</TableCell>
                            {processedData.monthNumbers.map(month => (
                              <TableCell key={month} className="text-right">
                                {processedData.aggregatedLTV.find(d => d.month === (month === 0 ? 'Month 0' : `M+${month}`))?.label || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow className="bg-green-50 font-medium">
                            <TableCell>Cumulative LTV</TableCell>
                            {processedData.monthNumbers.map(month => (
                              <TableCell key={month} className="text-right">
                                {processedData.cumulativeLTV.find(d => d.month === (month === 0 ? 'Month 0' : `M+${month}`))?.label || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="matrix">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Value Matrix</CardTitle>
                  <CardDescription>
                    Detailed player value calculation (Retention Vector × ARPU Vector)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Retention Vector */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">Retention Vector</h3>
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left pb-2">Month</th>
                                  <th className="text-right pb-2">Retention %</th>
                                </tr>
                              </thead>
                              <tbody>
                                {processedData.playerValueMatrix.map((item, index) => (
                                  <tr key={index} className="border-t border-indigo-100">
                                    <td className="py-2">{item.month}</td>
                                    <td className="text-right py-2 font-medium">{formatPercent(item.retention)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* ARPU Vector */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">ARPU Vector</h3>
                          <div className="bg-cyan-50 p-4 rounded-lg">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left pb-2">Month</th>
                                  <th className="text-right pb-2">ARPU</th>
                                </tr>
                              </thead>
                              <tbody>
                                {processedData.playerValueMatrix.map((item, index) => (
                                  <tr key={index} className="border-t border-cyan-100">
                                    <td className="py-2">{item.month}</td>
                                    <td className="text-right py-2 font-medium">{formatCurrency(item.arpu)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Player Value Vector */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">Player Value Vector</h3>
                          <div className="bg-rose-50 p-4 rounded-lg">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left pb-2">Month</th>
                                  <th className="text-right pb-2">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {processedData.playerValueMatrix.map((item, index) => (
                                  <tr key={index} className="border-t border-rose-100">
                                    <td className="py-2">{item.month}</td>
                                    <td className="text-right py-2 font-medium">{formatCurrency(item.ltv)}</td>
                                  </tr>
                                ))}
                                <tr className="border-t border-rose-100 bg-rose-100">
                                  <td className="py-2 font-medium">Total LTV</td>
                                  <td className="text-right py-2 font-bold">
                                    {formatCurrency(processedData.playerValueMatrix.reduce((sum, item) => sum + item.ltv, 0))}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-8">
                        <h3 className="text-lg font-medium mb-3">Calculation: Retention × ARPU = Player Value</h3>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left pb-3">Month</th>
                              <th className="text-right pb-3">Retention</th>
                              <th className="text-center pb-3">×</th>
                              <th className="text-right pb-3">ARPU</th>
                              <th className="text-center pb-3">=</th>
                              <th className="text-right pb-3">Player Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedData.playerValueMatrix.map((item, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="py-3">{item.month}</td>
                                <td className="text-right py-3">{formatPercent(item.retention)}</td>
                                <td className="text-center py-3">×</td>
                                <td className="text-right py-3">{formatCurrency(item.arpu)}</td>
                                <td className="text-center py-3">=</td>
                                <td className="text-right py-3 font-medium">{formatCurrency(item.ltv)}</td>
                              </tr>
                            ))}
                            <tr className="bg-green-50">
                              <td className="py-3 font-medium" colSpan={5}>Total Lifetime Value (LTV)</td>
                              <td className="text-right py-3 font-bold">
                                {formatCurrency(processedData.playerValueMatrix.reduce((sum, item) => sum + item.ltv, 0))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-3">Explanation</h3>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>
                            <strong>Retention Vector:</strong> The percentage of original FTDs who are still active in each month of their lifecycle
                          </li>
                          <li>
                            <strong>ARPU Vector:</strong> The average revenue per active player in each month of their lifecycle
                          </li>
                          <li>
                            <strong>Player Value (PV):</strong> For each month, multiply the retention percentage by the ARPU to get the expected value from a player in that month
                          </li>
                          <li>
                            <strong>Lifetime Value (LTV):</strong> The sum of all the monthly player values
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Value Summary</CardTitle>
                  <CardDescription>
                    Consolidated view of player retention, ARPU and lifetime value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Retention Vector</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {processedData.aggregatedRetention.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-gray-600">{item.month}</span>
                                  <span className="font-semibold">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">ARPU Vector</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {processedData.aggregatedARPU.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-gray-600">{item.month}</span>
                                  <span className="font-semibold">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Cumulative LTV</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {processedData.cumulativeLTV.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-gray-600">{item.month}</span>
                                  <span className="font-semibold">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Marketing Efficiency Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {processedData.cohorts.map(cohort => {
                              const cohortData = filteredData.filter(d => d.ftd_month === cohort);
                              const initialCohortSize = cohortData.find(d => d.month_number === 0)?.cohort_size || 0;
                              const marketingSpend = cohortData.find(d => d.month_number === 0)?.marketing_spend || 0;
                              
                              if (!initialCohortSize || !marketingSpend) return null;
                              
                              const acquisitionCost = marketingSpend / initialCohortSize;
                              const cumulativeLTV = processedData.monthNumbers.reduce((total, month) => {
                                return total + (processedData.ltValueMatrix[cohort][month] || 0);
                              }, 0);
                              
                              const roi = (cumulativeLTV / acquisitionCost) - 1;
                              
                              return (
                                <div key={cohort} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b">
                                  <div>
                                    <h3 className="font-semibold">{formatCohortDate(cohort)} Cohort</h3>
                                    <p className="text-sm text-gray-500">
                                      {initialCohortSize} players, {formatCurrency(marketingSpend)} spent
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500">CPA</p>
                                      <p className="font-semibold">{formatCurrency(acquisitionCost)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500">LTV</p>
                                      <p className="font-semibold">{formatCurrency(cumulativeLTV)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500">ROI</p>
                                      <p className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {(roi * 100).toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}