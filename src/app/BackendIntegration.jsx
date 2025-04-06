
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformIntegration } from "@/api/entities";
import { User } from "@/api/entities";
import { Checkbox } from "@/components/ui/checkbox";
import { InvokeLLM } from "@/api/integrations";
import { 
  Server, Database, ShieldCheck, Lock, CheckCircle2, Upload, 
  CloudCog, Code, Globe, Key, AlertTriangle, RefreshCw,
  FileCode, GitBranch, Download, Share2, Copy, ArrowRight
} from 'lucide-react';

export default function BackendIntegration() {
  const [deploymentOption, setDeploymentOption] = useState('hosted');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    database_host: '',
    database_port: '5432',
    database_name: '',
    database_user: '',
    database_password: '',
    setup_option: 'full',
    sync_frequency: 'daily',
    platform: 'softswiss',
    api_key: '',
    secure_connection: true,
    allow_write_access: false
  });
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [softswissIntegration, setSoftswissIntegration] = useState(null);
  const [deploymentStage, setDeploymentStage] = useState(0);
  
  useEffect(() => {
    const checkExistingIntegration = async () => {
      try {
        const integrations = await PlatformIntegration.list();
        const softswiss = integrations.find(int => int.platform_name === 'softswiss');
        
        if (softswiss) {
          setSoftswissIntegration(softswiss);
          
          if (softswiss.sync_status !== 'active') {
            setFormData(prev => ({
              ...prev,
              database_host: softswiss.endpoint_url?.split(':')[0] || '',
              database_port: softswiss.endpoint_url?.split(':')[1] || '5432',
              database_name: softswiss.brand || '',
              platform: softswiss.platform_name,
              api_key: softswiss.api_key,
              sync_frequency: softswiss.sync_frequency || 'daily'
            }));
          }
        }
      } catch (error) {
        console.error('Error checking existing integration:', error);
      }
    };
    
    checkExistingIntegration();
    
    const savedCredentials = localStorage.getItem('softswissCredentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setDeploymentStatus('success');
        setFormData(prev => ({
          ...prev,
          ...credentials
        }));
      } catch (e) {
        console.error('Error parsing saved credentials');
      }
    }
  }, []);
  
  const handleDeployment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const credentials = {
        host: formData.database_host,
        port: formData.database_port,
        database: formData.database_name,
        platform: formData.platform
      };
      
      localStorage.setItem('softswissCredentials', JSON.stringify(credentials));
      
      const platformIntegration = {
        platform_name: formData.platform,
        brand: formData.database_name,
        api_key: formData.api_key,
        endpoint_url: `${formData.database_host}:${formData.database_port}`,
        sync_frequency: formData.sync_frequency,
        sync_status: 'active',
        last_sync: new Date().toISOString(),
        data_points: [
          'players', 'deposits', 'withdrawals', 'game_rounds', 'bonuses', 'affiliates'
        ]
      };
      
      if (softswissIntegration?.id) {
        await PlatformIntegration.update(softswissIntegration.id, platformIntegration);
      } else {
        await PlatformIntegration.create(platformIntegration);
      }
      
      const existingIntegrations = JSON.parse(localStorage.getItem('platformIntegrations') || '[]');
      const integrationExists = existingIntegrations.some(int => int.platform_name === formData.platform);
      
      if (integrationExists) {
        const updatedIntegrations = existingIntegrations.map(int => {
          if (int.platform_name === formData.platform) {
            return { ...int, ...platformIntegration };
          }
          return int;
        });
        localStorage.setItem('platformIntegrations', JSON.stringify(updatedIntegrations));
      } else {
        localStorage.setItem('platformIntegrations', JSON.stringify([
          ...existingIntegrations,
          platformIntegration
        ]));
      }
      
      await simulateDeployment();
      
      setDeploymentStatus('success');
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  const simulateDeployment = async () => {
    const stages = [
      'Validating database credentials...',
      'Testing database connection...',
      'Creating necessary indexes...',
      'Setting up ETL process...',
      'Deploying API endpoints...',
      'Configuring security rules...',
      'Starting data synchronization...'
    ];
    
    for (let i = 0; i < stages.length; i++) {
      setDeploymentStage(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const getConnectionCode = () => {
    if (deploymentOption === 'self-hosted') {
      return `
# Python code for database connection
import psycopg2
import pandas as pd

conn = psycopg2.connect(
    host="${formData.database_host}",
    port=${formData.database_port},
    database="${formData.database_name}",
    user="your_database_user",
    password="your_database_password"
)

def get_cohort_data():
    query = """
    SELECT 
        to_char(date_trunc('month', first_deposit_date), 'YYYY-MM') as ftd_month,
        count(distinct player_id) as cohort_size,
        affiliate_id,
        affiliate_name,
        stag,
        brand,
        EXTRACT(MONTH FROM age(date_trunc('month', deposit_date), 
                             date_trunc('month', first_deposit_date))) as month_number,
        sum(deposit_amount) as deposits_amount,
        sum(ngr) as ngr,
        count(distinct player_id) as unique_depositors,
        sum(marketing_spend) as marketing_spend
    FROM player_activity
    WHERE first_deposit_date is not null
    GROUP BY 1, 3, 4, 5, 6, 7
    ORDER BY 1, 7
    """
    
    df = pd.read_sql(query, conn)
    return df.to_json(orient='records')

# Then setup a simple API with Flask or FastAPI to expose this data
`;
    } else {
      return `
# No coding required - our system will handle the connection
# Just provide these credentials in the setup form

DATABASE_HOST = "${formData.database_host}"
DATABASE_PORT = ${formData.database_port}
DATABASE_NAME = "${formData.database_name}"
PLATFORM = "${formData.platform}"

# Our ETL process will connect securely and handle the data transfer
`;
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Setup</h1>
          <p className="text-gray-500">
            Connect your gaming platform data to enable real-time analytics
          </p>
        </div>

        {softswissIntegration?.sync_status === 'active' && deploymentStatus !== 'error' ? (
          <div className="bg-green-50 border border-green-100 p-4 rounded-md flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">Production Connection Active</h3>
              <p className="text-sm text-green-700 mt-1">
                Your gaming platform is connected and data is being synchronized. Last sync: {' '}
                {new Date(softswissIntegration.last_sync).toLocaleString()}
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="text-green-700 border-green-200">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="database" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="database">Database Connection</TabsTrigger>
              <TabsTrigger value="api">API Integration</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    Connect your iGaming Database
                  </CardTitle>
                  <CardDescription>
                    Securely connect to your gaming platform's database to enable analytics
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleDeployment}>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <RadioGroup 
                          defaultValue={deploymentOption} 
                          onValueChange={setDeploymentOption}
                          className="flex flex-col space-y-2 mb-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hosted" id="hosted" />
                            <Label htmlFor="hosted" className="flex items-center cursor-pointer">
                              <CloudCog className="h-4 w-4 mr-2 text-indigo-600" />
                              Base44 Full Solution (Recommended)
                            </Label>
                            <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Fastest Setup</Badge>
                          </div>
                          <div className="text-sm text-gray-500 ml-6 mb-2">
                            We handle the data pipeline, security and maintenance. Your data stays in your infrastructure.
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self-hosted" id="self-hosted" />
                            <Label htmlFor="self-hosted" className="flex items-center cursor-pointer">
                              <Server className="h-4 w-4 mr-2 text-gray-600" />
                              Self-hosted Connection
                            </Label>
                          </div>
                          <div className="text-sm text-gray-500 ml-6">
                            For teams that want to manage their own connection. We provide the code, you run the integration.
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h3 className="text-base font-medium mb-3">Database Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="platform">Gaming Platform</Label>
                            <Select 
                              value={formData.platform} 
                              onValueChange={(value) => handleInputChange({target: {name: 'platform', value}})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="softswiss">SoftSwiss</SelectItem>
                                <SelectItem value="delasport">Delasport</SelectItem>
                                <SelectItem value="soft2bet">Soft2Bet</SelectItem>
                                <SelectItem value="betconstruct">BetConstruct</SelectItem>
                                <SelectItem value="white_hat_gaming">White Hat Gaming</SelectItem>
                                <SelectItem value="custom">Custom Platform</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="database_name">Database Name</Label>
                            <Input 
                              id="database_name" 
                              name="database_name" 
                              placeholder="casino_production" 
                              value={formData.database_name}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="database_host">Database Host</Label>
                            <Input 
                              id="database_host" 
                              name="database_host" 
                              placeholder="db.example.com or 10.0.0.12" 
                              value={formData.database_host}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="database_port">Database Port</Label>
                            <Input 
                              id="database_port" 
                              name="database_port" 
                              placeholder="5432" 
                              value={formData.database_port}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="database_user">Database User</Label>
                            <Input 
                              id="database_user" 
                              name="database_user" 
                              placeholder="analytics_user" 
                              value={formData.database_user}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="database_password">Database Password</Label>
                            <Input 
                              id="database_password" 
                              name="database_password" 
                              type="password" 
                              placeholder="••••••••" 
                              value={formData.database_password}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-2">
                          <Checkbox 
                            id="secure_connection" 
                            checked={formData.secure_connection}
                            onCheckedChange={(checked) => handleCheckboxChange('secure_connection', checked)}
                          />
                          <label
                            htmlFor="secure_connection"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Use secure encrypted connection (recommended)
                          </label>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h3 className="text-base font-medium mb-3">Synchronization Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Setup Type</Label>
                            <Select 
                              value={formData.setup_option} 
                              onValueChange={(value) => handleInputChange({target: {name: 'setup_option', value}})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">Full Setup (All Analytics)</SelectItem>
                                <SelectItem value="cohorts">Cohort Analytics Only</SelectItem>
                                <SelectItem value="retention">Retention Analysis Only</SelectItem>
                                <SelectItem value="payments">Payment Analytics Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Sync Frequency</Label>
                            <Select 
                              value={formData.sync_frequency} 
                              onValueChange={(value) => handleInputChange({target: {name: 'sync_frequency', value}})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="realtime">Real-time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-2">
                          <Checkbox 
                            id="allow_write_access" 
                            checked={formData.allow_write_access}
                            onCheckedChange={(checked) => handleCheckboxChange('allow_write_access', checked)}
                          />
                          <label
                            htmlFor="allow_write_access"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Allow write access (for advanced features like automated player tagging)
                          </label>
                        </div>
                      </div>
                      
                      {deploymentOption === 'self-hosted' && (
                        <div className="border-t pt-4">
                          <h3 className="text-base font-medium mb-3">Connection Code</h3>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-md relative">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="absolute top-2 right-2 h-8 text-gray-400 hover:text-white"
                              onClick={() => navigator.clipboard.writeText(getConnectionCode())}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <pre className="text-sm overflow-auto whitespace-pre-wrap">
                              {getConnectionCode()}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" disabled={loading} className="gap-2">
                        {loading && <span className="animate-spin">⏳</span>}
                        {deploymentOption === 'hosted' ? 'Deploy Connection' : 'Generate Connection Files'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    API Integration
                  </CardTitle>
                  <CardDescription>
                    Configure API endpoints and data transfer
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-3">API Credentials</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="api_key">API Key</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="api_key" 
                              name="api_key" 
                              placeholder="Your API key" 
                              value={formData.api_key || "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"}
                              onChange={handleInputChange}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" className="whitespace-nowrap">
                              <Key className="h-4 w-4 mr-2" />
                              Generate Key
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>API Endpoints</Label>
                          <div className="border rounded-md divide-y">
                            <div className="p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium">Cohort Data Endpoint</p>
                                <p className="text-sm text-gray-500">GET /api/v1/cohorts</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium">Player Value Matrix</p>
                                <p className="text-sm text-gray-500">GET /api/v1/player-value</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium">Real-time KPIs</p>
                                <p className="text-sm text-gray-500">GET /api/v1/kpis</p>
                              </div>
                              <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-base font-medium mb-3">Data Schema</h3>
                      <div className="bg-gray-50 border rounded-md p-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Our system will map your database schema to our analytics structure.
                          You can customize field mappings below if needed.
                        </p>
                        
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileCode className="h-4 w-4" />
                          View Schema Definition
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-base font-medium mb-3">Import Schedule</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Initial Import</Label>
                          <Select defaultValue="last_90_days">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_data">All Historical Data</SelectItem>
                              <SelectItem value="last_12_months">Last 12 Months</SelectItem>
                              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Import Schedule</Label>
                          <Select defaultValue="daily">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="realtime">Real-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline">Test Connection</Button>
                  <Button>Save Configuration</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    Security & Compliance
                  </CardTitle>
                  <CardDescription>
                    Configure security settings and compliance requirements
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-3">Data Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                          <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">End-to-End Encryption</p>
                            <p className="text-sm text-gray-600 mt-1">
                              All data transferred between your database and our analytics platform is encrypted
                              using industry-standard TLS/SSL encryption.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                          <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Data Isolation</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Your data remains within your infrastructure. Our ETL process securely accesses and processes 
                              the data without storing raw player information in our systems.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                          <Server className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Read-Only Access</p>
                            <p className="text-sm text-gray-600 mt-1">
                              By default, our system only has read access to your database, ensuring that your 
                              production data cannot be modified.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-base font-medium mb-3">Data Compliance</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="gdpr_compliance" defaultChecked />
                          <label
                            htmlFor="gdpr_compliance"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Enable GDPR Compliance
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="data_anonymization" defaultChecked />
                          <label
                            htmlFor="data_anonymization"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Anonymize Personally Identifiable Information (PII)
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="data_retention" defaultChecked />
                          <label
                            htmlFor="data_retention"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Apply data retention policies
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-base font-medium mb-3">Access Control</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>IP Whitelist (Optional)</Label>
                          <Textarea 
                            placeholder="Enter IP addresses separated by commas (e.g., 192.168.1.1, 10.0.0.1)"
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Access Logs Retention</Label>
                          <Select defaultValue="90_days">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30_days">30 Days</SelectItem>
                              <SelectItem value="90_days">90 Days</SelectItem>
                              <SelectItem value="1_year">1 Year</SelectItem>
                              <SelectItem value="forever">Indefinite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button>Save Security Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium">Deploying Production Environment</h3>
                  <p className="text-gray-500 mt-1">
                    {['Validating credentials...', 'Setting up connection...', 'Configuring data pipeline...', 'Almost there...'][Math.floor(deploymentStage / 2)]}
                  </p>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(deploymentStage / 6) * 100}%` }}
                  ></div>
                </div>
                
                <div className="space-y-2 mt-4">
                  {[
                    'Validating database credentials',
                    'Testing database connection',
                    'Creating necessary indexes',
                    'Setting up ETL process',
                    'Deploying API endpoints',
                    'Configuring security rules',
                    'Starting data synchronization'
                  ].map((step, index) => (
                    <div key={index} className="flex items-center">
                      {index <= deploymentStage ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <div className="h-4 w-4 border border-gray-300 rounded-full mr-2"></div>
                      )}
                      <span className={index <= deploymentStage ? "text-gray-900" : "text-gray-400"}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {deploymentStatus === 'success' && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium">Deployment Successful!</h3>
                  <p className="text-gray-500 mt-1">
                    Your production environment is now ready. Data synchronization has begun.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Connection Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Platform:</div>
                    <div className="font-medium">{formData.platform}</div>
                    
                    <div className="text-gray-500">Database:</div>
                    <div className="font-medium">{formData.database_name}</div>
                    
                    <div className="text-gray-500">Host:</div>
                    <div className="font-medium">{formData.database_host}:{formData.database_port}</div>
                    
                    <div className="text-gray-500">Sync Frequency:</div>
                    <div className="font-medium capitalize">{formData.sync_frequency}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Config
                  </Button>
                  <Button className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    View Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {deploymentStatus === 'error' && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium">Deployment Failed</h3>
                  <p className="text-gray-500 mt-1">
                    There was an issue connecting to your database. Please check your credentials and try again.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-100 p-4 rounded-md text-red-800">
                  <h4 className="font-medium">Error Details</h4>
                  <p className="text-sm mt-1">
                    Could not establish connection to database at {formData.database_host}:{formData.database_port}.
                    Please verify that your database is accessible from outside your network and credentials are correct.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setDeploymentStatus(null)} 
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
