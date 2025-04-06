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
  AlertTriangle,
  Rocket,
  Cpu,
  Globe,
  Radio,
  Network,
  FileType,
  Settings,
  FileKey
} from 'lucide-react';

export default function ProductionSetupGuide() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Production Deployment Guide
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            A comprehensive guide to deploying your iGaming Analytics platform in a production environment
          </p>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Production Deployment</AlertTitle>
          <AlertDescription>
            This guide outlines the steps to deploy your analytics platform in a production environment.
            Follow the security best practices to ensure your data is protected.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="infrastructure">
          <TabsList className="mb-4">
            <TabsTrigger value="infrastructure">
              <Server className="h-4 w-4 mr-1" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="azure">
              <CloudIcon className="h-4 w-4 mr-1" />
              Azure Setup
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Cpu className="h-4 w-4 mr-1" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="infrastructure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Requirements</CardTitle>
                <CardDescription>
                  Essential infrastructure components for a production deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Core Components</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-500" />
                        Application Servers
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Dedicated servers to host the application backend and API services
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Minimum 4 cores, 16GB RAM for up to 10K daily users</li>
                          <li>Scale vertically for higher concurrent user loads</li>
                          <li>Recommended: Azure App Service Premium v3 P2v3 (8 cores, 32GB)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-500" />
                        Database
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          High-performance database for analytics data storage
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Azure SQL Database - Business Critical tier (8 vCores minimum)</li>
                          <li>Azure Cosmos DB with analytical store enabled</li>
                          <li>Read replicas for reporting workloads</li>
                          <li>Storage: Min 500GB for 8.5GB raw data (after indexing and expansion)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Network className="h-4 w-4 text-purple-500" />
                        Networking
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Secure network configuration with proper isolation
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Azure Virtual Network with separate subnets</li>
                          <li>Application Gateway with WAF for frontend protection</li>
                          <li>Private endpoints for database connections</li>
                          <li>ExpressRoute or VPN for secure data center connections</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Radio className="h-4 w-4 text-red-500" />
                        Caching Layer
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Distributed cache for improved performance
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Azure Redis Cache Premium P1 (6GB) minimum</li>
                          <li>Cluster mode for scaling query performance</li>
                          <li>Data persistence configured for reliability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="font-medium text-lg">Specialized Components for Large Dataset (8.5GB+)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2 bg-blue-50">
                      <h4 className="font-medium flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-blue-600" />
                        ETL Processing Pipeline
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Dedicated services for data transformation
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Azure Data Factory for orchestration</li>
                          <li>Azure Databricks for complex transformations (Standard cluster)</li>
                          <li>Azure Functions Premium plan for custom processing logic</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2 bg-blue-50">
                      <h4 className="font-medium flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        Data Warehouse
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Analytics-optimized storage for large datasets
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Azure Synapse Analytics (formerly SQL DW)</li>
                          <li>Minimum DWU1000c for your data volume</li>
                          <li>Columnar storage for analytical queries</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Infrastructure Cost Estimation</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Based on your 8.5GB dataset size and typical analytics workload:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Base infrastructure:</div>
                        <div>$3,500 - $5,000 per month</div>
                        <div>With full ETL pipeline:</div>
                        <div>$6,000 - $8,500 per month</div>
                        <div>Development environment:</div>
                        <div>$1,500 - $2,500 per month</div>
                      </div>
                      <p className="mt-2 text-sm">Costs can be optimized by using reserved instances and right-sizing resources based on actual usage patterns.</p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="azure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Azure Resource Configuration</CardTitle>
                <CardDescription>
                  Detailed steps to set up your Azure environment for production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Step 1</Badge>
                    Resource Group Organization
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p className="mb-3">Create dedicated resource groups to organize your infrastructure:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Core Platform</h4>
                        <p className="text-gray-600 text-xs mt-1">
                          Main application components, API services, and authentication
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Data Storage</h4>
                        <p className="text-gray-600 text-xs mt-1">
                          Databases, cache, and storage accounts
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Data Processing</h4>
                        <p className="text-gray-600 text-xs mt-1">
                          ETL components, Azure Functions, and integration services
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 mb-2 font-medium">Resource tagging strategy:</div>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                      <pre>{`{
  "Environment": "Production",
  "ApplicationName": "iGamingAnalytics",
  "CostCenter": "Analytics-123",
  "DataClassification": "Confidential",
  "Owner": "analytics-platform-team"
}`}</pre>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Step 2</Badge>
                    Azure Virtual Network Configuration
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p className="mb-3">Set up network security with proper isolation:</p>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Create Virtual Network</h4>
                        <div className="text-xs mt-2 space-y-1">
                          <div><span className="font-medium">Name:</span> igaming-analytics-vnet</div>
                          <div><span className="font-medium">Address space:</span> 10.0.0.0/16</div>
                          <div><span className="font-medium">Region:</span> Same as your resource group</div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Configure Subnets</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li><span className="font-medium">Web subnet:</span> 10.0.1.0/24 (for App Service)</li>
                          <li><span className="font-medium">API subnet:</span> 10.0.2.0/24 (for API Services)</li>
                          <li><span className="font-medium">Data subnet:</span> 10.0.3.0/24 (for Databases and Cache)</li>
                          <li><span className="font-medium">Integration subnet:</span> 10.0.4.0/24 (for Azure Functions and Logic Apps)</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Network Security Groups</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Create dedicated NSGs for each subnet</li>
                          <li>Restrict inbound traffic to only necessary services</li>
                          <li>Configure service endpoints for Azure services</li>
                          <li>Enable Azure DDoS Protection Standard</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Step 3</Badge>
                    Azure Data Lake Connection Setup
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p className="mb-3">Configure secure connection to your Azure Data Lake:</p>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Create Managed Identity</h4>
                        <div className="text-xs mt-2">
                          <p>Create a User-Assigned Managed Identity for your data processing services</p>
                          <div className="bg-gray-100 p-2 rounded mt-2 font-mono">
                            <code>az identity create --name analytics-data-processor-identity --resource-group data-processing-rg</code>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Assign RBAC Permissions</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Assign "Storage Blob Data Reader" role to your data lake</li>
                          <li>Grant "Storage Blob Data Contributor" if writing data is needed</li>
                          <li>Restrict access to specific containers when possible</li>
                        </ul>
                        <div className="bg-gray-100 p-2 rounded mt-2 font-mono text-xs">
                          <code>az role assignment create --assignee [IDENTITY_PRINCIPAL_ID] --role "Storage Blob Data Reader" --scope /subscriptions/[SUBSCRIPTION_ID]/resourceGroups/[RESOURCE_GROUP]/providers/Microsoft.Storage/storageAccounts/[STORAGE_ACCOUNT_NAME]</code>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Private Endpoint Configuration</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Create private endpoints for secure connectivity</li>
                          <li>Configure DNS integration for name resolution</li>
                          <li>Disable public network access when possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Step 4</Badge>
                    Data Factory Pipeline Setup
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p className="mb-3">Create ETL pipeline for your 8.5GB dataset:</p>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Create Linked Services</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Azure Data Lake Storage Gen2 (source)</li>
                          <li>Azure SQL Database or Synapse (destination)</li>
                          <li>Use managed identity for authentication</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Create Datasets</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Source: JSON or CSV datasets with appropriate schema</li>
                          <li>Destination: Table definitions for analytics schema</li>
                          <li>Configure partitioning for large files</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Configure Pipeline</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Use Data Flow for complex transformations</li>
                          <li>Enable parallelism and partition optimization</li>
                          <li>Configure error handling and logging</li>
                          <li>Set up incremental loading patterns</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Monitoring and Triggers</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Set up tumbling window trigger for scheduled runs</li>
                          <li>Configure event-based triggers for new data</li>
                          <li>Integration with Azure Monitor for alerting</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Essential security measures for production deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 text-red-800">
                      <Lock className="h-5 w-5 text-red-700" />
                      Critical Security Requirements
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      These security measures are non-negotiable for handling sensitive iGaming data in production.
                    </p>
                    <ul className="mt-2 space-y-2 pl-5 list-disc text-red-700 text-sm">
                      <li>
                        <span className="font-medium">End-to-end encryption</span> for all data at rest and in transit
                      </li>
                      <li>
                        <span className="font-medium">Comprehensive audit logging</span> of all data access and operations
                      </li>
                      <li>
                        <span className="font-medium">Strong authentication</span> with MFA for all administrative access
                      </li>
                      <li>
                        <span className="font-medium">Regulatory compliance</span> with gaming industry standards
                      </li>
                    </ul>
                  </div>
                  
                  <h3 className="font-medium text-lg">Data Security</h3>
                  <div className="space-y-3 pl-4">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Encryption Configuration</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Enable Azure Storage Service Encryption with customer-managed keys</li>
                        <li>Configure TDE (Transparent Data Encryption) for SQL databases</li>
                        <li>Use Always Encrypted for sensitive columns (PII data)</li>
                        <li>Implement TLS 1.2+ for all API communications</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Data Classification</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Implement Azure Information Protection for data classification</li>
                        <li>Configure SQL Data Discovery & Classification</li>
                        <li>Define data handling policies based on sensitivity</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Data Masking</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Implement dynamic data masking for PII in databases</li>
                        <li>Configure column-level encryption for financial data</li>
                        <li>Apply pseudonymization for analytics datasets</li>
                      </ul>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Access Control</h3>
                  <div className="space-y-3 pl-4">
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">Identity Management</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Use Azure AD for centralized identity management</li>
                        <li>Implement Conditional Access policies</li>
                        <li>Enforce Multi-Factor Authentication for all users</li>
                        <li>Configure Azure AD Privileged Identity Management for JIT access</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">RBAC Configuration</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Implement least privilege principle across all resources</li>
                        <li>Create custom RBAC roles for specific job functions</li>
                        <li>Use Azure AD groups for role assignments</li>
                        <li>Regularly review and audit role assignments</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">API Security</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Implement Azure API Management with OAuth2/OpenID Connect</li>
                        <li>Configure rate limiting and throttling</li>
                        <li>Use Azure AD B2C for customer-facing APIs</li>
                        <li>Implement IP restrictions for administrative APIs</li>
                      </ul>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Network Security</h3>
                  <div className="space-y-3 pl-4">
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Azure Firewall Configuration</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Deploy Azure Firewall with threat intelligence-based filtering</li>
                        <li>Configure DNAT rules for inbound traffic</li>
                        <li>Set up network rules to restrict outbound traffic</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Web Application Firewall</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Deploy Application Gateway with WAF v2</li>
                        <li>Enable OWASP ModSecurity Core Rule Set 3.1</li>
                        <li>Configure custom rules for iGaming-specific threats</li>
                        <li>Implement bot protection</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Private Links</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Configure Azure Private Link for PaaS services</li>
                        <li>Disable public network access where possible</li>
                        <li>Implement private DNS zones for secure name resolution</li>
                      </ul>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Compliance & Governance</h3>
                  <div className="space-y-3 pl-4">
                    <div className="border-l-4 border-amber-400 pl-4">
                      <h4 className="font-medium">Regulatory Compliance</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Configure Azure Policy for compliance requirements</li>
                        <li>Set up Azure Security Center with industry regulatory standards</li>
                        <li>Implement Azure Blueprints for compliant deployments</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-amber-400 pl-4">
                      <h4 className="font-medium">Security Testing</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Schedule regular penetration testing</li>
                        <li>Implement vulnerability scanning with Azure Defender</li>
                        <li>Conduct security assessments with Microsoft Secure Score</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-amber-400 pl-4">
                      <h4 className="font-medium">Key Management</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Use Azure Key Vault for centralized key management</li>
                        <li>Implement key rotation policies</li>
                        <li>Configure access policies with least privilege</li>
                        <li>Enable soft delete and purge protection</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Alert className="mt-6">
                    <FileKey className="h-4 w-4" />
                    <AlertTitle>Environment Variables & Secrets</AlertTitle>
                    <AlertDescription className="text-sm">
                      <p className="mb-2">
                        Special note on handling environment variables for Azure Data Lake connection:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Never store connection strings or keys in application code</li>
                        <li>Use Azure Key Vault for all secrets and credentials</li>
                        <li>Reference Key Vault secrets through managed identity in App Service settings</li>
                        <li>For local development, use user secrets or local Key Vault instance</li>
                      </ul>
                      <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono">
                        <pre>{`# App Service configuration example (PowerShell)
