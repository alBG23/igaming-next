'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAvailableTables } from '@/lib/supabase';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';
import { LineChart, BarChart } from '@tremor/react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
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

type QueryType = 'NGR' | 'GGR' | 'FTD' | 'REGISTRATIONS' | 'DEPOSITS' | 'CASHOUTS' | 'UNKNOWN';

const detectQueryType = (query: string): QueryType => {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('ngr') || lowerQuery.includes('net gaming revenue')) return 'NGR';
  if (lowerQuery.includes('ggr') || lowerQuery.includes('gross gaming revenue')) return 'GGR';
  if (lowerQuery.includes('ftd') || lowerQuery.includes('first time deposit')) return 'FTD';
  if (lowerQuery.includes('registrations') || lowerQuery.includes('signups')) return 'REGISTRATIONS';
  if (lowerQuery.includes('deposits')) return 'DEPOSITS';
  if (lowerQuery.includes('cashouts') || lowerQuery.includes('withdrawals')) return 'CASHOUTS';
  return 'UNKNOWN';
};

const detectTimeframe = (query: string): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('last 3 months')) {
    return {
      startDate: new Date(now.setMonth(now.getMonth() - 3)),
      endDate: new Date()
    };
  }
  
  if (lowerQuery.includes('last month')) {
    return {
      startDate: new Date(now.setMonth(now.getMonth() - 1)),
      endDate: new Date()
    };
  }
  
  if (lowerQuery.includes('last week')) {
    return {
      startDate: new Date(now.setDate(now.getDate() - 7)),
      endDate: new Date()
    };
  }
  
  // Default to last month
  return {
    startDate: new Date(now.setMonth(now.getMonth() - 1)),
    endDate: new Date()
  };
};

