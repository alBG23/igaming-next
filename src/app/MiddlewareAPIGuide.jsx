import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Server, 
  Link2, 
  PlusCircle, 
  Database, 
  ArrowRightLeft, 
  GitBranch, 
  Shield, 
  Clock, 
  FileCode, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function MiddlewareAPIGuide() {
  const [apiEndpoint, setApiEndpoint] = useState('https://api.example.com/metrics');
  const [apiKey, setApiKey] = useState('your_api_key_here');
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const simulateAPITest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTestResponse({
        status: "success",
        data: [
          {
            user_id: 1001,
            date: "2024-01-15",
            ggr: 245.50,
            ngr: 198.20,
          }
        ],
        count: 1,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Middleware API Integration Guide</h1>
          <p className="text-gray-500 mt-1">
            Building an API middleware layer between your database and Base44
          </p>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            A middleware API can solve data integration challenges by providing a controlled interface between your PostgreSQL database and Base44.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Understanding the middleware approach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-white p-4 border">
                  <h3 className="font-medium mb-2">What is a Middleware API?</h3>
                  <p className="text-gray-600">
                    A middleware API is a custom-built service that sits between your database and Base44, providing a secure and controlled way to access your data.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-md bg-indigo-50 p-4 border border-indigo-100">
                    <h3 className="font-medium mb-2 text-indigo-900">Benefits</h3>
                    <ul className="space-y-2 ml-6 list-disc text-indigo-700">
                      <li>Secure database access</li>
                      <li>Data transformation control</li>
                      <li>Custom authentication</li>
                      <li>Performance optimization</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-md bg-amber-50 p-4 border border-amber-100">
                    <h3 className="font-medium mb-2 text-amber-900">Considerations</h3>
                    <ul className="space-y-2 ml-6 list-disc text-amber-700">
                      <li>Requires development effort</li>
                      <li>Needs hosting infrastructure</li>
                      <li>Ongoing maintenance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="architecture">
            <Card>
              <CardHeader>
                <CardTitle>Architecture</CardTitle>
                <CardDescription>Recommended setup for your middleware API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-md border">
                    <h3 className="font-medium mb-3">Components</h3>
                    <ul className="space-y-2 ml-6 list-disc text-gray-700">
                      <li>API Server (Node.js/Python)</li>
                      <li>Database Connector</li>
                      <li>Authentication Layer</li>
                      <li>Data Transformation Logic</li>
                      <li>Caching System (Optional)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation">
            <Card>
              <CardHeader>
                <CardTitle>Implementation</CardTitle>
                <CardDescription>Code examples and setup instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded-md">
                    <p className="text-gray-300 mb-2">Example API Endpoint:</p>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
{`app.get('/api/metrics', async (req, res) => {
  const { start_date, end_date } = req.query;
  const result = await db.query(
    'SELECT * FROM metrics WHERE date BETWEEN $1 AND $2',
    [start_date, end_date]
  );
  res.json(result.rows);
});`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>Testing</CardTitle>
                <CardDescription>Test your middleware API connection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>API Endpoint</Label>
                      <Input 
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        placeholder="https://your-api.example.com/metrics"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Your API Key"
                      />
                    </div>
                    
                    <Button 
                      onClick={simulateAPITest}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    
                    {testResponse && (
                      <div className="rounded-md bg-green-50 border border-green-200 p-4">
                        <h3 className="font-medium text-green-800 mb-2">Connection Successful</h3>
                        <pre className="text-sm bg-white p-2 rounded border">
                          {JSON.stringify(testResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}