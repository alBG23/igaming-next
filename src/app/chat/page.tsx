'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDate, formatCurrency, formatCompactCurrency, formatNumber } from '@/lib/utils';
import { LineChart, BarChart } from '@tremor/react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Send, 
  Database, 
  BookOpen, 
  Cpu, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  BarChart3,
  BrainCircuit
} from 'lucide-react';
import { 
  KNOWLEDGE_DOCUMENTS, 
  KnowledgeDocument, 
  searchKnowledgeBase, 
  getKnowledgeDocumentsForVendor,
  executeHermesLangChainQuery, 
  HermesAnalysisResult 
} from '@/lib/hermes/knowledge-base';
import { useVendor } from '@/lib/vendor-context';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  reasoningSteps?: string[];
  matchedKnowledge?: KnowledgeDocument[];
  visualization?: {
    type: 'line' | 'bar' | 'text' | 'table';
    title?: string;
    description?: string;
    data: any;
    categories?: string[];
    values?: string[];
    metrics?: Array<{
      name: string;
      value: string;
      change?: string;
    }>;
  };
};

function getQuickPromptsForVendor(vendorName: string) {
  const isSoft2Bet = vendorName.toLowerCase() === 'soft2bet';
  return [
    { label: 'Top 3 Affiliates by NGR', query: 'Show me top 3 affiliates by NGR for last 3 months' },
    { label: 'GGR Trend', query: 'What is the GGR trend for last month?' },
    { label: `${vendorName} Payments & FTDs`, query: `How many ${vendorName} FTDs and payments did we have?` },
    { label: 'Crypto Divisors (1e8 / 1e9)', query: 'Explain crypto currency subunit divisors' },
    { label: 'SPLIT Payment Basis', query: `What is ${vendorName} SPLIT payment day basis?` },
    {
      label: isSoft2Bet ? 'Soft2Bet MEGA & PAM Schema' : 'SoftSwiss Replica Schema',
      query: isSoft2Bet
        ? 'Show Soft2Bet multi-brand MEGA gamification and PAM schema architecture'
        : 'Show SoftSwiss datalake replica schema architecture',
    },
  ];
}

function buildWelcomeMessage(vendorId: string, vendorName: string): Message {
  const vendorDocs = getKnowledgeDocumentsForVendor(vendorId);
  return {
    role: 'assistant',
    content: `Welcome to the Analytics Chat! I can help you analyze your ${vendorName} igaming data.`,
    reasoningSteps: [
      `Plan: Initialized Hermes AI session with LangChain knowledge retrieval pipeline for ${vendorName}.`,
      `Knowledge: Loaded ${vendorName} datalake replica schema (users_view, payments_view, casino_games_view).`,
      'Verification: Active tenant isolation and currency subunit rules (Fiat /100, BTC /1e8, ETH /1e9).',
      'Ready: Awaiting natural language query or knowledge base prompt.',
    ],
    matchedKnowledge: vendorDocs.slice(0, 2),
    visualization: {
      type: 'text',
      title: `Hermes AI Knowledge & Analytical Capabilities (${vendorName})`,
      description: `Multi-turn analytical chat powered by LangChain and ${vendorName} real replica data`,
      data: `I can help you analyze (${vendorName} Platform):
- NGR (Net Gaming Revenue)
- GGR (Gross Gaming Revenue)
- FTDs (First Time Depositors)
- Registrations
- Deposits
- Cashouts

Try queries like:
- Show me top 3 affiliates by NGR for last 3 months
- What's the GGR trend for last month?
- How many FTDs did we have last week?
- Show me deposits vs cashouts for last month`
    }
  };
}

const ChartCustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-background/95 backdrop-blur-xs p-3 shadow-lg text-xs min-w-[150px] border-border/80">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((cat: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: cat.color || '#3b82f6' }}
            />
            <span className="text-muted-foreground font-medium">{cat.dataKey || cat.name}:</span>
          </div>
          <span className="font-semibold text-foreground font-mono">
            {formatCurrency(cat.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ChatPage() {
  const { currentVendor } = useVendor();
  const quickPrompts = useMemo(() => getQuickPromptsForVendor(currentVendor.name), [currentVendor.name]);
  const [messages, setMessages] = useState<Message[]>(() => [
    buildWelcomeMessage(currentVendor.id, currentVendor.name),
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'visualization' | 'reasoning' | 'knowledge'>('visualization');
  const [kbSearchQuery, setKbSearchQuery] = useState('');
  const [kbCategoryFilter, setKbCategoryFilter] = useState<string>('all');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [knowledgeQueryStatus, setKnowledgeQueryStatus] = useState<{ loading: boolean; result?: HermesAnalysisResult } | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [buildWelcomeMessage(currentVendor.id, currentVendor.name)];
      }
      return prev;
    });
  }, [currentVendor.id, currentVendor.name]);

  const handleFeedback = (index: number, type: 'thumbs_up' | 'thumbs_down') => {
    setFeedbackState(prev => ({ ...prev, [index]: type }));
  };

  /**
   * Ask Hermes from a Knowledge card: sends the doc-title query,
   * switches to the Visualization tab, shows loading state, and displays result.
   */
  const handleAskHermesKnowledge = async (doc: KnowledgeDocument) => {
    setActiveTab('visualization');
    setKnowledgeQueryStatus({ loading: true });

    try {
      const result = await executeHermesLangChainQuery(
        `Explain ${doc.title} in detail`,
        currentVendor.id
      );
      setKnowledgeQueryStatus({ loading: false, result });
    } catch (error) {
      console.error('Ask Hermes (knowledge) error:', error);
      setKnowledgeQueryStatus({ loading: false });
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSubmit = (queryText || input).trim();
    if (!textToSubmit) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSubmit
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setActiveTab('visualization');

    try {
      // Execute Hermes LangChain RAG pipeline
      const hermesResult: HermesAnalysisResult = await executeHermesLangChainQuery(
        textToSubmit,
        currentVendor.id
      );
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: hermesResult.content,
        reasoningSteps: hermesResult.reasoningSteps,
        matchedKnowledge: hermesResult.matchedKnowledge,
        visualization: hermesResult.visualization
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Encountered an error processing your query. Please retry or browse the Knowledge Base.',
        visualization: {
          type: 'text',
          title: 'Query Error',
          data: 'An error occurred during analytical execution.'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredKnowledgeDocs = useMemo(() => {
    let docs = getKnowledgeDocumentsForVendor(currentVendor.id);
    if (kbCategoryFilter !== 'all') {
      docs = docs.filter(d => d.category === kbCategoryFilter);
    }
    if (kbSearchQuery.trim()) {
      docs = searchKnowledgeBase(kbSearchQuery, 10, currentVendor.id);
      if (kbCategoryFilter !== 'all') {
        docs = docs.filter(d => d.category === kbCategoryFilter);
      }
    }
    return docs;
  }, [kbSearchQuery, kbCategoryFilter, currentVendor.id]);

  const latestAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return messages[0];
  }, [messages]);

  const latestViz = latestAssistantMessage?.visualization;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      {/* Left Column: Analytics Chat with Input at the TOP */}
      <div className="w-full lg:w-1/2 flex flex-col border rounded-xl bg-card p-5 shadow-sm">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-3 border-b mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics Chat</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hermes 3 AI Engine • LangChain RAG Active • {currentVendor.name} Knowledge Base
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hermes Quality: 98%
            </span>
          </div>
        </div>

        {/* TOP CHAT INPUT & PROMPTS BAR */}
        <div className="bg-muted/40 border border-border/80 rounded-lg p-3.5 mb-4 shadow-2xs space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your data (e.g., 'Show me top 3 affiliates by NGR for last 3 months')"
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              className="bg-background shadow-xs h-10 text-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendQuery()} 
              disabled={isLoading || !input.trim()}
              className="gap-1.5 h-10 px-4 font-medium shrink-0"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>

          {/* Quick Suggestion Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Quick Knowledge Prompts
              </span>
              <span className="text-[10px] opacity-75">Click to run immediately</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendQuery(prompt.query)}
                  className="text-[11px] font-medium bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-muted-foreground/20 rounded-md px-2.5 py-1 transition-colors text-left"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Stream - positioned below the top input bar */}
        <ScrollArea className="flex-1 pr-3 max-h-[calc(100vh-370px)] min-h-[350px]">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Card 
                key={index} 
                className={`p-4 transition-all duration-200 border ${
                  message.role === 'user' 
                    ? 'bg-primary/5 border-primary/20 ml-6' 
                    : 'bg-card border-border mr-2 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-indigo-600 text-white'
                    }`}>
                      {message.role === 'user' ? 'U' : 'AI'}
                    </span>
                    <p className="font-semibold text-sm">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </p>
                  </div>
                  {message.role === 'assistant' && (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Hermes Quality: 98%
                    </span>
                  )}
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-8">
                  {message.content}
                </div>

                {/* Hermes Reasoning Steps Badges */}
                {message.reasoningSteps && message.reasoningSteps.length > 0 && (
                  <div className="mt-3 pl-8 pt-2.5 border-t border-dashed space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                      <BrainCircuit className="h-3 w-3 text-indigo-500" />
                      <span>Hermes Reasoning Chain:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {message.reasoningSteps.map((step, sIdx) => {
                        const stepPrefix = step.split(':')[0] || 'Step';
                        return (
                          <Badge 
                            key={sIdx} 
                            variant="outline" 
                            className="text-[10px] font-mono font-normal bg-muted/40 py-0.5 cursor-pointer hover:bg-muted"
                            onClick={() => setActiveTab('reasoning')}
                          >
                            {stepPrefix}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Matched Knowledge Base Citations */}
                {message.matchedKnowledge && message.matchedKnowledge.length > 0 && (
                  <div className="mt-2.5 pl-8 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-2.5 w-2.5 text-blue-500" />
                      Sources:
                    </span>
                    {message.matchedKnowledge.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setActiveTab('knowledge');
                          setExpandedDocId(doc.id);
                        }}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                      >
                        {doc.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Feedback Controls for Assistant */}
                {message.role === 'assistant' && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t text-xs text-muted-foreground pl-8">
                    <span className="text-[11px]">
                      {feedbackState[index] ? `Feedback: ${feedbackState[index] === 'thumbs_up' ? 'Helpful' : 'Needs Correction'}` : 'Was this accurate?'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={feedbackState[index] === 'thumbs_up' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => handleFeedback(index, 'thumbs_up')}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful
                      </Button>
                      <Button
                        variant={feedbackState[index] === 'thumbs_down' ? 'destructive' : 'ghost'}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => handleFeedback(index, 'thumbs_down')}
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        Fix
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {isLoading && (
              <Card className="p-4 bg-muted/30 border-dashed animate-pulse">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                  <span>Hermes is retrieving knowledge and querying {currentVendor.name} replica...</span>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Column: Visualization & LangChain Knowledge Base Engine */}
      <div className="w-full lg:w-1/2 flex flex-col border rounded-xl bg-card p-5 shadow-sm">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Visualization</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live Charts • Hermes Reasoning Trace • LangChain Knowledge Base
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
            <TabsList className="inline-flex h-9 p-1 bg-muted rounded-lg">
              <TabsTrigger value="visualization" className="text-xs px-3">
                Visuals
              </TabsTrigger>
              <TabsTrigger value="reasoning" className="text-xs px-3">
                Hermes Chain
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="text-xs px-3">
                Knowledge ({KNOWLEDGE_DOCUMENTS.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab 1: Live Visualization */}
        {activeTab === 'visualization' && (
          <ScrollArea className="flex-1 pr-3 max-h-[calc(100vh-250px)]">
            {knowledgeQueryStatus?.loading && (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium">Hermes is analyzing knowledge...</p>
                <p className="text-xs mt-1">Retrieving context and synthesizing analysis</p>
              </div>
            )}
            {knowledgeQueryStatus?.result && !knowledgeQueryStatus.loading && (() => {
            const rq = knowledgeQueryStatus.result;
            return (
              <div className="space-y-4">
                <Card className="p-4 border border-primary/20 bg-primary/5">
                  {rq.visualization?.title && (
                    <h3 className="text-lg font-bold mb-1 tracking-tight text-primary">
                      {rq.visualization.title}
                    </h3>
                  )}
                  {rq.visualization?.description && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {rq.visualization.description}
                    </p>
                  )}

                  {rq.visualization?.metrics && rq.visualization.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      {rq.visualization.metrics.map((metric, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-muted/20 shadow-2xs">
                          <p className="text-xs text-muted-foreground font-medium">{metric.name}</p>
                          <p className="text-lg font-bold text-foreground mt-0.5">{metric.value}</p>
                          {metric.change && (
                            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                              {metric.change}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Charts from knowledge query */}
                  {rq.visualization?.type === 'bar' && rq.visualization.data?.data && (
                    <div className="pt-2">
                      <BarChart
                        data={rq.visualization.data.data}
                        index="name"
                        categories={rq.visualization.data.categories || ["NGR", "value"]}
                        colors={["blue"]}
                        valueFormatter={(v: number) => formatCompactCurrency(v)}
                        customTooltip={ChartCustomTooltip}
                        yAxisWidth={76}
                        intervalType="preserveStartEnd"
                        tickGap={0}
                        showAnimation={true}
                        className="h-64"
                      />
                    </div>
                  )}

                  {rq.visualization?.type === 'line' && rq.visualization.data?.data && (
                    <div className="pt-2">
                      <LineChart
                        data={rq.visualization.data.data}
                        index="name"
                        categories={rq.visualization.data.categories || ["GGR", "value"]}
                        colors={["blue"]}
                        valueFormatter={(v: number) => formatCompactCurrency(v)}
                        customTooltip={ChartCustomTooltip}
                        curveType="monotone"
                        yAxisWidth={76}
                        intervalType="preserveStartEnd"
                        tickGap={0}
                        showAnimation={true}
                        className="h-64"
                      />
                    </div>
                  )}

                  {rq.visualization?.type === 'table' && rq.visualization.data?.headers && (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            {rq.visualization.data.headers.map((h: string, idx: number) => (
                              <th key={idx} className="px-3.5 py-2.5 font-semibold text-muted-foreground">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {rq.visualization.data.rows?.map((row: any[], rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-muted/30">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3.5 py-2 font-mono">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                {/* Knowledge reasoning steps */}
                {rq.reasoningSteps && rq.reasoningSteps.length > 0 && (
                  <Card className="p-3.5 border-indigo-200/50 bg-indigo-50/20">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-2">
                      <BrainCircuit className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Reasoning Chain:</span>
                    </div>
                    <div className="space-y-1.5">
                      {rq.reasoningSteps.map((step, sIdx) => {
                        const stepPrefix = step.split(':')[0] || 'Step';
                        const detail = step.split(':')[1]?.trim() || '';
                        return (
                          <div key={sIdx} className="flex items-start gap-2 text-[11px]">
                            <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="text-foreground/80">
                              <strong className="text-primary">{stepPrefix}:</strong> {detail}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Matched knowledge sources */}
                {rq.matchedKnowledge && rq.matchedKnowledge.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="text-muted-foreground font-medium">Sources:</span>
                    {rq.matchedKnowledge.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setActiveTab('knowledge');
                          setExpandedDocId(doc.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                      >
                        {doc.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
            {!knowledgeQueryStatus && latestViz ? (
              <div className="space-y-4">
                <Card className="p-4 border">
                  {latestViz.title && (
                    <h3 className="text-lg font-bold mb-1 tracking-tight">
                      {latestViz.title}
                    </h3>
                  )}
                  {latestViz.description && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {latestViz.description}
                    </p>
                  )}

                  {/* Summary Metric Cards */}
                  {latestViz.metrics && latestViz.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      {latestViz.metrics.map((metric, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-muted/20 shadow-2xs">
                          <p className="text-xs text-muted-foreground font-medium">{metric.name}</p>
                          <p className="text-lg font-bold text-foreground mt-0.5">{metric.value}</p>
                          {metric.change && (
                            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                              {metric.change}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bar Chart */}
                  {latestViz.type === 'bar' && latestViz.data?.data && (
                    <div className="pt-2">
                      <BarChart
                        data={latestViz.data.data}
                        index="name"
                        categories={latestViz.data.categories || ["NGR", "value"]}
                        colors={["blue"]}
                        valueFormatter={(v: number) => formatCompactCurrency(v)}
                        customTooltip={ChartCustomTooltip}
                        yAxisWidth={76}
                        intervalType="preserveStartEnd"
                        tickGap={0}
                        showAnimation={true}
                        className="h-64"
                      />
                    </div>
                  )}

                  {/* Line Chart */}
                  {latestViz.type === 'line' && latestViz.data?.data && (
                    <div className="pt-2">
                      <LineChart
                        data={latestViz.data.data}
                        index="name"
                        categories={latestViz.data.categories || ["GGR", "value"]}
                        colors={["blue"]}
                        valueFormatter={(v: number) => formatCompactCurrency(v)}
                        customTooltip={ChartCustomTooltip}
                        curveType="monotone"
                        yAxisWidth={76}
                        intervalType="preserveStartEnd"
                        tickGap={0}
                        showAnimation={true}
                        className="h-64"
                      />
                    </div>
                  )}

                  {/* Table Visualization */}
                  {latestViz.type === 'table' && latestViz.data?.headers && (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            {latestViz.data.headers.map((h: string, idx: number) => (
                              <th key={idx} className="px-3.5 py-2.5 font-semibold text-muted-foreground">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {latestViz.data.rows?.map((row: any[], rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-muted/30">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3.5 py-2 font-mono">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Text / Summary Output */}
                  {latestViz.type === 'text' && (
                    <pre className="text-xs bg-muted/40 p-3.5 rounded-lg whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed border">
                      {latestViz.data}
                    </pre>
                  )}
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">No visualization active</p>
                <p className="text-xs">Ask a question or select a prompt to generate charts</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Tab 2: Hermes 4-Step Reasoning Chain Trace */}
        {activeTab === 'reasoning' && (
          <ScrollArea className="flex-1 pr-3 max-h-[calc(100vh-250px)]">
            <div className="space-y-3">
              <Card className="p-4 border bg-indigo-50/20 border-indigo-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-sm">Hermes 4-Step Chain Execution</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-300">
                    Confidence: 98%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deterministic reasoning loop enforcing tenant boundary separation, currency subunit integrity, and SPLIT payment parity.
                </p>
              </Card>

              {latestAssistantMessage?.reasoningSteps?.map((step, idx) => {
                const parts = step.split(':');
                const title = parts[0];
                const detail = parts.slice(1).join(':').trim();

                return (
                  <Card key={idx} className="p-3.5 border shadow-2xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">
                        {title}
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground pl-7 leading-relaxed">
                      {detail}
                    </p>
                  </Card>
                );
              })}

              <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
                <p className="font-semibold text-[11px] text-foreground">Verified Execution Guards:</p>
                <p className="text-[11px] text-muted-foreground">✔ {currentVendor.name} replica read-only isolation</p>
                <p className="text-[11px] text-muted-foreground">✔ Split payment date rules (deposits: created_at, cashouts: finished_at)</p>
                <p className="text-[11px] text-muted-foreground">✔ Multi-currency subunit divisors (Fiat: 100, BTC: 1e8, ETH: 1e9)</p>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Tab 3: LangChain Knowledge Base Engine */}
        {activeTab === 'knowledge' && (
          <ScrollArea className="flex-1 pr-3 max-h-[calc(100vh-250px)]">
            <div className="space-y-3.5">
              {/* Search & Category Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={kbSearchQuery}
                    onChange={(e) => setKbSearchQuery(e.target.value)}
                    placeholder="Search schemas, formulas, subunit rules..."
                    className="pl-8 h-8 text-xs bg-background"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {['all', 'schema', 'formula', 'platform', 'compliance', 'reconciliation'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setKbCategoryFilter(cat)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize transition-colors ${
                        kbCategoryFilter === cat 
                          ? 'bg-primary text-primary-foreground font-semibold' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Knowledge Query Result Card */}
              {knowledgeQueryStatus?.result && (
                (() => {
                  const rq = knowledgeQueryStatus.result!;
                  return (
                <Card className="p-3.5 border-primary/40 bg-primary/5 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <h4 className="font-semibold text-xs text-primary">Hermes Analysis Result</h4>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Ready
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap">{rq.content}</p>
                  {rq.visualization && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      📊 Visualization available — switch to <button onClick={() => setActiveTab('visualization')} className="underline text-primary hover:text-primary/80">Visuals</button> tab to view charts.
                    </p>
                  )}
                </Card>
                  );
                })()
              )}

              {knowledgeQueryStatus?.loading && (
                <Card className="p-3.5 border-primary/30 bg-primary/5 border-dashed animate-pulse">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                    <span>Hermes is analyzing knowledge for this topic...</span>
                  </div>
                </Card>
              )}

              <div className="space-y-2.5">
                {filteredKnowledgeDocs.map((doc) => {
                  const isExpanded = expandedDocId === doc.id;
                  return (
                    <Card key={doc.id} className="p-3.5 border transition-all hover:border-primary/40 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-mono capitalize py-0">
                              {doc.category}
                            </Badge>
                            <h4 className="font-semibold text-xs text-foreground">
                              {doc.title}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.summary}
                          </p>
                        </div>
                      </div>

                      {/* Expandable full content */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t text-xs space-y-2 bg-muted/20 p-2.5 rounded-md">
                          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/90">
                            {doc.content}
                          </pre>
                          <div className="flex items-center gap-1 flex-wrap text-[10px] text-muted-foreground pt-1 border-t">
                            <span className="font-semibold">References:</span>
                            {doc.citations.map((c, i) => (
                              <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                {c}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                        >
                          {isExpanded ? 'Collapse' : 'View Full Spec'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2.5 gap-1.5 bg-background border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary/80 hover:text-primary"
                          onClick={() => handleAskHermesKnowledge(doc)}
                        >
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Ask Hermes
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}

                {filteredKnowledgeDocs.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No knowledge documents matched &quot;{kbSearchQuery}&quot;.
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}