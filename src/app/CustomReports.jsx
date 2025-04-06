
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Database, 
  Save,
  DownloadCloud, 
  Plus, 
  FileText, 
  Table as TableIcon, 
  Code,
  ListFilter,
  ArrowUpDown,
  Columns as ColumnsIcon,
  Play,
  X,
  Wand2,
  MessageSquare,
  HelpCircle,
  PanelLeft,
  PanelRight,
  FileJson,
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InvokeLLM } from "@/api/integrations";

import DraggableReportBuilder from '../components/custom-reports/DraggableReportBuilder';

export default function CustomReports() {
  const [activeTab, setActiveTab] = useState('builder');
  const [reportName, setReportName] = useState('Untitled Report');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users_view LIMIT 100');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponding, setAiResponding] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiConversation, setAiConversation] = useState([
    {
      role: 'assistant',
      content: 'Hello! I can help you create custom reports. What kind of data would you like to analyze?'
    }
  ]);
  
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortBy, setSortBy] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [savedReports, setSavedReports] = useState([
    { 
      id: 'saved1', 
      name: 'Player Deposit Analysis', 
      description: 'Track deposit patterns by payment method',
      created: '2023-05-10',
      creator: 'admin@example.com',
      lastRun: '2023-06-01',
      favorite: true
    },
    { 
      id: 'saved2', 
      name: 'Affiliate Performance Report', 
      description: 'Compare affiliate conversion rates and ROI',
      created: '2023-04-15',
      creator: 'admin@example.com',
      lastRun: '2023-05-28',
      favorite: false
    },
    { 
      id: 'saved3', 
      name: 'User Retention by GEO', 
      description: 'Analyze player retention rates across different regions',
      created: '2023-03-22',
      creator: 'analyst@example.com',
      lastRun: '2023-05-15',
      favorite: true
    }
  ]);
  const [showExplorer, setShowExplorer] = useState(true);
  
  const availableTables = [
    { id: 'users_view', name: 'users_view', category: 'user', columns: 13 },
    { id: 'profiles_view', name: 'profiles_view', category: 'user', columns: 25 },
    { id: 'payments_view', name: 'payments_view', category: 'financial', columns: 43 },
    { id: 'traffic_reports', name: 'traffic_reports', category: 'analytics', columns: 13 },
    { id: 'casino_games_view',name: 'casino_games_view', category: 'gaming', columns: 12 },
    { id: 'bonus_issues_view', name: 'bonus_issues_view', category: 'gaming', columns: 25 },
    { id: 'payment_systems_view', name: 'payment_systems_view', category: 'financial', columns: 14 },
    { id: 'tournament_players_view', name: 'tournament_players_view', category: 'gaming', columns: 11 },
    { id: 'freespin_issues_view', name: 'freespin_issues_view', category: 'gaming', columns: 19 },
    { id: 'phones_view', name: 'phones_view', category: 'user', columns: 6 }
  ];
  
  const tablesWithColumns = {
    'users_view': [
      { id: 'users_view.id', name: 'id', type: 'bigint', table: 'users_view' },
      { id: 'users_view.email', name: 'email', type: 'varchar', table: 'users_view' },
      { id: 'users_view.created_at', name: 'created_at', type: 'timestamp', table: 'users_view' },
      { id: 'users_view.updated_at', name: 'updated_at', type: 'timestamp', table: 'users_view' },
      { id: 'users_view.tags', name: 'tags', type: 'varchar', table: 'users_view' },
      { id: 'users_view.suspended', name: 'suspended', type: 'boolean', table: 'users_view' },
      { id: 'users_view.disabled', name: 'disabled', type: 'boolean', table: 'users_view' }
    ],
    'profiles_view': [
      { id: 'profiles_view.id', name: 'id', type: 'bigint', table: 'profiles_view' },
      { id: 'profiles_view.user_id', name: 'user_id', type: 'bigint', table: 'profiles_view' },
      { id: 'profiles_view.first_name', name: 'first_name', type: 'varchar', table: 'profiles_view' },
      { id: 'profiles_view.last_name', name: 'last_name', type: 'varchar', table: 'profiles_view' },
      { id: 'profiles_view.country', name: 'country', type: 'varchar', table: 'profiles_view' },
      { id: 'profiles_view.city', name: 'city', type: 'varchar', table: 'profiles_view' },
      { id: 'profiles_view.birth_date', name: 'birth_date', type: 'date', table: 'profiles_view' }
    ],
    'payments_view': [
      { id: 'payments_view.id', name: 'id', type: 'bigint', table: 'payments_view' },
      { id: 'payments_view.user_id', name: 'user_id', type: 'bigint', table: 'payments_view' },
      { id: 'payments_view.amount', name: 'amount', type: 'decimal', table: 'payments_view' },
      { id: 'payments_view.currency', name: 'currency', type: 'varchar', table: 'payments_view' },
      { id: 'payments_view.payment_method', name: 'payment_method', type: 'varchar', table: 'payments_view' },
      { id: 'payments_view.status', name: 'status', type: 'varchar', table: 'payments_view' },
      { id: 'payments_view.created_at', name: 'created_at', type: 'timestamp', table: 'payments_view' }
    ],
    'traffic_reports': [
      { id: 'traffic_reports.id', name: 'id', type: 'bigint', table: 'traffic_reports' },
      { id: 'traffic_reports.date', name: 'date', type: 'date', table: 'traffic_reports' },
      { id: 'traffic_reports.affiliate_id', name: 'affiliate_id', type: 'varchar', table: 'traffic_reports' },
      { id: 'traffic_reports.affiliate_name', name: 'affiliate_name', type: 'varchar', table: 'traffic_reports' },
      { id: 'traffic_reports.clicks', name: 'clicks', type: 'integer', table: 'traffic_reports' },
      { id: 'traffic_reports.registrations', name: 'registrations', type: 'integer', table: 'traffic_reports' },
      { id: 'traffic_reports.ftd_count', name: 'ftd_count', type: 'integer', table: 'traffic_reports' },
      { id: 'traffic_reports.ftd_amount', name: 'ftd_amount', type: 'decimal', table: 'traffic_reports' }
    ],
    'casino_games_view': [
      { id: 'casino_games_view.id', name: 'id', type: 'bigint', table: 'casino_games_view' },
      { id: 'casino_games_view.name', name: 'name', type: 'varchar', table: 'casino_games_view' },
      { id: 'casino_games_view.provider', name: 'provider', type: 'varchar', table: 'casino_games_view' },
      { id: 'casino_games_view.category', name: 'category', type: 'varchar', table: 'casino_games_view' },
      { id: 'casino_games_view.rtp', name: 'rtp', type: 'decimal', table: 'casino_games_view' }
    ]
  };
  
  const handleAIPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    const newMessage = { role: 'user', content: aiPrompt };
    setAiConversation([...aiConversation, newMessage]);
    
    setAiResponding(true);
    setAiPrompt('');
    
    try {
      const response = await InvokeLLM({
        prompt: `You're an iGaming analytics expert. Help create a custom report based on: "${aiPrompt}".
                Tables available: users_view, profiles_view, payments_view, traffic_reports, casino_games_view.
                Respond with a helpful, detailed explanation of what report would address this need.`,
        add_context_from_internet: false
      });
      
      setAiConversation(prev => [...prev, { role: 'assistant', content: response }]);
      
      const suggestionPrompt = `Based on the request "${aiPrompt}", generate 3 SQL queries that would be helpful. 
                                Format as JSON array of objects with "title" and "query" properties.`;
      
      const suggestionsResponse = await InvokeLLM({
        prompt: suggestionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  query: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (suggestionsResponse && suggestionsResponse.suggestions) {
        setAiSuggestions(suggestionsResponse.suggestions);
      }
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      setAiConversation(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error processing your request. Please try again." 
      }]);
    }
    
    setAiResponding(false);
  };
  
  const handleRunReport = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockData = [];
      for (let i = 0; i < 30; i++) {
        const row = {};
        selectedColumns.forEach(column => {
          if (column.type === 'bigint' || column.type === 'integer') {
            row[column.id] = Math.floor(Math.random() * 10000);
          } else if (column.type === 'decimal') {
            row[column.id] = (Math.random() * 1000).toFixed(2);
          } else if (column.type === 'boolean') {
            row[column.id] = Math.random() > 0.5;
          } else if (column.type === 'date' || column.type === 'timestamp') {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            row[column.id] = date.toISOString().split('T')[0];
          } else if (column.type === 'varchar' && column.name === 'email') {
            row[column.id] = `user${i}@example.com`;
          } else if (column.type === 'varchar' && column.name === 'country') {
            const countries = ['US', 'UK', 'CA', 'DE', 'FR', 'ES', 'IT'];
            row[column.id] = countries[Math.floor(Math.random() * countries.length)];
          } else if (column.type === 'varchar' && column.name === 'payment_method') {
            const methods = ['visa', 'mastercard', 'paypal', 'bitcoin', 'skrill'];
            row[column.id] = methods[Math.floor(Math.random() * methods.length)];
          } else if (column.type === 'varchar' && column.name === 'status') {
            const statuses = ['completed', 'pending', 'failed', 'refunded'];
            row[column.id] = statuses[Math.floor(Math.random() * statuses.length)];
          } else if (column.type === 'varchar' && column.name === 'currency') {
            const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
            row[column.id] = currencies[Math.floor(Math.random() * currencies.length)];
          } else {
            row[column.id] = `Value ${i} for ${column.name}`;
          }
        });
        mockData.push(row);
      }
      
      setPreviewData(mockData);
      setShowPreview(true);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSQLRun = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockData = [];
      for (let i = 0; i < 20; i++) {
        mockData.push({
          id: i + 1,
          email: `user${i}@example.com`,
          created_at: `2023-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          suspended: Math.random() > 0.8
        });
      }
      
      setPreviewData(mockData);
      setShowPreview(true);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSaveReport = () => {
    const newReport = {
      id: `report-${Date.now()}`,
      name: reportName,
      description: 'Custom report created by drag & drop builder',
      created: new Date().toISOString().split('T')[0],
      creator: 'admin@example.com',
      lastRun: new Date().toISOString().split('T')[0],
      favorite: false
    };
    
    setSavedReports([newReport, ...savedReports]);
    alert(`Report "${reportName}" has been saved.`);
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
            <p className="text-gray-500">
              Build and analyze custom reports from your gaming data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="pr-20 w-[250px]"
                placeholder="Report name"
              />
              {isEditing ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full"
                  onClick={handleSaveReport}
                >
                  <Save className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              SQL Editor
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Saved Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder">
            <div className="grid grid-cols-1 gap-6">
              <DraggableReportBuilder
                availableTables={availableTables}
                tablesWithColumns={tablesWithColumns}
                selectedTables={selectedTables}
                setSelectedTables={setSelectedTables}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
                filters={filters}
                setFilters={setFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onRunReport={handleRunReport}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="sql">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>SQL Query Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Show Schema
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileJson className="h-4 w-4 mr-2" />
                    Load Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="font-mono min-h-[200px]"
                  />
                  
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Select defaultValue="100">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Row limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 rows</SelectItem>
                          <SelectItem value="500">500 rows</SelectItem>
                          <SelectItem value="1000">1,000 rows</SelectItem>
                          <SelectItem value="5000">5,000 rows</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[300px]">
                              You can query any table in the database. Use "SELECT * FROM table_name LIMIT 100" to see sample data.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <Button onClick={handleSQLRun}>
                      <Play className="h-4 w-4 mr-2" />
                      Run Query
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>AI Report Assistant</CardTitle>
                  <CardDescription>
                    Describe the report you want to create in plain English
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4">
                    {aiConversation.map((message, index) => (
                      <div 
                        key={index}
                        className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
                      >
                        <div 
                          className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${
                            message.role === 'user' 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    
                    {aiResponding && (
                      <div className="mb-4">
                        <div className="inline-block rounded-lg px-4 py-2 bg-gray-100">
                          <div className="flex space-x-2 items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <div className="flex gap-2 w-full">
                    <Input
                      placeholder="Ask how to build a specific report..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAIPrompt();
                        }
                      }}
                    />
                    <Button onClick={handleAIPrompt} disabled={aiResponding}>
                      {aiResponding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>
                    Ready-to-use queries based on your request
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {aiSuggestions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {aiResponding ? (
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                            <p>Generating suggestions...</p>
                          </div>
                        ) : (
                          <p>Ask the AI assistant to generate report suggestions</p>
                        )}
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {aiSuggestions.map((suggestion, idx) => (
                          <AccordionItem key={idx} value={`suggestion-${idx}`}>
                            <AccordionTrigger className="px-4 py-2 text-left hover:no-underline">
                              {suggestion.title}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-2">
                              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                                {suggestion.query}
                              </pre>
                              <div className="mt-2 flex justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setSqlQuery(suggestion.query);
                                    setActiveTab('sql');
                                  }}
                                >
                                  Use This Query
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>
                  Access your previously created reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Report Name</TableHead>
                          <TableHead>Created On</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Last Run</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                {report.name}
                                {report.favorite && (
                                  <Badge variant="outline" className="ml-2">
                                    Favorite
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                            </TableCell>
                            <TableCell>{report.created}</TableCell>
                            <TableCell>{report.creator}</TableCell>
                            <TableCell>{report.lastRun}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <DownloadCloud className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <Card className="w-[300px]">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                  <p className="text-center font-medium">Running query...</p>
                  <p className="text-center text-sm text-gray-500 mt-1">
                    This may take a few moments
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {showPreview && previewData && !isLoading && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Results Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Badge>
                  {previewData.length} rows
                </Badge>
                <Button variant="outline" size="sm">
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="rounded-md overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewData[0] && Object.keys(previewData[0]).map((key) => (
                          <TableHead key={key}>{key.split('.').pop()}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {typeof value === 'boolean' 
                                ? value ? 'Yes' : 'No'
                                : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
