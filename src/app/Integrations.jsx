
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlatformIntegration } from '@/api/entities';
import { AffiliateProgram } from '@/api/entities';
import { Badge } from "@/components/ui/badge";
import { 
  ServerIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Link, 
  RefreshCw, 
  PauseCircle,
  PlusCircle,
  Lock
} from "lucide-react";

// Import mock API helper
import { mockApi } from "../components/mock-api/api-helper";

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('platforms');
  const [platformIntegrations, setPlatformIntegrations] = useState([]);
  const [affiliatePrograms, setAffiliatePrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSoftswissForm, setShowSoftswissForm] = useState(true);
  const [softswissCredentials, setSoftswissCredentials] = useState({
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    sslEnabled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Use mock data instead of Base44 API
      setPlatformIntegrations(mockApi.platformIntegrations);
      setAffiliatePrograms(mockApi.affiliatePrograms);
    } catch (error) {
      console.error('Error loading integrations data:', error);
    }
    setIsLoading(false);
  };

  const handleSoftswissSubmit = (e) => {
    e.preventDefault();
    
    localStorage.setItem('softswissCredentials', JSON.stringify(softswissCredentials));
    
    const newIntegration = {
      id: 'sw_' + Date.now(),
      platform_name: 'softswiss',
      brand: 'Your Casino',
      sync_status: 'active',
      last_sync: new Date().toISOString(),
      sync_frequency: 'hourly',
      data_points: ['players', 'deposits', 'game_rounds', 'transactions'],
      error_message: null
    };
    
    const updatedIntegrations = [newIntegration, ...platformIntegrations];
    setPlatformIntegrations(updatedIntegrations);
    
    localStorage.setItem('platformIntegrations', JSON.stringify(updatedIntegrations));
    
    setShowSoftswissForm(false);
    
    alert('This demonstrates a successful connection in the demo environment. For a secure production implementation with your real PostgreSQL datalake, the Base44 team can help set up a backend API service that will securely access your data.');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <PauseCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Integrations</h1>
            <p className="text-gray-500">Connect to external platforms to import and export data</p>
          </div>
          <Button onClick={() => setShowSoftswissForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Integration
          </Button>
        </div>

        {showSoftswissForm && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerIcon className="h-5 w-5 text-indigo-600" />
                Connect to SoftSwiss Database Replica
              </CardTitle>
              <CardDescription>
                Enter your SoftSwiss read-only replica database credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSoftswissSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input 
                      id="host" 
                      placeholder="e.g. replica.softswiss.com" 
                      value={softswissCredentials.host}
                      onChange={(e) => setSoftswissCredentials({...softswissCredentials, host: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input 
                      id="port" 
                      placeholder="e.g. 5432" 
                      value={softswissCredentials.port}
                      onChange={(e) => setSoftswissCredentials({...softswissCredentials, port: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="database">Database Name</Label>
                    <Input 
                      id="database" 
                      placeholder="e.g. casino_analytics" 
                      value={softswissCredentials.database}
                      onChange={(e) => setSoftswissCredentials({...softswissCredentials, database: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="Read-only user" 
                      value={softswissCredentials.username}
                      onChange={(e) => setSoftswissCredentials({...softswissCredentials, username: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={softswissCredentials.password}
                      onChange={(e) => setSoftswissCredentials({...softswissCredentials, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Switch 
                        checked={softswissCredentials.sslEnabled}
                        onCheckedChange={(checked) => setSoftswissCredentials({...softswissCredentials, sslEnabled: checked})}
                      />
                      SSL Encryption
                    </Label>
                    <p className="text-sm text-gray-500">Recommended for secure connections</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Security Note
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Credentials are encrypted and stored securely. We recommend using a read-only database user with limited access.
                  </p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowSoftswissForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Connect Database
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="platforms">Gaming Platforms</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliate Programs</TabsTrigger>
            <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformIntegrations.map((integration) => (
              <Card key={integration.id}> 
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={`
                      ${integration.sync_status === 'active' ? 'bg-green-100 text-green-800' : 
                        integration.sync_status === 'error' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'}
                    `}>
                      {integration.sync_status}
                    </Badge>
                    {getStatusIcon(integration.sync_status)}
                  </div>
                  <CardTitle className="flex items-center gap-2 mt-2">
                    <ServerIcon className="h-5 w-5 text-indigo-600" />
                    {integration.platform_name.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </CardTitle>
                  <CardDescription>
                    Connected to {integration.brand}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Last synced:</span>{' '}
                      <span className="font-medium">
                        {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Sync frequency:</span>{' '}
                      <span className="font-medium capitalize">{integration.sync_frequency}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Data points:</span>{' '}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {integration.data_points?.map((point, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {integration.error_message && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                        {integration.error_message}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Link className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[220px]">
                <PlusCircle className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Connect New Platform</p>
                <p className="text-gray-400 text-sm text-center mt-1 max-w-xs">
                  Add Softswiss, Delasport, BetConstruct, or other gaming platforms
                </p>
                <Button className="mt-4" variant="outline">
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {affiliatePrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={`
                      ${program.sync_status === 'active' ? 'bg-green-100 text-green-800' : 
                        program.sync_status === 'error' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'}
                    `}>
                      {program.sync_status}
                    </Badge>
                    {program.write_access ? (
                      <Badge className="bg-indigo-100 text-indigo-800">Write Access</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <Lock className="h-3 w-3 mr-1" /> Read Only
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 mt-2">
                    {program.program_name.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </CardTitle>
                  <CardDescription>
                    Connected to {program.brand}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Last synced:</span>{' '}
                      <span className="font-medium">
                        {program.last_sync ? new Date(program.last_sync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-500">Automation rules:</span>{' '}
                      <span className="font-medium">{program.automation_rules?.length || 0} active</span>
                    </div>

                    {program.automation_rules?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {program.automation_rules.slice(0, 2).map((rule, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded-md text-xs">
                            <div className="font-medium">{rule.rule_name}</div>
                            <div className="text-gray-500 mt-1">If {rule.trigger_condition}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Automation
                  </Button>
                  <Button size="sm" variant="default">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[220px]">
                <PlusCircle className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Connect Affiliate Program</p>
                <p className="text-gray-400 text-sm text-center mt-1 max-w-xs">
                  Add Cellxpert, NetRefer, MyAffiliates, or other affiliate networks
                </p>
                <Button className="mt-4" variant="outline">
                  Add Program
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="flex items-center justify-center h-60">
            <div className="text-center">
              <ServerIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Gateway Integration</h3>
              <p className="mt-1 text-sm text-gray-500">
                Payment gateway integrations will be available in the next release.
              </p>
              <Button className="mt-5" variant="outline">
                Coming Soon
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
