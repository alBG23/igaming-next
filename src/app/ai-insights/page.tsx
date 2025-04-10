'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, RefreshCw, Key, XCircle, Loader2, AlertTriangle, CheckCircle, Lock, FileText, Zap, BarChart3, Users, TrendingUp, SendIcon, Book, Settings, Upload } from 'lucide-react';
import OpenAIConnectionCheck from '@/components/ai/OpenAIConnectionCheck';
import OpenAITraining from '@/components/ai/OpenAITraining';

// Types
type Message = {
  type: 'user' | 'assistant' | 'system';
  content: string;
};

type Metrics = {
  ggr: number;
  ggr_growth: number;
  ngr: number;
  ngr_growth: number;
  active_players: number;
  active_players_growth: number;
  new_players: number;
  new_players_growth: number;
  conversion_rate: number;
  conversion_rate_growth: number;
};

type ApiStatus = 'connected' | 'error' | null;

// Mock API helper
const mockApi = {
  llmResponses: {
    default: "I can help you analyze your iGaming data. What would you like to know?",
    ggr: "Your GGR has shown a positive trend over the last quarter, with a 12.5% growth rate. The main drivers are increased player activity and higher average bet amounts.",
    players: "Player metrics show healthy growth in active players (5.8%) but a slight decline in new player acquisition (-2.3%). Consider focusing on retention strategies.",
    insights: "Key Insights:\n1. GGR growth is strong at 12.5%\n2. Player retention is improving\n3. Conversion rate is up 1.2%\n4. NGR growth is steady at 8.2%",
    report: "Executive Summary:\nThe platform shows strong performance with GGR growth of 12.5% and NGR growth of 8.2%. Player metrics indicate healthy retention but need focus on new player acquisition."
  }
};

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState<string>('question');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiModel, setAiModel] = useState<string>('gpt4');
  const [question, setQuestion] = useState<string>('');
  const [showApiKeyConfig, setShowApiKeyConfig] = useState<boolean>(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Use mock data instead of authenticated API calls
      setTimeout(() => {
        setMetrics({
          ggr: 385000,
          ggr_growth: 12.5,
          ngr: 310000,
          ngr_growth: 8.2,
          active_players: 4700,
          active_players_growth: 5.8,
          new_players: 850,
          new_players_growth: -2.3,
          conversion_rate: 22.5,
          conversion_rate_growth: 1.2
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setIsLoading(false);
    }
  };

  const checkApiKeyConfiguration = async (): Promise<void> => {
    try {
      setIsApiKeyConfigured(true);
      setApiStatus("connected");
    } catch (error) {
      console.error("Error checking API key configuration:", error);
      setIsApiKeyConfigured(false);
      setApiStatus("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

  const handleQuestionSubmit = async (): Promise<void> => {
    if (!question.trim()) return;
    
    setIsGeneratingResponse(true);
    setErrorMessage(null);
    
    const newMessage: Message = { type: 'user', content: question };
    setChatHistory(prev => [...prev, newMessage]);
    
    try {
      // Use mock responses instead of Base44 API
      let response = mockApi.llmResponses.default;
      
      // Simple keyword matching for demo purposes
      if (question.toLowerCase().includes('ggr')) {
        response = mockApi.llmResponses.ggr;
      } else if (question.toLowerCase().includes('player')) {
        response = mockApi.llmResponses.players;
      }
      
      setChatHistory(prev => [...prev, { type: 'assistant', content: response }]);
      setQuestion('');
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : "Failed to generate response"}`);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleGenerateInsights = async (): Promise<void> => {
    setIsGeneratingResponse(true);
    setErrorMessage(null);
    
    try {
      // Use mock responses instead of Base44 API
      const response = mockApi.llmResponses.insights;

      setChatHistory(prev => [...prev, 
        { type: 'system', content: 'Generating automated insights...' },
        { type: 'assistant', content: response }
      ]);
    } catch (error) {
      setErrorMessage("Failed to generate insights: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleCreateReport = async (): Promise<void> => {
    setIsGeneratingResponse(true);
    setErrorMessage(null);
    
    try {
      // Use mock responses instead of Base44 API
      const response = mockApi.llmResponses.report;

      setChatHistory(prev => [...prev, 
        { type: 'system', content: 'Generating AI report...' },
        { type: 'assistant', content: response }
      ]);
    } catch (error) {
      setErrorMessage("Failed to generate report: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-500">
              Get intelligent insights from your data using AI
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4 (Recommended)</SelectItem>
                <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude">Anthropic Claude</SelectItem>
                <SelectItem value="trained">Your Trained Model</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant={isApiKeyConfigured ? "outline" : "default"}
              size="sm"
              onClick={() => setShowApiKeyConfig(!showApiKeyConfig)}
              className={isApiKeyConfigured ? "" : "bg-indigo-600 hover:bg-indigo-700"}
            >
              <Key className="h-4 w-4 mr-2" />
              {isApiKeyConfigured ? (
                <>
                  Configure API Key 
                  <Badge className={`ml-2 ${
                    apiStatus === "connected" ? "bg-green-100 text-green-800" : 
                    apiStatus === "error" ? "bg-red-100 text-red-800" : 
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {apiStatus === "connected" ? "Connected" : 
                     apiStatus === "error" ? "Error" : 
                     "Status Unknown"}
                  </Badge>
                </>
              ) : (
                "Configure API Key"
              )}
            </Button>
          </div>
        </div>
        
        {showApiKeyConfig && (
          <OpenAIConnectionCheck />
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="question">Ask a Question</TabsTrigger>
            <TabsTrigger value="train">Train AI</TabsTrigger>
            <TabsTrigger value="data">Generate Insights</TabsTrigger>
            <TabsTrigger value="reports">AI Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="question">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Chat with AI Assistant</CardTitle>
                    <CardDescription>
                      Ask questions about your iGaming data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4">
                      {chatHistory.map((message, index) => (
                        <div 
                          key={index} 
                          className={`mb-4 ${
                            message.type === 'user' ? 'flex justify-end' : 'flex justify-start'
                          }`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.type === 'user' 
                                ? 'bg-indigo-600 text-white' 
                                : message.type === 'system'
                                ? 'bg-gray-100 text-gray-600 italic'
                                : 'bg-white border text-gray-800'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your data (e.g., 'Show me top 3 affiliates by NGR for last 3 months')"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleQuestionSubmit}
                        disabled={isGeneratingResponse}
                      >
                        {isGeneratingResponse ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SendIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Generate insights with one click
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateInsights}
                      disabled={isGeneratingResponse}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleCreateReport}
                      disabled={isGeneratingResponse}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Report
                    </Button>
                    
                    {errorMessage && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="train">
            <OpenAITraining />
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Analysis</CardTitle>
                <CardDescription>
                  Generate insights from your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics && Object.entries(metrics).map(([key, value]) => (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {typeof value === 'number' 
                            ? key.includes('growth') || key.includes('rate')
                              ? `${value.toFixed(1)}%`
                              : key.includes('ggr') || key.includes('ngr')
                                ? `$${value.toLocaleString()}`
                                : value.toLocaleString()
                            : value}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>AI Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" onClick={handleCreateReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Executive Report
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Performance Report
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Generate Player Analysis Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 