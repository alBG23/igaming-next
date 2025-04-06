
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Info, RefreshCw, Database, Users, DollarSign, Filter, Search, ChevronDown, Brain, Zap } from "lucide-react";

export default function DataValidation() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reconciliation");
  const [validationResults, setValidationResults] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveProgress, setResolveProgress] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [openDiscrepancy, setOpenDiscrepancy] = useState(null);
  
  const dataSources = [
    { id: "payments", name: "Payment Processor" },
    { id: "softswiss", name: "SoftSwiss Platform" },
    { id: "affiliate", name: "Affiliate Program" },
    { id: "marketing", name: "Marketing Campaigns" },
    { id: "crm", name: "CRM System" }
  ];
  
  const validationTypes = [
    { id: "schema", name: "Schema & Integrity" },
    { id: "financial", name: "Financial Reconciliation" },
    { id: "cohort", name: "Cohort & Retention" },
    { id: "anomaly", name: "Anomaly Detection" }
  ];
  
  const sampleDiscrepancies = [
    // Sample discrepancies data...
  ];
  
  useEffect(() => {
    fetchValidationResults();
  }, []);
  
  const fetchValidationResults = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setValidationResults(sampleDiscrepancies);
      setIsLoading(false);
    }, 1200);
  };

  const getFilteredResults = () => {
    return validationResults.filter(result => {
      if (selectedDataSource !== 'all' && !result.sources.includes(selectedDataSource)) {
        return false;
      }
      if (selectedSeverity !== 'all' && result.severity !== selectedSeverity) {
        return false;
      }
      if (selectedType !== 'all' && result.type !== selectedType) {
        return false;
      }
      if (searchTerm && !result.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-red-600 border-red-200">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-amber-600 border-amber-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSourceName = (sourceId) => {
    const source = dataSources.find(src => src.id === sourceId);
    return source ? source.name : sourceId;
  };

  const getTypeName = (typeId) => {
    const type = validationTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAiAnalysis = async (discrepancy) => {
    setIsResolving(true);
    setResolveProgress(10);
    
    try {
      for (let i = 20; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setResolveProgress(i);
      }
      
      setResolveProgress(100);
      
      setTimeout(() => {
        setIsResolving(false);
        setResolveProgress(0);
      }, 500);
    } catch (error) {
      console.error("Error running AI analysis:", error);
      setIsResolving(false);
      setResolveProgress(0);
    }
  };

  const handleToggleDiscrepancy = (id) => {
    if (openDiscrepancy === id) {
      setOpenDiscrepancy(null);
    } else {
      setOpenDiscrepancy(id);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Validation & Reconciliation</h1>
            <p className="text-gray-500">
              Cross-check data integrity, validate financials, and ensure accurate reporting
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchValidationResults} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Run Validation
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                Schema Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
                  {validationResults.filter(r => r.type === 'schema' && r.status !== 'resolved').length}
                </div>
                <Badge variant={validationResults.filter(r => r.type === 'schema' && r.severity === 'critical').length > 0 ? "destructive" : "outline"}>
                  {validationResults.filter(r => r.type === 'schema' && r.severity === 'critical').length} critical
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Issues with data structure, required fields, and integrity</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-500" />
                Financial Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
                  {validationResults.filter(r => r.type === 'financial' && r.status !== 'resolved').length}
                </div>
                <Badge variant={validationResults.filter(r => r.type === 'financial' && r.severity === 'critical').length > 0 ? "destructive" : "outline"}>
                  {validationResults.filter(r => r.type === 'financial' && r.severity === 'critical').length} critical
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Deposit, NGR, and affiliate payment discrepancies</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Cohort & Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
                  {validationResults.filter(r => r.type === 'cohort' && r.status !== 'resolved').length}
                </div>
                <Badge variant={validationResults.filter(r => r.type === 'cohort' && r.severity === 'critical').length > 0 ? "destructive" : "outline"}>
                  {validationResults.filter(r => r.type === 'cohort' && r.severity === 'critical').length} critical
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Player retention, LTV, and cohort calculation issues</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Discrepancies</CardTitle>
            <CardDescription>
              Detected issues requiring validation and reconciliation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search discrepancies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Data Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {dataSources.map(source => (
                      <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-[180px]">
                    <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {validationTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="space-y-2 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-gray-500">Loading validation results...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredResults().length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">No discrepancies found</h3>
                    <p className="text-gray-500 mt-2">All data appears to be consistent across your systems</p>
                  </div>
                ) : (
                  getFilteredResults().map(discrepancy => (
                    <div 
                      key={discrepancy.id} 
                      className="border rounded-lg overflow-hidden"
                    >
                      <div 
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer ${openDiscrepancy === discrepancy.id ? 'bg-gray-50' : 'bg-white'}`}
                        onClick={() => handleToggleDiscrepancy(discrepancy.id)}
                      >
                        <div className="flex items-start gap-3">
                          {discrepancy.severity === 'critical' ? (
                            <XCircle className="h-5 w-5 text-red-500 mt-1" />
                          ) : discrepancy.severity === 'high' ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
                          ) : (
                            <Alert className="h-5 w-5 text-blue-500 mt-1" />
                          )}
                          
                          <div>
                            <h3 className="font-semibold">{discrepancy.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {discrepancy.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getSeverityBadge(discrepancy.severity)}
                              {getStatusBadge(discrepancy.status)}
                              <Badge variant="outline" className="bg-gray-100">
                                {getTypeName(discrepancy.type)}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100">
                                Discrepancy: {discrepancy.discrepancy}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-auto mt-3 md:mt-0">
                          <div className="text-sm text-gray-500 mr-4 hidden md:block">
                            Detected: {formatDate(discrepancy.detectedAt)}
                          </div>
                          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openDiscrepancy === discrepancy.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      
                      {openDiscrepancy === discrepancy.id && (
                        <div className="p-4 border-t bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Affected Data Sources</h4>
                                <div className="flex flex-wrap gap-2">
                                  {discrepancy.sources.map(source => (
                                    <Badge key={source} variant="outline">
                                      {getSourceName(source)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">SQL Query Used for Detection</h4>
                                <div className="bg-gray-900 text-gray-200 p-3 rounded-md text-xs overflow-x-auto">
                                  <pre>{discrepancy.sql}</pre>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Suggested Fix</h4>
                                <p className="text-sm bg-white p-3 rounded-md border">
                                  {discrepancy.suggestedFix}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-gray-600">AI Analysis</h4>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => handleAiAnalysis(discrepancy)}
                                    disabled={isResolving}
                                  >
                                    {isResolving ? (
                                      <>
                                        <Brain className="h-3.5 w-3.5 mr-1 animate-pulse" />
                                        Analyzing...
                                      </>
                                    ) : (
                                      <>
                                        <Zap className="h-3.5 w-3.5 mr-1" />
                                        Analyze Deeper
                                      </>
                                    )}
                                  </Button>
                                </div>
                                
                                {isResolving && (
                                  <div className="mb-3">
                                    <Progress value={resolveProgress} className="h-1" />
                                  </div>
                                )}
                                
                                <Alert variant="outline" className="bg-indigo-50 border-indigo-100">
                                  <Info className="h-4 w-4 text-indigo-600" />
                                  <AlertTitle className="text-indigo-700 text-sm ml-2">AI Insights</AlertTitle>
                                  <AlertDescription className="text-sm ml-6 text-gray-700">
                                    {discrepancy.aiAnalysis}
                                  </AlertDescription>
                                </Alert>
                              </div>
                              
                              <div className="bg-white p-4 rounded-md border">
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="h-8">
                                    Ignore
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8">
                                    Mark as Investigating
                                  </Button>
                                  <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700">
                                    Apply Fix
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Notes & Activity</h4>
                                <div className="bg-white p-3 rounded-md border text-sm">
                                  <p className="text-gray-500 italic">No notes or activity yet</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Automated Validation Rules</CardTitle>
            <CardDescription>
              Configure rules to automatically validate data integrity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Financial Reconciliation: Deposits</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Cross-check deposits between payment processor and platform
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <code>IF ABS((payment_total - platform_total) / payment_total) > 0.05 THEN trigger_alert</code>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Player Retention Validation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ensure retention calculation methodology is consistent
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <code>IF retention_drop > 0.15 AND no_promo_changes THEN investigate</code>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Schema Integrity Check</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Validate that all required fields exist and have valid values
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <code>SELECT COUNT(*) FROM transactions WHERE player_id IS NULL OR amount IS NULL</code>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Affiliate Payment Validation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ensure affiliate commission payments match expected values
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <code>IF ABS(calculated_commission - actual_paid) > 100 THEN trigger_alert</code>
                </div>
              </div>
              
              <Button className="mt-2">
                Add New Validation Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
