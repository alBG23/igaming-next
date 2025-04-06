import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CloudIcon, 
  Database, 
  Settings, 
  CheckCircle, 
  Shield, 
  Loader2, 
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { MetricsData } from "@/api/entities";

// Assume Base44 provides these integrations (according to their homepage)
import { AzureConnector } from "@/api/integrations/AzureConnector";

export default function AzureDataLakeConnector() {
  const [connectionType, setConnectionType] = useState('direct');
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, success, error
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [dataPreview, setDataPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    connectionString: '',
    accountName: '',
    containerName: '',
    filePath: '',
    useManagedIdentity: false,
    fileFormat: 'parquet',
    refreshFrequency: 'daily',
    mappingEnabled: true
  });
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleConnect = async () => {
    setConnectionStatus('connecting');
    setImportStatus('');
    
    try {
      // Using the Azure connector that Base44 should provide
      const result = await AzureConnector.connect({
        connectionString: formData.connectionString,
        accountName: formData.accountName,
        containerName: formData.containerName,
        useManagedIdentity: formData.useManagedIdentity
      });
      
      if (result.success) {
        setConnectionStatus('success');
        loadDataPreview();
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus('error');
    }
  };
  
  const loadDataPreview = async () => {
    setIsLoadingPreview(true);
    
    try {
      // Using Base44's Azure connector to get actual data preview
      const previewData = await AzureConnector.previewData({
        containerName: formData.containerName,
        filePath: formData.filePath,
        fileFormat: formData.fileFormat,
        limit: 5
      });
      
      setDataPreview(previewData);
    } catch (error) {
      console.error("Error loading preview:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  };
  
  const startImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Initializing import process...');
    
    try {
      // Start the import process and get a job ID
      const jobId = await AzureConnector.startImport({
        containerName: formData.containerName,
        filePath: formData.filePath,
        fileFormat: formData.fileFormat,
        targetEntity: 'MetricsData',
        mappingEnabled: formData.mappingEnabled,
        refreshFrequency: formData.refreshFrequency
      });
      
      // Poll for job status updates
      const statusCheck = setInterval(async () => {
        const status = await AzureConnector.getImportStatus(jobId);
        
        setImportProgress(status.progressPercentage || 0);
        setImportStatus(status.statusMessage || 'Processing...');
        
        if (status.isComplete) {
          clearInterval(statusCheck);
          setImportStatus(`Import completed. ${status.recordsProcessed} records imported.`);
          setTimeout(() => {
            setIsImporting(false);
          }, 1000);
        }
        
        if (status.hasError) {
          clearInterval(statusCheck);
          setImportStatus(`Error: ${status.errorMessage}`);
          setTimeout(() => {
            setIsImporting(false);
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus('Error starting import. Please try again.');
      setIsImporting(false);
    }
  };

  const renderStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <Alert className="bg-blue-50 border-blue-200 mt-4">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin mr-2" />
            <AlertDescription className="text-blue-700">
              Establishing connection to Azure Data Lake Storage...
            </AlertDescription>
          </Alert>
        );
      case 'success':
        return (
          <Alert className="bg-green-50 border-green-200 mt-4">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <AlertDescription className="text-green-700">
              Successfully connected to Azure Data Lake Storage. Your data is now available for analysis.
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert className="bg-red-50 border-red-200 mt-4">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <AlertDescription className="text-red-700">
              Connection failed. Please check your credentials and try again.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Azure Data Lake Connector
          </h1>
          <p className="text-gray-500 mt-1">
            Connect directly to your Azure Data Lake Storage to import your analytics data
          </p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CloudIcon className="mr-2 h-5 w-5 text-blue-600" />
              Azure Data Lake Connection Settings
            </CardTitle>
            <CardDescription>
              Configure your connection to Azure Data Lake Storage
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={connectionType} onValueChange={setConnectionType}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="direct">
                  <Database className="h-4 w-4 mr-2" />
                  Direct Connection
                </TabsTrigger>
                <TabsTrigger value="oauth">
                  <Shield className="h-4 w-4 mr-2" />
                  OAuth Authentication
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="direct" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="connectionString">Azure Storage Connection String (optional)</Label>
                    <Input 
                      id="connectionString" 
                      type="password" 
                      placeholder="DefaultEndpointsProtocol=https;AccountName=youraccount;AccountKey=your-key;EndpointSuffix=core.windows.net"
                      value={formData.connectionString}
                      onChange={(e) => handleInputChange('connectionString', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Alternatively, you can provide the account details separately below
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Storage Account Name</Label>
                      <Input 
                        id="accountName" 
                        placeholder="yourazurestorage"
                        value={formData.accountName}
                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="containerName">Container Name</Label>
                      <Input 
                        id="containerName" 
                        placeholder="analytics-data"
                        value={formData.containerName}
                        onChange={(e) => handleInputChange('containerName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="filePath">File Path Pattern</Label>
                    <Input 
                      id="filePath" 
                      placeholder="iGaming/metrics/*.parquet"
                      value={formData.filePath}
                      onChange={(e) => handleInputChange('filePath', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Specify the path pattern to your data files within the container
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="useManagedIdentity"
                      checked={formData.useManagedIdentity}
                      onCheckedChange={(checked) => handleInputChange('useManagedIdentity', checked)}
                    />
                    <Label htmlFor="useManagedIdentity">Use Managed Identity (for Azure hosted services)</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="oauth" className="space-y-4">
                <Alert>
                  <CloudIcon className="h-4 w-4" />
                  <AlertTitle>OAuth Authentication</AlertTitle>
                  <AlertDescription>
                    Connect securely using OAuth authentication. You'll be redirected to Microsoft to authorize access.
                  </AlertDescription>
                </Alert>
                
                <Button variant="outline" className="w-full">
                  <CloudIcon className="mr-2 h-4 w-4" />
                  Sign in with Microsoft Azure
                </Button>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setAdvancedOptions(!advancedOptions)}
              >
                <Settings className="mr-2 h-4 w-4" />
                {advancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </Button>
              
              <Badge variant="outline" className="ml-auto">
                {formData.fileFormat.toUpperCase()}
              </Badge>
            </div>
            
            {advancedOptions && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileFormat">File Format</Label>
                    <Select 
                      value={formData.fileFormat} 
                      onValueChange={(value) => handleInputChange('fileFormat', value)}
                    >
                      <SelectTrigger id="fileFormat">
                        <SelectValue placeholder="Select file format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parquet">Parquet</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="avro">Avro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refreshFrequency">Refresh Frequency</Label>
                    <Select 
                      value={formData.refreshFrequency} 
                      onValueChange={(value) => handleInputChange('refreshFrequency', value)}
                    >
                      <SelectTrigger id="refreshFrequency">
                        <SelectValue placeholder="Select refresh frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="mappingEnabled"
                      checked={formData.mappingEnabled}
                      onCheckedChange={(checked) => handleInputChange('mappingEnabled', checked)}
                    />
                    <Label htmlFor="mappingEnabled">Auto-map to MetricsData entity</Label>
                  </div>
                  <p className="text-xs text-gray-500 pl-6">
                    Automatically map fields from your data to the MetricsData entity
                  </p>
                </div>
              </div>
            )}
            
            {renderStatusMessage()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setFormData({
                connectionString: '',
                accountName: '',
                containerName: '',
                filePath: '',
                useManagedIdentity: false,
                fileFormat: 'parquet',
                refreshFrequency: 'daily',
                mappingEnabled: true
              });
              setConnectionStatus('idle');
              setDataPreview(null);
            }}>
              Reset
            </Button>
            
            <Button 
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting' || (!formData.connectionString && (!formData.accountName || !formData.containerName))}
            >
              {connectionStatus === 'connecting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect to Azure
            </Button>
          </CardFooter>
        </Card>
        
        {connectionStatus === 'success' && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-green-600" />
                Data Preview and Import
              </CardTitle>
              <CardDescription>
                Preview and import your data from Azure Data Lake Storage
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isLoadingPreview ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  <span className="ml-2">Loading data preview...</span>
                </div>
              ) : dataPreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Data Preview</h3>
                    <Button variant="outline" size="sm" onClick={loadDataPreview}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          {dataPreview[0] && Object.keys(dataPreview[0]).map(key => (
                            <th key={key} className="px-3 py-2 border">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataPreview.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="px-3 py-2 border">{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Showing {dataPreview.length} rows from your data source
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No data preview available
                </div>
              )}
              
              {isImporting ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Import Progress</div>
                  <Progress value={importProgress} />
                  <div className="text-sm text-gray-600">{importStatus}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTitle className="flex items-center">
                      <Download className="h-4 w-4 mr-2 text-blue-600" />
                      Ready to Import
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Your connection is configured. You can now import your data from Azure Data Lake Storage.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={startImport} 
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import Data from Azure
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}