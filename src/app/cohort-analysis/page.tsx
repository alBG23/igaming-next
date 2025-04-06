'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO, subMonths } from 'date-fns';
import { CohortData } from '@/api/entities';
import { Loader2, Download, Filter, Calendar, DollarSign, Users, TrendingUp, Percent } from 'lucide-react';

// Basic sample data for cohort analysis
const sampleCohortData = [
  // January 2023 Cohort
  {
    ftd_month: "2023-01", cohort_size: 320, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 0, deposits_amount: 38400, ngr: 7680, 
    unique_depositors: 320, marketing_spend: 12000
  },
  {
    ftd_month: "2023-01", cohort_size: 320, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 1, deposits_amount: 28800, ngr: 6048, 
    unique_depositors: 224, marketing_spend: 0
  },
  {
    ftd_month: "2023-01", cohort_size: 320, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 2, deposits_amount: 21600, ngr: 4752, 
    unique_depositors: 157, marketing_spend: 0
  },
  {
    ftd_month: "2023-01", cohort_size: 320, affiliate_id: "AFF001", affiliate_name: "TopCasinoGuide",
    stag: "social", brand: "Lucky Casino", month_number: 3, deposits_amount: 16200, ngr: 3645, 
    unique_depositors: 110, marketing_spend: 0
  },
  
  // February 2023 Cohort
  {
    ftd_month: "2023-02", cohort_size: 280, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 0, deposits_amount: 33600, ngr: 6720, 
    unique_depositors: 280, marketing_spend: 11200
  },
  {
    ftd_month: "2023-02", cohort_size: 280, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 1, deposits_amount: 25200, ngr: 5292, 
    unique_depositors: 196, marketing_spend: 0
  },
  {
    ftd_month: "2023-02", cohort_size: 280, affiliate_id: "AFF002", affiliate_name: "SlotReviewer",
    stag: "blog", brand: "VIP Slots", month_number: 2, deposits_amount: 18900, ngr: 4095, 
    unique_depositors: 137, marketing_spend: 0
  },
  
  // March 2023 Cohort
  {
    ftd_month: "2023-03", cohort_size: 350, affiliate_id: "AFF003", affiliate_name: "GamingPartners",
    stag: "email", brand: "Lucky Casino", month_number: 0, deposits_amount: 42000, ngr: 8400, 
    unique_depositors: 350, marketing_spend: 14000
  },
  {
    ftd_month: "2023-03", cohort_size: 350, affiliate_id: "AFF003", affiliate_name: "GamingPartners",
    stag: "email", brand: "Lucky Casino", month_number: 1, deposits_amount: 31500, ngr: 6615, 
    unique_depositors: 245, marketing_spend: 0
  }
];

export default function CohortAnalysisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deposits');
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

  useEffect(() => {
    // Load data
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

  // Filter data based on user selections
  const applyFilters = () => {
    let filtered = [...cohortData];
    
    if (filter.stag !== 'all') {
      filtered = filtered.filter(d => d.stag === filter.stag);
    }
    
    if (filter.affiliateId !== 'all') {
      filtered = filtered.filter(d => d.affiliate_id === filter.affiliateId);
    }
    
    if (filter.brand !== 'all') {
      filtered = filtered.filter(d => d.brand === filter.brand);
    }
    
    setFilteredData(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setFilter(prev => {
      const newFilter = { ...prev, [filterKey]: value };
      
      // Apply filters with short delay
      setTimeout(() => {
        let filtered = [...cohortData];
        
        if (newFilter.stag !== 'all') {
          filtered = filtered.filter(d => d.stag === newFilter.stag);
        }
        
        if (newFilter.affiliateId !== 'all') {
          filtered = filtered.filter(d => d.affiliate_id === newFilter.affiliateId);
        }
        
        if (newFilter.brand !== 'all') {
          filtered = filtered.filter(d => d.brand === newFilter.brand);
        }
        
        setFilteredData(filtered);
      }, 0);
      
      return newFilter;
    });
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Process data to display in cohort tables
  const getProcessedCohortData = () => {
    // Get unique cohorts (FTD months) and sort chronologically
    const cohorts = [...new Set(filteredData.map(d => d.ftd_month))].sort();
    
    // Get all month numbers and sort
    const monthNumbers = [...new Set(filteredData.map(d => d.month_number))].sort((a, b) => a - b);
    
    // Create tables for each metric
    const depositsTable = {};
    const ngrTable = {};
    const depositorsTable = {};
    
    cohorts.forEach(cohort => {
      depositsTable[cohort] = {};
      ngrTable[cohort] = {};
      depositorsTable[cohort] = {};
      
      monthNumbers.forEach(month => {
        const record = filteredData.find(d => d.ftd_month === cohort && d.month_number === month);
        
        depositsTable[cohort][month] = record ? record.deposits_amount : null;
        ngrTable[cohort][month] = record ? record.ngr : null;
        depositorsTable[cohort][month] = record ? record.unique_depositors : null;
      });
    });
    
    return {
      cohorts,
      monthNumbers,
      depositsTable,
      ngrTable,
      depositorsTable
    };
  };

  // Processed data
  const processedData = getProcessedCohortData();

  // Render cohort table
  const renderCohortTable = (title, description, dataTable, formatter = formatCurrency) => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">FTD Cohort</th>
                {processedData.monthNumbers.map(month => (
                  <th key={month} className="text-right py-2 px-3 font-medium">
                    {month === 0 ? 'Month 0' : `M+${month}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.cohorts.map(cohort => (
                <tr key={cohort} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">
                    {cohort}
                  </td>
                  {processedData.monthNumbers.map(month => (
                    <td key={month} className="text-right py-2 px-3">
                      {dataTable[cohort][month] !== null 
                        ? formatter(dataTable[cohort][month]) 
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cohort Analysis</h1>
            <p className="text-gray-500">Analyze player behavior and retention over time</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filter.stag} onValueChange={(value) => handleFilterChange('stag', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {filterOptions.stags.map(stag => (
                  <SelectItem key={stag} value={stag}>{stag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filter.affiliateId} onValueChange={(value) => handleFilterChange('affiliateId', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Affiliate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Affiliates</SelectItem>
                {filterOptions.affiliateIds.map(id => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filter.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
              <SelectTrigger className="w-[150px]">
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
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="ngr">NGR</TabsTrigger>
            <TabsTrigger value="depositors">Depositors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposits">
            {renderCohortTable(
              "Deposits by Cohort",
              "Total deposit amounts for each cohort over time",
              processedData.depositsTable
            )}
          </TabsContent>
          
          <TabsContent value="ngr">
            {renderCohortTable(
              "Net Gaming Revenue by Cohort",
              "NGR generated by each cohort over time",
              processedData.ngrTable
            )}
          </TabsContent>
          
          <TabsContent value="depositors">
            {renderCohortTable(
              "Active Depositors by Cohort",
              "Number of unique depositors in each cohort over time",
              processedData.depositorsTable,
              (value) => value.toString()
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 