const generateMetrics = (data: any, type: QueryType) => {
  switch (type) {
    case 'NGR':
      return [
        { name: 'Total NGR', value: formatCurrency(data.total) },
        { name: 'Average NGR per Affiliate', value: formatCurrency(data.average) },
        { name: 'Top Affiliate NGR', value: formatCurrency(data.top) }
      ];
    case 'GGR':
      return [
        { name: 'Total GGR', value: formatCurrency(data.total) },
        { name: 'Average Daily GGR', value: formatCurrency(data.dailyAverage) },
        { name: 'Highest Daily GGR', value: formatCurrency(data.highest) }
      ];
    case 'FTD':
      return [
        { name: 'Total FTDs', value: formatNumber(data.total) },
        { name: 'Average Deposit Amount', value: formatCurrency(data.averageDeposit) },
        { name: 'Conversion Rate', value: `${data.conversionRate}%` }
      ];
    default:
      return [];
  }
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      const tables = await getAvailableTables();
      setAvailableTables(tables);
      
      setMessages([{
        role: 'assistant',
        content: 'Welcome to the Analytics Chat! I can help you analyze your igaming data.',
        visualization: {
          type: 'text',
          data: `I can help you analyze:
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
      }]);
    };

    fetchTables();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const queryType = detectQueryType(input);
      const timeframe = detectTimeframe(input);
      
      let response: Message;
      
      switch (queryType) {
        case 'NGR':
          response = {
            role: 'assistant',
            content: `Analyzing NGR data for the specified period...`,
            visualization: {
              type: 'bar',
              title: 'Top Affiliates by NGR',
              description: `Showing NGR data from ${formatDate(timeframe.startDate)} to ${formatDate(timeframe.endDate)}`,
              data: {
                categories: ['Affiliate 1', 'Affiliate 2', 'Affiliate 3'],
                data: [
                  { name: 'NGR', value: 50000 },
                  { name: 'NGR', value: 35000 },
                  { name: 'NGR', value: 25000 }
                ]
              },
              metrics: generateMetrics({
                total: 110000,
                average: 36666.67,
                top: 50000
              }, 'NGR')
            }
          };
          break;
          
        case 'GGR':
          response = {
            role: 'assistant',
            content: `Analyzing GGR trends...`,
            visualization: {
              type: 'line',
              title: 'GGR Trend',
              description: `GGR data from ${formatDate(timeframe.startDate)} to ${formatDate(timeframe.endDate)}`,
              data: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                data: [
                  { name: 'GGR', value: 100000 },
                  { name: 'GGR', value: 120000 },
                  { name: 'GGR', value: 90000 },
                  { name: 'GGR', value: 110000 }
                ]
              },
              metrics: generateMetrics({
                total: 420000,
                dailyAverage: 15000,
                highest: 30000
              }, 'GGR')
            }
          };
          break;
          
        case 'FTD':
          response = {
            role: 'assistant',
            content: `Analyzing FTD data...`,
            visualization: {
              type: 'table',
              title: 'First Time Depositors',
              description: `FTD data from ${formatDate(timeframe.startDate)} to ${formatDate(timeframe.endDate)}`,
              data: {
                headers: ['Date', 'FTDs', 'Deposit Amount', 'Average Deposit'],
                rows: [
                  ['2024-01-01', '50', formatCurrency(50000), formatCurrency(1000)],
                  ['2024-01-02', '45', formatCurrency(45000), formatCurrency(1000)],
                  ['2024-01-03', '60', formatCurrency(60000), formatCurrency(1000)]
                ]
              },
              metrics: generateMetrics({
                total: 155,
                averageDeposit: 1000,
                conversionRate: 2.5
              }, 'FTD')
            }
          };
          break;
          
        default:
          response = {
            role: 'assistant',
            content: 'I can help you analyze NGR, GGR, FTDs, registrations, deposits, and cashouts. Try asking about specific metrics.',
            visualization: {
              type: 'text',
              data: 'Try queries like:\n- Show me top 3 affiliates by NGR for last 3 months\n- What\'s the GGR trend for last month?\n- How many FTDs did we have last week?'
            }
          };
      }
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error processing query:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        visualization: {
          type: 'text',
          data: 'Error occurred'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat Panel */}
      <div className="w-1/2 border-r p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Analytics Chat</h1>
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Card key={index} className={`p-4 ${message.role === 'user' ? 'bg-primary/10' : ''}`}>
                <p className="font-semibold">{message.role === 'user' ? 'You' : 'Assistant'}</p>
                <p>{message.content}</p>
              </Card>
            ))}
            {isLoading && (
              <Card className="p-4">
                <p>Analyzing data...</p>
              </Card>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data (e.g., 'Show me top 3 affiliates by NGR for last 3 months')"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>

      {/* Visualization Panel */}
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4">Visualization</h2>
        <ScrollArea className="h-full">
          {messages.length > 0 && messages[messages.length - 1].visualization && (
            <Card className="p-4">
              {messages[messages.length - 1].visualization?.title && (
                <h3 className="text-xl font-semibold mb-2">
                  {messages[messages.length - 1].visualization?.title}
                </h3>
              )}
              {messages[messages.length - 1].visualization?.description && (
                <p className="text-sm text-gray-500 mb-4">
                  {messages[messages.length - 1].visualization?.description}
                </p>
              )}
              
              {messages[messages.length - 1].visualization?.metrics && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {messages[messages.length - 1].visualization?.metrics?.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">{metric.name}</p>
                      <p className="text-xl font-semibold">{metric.value}</p>
                      {metric.change && (
                        <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {metric.change}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {messages[messages.length - 1].visualization?.type === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {messages[messages.length - 1].visualization?.data.headers.map((header: string, index: number) => (
                          <th key={index} className="px-4 py-2 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {messages[messages.length - 1].visualization?.data.rows.map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 border-t">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {messages[messages.length - 1].visualization?.type === 'bar' && (
                <BarChart
                  data={messages[messages.length - 1].visualization?.data.data}
                  index="name"
                  categories={messages[messages.length - 1].visualization?.data.categories}
                  colors={["blue"]}
                  valueFormatter={formatCurrency}
                  yAxisWidth={60}
                />
              )}
              
              {messages[messages.length - 1].visualization?.type === 'line' && (
                <LineChart
                  data={messages[messages.length - 1].visualization?.data.data}
                  index="name"
                  categories={messages[messages.length - 1].visualization?.data.categories}
                  colors={["blue"]}
                  valueFormatter={formatCurrency}
                  yAxisWidth={60}
                />
              )}
              
              {messages[messages.length - 1].visualization?.type === 'text' && (
                <pre className="whitespace-pre-wrap">{messages[messages.length - 1].visualization?.data}</pre>
              )}
            </Card>
          )}
        </ScrollArea>
      </div>
    </div>
  );
} 