import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudIcon, Shield, Server, Database, CheckCircle } from 'lucide-react';
import AzureDataLakeConnector from '../components/integrations/AzureDataLakeConnector';

export default function AzureDataLakeSetup() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Azure Data Lake Integration
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            Connect your Azure Data Lake Storage to analyze your gaming data
          </p>
        </div>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Base44 Direct Connection</AlertTitle>
          <AlertDescription>
            This page allows you to connect your Azure Data Lake directly to Base44 without requiring any additional backend setup.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AzureDataLakeConnector />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connection Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Secure Authentication</p>
                    <p className="text-sm text-gray-500">Use Azure AD or key-based authentication</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Managed Data Pipeline</p>
                    <p className="text-sm text-gray-500">Automatic ETL processing and schema mapping</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Scheduled Syncs</p>
                    <p className="text-sm text-gray-500">Configure how often data should refresh</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Delta Processing</p>
                    <p className="text-sm text-gray-500">Only import new or changed data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <a href="#" className="text-blue-600 hover:underline">Azure Data Lake Connection Guide</a>
                </p>
                <p className="text-sm">
                  <a href="#" className="text-blue-600 hover:underline">Schema Mapping Documentation</a>
                </p>
                <p className="text-sm">
                  <a href="#" className="text-blue-600 hover:underline">Supported File Formats</a>
                </p>
                <p className="text-sm">
                  <a href="#" className="text-blue-600 hover:underline">Connection Troubleshooting</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <CloudIcon className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <Server className="h-4 w-4 mr-1" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="schema">
              <Database className="h-4 w-4 mr-1" />
              Schema Mapping
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <h3 className="text-lg font-medium">Azure Data Lake Integration</h3>
            <p>
              This integration allows you to securely connect your Azure Data Lake Storage account to Base44's analytics platform. 
              The connection is established securely through Azure AD integration, with all data transfers encrypted in transit and at rest.
            </p>
            <p>
              Once connected, you can visualize your data, create custom reports, set up alerts, and leverage AI insights - all within Base44.
            </p>
            <h4 className="text-md font-medium mt-4">Connection Process:</h4>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Configure your Azure Data Lake connection details</li>
              <li>Select the specific data files or patterns to import</li>
              <li>Map your data schema to Base44's analytics model</li>
              <li>Configure refresh settings and permissions</li>
              <li>Start analyzing your data with Base44's tools</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <h3 className="text-lg font-medium">Security Information</h3>
            <p>
              Base44 takes security seriously when connecting to your Azure Data Lake Storage. Here's how your data is protected:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="font-medium">Azure Active Directory Integration:</span> We authenticate through Azure AD for secure access without storing your credentials</li>
              <li><span className="font-medium">Minimal Permissions:</span> We only request read-only access to specific containers</li>
              <li><span className="font-medium">Encryption:</span> All data is encrypted in transit using TLS 1.2+ and at rest using AES-256</li>
              <li><span className="font-medium">Data Residency:</span> Data processing occurs in the same Azure region as your storage account</li>
              <li><span className="font-medium">Audit Logging:</span> All access and operations are logged for security auditing</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="architecture" className="space-y-4">
            <h3 className="text-lg font-medium">Integration Architecture</h3>
            <p>
              Base44's Azure Data Lake connector uses a secure, scalable architecture designed for performance and reliability:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="font-medium">Serverless Functions:</span> Azure Functions process your data for optimal scaling</li>
              <li><span className="font-medium">Managed Identity:</span> Azure Managed Identities for secure authentication</li>
              <li><span className="font-medium">Delta Processing:</span> Only import new or changed data to minimize transfer volumes</li>
              <li><span className="font-medium">Schema Inference:</span> Automatic schema detection and mapping</li>
              <li><span className="font-medium">Data Transformation:</span> ETL pipeline to optimize data for analytics</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="schema" className="space-y-4">
            <h3 className="text-lg font-medium">Schema Mapping</h3>
            <p>
              Base44 automatically maps your data schema to our analytics models, but you can customize these mappings:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="font-medium">Automatic Field Detection:</span> Fields are automatically identified and mapped</li>
              <li><span className="font-medium">Custom Mapping:</span> Define custom transformations and field mappings</li>
              <li><span className="font-medium">Data Type Conversion:</span> Automatic handling of type conversions</li>
              <li><span className="font-medium">Multi-format Support:</span> Support for Parquet, CSV, JSON, and Delta Lake formats</li>
              <li><span className="font-medium">Schema Evolution:</span> Handles changes to your data schema over time</li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}