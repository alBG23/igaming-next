
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CloudIcon, 
  Server, 
  Shield, 
  Code, 
  Database, 
  Lock, 
  CheckCircle, 
  Layers, 
  Terminal,
  Zap,
  FileCode,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function AzureIntegrationGuide() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Azure Data Lake Integration: Implementation Guide
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            A practical step-by-step guide to build your own secure integration between 
            Azure Data Lake Storage and your analytics platform
          </p>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Self-Implementation Notice</AlertTitle>
          <AlertDescription>
            This guide outlines a DIY approach for situations where you need to develop your own integration. 
            For production environments, dedicated ETL services or managed connectors are generally recommended.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Implementation Time: 2-5 days
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Technical Expertise: Intermediate-Advanced
          </Badge>
        </div>

        <Tabs defaultValue="architecture">
          <TabsList className="mb-4">
            <TabsTrigger value="architecture">
              <Layers className="h-4 w-4 mr-1" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="setup">
              <Server className="h-4 w-4 mr-1" />
              Setup Guide
            </TabsTrigger>
            <TabsTrigger value="code">
              <FileCode className="h-4 w-4 mr-1" />
              Code Samples
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security Considerations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-blue-50 p-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <CloudIcon className="h-5 w-5 text-blue-600" />
                    Recommended Architecture
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded p-3 shadow-sm">
                      <h4 className="font-medium mb-2">1. Middleware Service</h4>
                      <p className="text-gray-600">
                        A dedicated service to handle authentication, data processing, and secure transfers
                      </p>
                    </div>
                    <div className="bg-white rounded p-3 shadow-sm">
                      <h4 className="font-medium mb-2">2. Secure REST API</h4>
                      <p className="text-gray-600">
                        API endpoints that your frontend can call to request data imports
                      </p>
                    </div>
                    <div className="bg-white rounded p-3 shadow-sm">
                      <h4 className="font-medium mb-2">3. ETL Processing</h4>
                      <p className="text-gray-600">
                        Transform data from your schema to the analytics platform's expected format
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium text-lg">Implementation Options</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Option 1: Serverless with Azure Functions
                    </h4>
                    <div className="pl-6 space-y-2">
                      <p className="text-sm">
                        Deploy Azure Functions to securely connect to your data lake, transform the data, 
                        and send it to your analytics platform. This option offers minimal maintenance
                        and automatic scaling.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className="bg-green-100 text-green-800">
                          Low maintenance
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          Cost-effective
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          Auto-scaling
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-500" />
                      Option 2: Containerized Application
                    </h4>
                    <div className="pl-6 space-y-2">
                      <p className="text-sm">
                        Build a containerized application (Docker) hosted on Azure Container Instances or AKS.
                        More control and suitable for complex transformation logic.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className="bg-blue-100 text-blue-800">
                          More control
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          Complex ETL
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          Portable
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Layers className="h-4 w-4 text-purple-500" />
                      Option 3: Azure Data Factory
                    </h4>
                    <div className="pl-6 space-y-2">
                      <p className="text-sm">
                        Use Azure Data Factory to create managed ETL pipelines. Best for large-scale data
                        processing with complex transformations and scheduling.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className="bg-purple-100 text-purple-800">
                          Fully managed
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          Visual designer
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          Enterprise-grade
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-3">Recommended for Your 8.5GB Dataset</h3>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Azure Data Factory + Azure Functions</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          For your 8.5GB dataset, a hybrid approach is optimal:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-5">
                          <li>Use Azure Data Factory to handle the large data extraction and initial processing</li>
                          <li>Implement Azure Functions for the final transformation and API endpoints</li>
                          <li>This approach handles large data volumes efficiently while providing a flexible API</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step-by-Step Setup Guide</CardTitle>
                <CardDescription>
                  Follow these steps to implement your own Azure Data Lake integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-md font-medium flex items-center gap-2">
                      <Badge>Step 1</Badge> 
                      Set Up Azure Resources
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Create a Resource Group</span> to contain all your integration components
                        </li>
                        <li>
                          <span className="font-medium">Deploy an Azure Function App</span> (Consumption plan for cost-efficiency)
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Choose Node.js or Python runtime based on your expertise</li>
                            <li>Enable managed identity for secure authentication</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Create an Azure Key Vault</span> to store secrets
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Store API keys and connection strings here</li>
                            <li>Grant your Function App access to the Key Vault</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Set up Azure Data Factory</span> (if using Option 3)
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-medium flex items-center gap-2">
                      <Badge>Step 2</Badge> 
                      Configure Permissions
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Grant Data Lake access to your function</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Assign "Storage Blob Data Reader" role to your function's managed identity</li>
                            <li>If writing data back, also assign "Storage Blob Data Contributor"</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Configure CORS settings</span> if your frontend needs to call your API directly
                        </li>
                        <li>
                          <span className="font-medium">Set up API authentication</span> using Azure AD or API keys
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-medium flex items-center gap-2">
                      <Badge>Step 3</Badge> 
                      Develop Integration Code
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Create API endpoints</span> in your Azure Function
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li><code>POST /api/import</code> - Trigger a data import</li>
                            <li><code>GET /api/import/status/{id}</code> - Check import status</li>
                            <li><code>GET /api/schemas</code> - Get available data schemas</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Implement the data processing pipeline</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Connect to Data Lake using Azure SDK</li>
                            <li>Read data in chunks to handle your 8.5GB dataset</li>
                            <li>Transform data to match analytics platform schema</li>
                            <li>Store processed data or send to analytics API</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Implement error handling and logging</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-medium flex items-center gap-2">
                      <Badge>Step 4</Badge> 
                      Connect Your Frontend
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Update your frontend to call your new API</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Send authentication tokens with requests</li>
                            <li>Display import progress to users</li>
                            <li>Handle success/error states appropriately</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Implement throttling and concurrency controls</span> to prevent overloading
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-medium flex items-center gap-2">
                      <Badge>Step 5</Badge> 
                      Testing and Deployment
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Test with small datasets first</span>
                        </li>
                        <li>
                          <span className="font-medium">Set up CI/CD pipeline</span> for reliable deployment
                        </li>
                        <li>
                          <span className="font-medium">Monitor performance and costs</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Set up Azure Monitor alerts</li>
                            <li>Track execution times and resource usage</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Implement a gradual rollout</span> for your production data
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Samples</CardTitle>
                <CardDescription>
                  Example code to help you get started with the implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Azure Function - Data Import Endpoint (Node.js)</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <pre>{`// Azure Function - import trigger endpoint
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = async function (context, req) {
    try {
        // Get request parameters
        const { container, directory, filePattern, targetEntity } = req.body;
        
        if (!container || !targetEntity) {
            return {
                status: 400,
                body: { error: "Missing required parameters" }
            };
        }
        
        // Get storage account name from environment variable
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        
        // Create a BlobServiceClient using Managed Identity
        const credential = new DefaultAzureCredential();
        const blobServiceClient = new BlobServiceClient(
            \`https://\${storageAccountName}.blob.core.windows.net\`,
            credential
        );
        
        // Create a unique job ID
        const jobId = new Date().getTime().toString();
        
        // Store job information in database or storage
        await storeJobInfo(jobId, {
            status: 'initiated',
            container,
            directory,
            filePattern,
            targetEntity,
            startTime: new Date().toISOString()
        });
        
        // Start the processing asynchronously (this would call another function)
        context.bindings.processDataTrigger = {
            jobId,
            container,
            directory,
            filePattern,
            targetEntity
        };
        
        return {
            status: 202, // Accepted
            body: {
                jobId,
                status: 'initiated',
                message: 'Data import job started'
            }
        };
    } catch (error) {
        context.log.error('Error starting import job:', error);
        return {
            status: 500,
            body: { error: "Failed to start import job", details: error.message }
        };
    }
};

async function storeJobInfo(jobId, info) {
    // Implementation to store job info in Cosmos DB, Table Storage, etc.
    // This would be expanded in a real implementation
}`}</pre>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Azure Function - Data Processing (Node.js)</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <pre>{`// Azure Function - process data from Data Lake
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const { DataLakeServiceClient } = require('@azure/storage-file-datalake');
const stream = require('stream');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);

module.exports = async function (context, myQueueItem) {
    try {
        const { jobId, container, directory, filePattern, targetEntity } = myQueueItem;
        
        // Update job status
        await updateJobStatus(jobId, 'processing');
        
        // Get storage account info
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        
        // Connect to Data Lake using Managed Identity
        const credential = new DefaultAzureCredential();
        const datalakeServiceClient = new DataLakeServiceClient(
            \`https://\${storageAccountName}.dfs.core.windows.net\`,
            credential
        );
        
        // Get file system client (container)
        const fileSystemClient = datalakeServiceClient.getFileSystemClient(container);
        
        // List files in directory matching pattern
        const dirPath = directory || "";
        const iterator = fileSystemClient.listPaths({
            path: dirPath,
            recursive: true
        });
        
        let processedFiles = 0;
        let totalRecords = 0;
        
        // Process each file
        for await (const path of iterator) {
            // Check if path matches pattern
            if (filePattern && !path.name.includes(filePattern)) continue;
            
            context.log(\`Processing file: \${path.name}\`);
            
            // Get file client
            const fileClient = fileSystemClient.getFileClient(path.name);
            
            // Process file in chunks
            const downloadResponse = await fileClient.read();
            const chunks = [];
            
            for await (const chunk of downloadResponse.readableStreamBody) {
                chunks.push(chunk);
            }
            
            const fileContent = Buffer.concat(chunks).toString('utf8');
            
            // Parse the data (assuming JSON format here)
            let records;
            try {
                records = JSON.parse(fileContent);
                if (!Array.isArray(records)) {
                    // Handle case where the file contains an object with an array property
                    // This is common in exports where data might be under a specific key
                    const possibleArrayProps = Object.keys(records).filter(key => Array.isArray(records[key]));
                    if (possibleArrayProps.length > 0) {
                        records = records[possibleArrayProps[0]];
                    } else {
                        records = [records]; // Single record
                    }
                }
            } catch (e) {
                context.log.error(\`Error parsing file \${path.name}: \${e.message}\`);
                continue;
            }
            
            // Transform and validate records based on target entity
            const transformedRecords = records.map(record => transformRecord(record, targetEntity));
            
            // Send to analytics platform in batches
            // This would call your analytics platform's API
            const batchSize = 1000;
            for (let i = 0; i < transformedRecords.length; i += batchSize) {
                const batch = transformedRecords.slice(i, i + batchSize);
                await sendToAnalyticsPlatform(batch, targetEntity);
                totalRecords += batch.length;
            }
            
            processedFiles++;
        }
        
        // Update job status to completed
        await updateJobStatus(jobId, 'completed', {
            processedFiles,
            totalRecords,
            completedAt: new Date().toISOString()
        });
        
        context.log(\`Job \${jobId} completed. Processed \${processedFiles} files with \${totalRecords} records.\`);
    } catch (error) {
        context.log.error(\`Error processing data: \${error.message}\`);
        await updateJobStatus(jobId, 'failed', { error: error.message });
    }
};

function transformRecord(record, targetEntity) {
    // Implement transformation logic based on target entity
    // This would map fields from your data lake schema to analytics platform schema
    // Return the transformed record
    // This is placeholder code - you would customize this for your schema
    
    switch(targetEntity) {
        case 'MetricsData':
            return {
                brand: record.brand || record.casino || record.site_name,
                date: record.date || record.timestamp,
                traffic_source: mapTrafficSource(record.source || record.traffic_source),
                geo: record.country || record.geo || 'unknown',
                // Map other fields...
                clicks: Number(record.clicks || 0),
                registrations: Number(record.registrations || record.signups || 0),
                // Add additional fields based on your schema
            };
        // Add cases for other entity types
        default:
            return record;
    }
}

function mapTrafficSource(source) {
    // Map source values to the expected enum values
    const sourceMap = {
        'google': 'organic',
        'facebook': 'paid_social',
        'instagram': 'paid_social',
        // Add other mappings
    };
    
    return sourceMap[source?.toLowerCase()] || source || 'direct';
}

async function sendToAnalyticsPlatform(records, entityType) {
    // Implementation to send data to your analytics platform
    // This could be a REST API call, database insertion, etc.
    // This is placeholder code
    
    // Example API call (using fetch if available)
    /*
    const response = await fetch(\`\${process.env.ANALYTICS_API_URL}/api/entities/\${entityType}/bulk\`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${process.env.ANALYTICS_API_KEY}\`
        },
        body: JSON.stringify(records)
    });
    
    if (!response.ok) {
        throw new Error(\`API Error: \${response.status} \${await response.text()}\`);
    }
    */
}

async function updateJobStatus(jobId, status, additionalInfo = {}) {
    // Implementation to update job status in database
    // This is placeholder code
}`}</pre>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Azure Function - Import Status Endpoint (Node.js)</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <pre>{`// Azure Function - get import job status
module.exports = async function (context, req) {
    try {
        const jobId = req.params.jobId;
        
        if (!jobId) {
            return {
                status: 400,
                body: { error: "Missing job ID" }
            };
        }
        
        // Retrieve job info from storage
        const jobInfo = await getJobInfo(jobId);
        
        if (!jobInfo) {
            return {
                status: 404,
                body: { error: "Job not found" }
            };
        }
        
        return {
            status: 200,
            body: jobInfo
        };
    } catch (error) {
        context.log.error('Error getting job status:', error);
        return {
            status: 500,
            body: { error: "Failed to get job status", details: error.message }
        };
    }
};

async function getJobInfo(jobId) {
    // Implementation to retrieve job info from storage
    // This would be expanded in a real implementation
}`}</pre>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Azure Data Factory Integration (JSON)</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <pre>{`{
    "name": "AzureDataLakeToAnalyticsPlatform",
    "properties": {
        "activities": [
            {
                "name": "DataLakeToBlobStaging",
                "type": "Copy",
                "dependsOn": [],
                "policy": {
                    "timeout": "7.00:00:00",
                    "retry": 0,
                    "retryIntervalInSeconds": 30,
                    "secureOutput": false,
                    "secureInput": false
                },
                "typeProperties": {
                    "source": {
                        "type": "JsonSource",
                        "storeSettings": {
                            "type": "AzureDataLakeStoreReadSettings",
                            "recursive": true,
                            "wildcardFolderPath": "raw-data",
                            "wildcardFileName": "*.json"
                        },
                        "formatSettings": {
                            "type": "JsonReadSettings"
                        }
                    },
                    "sink": {
                        "type": "JsonSink",
                        "storeSettings": {
                            "type": "AzureBlobStorageWriteSettings"
                        },
                        "formatSettings": {
                            "type": "JsonWriteSettings"
                        }
                    },
                    "enableStaging": false
                },
                "inputs": [
                    {
                        "referenceName": "DataLakeSource",
                        "type": "DatasetReference"
                    }
                ],
                "outputs": [
                    {
                        "referenceName": "BlobStagingArea",
                        "type": "DatasetReference"
                    }
                ]
            },
            {
                "name": "TriggerFunctionProcessing",
                "type": "AzureFunctionActivity",
                "dependsOn": [
                    {
                        "activity": "DataLakeToBlobStaging",
                        "dependencyConditions": [
                            "Succeeded"
                        ]
                    }
                ],
                "policy": {
                    "timeout": "7.00:00:00",
                    "retry": 0,
                    "retryIntervalInSeconds": 30,
                    "secureOutput": false,
                    "secureInput": false
                },
                "typeProperties": {
                    "functionName": "StartDataProcessing",
                    "method": "POST",
                    "body": {
                        "container": "staging",
                        "directory": "@activity('DataLakeToBlobStaging').output.targetPath",
                        "targetEntity": "MetricsData"
                    }
                },
                "linkedServiceName": {
                    "referenceName": "AzureFunctionService",
                    "type": "LinkedServiceReference"
                }
            }
        ]
    }
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Best Practices</CardTitle>
                <CardDescription>
                  Important security considerations for your implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 text-red-800">
                      <Lock className="h-5 w-5 text-red-700" />
                      Critical Security Considerations
                    </h3>
                    <ul className="mt-2 space-y-2 pl-5 list-disc text-red-700">
                      <li>
                        <span className="font-medium">Never store credentials in code or environment variables</span> - 
                        use Azure Key Vault or another secure secret manager
                      </li>
                      <li>
                        <span className="font-medium">Always use managed identities</span> when possible instead of 
                        connection strings or access keys
                      </li>
                      <li>
                        <span className="font-medium">Enable encryption</span> at rest and in transit for all storage 
                        and communication channels
                      </li>
                      <li>
                        <span className="font-medium">Implement proper authentication</span> for your API endpoints using 
                        Azure AD or API keys with proper rate limiting
                      </li>
                    </ul>
                  </div>
                  
                  <h3 className="font-medium text-lg">Authentication & Authorization</h3>
                  <div className="space-y-2 pl-4">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Use Azure AD for Authentication</h4>
                      <p className="text-sm text-gray-600">
                        Secure your Azure Functions API with Azure Active Directory to ensure only authorized 
                        users or applications can access your endpoints.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Implement Role-Based Access Control (RBAC)</h4>
                      <p className="text-sm text-gray-600">
                        Assign specific roles to your managed identities to limit access to only the resources 
                        and operations they need.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Use Scoped Access Tokens</h4>
                      <p className="text-sm text-gray-600">
                        When accessing your API from frontend applications, use properly scoped access tokens with 
                        minimal permissions and short expiration times.
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Data Protection</h3>
                  <div className="space-y-2 pl-4">
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">Encrypt Sensitive Data</h4>
                      <p className="text-sm text-gray-600">
                        Implement field-level encryption for personally identifiable information (PII) and 
                        other sensitive data before storing it.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">Data Anonymization</h4>
                      <p className="text-sm text-gray-600">
                        Consider anonymizing or pseudonymizing user data in your ETL process if full 
                        identification isn't necessary for your analytics.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">Implement Data Loss Prevention (DLP)</h4>
                      <p className="text-sm text-gray-600">
                        Scan data during processing to identify and protect sensitive information that 
                        shouldn't be exposed in analytics.
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Network Security</h3>
                  <div className="space-y-2 pl-4">
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Use Private Endpoints</h4>
                      <p className="text-sm text-gray-600">
                        Configure Azure Storage and Function App with private endpoints to restrict 
                        access to your virtual network.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Implement IP Restrictions</h4>
                      <p className="text-sm text-gray-600">
                        Restrict access to your Function App to specific IP ranges for added security.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Use Azure Front Door or API Management</h4>
                      <p className="text-sm text-gray-600">
                        For production deployments, add an API gateway with additional security features such 
                        as WAF protection and throttling.
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Monitoring & Compliance</h3>
                  <div className="space-y-2 pl-4">
                    <div className="border-l-4 border-amber-400 pl-4">
                      <h4 className="font-medium">Implement Comprehensive Logging</h4>
                      <p className="text-sm text-gray-600">
                        Log all access attempts, data operations, and system errors. Store logs securely 
                        for audit purposes.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-amber-400 pl-4">
                      <h4 className="font-medium">Configure Azure Defender</h4>
                      <p className="text-sm text-gray-600">
                        Enable Azure Defender for Storage to detect unusual and potentially harmful access 
                        to your storage accounts.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-amber-400 pl-4">
                      <h4 className="font-medium">Regular Security Reviews</h4>
                      <p className="text-sm text-gray-600">
                        Conduct regular security reviews of your integration, including checking for 
                        outdated dependencies and following Azure security best practices.
                      </p>
                    </div>
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