$resourceGroup = "analytics-rg"
$webAppName = "igaming-analytics"
$keyVaultName = "kv-igaming-analytics"

# Configure App Service to use Key Vault references
az webapp config appsettings set --resource-group $resourceGroup --name $webAppName \\
  --settings \\
    AzureDataLake__StorageAccount="@Microsoft.KeyVault(SecretUri=https://$keyVaultName.vault.azure.net/secrets/DataLakeStorageAccount)" \\
    AzureDataLake__ClientId="@Microsoft.KeyVault(SecretUri=https://$keyVaultName.vault.azure.net/secrets/DataLakeClientId)" \\
    AzureDataLake__ClientSecret="@Microsoft.KeyVault(SecretUri=https://$keyVaultName.vault.azure.net/secrets/DataLakeClientSecret)"`}</pre>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring and Operations</CardTitle>
                <CardDescription>
                  Setting up comprehensive monitoring for your production deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Monitoring Infrastructure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        Azure Monitor Setup
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Core monitoring platform configuration
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Enable diagnostic settings on all resources</li>
                          <li>Configure Log Analytics workspace with 90-day retention</li>
                          <li>Set up workbooks for key metrics visualization</li>
                          <li>Configure Application Insights for web app monitoring</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        Alerting System
                      </h4>
                      <div className="pl-6 space-y-2">
                        <p className="text-sm text-gray-600">
                          Proactive notification for issues
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Configure action groups with email, SMS, and webhook notifications</li>
                          <li>Set up Smart Groups for alert correlation</li>
                          <li>Implement Azure Logic Apps for custom alert handling</li>
                          <li>Integration with existing ticketing system</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Key Metrics to Monitor</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Performance Metrics</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>CPU and memory utilization ({">"} 70% triggers alert)</li>
                          <li>Database DTU/vCore utilization and query performance</li>
                          <li>App Service response times (p95 {"<"} 500ms)</li>
                          <li>API endpoint performance by operation</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Data Processing Metrics</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>ETL pipeline execution times and failures</li>
                          <li>Data processing throughput (records/sec)</li>
                          <li>Data freshness and latency</li>
                          <li>Failed record count and processing errors</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-white">
                        <h4 className="font-medium">Security Metrics</h4>
                        <ul className="text-xs mt-2 space-y-1 list-disc pl-5">
                          <li>Authentication failures and unusual patterns</li>
                          <li>Firewall blocked requests</li>
                          <li>Privilege escalation attempts</li>
                          <li>Data access patterns and anomalies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Custom Dashboards</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <h4 className="font-medium">Data Lake Integration Dashboard</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Specialized dashboard for monitoring your 8.5GB data processing:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-5">
                          <li>Data processing pipeline status and throughput</li>
                          <li>File processing metrics (count, size, duration)</li>
                          <li>Error rates and failure reasons</li>
                          <li>Transformation performance by data type</li>
                          <li>Data freshness indicators</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <h4 className="font-medium">Executive Overview Dashboard</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          High-level status dashboard for management:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-5">
                          <li>System health indicators</li>
                          <li>Data processing SLA compliance</li>
                          <li>Key performance metrics</li>
                          <li>Cost optimization opportunities</li>
                          <li>Security compliance status</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg">Operational Procedures</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Backup Strategy</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Enable Azure SQL automated backups with geo-redundancy</li>
                        <li>Configure long-term retention policies (7 years for compliance)</li>
                        <li>Set up Azure Backup for VMs and configuration</li>
                        <li>Create regular export of critical analytics data</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Disaster Recovery Plan</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Configure geo-replicated storage for Data Lake</li>
                        <li>Implement failover groups for SQL databases</li>
                        <li>Document recovery procedures with runbooks</li>
                        <li>Schedule quarterly DR drills</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Scaling Procedures</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mt-1">
                        <li>Configure autoscaling rules for App Service plans</li>
                        <li>Document manual scaling procedures for databases</li>
                        <li>Set up scale-out thresholds for ETL processing</li>
                        <li>Implement rate limiting and throttling policies</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertTitle>DevOps Integration</AlertTitle>
                    <AlertDescription className="text-sm">
                      <p className="mb-2">
                        Integrate monitoring with your CI/CD pipeline:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Configure Application Insights for release annotations</li>
                        <li>Set up automatic rollback on monitoring alerts</li>
                        <li>Include dashboard links in deployment notifications</li>
                        <li>Update alert thresholds as part of deployment process</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}