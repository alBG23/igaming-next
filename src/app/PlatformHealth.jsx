
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { PlatformIntegration } from '@/api/entities';
import { AffiliateProgram } from '@/api/entities';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCw, 
  Layers, 
  Database,
  Activity, 
  RefreshCw,
  CpuIcon,
  NetworkIcon,
  BarChart4,
  CircleAlert,
  ServerCrash,
  HardDrive,
  Cpu,
  Shield
} from "lucide-react";

import UserSessionMonitor from '../components/security/UserSessionMonitor';

export default function PlatformHealth() {
  const [integrations, setIntegrations] = useState([]);
  const [affiliatePrograms, setAffiliatePrograms] = useState([]);
  const [systemStats, setSystemStats] = useState({
    cpu: { current: 24, threshold: 80 },
    memory: { current: 42, threshold: 80 },
    storage: { current: 67, threshold: 90 },
    concurrentUsers: { current: 126, max: 500 },
    requestsPerMinute: { current: 1243, max: 5000 },
    avgResponseTime: { current: 187, threshold: 500 },
  });
  const [integrationHealth, setIntegrationHealth] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    failed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('integrations');

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'high',
      title: 'SoftSwiss API Timeout',
      description: 'The last 3 attempts to sync data from SoftSwiss timed out after 30 seconds',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'open'
    },
    {
      id: 2,
      severity: 'medium',
      title: 'Database Storage Approaching Limit',
      description: 'Current database storage usage is at 67%, projected to reach 80% within 14 days',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'open'
    },
    {
      id: 3,
      severity: 'low',
      title: 'Response Time Degradation',
      description: 'Average response time has increased by 15% in the last 24 hours',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'acknowledged'
    },
  ]);

  const [dataValidation, setDataValidation] = useState({
    syncIssues: [],
    reconciliationOverview: {
      totalRecords: 0,
      mismatches: 0,
      resolved: 0,
      unresolved: 0
    }
  });

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const platformData = await PlatformIntegration.list();
      const affiliateData = await AffiliateProgram.list();
      
      setIntegrations(platformData);
      setAffiliatePrograms(affiliateData);
      
      const integrationStatusCount = calculateIntegrationHealth([...platformData, ...affiliateData]);
      setIntegrationHealth(integrationStatusCount);
      
      // Load data validation and reconciliation data
      await loadDataValidation();
    } catch (error) {
      console.error('Error loading platform health data:', error);
    }
    setIsLoading(false);
  };

  const loadDataValidation = async () => {
    // Logic to fetch and set data validation and reconciliation data
    // Example: Fetch from an API or perform checks
    // const validationData = await fetchDataValidation();
    const validationData = {
      syncIssues: [
        { id: 1, description: 'Data mismatch in Player Metrics', status: 'unresolved' },
      ],
      reconciliationOverview: {
        totalRecords: 5000,
        mismatches: 5,
        resolved: 3,
        unresolved: 2
      }
    };
    setDataValidation(validationData);
  };

  const calculateIntegrationHealth = (allIntegrations) => {
    const counts = {
      total: allIntegrations.length,
      healthy: 0,
      degraded: 0,
      failed: 0
    };
    
    allIntegrations.forEach(integration => {
      if (integration.sync_status === 'active') {
        counts.healthy++;
      } else if (integration.sync_status === 'paused') {
        counts.degraded++;
      } else {
        counts.failed++;
      }
    });
    
    return counts;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-800">Degraded</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'paused':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const handleReconnect = (integrationId) => {
    // This would trigger a reconnection attempt
    alert(`Attempting to reconnect integration ${integrationId}. This would send a reconnect signal to the backend.`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Health</h1>
            <p className="text-gray-500">Monitor system performance and integration status</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Health Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-xl font-bold">Operational</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">All services running normally</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{integrationHealth.healthy}/{integrationHealth.total}</span>
                <span className="text-sm text-gray-500">healthy</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {integrationHealth.degraded > 0 && (
                  <Badge className="bg-amber-100 text-amber-800">
                    {integrationHealth.degraded} degraded
                  </Badge>
                )}
                {integrationHealth.failed > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {integrationHealth.failed} failed
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{systemStats.cpu.current}%</span>
                <span className="text-sm text-gray-500">of {systemStats.cpu.threshold}% threshold</span>
              </div>
              <Progress 
                value={systemStats.cpu.current} 
                max={100} 
                className="h-2 mt-2" 
                indicatorClassName={systemStats.cpu.current > systemStats.cpu.threshold ? "bg-red-500" : ""}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{systemStats.memory.current}%</span>
                <span className="text-sm text-gray-500">of {systemStats.memory.threshold}% threshold</span>
              </div>
              <Progress 
                value={systemStats.memory.current} 
                max={100} 
                className="h-2 mt-2" 
                indicatorClassName={systemStats.memory.current > systemStats.memory.threshold ? "bg-red-500" : ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Data Validation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Data Validation and Reconciliation</CardTitle>
            <CardDescription>
              Overview of data sync issues and reconciliation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Reconciliation Overview</h3>
              <div className="flex justify-between">
                <span>Total Records:</span>
                <span>{dataValidation.reconciliationOverview.totalRecords}</span>
              </div>
              <div className="flex justify-between">
                <span>Mismatches:</span>
                <span>{dataValidation.reconciliationOverview.mismatches}</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved:</span>
                <span>{dataValidation.reconciliationOverview.resolved}</span>
              </div>
              <div className="flex justify-between">
                <span>Unresolved:</span>
                <span>{dataValidation.reconciliationOverview.unresolved}</span>
              </div>
              <h3 className="text-lg font-medium mt-6">Sync Issues</h3>
              {dataValidation.syncIssues.length > 0 ? (
                dataValidation.syncIssues.map(issue => (
                  <div key={issue.id} className="flex justify-between border-b py-2">
                    <span>{issue.description}</span>
                    <Badge className={`text-xs ${issue.status === 'unresolved' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p>No sync issues detected.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Section */}
        {alerts.filter(alert => alert.status !== 'resolved').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Active Alerts
            </h2>
            
            {alerts.filter(alert => alert.status !== 'resolved').map(alert => (
              <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {alert.title}
                  <Badge className={
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' : 
                    alert.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 
                    'bg-blue-100 text-blue-800'
                  }>
                    {alert.severity} severity
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-1">{alert.description}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Detected {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="system">System Metrics</TabsTrigger>
            <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>
                  Status of all platform integrations and data connectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Integration</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sync</TableHead>
                        <TableHead>Sync Frequency</TableHead>
                        <TableHead>Data Points</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...integrations, ...affiliatePrograms].map((integration) => (
                        <TableRow key={integration.id} className={integration.sync_status === 'error' ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">
                            {integration.platform_name || integration.program_name}
                          </TableCell>
                          <TableCell>
                            {integration.platform_name ? 'Gaming Platform' : 'Affiliate Program'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(integration.sync_status)}
                              {getStatusBadge(integration.sync_status)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(integration.last_sync)}</TableCell>
                          <TableCell className="capitalize">{integration.sync_frequency || 'daily'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {integration.data_points?.slice(0, 3).map((point, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {point}
                                </Badge>
                              ))}
                              {integration.data_points?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{integration.data_points.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {integration.sync_status === 'error' ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleReconnect(integration.id)}
                              >
                                <RotateCw className="mr-1 h-3 w-3" />
                                Reconnect
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Layers className="mr-1 h-3 w-3" />
                                Details
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-indigo-500" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">CPU Utilization</span>
                        <span className="text-sm">{systemStats.cpu.current}%</span>
                      </div>
                      <Progress 
                        value={systemStats.cpu.current} 
                        max={100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm">{systemStats.memory.current}%</span>
                      </div>
                      <Progress 
                        value={systemStats.memory.current} 
                        max={100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Storage</span>
                        <span className="text-sm">{systemStats.storage.current}%</span>
                      </div>
                      <Progress 
                        value={systemStats.storage.current} 
                        max={100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Concurrent Users</div>
                        <div className="text-2xl font-bold">{systemStats.concurrentUsers.current}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Max Capacity</div>
                        <div className="text-2xl font-bold">{systemStats.concurrentUsers.max}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Requests Per Minute</div>
                        <div className="text-2xl font-bold">{systemStats.requestsPerMinute.current}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Capacity</div>
                        <div className="text-2xl font-bold">{systemStats.requestsPerMinute.max}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Avg. Response Time</div>
                        <div className="text-2xl font-bold">{systemStats.avgResponseTime.current} ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Threshold</div>
                        <div className="text-2xl font-bold">{systemStats.avgResponseTime.threshold} ms</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>System Uptime</CardTitle>
                <CardDescription>
                  Continuous operation status for all system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Last Restart</TableHead>
                      <TableHead>SLA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">API Gateway</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Operational</span>
                        </div>
                      </TableCell>
                      <TableCell>99.98%</TableCell>
                      <TableCell>14 days ago</TableCell>
                      <TableCell>99.9%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Database Cluster</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Operational</span>
                        </div>
                      </TableCell>
                      <TableCell>99.99%</TableCell>
                      <TableCell>30 days ago</TableCell>
                      <TableCell>99.99%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ETL Pipeline</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Operational</span>
                        </div>
                      </TableCell>
                      <TableCell>99.95%</TableCell>
                      <TableCell>7 days ago</TableCell>
                      <TableCell>99.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Analytics Engine</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Operational</span>
                        </div>
                      </TableCell>
                      <TableCell>99.93%</TableCell>
                      <TableCell>10 days ago</TableCell>
                      <TableCell>99.5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dataflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Synchronization Status</CardTitle>
                <CardDescription>
                  Current state of data flows between systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Records Processed</TableHead>
                      <TableHead>Avg Processing Time</TableHead>
                      <TableHead>Failures</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">SoftSwiss</TableCell>
                      <TableCell>Analytics Database</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                      </TableCell>
                      <TableCell>10 minutes ago</TableCell>
                      <TableCell>12,457</TableCell>
                      <TableCell>3.2s</TableCell>
                      <TableCell>0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Affiliate API</TableCell>
                      <TableCell>Analytics Database</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <Badge className="bg-amber-100 text-amber-800">Degraded</Badge>
                        </div>
                      </TableCell>
                      <TableCell>1 hour ago</TableCell>
                      <TableCell>3,128</TableCell>
                      <TableCell>6.7s</TableCell>
                      <TableCell>12</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Payment Gateway</TableCell>
                      <TableCell>Analytics Database</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                      </TableCell>
                      <TableCell>25 minutes ago</TableCell>
                      <TableCell>4,621</TableCell>
                      <TableCell>2.1s</TableCell>
                      <TableCell>0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Game Provider API</TableCell>
                      <TableCell>Analytics Database</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <Badge className="bg-red-100 text-red-800">Failed</Badge>
                        </div>
                      </TableCell>
                      <TableCell>3 hours ago</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>--</TableCell>
                      <TableCell>5</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <RotateCw className="mr-2 h-4 w-4" />
                  Force Sync All
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  Recent system and integration logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-md p-4 bg-gray-50">
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 14:32:15]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>SoftSwiss data sync completed successfully. Processed 12,457 records.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 13:45:08]</span>
                      <span className="text-amber-600 min-w-[80px]">WARN</span>
                      <span>Affiliate API response time above threshold (6.7s &gt; 5.0s).</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 13:32:22]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>Payment Gateway data sync completed. Processed 4,621 transactions.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 12:15:33]</span>
                      <span className="text-red-600 min-w-[80px]">ERROR</span>
                      <span>Game Provider API connection timeout after 30s. Retry attempt 1/3.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 12:17:40]</span>
                      <span className="text-red-600 min-w-[80px]">ERROR</span>
                      <span>Game Provider API connection timeout after 30s. Retry attempt 2/3.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 12:19:47]</span>
                      <span className="text-red-600 min-w-[80px]">ERROR</span>
                      <span>Game Provider API connection timeout after 30s. Retry attempt 3/3. Giving up.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 11:45:12]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>System resources check completed. CPU: 24%, Memory: 42%, Storage: 67%.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 11:30:00]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>Scheduled maintenance mode deactivated. All services back online.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 11:00:00]</span>
                      <span className="text-blue-600 min-w-[80px]">DEBUG</span>
                      <span>Scheduled maintenance mode activated. Database optimizations in progress.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 10:45:22]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>User jsmith@example.com accessed Player Analytics module.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 10:32:15]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>Daily analytics report generation completed. Report ID: RPT-20240120.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 10:15:07]</span>
                      <span className="text-amber-600 min-w-[80px]">WARN</span>
                      <span>High database load detected during peak hours. Consider query optimization.</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 min-w-[180px]">[2024-01-20 09:30:45]</span>
                      <span className="text-green-600 min-w-[80px]">INFO</span>
                      <span>User admin@casino.com reset authentication credentials for user analyst@casino.com.</span>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
