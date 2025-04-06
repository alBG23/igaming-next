
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Settings, 
  Trash2, 
  AlertCircle,
  Filter,
  Send,
  MessageSquare,
  Mail,
  Send as Telegram,  
  Copy,
  Eye
} from 'lucide-react';

export default function AlertsManagement() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertMetric, setNewAlertMetric] = useState('deposits');
  const [newAlertCondition, setNewAlertCondition] = useState('below');
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [newAlertTimeframe, setNewAlertTimeframe] = useState('24h');
  const [newAlertSeverity, setNewAlertSeverity] = useState('medium');
  const [newAlertChannels, setNewAlertChannels] = useState({
    email: true,
    telegram: false
  });
  const [newAlertRecipients, setNewAlertRecipients] = useState({
    email: '',
    telegram: ''
  });

  const alertsData = {
    active: [
      {
        id: 1,
        name: 'Deposit Volume Drop',
        metric: 'deposits',
        condition: 'below',
        threshold: '5000',
        timeframe: '24h',
        severity: 'high',
        enabled: true,
        lastTriggered: '2023-04-10T14:22:00Z',
        channels: ['email', 'telegram'],
        recipients: {
          email: 'alerts@example.com',
          telegram: '@igaming_alerts'
        }
      },
      {
        id: 2,
        name: 'New Player Registration Spike',
        metric: 'registrations',
        condition: 'above',
        threshold: '200',
        timeframe: '1h',
        severity: 'medium',
        enabled: true,
        lastTriggered: null,
        channels: ['email'],
        recipients: {
          email: 'marketing@example.com'
        }
      },
      {
        id: 3,
        name: 'Payment Processing Error Rate',
        metric: 'payment_errors',
        condition: 'above',
        threshold: '5',
        timeframe: '1h',
        severity: 'critical',
        enabled: true,
        lastTriggered: '2023-04-12T08:45:00Z',
        channels: ['email', 'telegram'],
        recipients: {
          email: 'payments@example.com,support@example.com',
          telegram: '@payments_team'
        }
      }
    ],
    history: [
      {
        id: 101,
        alertName: 'Deposit Volume Drop',
        triggeredAt: '2023-04-10T14:22:00Z',
        value: '4250',
        threshold: '5000',
        condition: 'below',
        status: 'resolved',
        resolvedAt: '2023-04-10T16:30:00Z',
        resolvedBy: 'john.smith@example.com',
        notificationsSent: ['email', 'telegram'],
        notes: 'False alarm due to scheduled maintenance'
      },
      {
        id: 102,
        alertName: 'Payment Processing Error Rate',
        triggeredAt: '2023-04-12T08:45:00Z',
        value: '8.7',
        threshold: '5',
        condition: 'above',
        status: 'acknowledged',
        resolvedAt: null,
        resolvedBy: null,
        notificationsSent: ['email', 'telegram'],
        notes: 'Investigating with payment processor'
      },
      {
        id: 103,
        alertName: 'NGR Drop',
        triggeredAt: '2023-04-05T10:12:00Z',
        value: '15240',
        threshold: '18000',
        condition: 'below',
        status: 'resolved',
        resolvedAt: '2023-04-05T14:30:00Z',
        resolvedBy: 'jane.doe@example.com',
        notificationsSent: ['email'],
        notes: 'Expected seasonal fluctuation'
      }
    ],
    muted: [
      {
        id: 4,
        name: 'New User Conversion Rate',
        metric: 'conversion_rate',
        condition: 'below',
        threshold: '12',
        timeframe: '24h',
        severity: 'low',
        enabled: false,
        lastTriggered: '2023-03-28T09:15:00Z',
        mutedUntil: '2023-05-15T00:00:00Z',
        channels: ['email'],
        recipients: {
          email: 'product@example.com'
        }
      }
    ]
  };

  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert);
  };

  const handleCreateAlert = () => {
    console.log('Creating alert with:', {
      name: newAlertName,
      metric: newAlertMetric,
      condition: newAlertCondition,
      threshold: newAlertThreshold,
      timeframe: newAlertTimeframe,
      severity: newAlertSeverity,
      channels: Object.keys(newAlertChannels).filter(channel => newAlertChannels[channel]),
      recipients: newAlertRecipients
    });
    
    setNewAlertName('');
    setNewAlertMetric('deposits');
    setNewAlertCondition('below');
    setNewAlertThreshold('');
    setNewAlertTimeframe('24h');
    setNewAlertSeverity('medium');
    setNewAlertChannels({ email: true, telegram: false });
    setNewAlertRecipients({ email: '', telegram: '' });
    setIsCreating(false);
  };

  const renderSeverityBadge = (severity) => {
    const severityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={severityColors[severity] || 'bg-gray-100'}>
        {severity}
      </Badge>
    );
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      triggered: 'bg-red-100 text-red-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts Management</h1>
            <p className="text-gray-500">Configure and monitor custom alerts for your key metrics</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                  <DialogDescription>
                    Set up an alert to notify you when metrics cross thresholds
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-name">Alert Name</Label>
                    <Input 
                      id="alert-name" 
                      placeholder="e.g., Low Deposit Volume Alert" 
                      value={newAlertName}
                      onChange={(e) => setNewAlertName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="metric">Metric</Label>
                      <Select value={newAlertMetric} onValueChange={setNewAlertMetric}>
                        <SelectTrigger id="metric">
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposits">Deposits</SelectItem>
                          <SelectItem value="registrations">Registrations</SelectItem>
                          <SelectItem value="payment_errors">Payment Errors</SelectItem>
                          <SelectItem value="ggr">GGR</SelectItem>
                          <SelectItem value="ngr">NGR</SelectItem>
                          <SelectItem value="active_players">Active Players</SelectItem>
                          <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={newAlertCondition} onValueChange={setNewAlertCondition}>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                          <SelectItem value="equal">Equal to</SelectItem>
                          <SelectItem value="percentage_change">% Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Threshold Value</Label>
                      <Input 
                        id="threshold" 
                        placeholder="e.g., 5000" 
                        value={newAlertThreshold}
                        onChange={(e) => setNewAlertThreshold(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Time Period</Label>
                      <Select value={newAlertTimeframe} onValueChange={setNewAlertTimeframe}>
                        <SelectTrigger id="timeframe">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="4h">4 Hours</SelectItem>
                          <SelectItem value="12h">12 Hours</SelectItem>
                          <SelectItem value="24h">24 Hours</SelectItem>
                          <SelectItem value="7d">7 Days</SelectItem>
                          <SelectItem value="30d">30 Days</SelectItem>
                          <SelectItem value="cy">Current Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={newAlertSeverity} onValueChange={setNewAlertSeverity}>
                      <SelectTrigger id="severity">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>Notification Channels</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="email-notifications" 
                        checked={newAlertChannels.email}
                        onCheckedChange={(checked) => 
                          setNewAlertChannels({...newAlertChannels, email: checked})
                        }
                      />
                      <Label htmlFor="email-notifications" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                    </div>
                    
                    {newAlertChannels.email && (
                      <div className="ml-6 mt-2">
                        <Label htmlFor="email-recipients" className="text-sm">
                          Email Recipients (comma-separated)
                        </Label>
                        <Input 
                          id="email-recipients" 
                          placeholder="e.g., alerts@example.com,team@example.com" 
                          className="mt-1"
                          value={newAlertRecipients.email}
                          onChange={(e) => 
                            setNewAlertRecipients({...newAlertRecipients, email: e.target.value})
                          }
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="telegram-notifications" 
                        checked={newAlertChannels.telegram}
                        onCheckedChange={(checked) => 
                          setNewAlertChannels({...newAlertChannels, telegram: checked})
                        }
                      />
                      <Label htmlFor="telegram-notifications" className="flex items-center gap-2">
                        <Telegram className="h-4 w-4" />
                        Telegram Notifications
                      </Label>
                    </div>
                    
                    {newAlertChannels.telegram && (
                      <div className="ml-6 mt-2">
                        <Label htmlFor="telegram-chat" className="text-sm">
                          Telegram Chat ID or Username
                        </Label>
                        <Input 
                          id="telegram-chat" 
                          placeholder="e.g., @your_channel or -1001234567890" 
                          className="mt-1"
                          value={newAlertRecipients.telegram}
                          onChange={(e) => 
                            setNewAlertRecipients({...newAlertRecipients, telegram: e.target.value})
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAlert}
                    disabled={!newAlertName || !newAlertThreshold}
                  >
                    Create Alert
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Alerts</CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                    <TabsTrigger value="active" className="flex items-center gap-1">
                      <Bell className="h-4 w-4" />
                      Active Alerts
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Alert History
                    </TabsTrigger>
                    <TabsTrigger value="muted" className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Muted Alerts
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="mt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Alert Name</TableHead>
                          <TableHead>Metric</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Last Triggered</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertsData.active.map((alert) => (
                          <TableRow 
                            key={alert.id}
                            className={`cursor-pointer ${selectedAlert?.id === alert.id ? 'bg-indigo-50' : ''}`}
                            onClick={() => handleSelectAlert(alert)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1">
                                <span>{alert.name}</span>
                                {alert.enabled ? (
                                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-700 border-gray-200">
                                    Paused
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{alert.metric.replace('_', ' ')}</TableCell>
                            <TableCell>
                              {alert.condition} {alert.threshold}
                            </TableCell>
                            <TableCell>{renderSeverityBadge(alert.severity)}</TableCell>
                            <TableCell>{formatDate(alert.lastTriggered)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {alert.lastTriggered ? (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Triggered
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800">
                                    Normal
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-0">
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Alert Name</TableHead>
                            <TableHead>Triggered At</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Resolved At</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alertsData.history.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">{event.alertName}</TableCell>
                              <TableCell>{formatDate(event.triggeredAt)}</TableCell>
                              <TableCell>
                                {event.value} 
                                <span className="text-xs text-gray-500 ml-1">
                                  ({event.condition} {event.threshold})
                                </span>
                              </TableCell>
                              <TableCell>{renderStatusBadge(event.status)}</TableCell>
                              <TableCell>{formatDate(event.resolvedAt)}</TableCell>
                              <TableCell className="max-w-xs truncate" title={event.notes}>
                                {event.notes}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="muted" className="mt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Alert Name</TableHead>
                          <TableHead>Metric</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Muted Until</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertsData.muted.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell className="font-medium">{alert.name}</TableCell>
                            <TableCell>{alert.metric.replace('_', ' ')}</TableCell>
                            <TableCell>
                              {alert.condition} {alert.threshold}
                            </TableCell>
                            <TableCell>{renderSeverityBadge(alert.severity)}</TableCell>
                            <TableCell>{formatDate(alert.mutedUntil)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Unmute
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardHeader>
              <CardContent>
                {/* Keep any content here that's outside of TabsContent */}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Alert Analytics</CardTitle>
                <CardDescription>
                  Understand your alert patterns and effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Most Triggered Alert</div>
                    <div className="font-bold">Payment Processing Error Rate</div>
                    <div className="text-xs text-gray-500 mt-1">12 triggers this month</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Resolution Time</div>
                    <div className="font-bold">1h 42m</div>
                    <div className="text-xs text-green-600 mt-1">
                      -12% from previous month
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">False Positive Rate</div>
                    <div className="font-bold">18%</div>
                    <div className="text-xs text-orange-600 mt-1">
                      +3% from previous month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedAlert ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alert Details</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">{selectedAlert.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderSeverityBadge(selectedAlert.severity)}
                        {selectedAlert.enabled ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Paused
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Metric:</span>
                        <span className="font-medium">{selectedAlert.metric.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Condition:</span>
                        <span className="font-medium">
                          {selectedAlert.condition} {selectedAlert.threshold}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timeframe:</span>
                        <span className="font-medium">{selectedAlert.timeframe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Triggered:</span>
                        <span className="font-medium">{formatDate(selectedAlert.lastTriggered)}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Notification Channels</h4>
                      <div className="space-y-2">
                        {selectedAlert.channels.includes('email') && (
                          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div className="flex-1 text-sm truncate" title={selectedAlert.recipients.email}>
                              {selectedAlert.recipients.email}
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {selectedAlert.channels.includes('telegram') && (
                          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <Telegram className="h-4 w-4 text-gray-500" />
                            <div className="flex-1 text-sm">
                              {selectedAlert.recipients.telegram}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    Edit
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                      <Clock className="h-4 w-4 mr-1" />
                      Mute
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Alert Selected</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Select an alert from the list to view its details and manage its settings.
                  </p>
                  <Button variant="outline" onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Alert
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Test Alert Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-channel">Notification Channel</Label>
                    <Select defaultValue="email">
                      <SelectTrigger id="test-channel">
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-recipient">Recipient</Label>
                    <Input id="test-recipient" placeholder="e.g., your@email.com" />
                  </div>
                  
                  <Button className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Send Test Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
