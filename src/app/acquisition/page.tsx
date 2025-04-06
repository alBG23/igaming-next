'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import AffiliateOptimization from '@/components/acquisition/AffiliateOptimization';

export default function AcquisitionPage() {
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [groupBy, setGroupBy] = useState('none');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Acquisition Analytics</h1>
            <p className="text-gray-500">Track and optimize player acquisition channels</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="cy">Current Year</SelectItem>
                <SelectItem value="py">Previous Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="traffic_source">Traffic Source</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="device">Device</SelectItem>
                <SelectItem value="affiliate">Affiliate</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="optimization">Affiliate Optimization</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Acquisition Overview</CardTitle>
                <CardDescription>Key metrics across all acquisition channels {groupBy !== 'none' && `(Grouped by ${groupBy})`}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Overview content goes here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Analyze performance by traffic source {groupBy !== 'none' && `(Grouped by ${groupBy})`}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Traffic sources content goes here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="affiliates">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Performance</CardTitle>
                <CardDescription>Track and analyze affiliate partners {groupBy !== 'none' && `(Grouped by ${groupBy})`}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Affiliate performance content goes here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="optimization">
            <AffiliateOptimization groupBy={groupBy} period={period} />
          </TabsContent>
          
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Campaigns</CardTitle>
                <CardDescription>Track campaign performance across channels {groupBy !== 'none' && `(Grouped by ${groupBy})`}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Campaign content goes here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 