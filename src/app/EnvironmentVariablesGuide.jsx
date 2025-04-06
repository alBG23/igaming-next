
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InfoIcon, ShieldAlert, Check, X, AlertTriangle, Key, Lock, Server, Code } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function EnvironmentVariablesGuide() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Environment Variables & Secure Connections</h1>
          <p className="text-gray-500 mt-1">
            Understanding how to securely store credentials and connect to external services
          </p>
        </div>
        
        <Alert className="bg-red-50 border-red-200">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Important Security Notice</AlertTitle>
          <AlertDescription className="text-red-700">
            Base44 is a browser-based application platform. As such, it does not support backend execution or backend environment variables 
            for storing sensitive credentials. Any code running in the browser can be inspected by users, making it 
            insecure for direct database connections or storing API keys.
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-indigo-50 border-indigo-200 mb-4">
          <InfoIcon className="h-5 w-5 text-indigo-600" />
          <AlertTitle className="text-indigo-800">Base44 Execution Environment</AlertTitle>
          <AlertDescription className="text-indigo-700">
            <p className="mb-2">Base44 runs your application code entirely in the browser:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>There is no server-side or backend execution environment within Base44</li>
              <li>All code is executed client-side in the user's browser</li>
              <li>For secure database connections, you must implement a separate backend service</li>
              <li>The Base44 platform itself does not provide access to environment variables for your code</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Understanding Environment Variables Limitations</CardTitle>
            <CardDescription>
              Why browser applications can't securely store database credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The browser environment has fundamental security limitations that affect how credentials can be stored and used:
            </p>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium">Frontend Code is Public</h3>
                  <p className="text-sm text-gray-600">
                    All JavaScript code that runs in the browser is accessible to users through browser developer tools. 
                    Any credentials hardcoded or even stored in frontend environment variables can be viewed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium">CORS Restrictions</h3>
                  <p className="text-sm text-gray-600">
                    Browsers implement Cross-Origin Resource Sharing (CORS) protections that prevent direct connections 
                    to databases or APIs that don't explicitly allow your application's domain.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium">No Access to Backend Environment</h3>
                  <p className="text-sm text-gray-600">
                    Base44 applications run entirely in the browser and don't have access to server-side environment 
                    variables where credentials would normally be stored securely.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="middleware">
          <TabsList className="mb-4">
            <TabsTrigger value="middleware">Middleware Solution</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            <TabsTrigger value="implementation">Implementation Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="middleware" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Middleware API Solution</CardTitle>
                <CardDescription>
                  The recommended approach for secure database access from Base44
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create a Middleware API Service</h3>
                    <p className="text-sm text-gray-600">
                      Deploy a separate backend service that acts as an intermediary between your Base44 application and your database. 
                      This service can securely store credentials in environment variables and handle database operations.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium mb-3">How the Middleware Pattern Works:</h3>
                  <ol className="space-y-2 ml-5 list-decimal text-sm">
                    <li>Your Base44 application makes HTTP requests to your middleware API</li>
                    <li>The middleware API authenticates the request</li>
                    <li>The middleware uses securely stored credentials to connect to your database</li>
                    <li>Database results are returned to your Base44 application</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-white rounded border text-xs font-mono">
                    <p className="text-gray-500">// Example middleware API endpoint (Node.js/Express)</p>
                    <pre>{`const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

// Configure CORS to only allow requests from your Base44 app domain
app.use(cors({ origin: 'https://your-base44-app.com' }));

// Database credentials stored in environment variables on the server
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true
});

// API endpoint that your Base44 app will call
app.get('/api/analytics/revenue', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM revenue_data');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(3000, () => console.log('Middleware API running on port 3000'));`}</pre>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mt-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Updating Your Base44 Application</h3>
                    <p className="text-sm text-gray-600">
                      Once your middleware API is deployed, update your Base44 code to fetch data through API calls:
                    </p>
                    <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono">
                      <pre>{`// In your Base44 React component
import React, { useState, useEffect } from 'react';

export default function RevenueReport() {
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Call your middleware API instead of connecting directly to a database
        const response = await fetch('https://your-api.com/api/analytics/revenue');
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data = await response.json();
        setRevenueData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Render your component using the fetched data
  // ...
}`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alternatives" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alternative Approaches</CardTitle>
                <CardDescription>
                  Other options for handling external data sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-medium">Serverless Functions</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Deploy lightweight serverless functions that handle specific data operations:
                  </p>
                  <ul className="space-y-2 text-sm ml-5 list-disc">
                    <li>AWS Lambda with API Gateway</li>
                    <li>Vercel Serverless Functions</li>
                    <li>Netlify Functions</li>
                    <li>Supabase Edge Functions</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-medium">Managed Database APIs</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Use services that provide secure API access to databases without requiring direct connections:
                  </p>
                  <ul className="space-y-2 text-sm ml-5 list-disc">
                    <li>Supabase (for PostgreSQL)</li>
                    <li>Firebase Firestore</li>
                    <li>MongoDB Atlas with Data API</li>
                    <li>Hasura GraphQL API</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-medium">Static Data Exports</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    For non-real-time data needs, consider periodic exports from your database to static JSON files:
                  </p>
                  <ul className="space-y-2 text-sm ml-5 list-disc">
                    <li>Schedule regular data exports to JSON</li>
                    <li>Host the JSON files on a CDN or in cloud storage</li>
                    <li>Configure CORS headers to allow access from your Base44 app</li>
                    <li>Fetch the JSON files directly from your Base44 application</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Steps</CardTitle>
                <CardDescription>
                  Step-by-step guide to set up a secure middleware API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-6">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">1</div>
                    <div>
                      <h4 className="font-medium">Choose Your Stack</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Select a technology stack for your middleware API based on your team's expertise and requirements.
                      </p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 border rounded-md">
                          <h5 className="text-sm font-medium mb-1">Node.js Stack</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Express or Fastify framework</li>
                            <li>• pg or pg-promise for PostgreSQL</li>
                            <li>• mysql2 for MySQL</li>
                            <li>• jsonwebtoken for JWT auth</li>
                          </ul>
                        </div>
                        <div className="p-3 border rounded-md">
                          <h5 className="text-sm font-medium mb-1">Python Stack</h5>
                          <ul className="text-sm space-y-1">
                            <li>• FastAPI framework</li>
                            <li>• SQLAlchemy ORM</li>
                            <li>• psycopg2 for PostgreSQL</li>
                            <li>• PyJWT for authentication</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">2</div>
                    <div>
                      <h4 className="font-medium">Set Up Hosting Environment</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Deploy your middleware API to a secure hosting environment.
                      </p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 border rounded-md">
                          <h5 className="text-sm font-medium mb-1">Serverless Options</h5>
                          <ul className="text-sm space-y-1">
                            <li>• AWS Lambda + API Gateway</li>
                            <li>• Vercel Serverless Functions</li>
                            <li>• Google Cloud Functions</li>
                            <li>• Azure Functions</li>
                          </ul>
                        </div>
                        <div className="p-3 border rounded-md">
                          <h5 className="text-sm font-medium mb-1">Server Options</h5>
                          <ul className="text-sm space-y-1">
                            <li>• AWS EC2 or Lightsail</li>
                            <li>• DigitalOcean Droplet</li>
                            <li>• Google Compute Engine</li>
                            <li>• Azure VM</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">3</div>
                    <div>
                      <h4 className="font-medium">Configure Environment Variables</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Set up environment variables in your hosting platform to securely store credentials.
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium mb-1">Common Environment Variables</h5>
                        <ul className="text-sm space-y-1">
                          <li>• <code>DB_HOST</code> - Database server hostname</li>
                          <li>• <code>DB_PORT</code> - Database server port</li>
                          <li>• <code>DB_USER</code> - Database username</li>
                          <li>• <code>DB_PASSWORD</code> - Database password</li>
                          <li>• <code>DB_NAME</code> - Database name</li>
                          <li>• <code>JWT_SECRET</code> - Secret for JWT tokens</li>
                          <li>• <code>ALLOWED_ORIGINS</code> - CORS allowed origins (your Base44 app URL)</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">4</div>
                    <div>
                      <h4 className="font-medium">Implement Authentication</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Add authentication to your middleware API to ensure only your Base44 application can access it.
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md font-mono text-xs">
                        <pre>{`// Example JWT authentication middleware (Node.js/Express)
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Use the middleware to protect routes
app.get('/api/secured-data', authenticateToken, (req, res) => {
  // Handle the request
});`}</pre>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">5</div>
                    <div>
                      <h4 className="font-medium">Create API Endpoints</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Implement the API endpoints that your Base44 application will call to fetch or modify data.
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium mb-1">Example Endpoints</h5>
                        <ul className="text-sm space-y-1">
                          <li>• <code>GET /api/analytics/revenue</code> - Fetch revenue data</li>
                          <li>• <code>GET /api/analytics/users</code> - Fetch user analytics</li>
                          <li>• <code>GET /api/analytics/campaigns</code> - Fetch campaign data</li>
                          <li>• <code>POST /api/data/export</code> - Request a data export</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">6</div>
                    <div>
                      <h4 className="font-medium">Update Your Base44 Application</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Modify your Base44 code to use the new middleware API instead of attempting direct database connections.
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium mb-1">API Connection Best Practices</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Create a centralized API client or service</li>
                          <li>• Implement error handling and retry logic</li>
                          <li>• Add loading states for better UX during API calls</li>
                          <li>• Consider caching responses for frequently used data</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800">Need Help?</AlertTitle>
              <AlertDescription className="text-amber-700">
                Setting up a secure middleware API can be complex. Visit our 
                <Button variant="link" asChild className="px-1 text-amber-900 font-medium">
                  <Link to={createPageUrl('ProductionSetupGuide')}>Production Setup Guide</Link>
                </Button>
                for more detailed information or contact our support team for assistance with implementing a secure solution.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
