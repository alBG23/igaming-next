import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Cloud, 
  AlertTriangle, 
  ServerCrash, 
  FileWarning, 
  HardDrive, 
  Server, 
  RefreshCw, 
  Link2, 
  Lock 
} from 'lucide-react';

export default function DatabaseConnections() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Connections</h1>
          <p className="text-gray-500 mt-1">
            Integration options for external databases and cloud storage
          </p>
        </div>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Base44 has certain limitations with external database connections. This guide explains current capabilities and alternatives.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                Direct Database Connections
              </CardTitle>
              <CardDescription>
                Current support for direct database connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <div className="flex">
                  <ServerCrash className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-medium">Current Limitations</h3>
                    <p className="text-red-700 mt-1">
                      Base44 currently does not support direct connections to external PostgreSQL databases or other SQL databases. The platform uses its own internal database for storing entity data.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-white p-4 border">
                <h3 className="font-medium mb-2">Available Approaches</h3>
                <ul className="space-y-2 ml-6 list-disc text-gray-700">
                  <li>Use <strong>API integrations</strong> to connect to external data sources (requires custom development)</li>
                  <li>Import data through CSV files (with size limitations)</li>
                  <li>Use the Metrics entity for analytics data</li>
                </ul>
              </div>
              
              <div className="rounded-md bg-white p-4 border">
                <h3 className="font-medium mb-2">Upcoming Features</h3>
                <p className="text-gray-600">
                  The Base44 team is working on direct database connection features that will allow connecting to PostgreSQL and other relational databases in the future. This will enable live data streaming rather than one-time imports.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-indigo-600" />
                Cloud Storage Options
              </CardTitle>
              <CardDescription>
                Cloud storage integration capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex">
                  <FileWarning className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-amber-800 font-medium">S3 Integration Status</h3>
                    <p className="text-amber-700 mt-1">
                      Base44 currently does not have native S3 bucket integration for data imports. You can't directly upload data to S3 and have Base44 pull from there.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-white p-4 border">
                <h3 className="font-medium mb-2">Alternative Cloud Approaches</h3>
                <ul className="space-y-2 ml-6 list-disc text-gray-700">
                  <li>Create a microservice that retrieves data from S3 and exposes it via API endpoints</li>
                  <li>Use AWS Lambda functions to transform S3 data and push to a Base44-accessible API</li>
                  <li>Download from S3 and use the file import functionality for smaller datasets</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600" />
                Middleware API Approach
              </CardTitle>
              <CardDescription>
                Creating a middleware layer to connect databases to Base44
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-green-50 border border-green-200 p-4">
                <h3 className="font-medium mb-2 text-green-800">Recommended Approach</h3>
                <p className="text-green-700">
                  The most effective way to connect Base44 to external databases is through a custom middleware API that:
                </p>
                <ul className="space-y-2 ml-6 list-disc text-green-700 mt-2">
                  <li>Connects directly to your PostgreSQL database</li>
                  <li>Provides REST endpoints that Base44 can consume</li>
                  <li>Handles authentication, data transformation, and business logic</li>
                  <li>Controls data access and filtering before sending to Base44</li>
                </ul>
              </div>
              
              <Button variant="outline" className="w-full justify-center gap-2">
                <Link2 className="h-4 w-4" />
                View Middleware API Implementation Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}