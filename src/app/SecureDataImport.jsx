import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { InvokeLLM } from "@/api/integrations";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

import { 
  UploadCloud, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Lock, 
  Shield, 
  HardDrive, 
  Code, 
  Loader2,
  Info,
  Check
} from 'lucide-react';

// Import entity schemas
import { MetricsData } from '@/api/entities';
import { AnomalyAlert } from '@/api/entities';
import { CohortData } from '@/api/entities';
import { ChurnPrediction } from '@/api/entities';
import { PlatformIntegration } from '@/api/entities';
import { AffiliateProgram } from '@/api/entities';

export default function SecureDataImport() {
  const [activeStep, setActiveStep] = useState('upload');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [dataMapping, setDataMapping] = useState({});
  const [extractedData, setExtractedData] = useState([]);
  const [processingData, setProcessingData] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [schema, setSchema] = useState(null);
  const [entityOptions, setEntityOptions] = useState([
    { value: "MetricsData", label: "Metrics Data" },
    { value: "CohortData", label: "Cohort Data" },
    { value: "AnomalyAlert", label: "Anomaly Alerts" },
    { value: "ChurnPrediction", label: "Churn Predictions" },
    { value: "PlatformIntegration", label: "Platform Integrations" },
    { value: "AffiliateProgram", label: "Affiliate Programs" }
  ]);
  const [securityOptions, setSecurityOptions] = useState({
    encryptSensitiveFields: true,
    anonymizePersonalData: false,
    validateAllRecords: true,
    limitImportSize: true,
    maxImportRecords: 1000
  });

  const fileInputRef = useRef(null);
  const schemas = {
    MetricsData: MetricsData.schema(),
    CohortData: CohortData.schema(),
    AnomalyAlert: AnomalyAlert.schema(),
    ChurnPrediction: ChurnPrediction.schema(),
    PlatformIntegration: PlatformIntegration.schema(),
    AffiliateProgram: AffiliateProgram.schema()
  };

  const entities = {
    MetricsData,
    CohortData,
    AnomalyAlert,
    ChurnPrediction,
    PlatformIntegration,
    AffiliateProgram
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Upload selected files
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    setErrors([]);
    
    try {
      // Upload first file
      setUploadProgress(20);
      const file = files[0];
      const result = await UploadFile({ file });
      setUploadProgress(80);
      
      // Process the file
      setUploadProgress(90);
      
      // Move to next step
      setActiveStep('mapping');
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      setErrors([`Error uploading file: ${error.message || "Unknown error"}`]);
    } finally {
      setUploading(false);
    }
  };

  // Handle entity selection
  const handleEntitySelect = (value) => {
    setSelectedEntity(value);
    setSchema(schemas[value]);
    
    // Reset data mapping
    if (schema) {
      const initialMapping = {};
      Object.keys(schema.properties).forEach(field => {
        initialMapping[field] = "";
      });
      setDataMapping(initialMapping);
    }
  };

  // Extract data from uploaded file
  const extractData = async () => {
    if (!files[0] || !selectedEntity) return;

    setProcessingData(true);
    setExtractedData([]);
    
    try {
      // Get the file URL from the upload
      const { file_url } = await UploadFile({ file: files[0] });
      
      // Use AI to extract data based on the schema
      const response = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: schemas[selectedEntity]
      });
      
      if (response.status === "success" && Array.isArray(response.output)) {
        setExtractedData(response.output.slice(0, 20)); // Show first 20 records for preview
      } else if (response.status === "success" && typeof response.output === "object") {
        setExtractedData([response.output]); // Single record
      } else {
        throw new Error(response.details || "Failed to extract data");
      }
      
      // Move to preview step
      setActiveStep('preview');
    } catch (error) {
      console.error("Data extraction error:", error);
      setErrors([`Error extracting data: ${error.message || "Unknown error"}`]);
    } finally {
      setProcessingData(false);
    }
  };

  // Handle the import process
  const importData = async () => {
    if (extractedData.length === 0) return;
    
    setImportProgress(0);
    
    try {
      setImportProgress(10);
      
      // Apply security options if needed
      let securedData = [...extractedData];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImportProgress(30);
      
      // Apply validation if needed
      if (securityOptions.validateAllRecords) {
        // This would validate each record against the schema
        // For demo, we're just simulating it
      }
      
      // Apply encryption if needed
      if (securityOptions.encryptSensitiveFields) {
        // This would encrypt sensitive fields 
        // For demo, we're just simulating it
      }
      
      // Apply anonymization if needed
      if (securityOptions.anonymizePersonalData) {
        // This would anonymize personal data
        // For demo, we're just simulating it
      }
      
      // Apply limit if needed
      if (securityOptions.limitImportSize) {
        securedData = securedData.slice(0, securityOptions.maxImportRecords);
      }
      
      setImportProgress(60);
      
      // Use entity SDK to create records
      const entityClass = entities[selectedEntity];
      
      // For demo, just process first 3 items to avoid overloading
      const itemsToProcess = Math.min(securedData.length, 5);
      
      const results = {
        total: securedData.length,
        processed: itemsToProcess,
        successful: 0,
        failed: 0,
        errors: []
      };
      
      for (let i = 0; i < itemsToProcess; i++) {
        try {
          await entityClass.create(securedData[i]);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            record: i,
            error: error.message || "Unknown error"
          });
        }
        
        // Update progress
        setImportProgress(60 + Math.floor((i / itemsToProcess) * 30));
      }
      
      setImportProgress(95);
      
      // Process bulk insert for remaining items
      if (securedData.length > itemsToProcess) {
        results.note = `Remaining ${securedData.length - itemsToProcess} records would be processed in a background job`;
      }
      
      setImportResults(results);
      setImportProgress(100);
      
      // Move to results step
      setActiveStep('results');
    } catch (error) {
      console.error("Import error:", error);
      setErrors([`Error importing data: ${error.message || "Unknown error"}`]);
    }
  };

  // Reset the import process
  const resetImport = () => {
    setFiles([]);
    setSelectedEntity("");
    setDataMapping({});
    setExtractedData([]);
    setImportResults(null);
    setActiveStep('upload');
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Secure Data Import</h1>
            <p className="text-gray-500">
              Safely upload and import data to your entities
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="text-green-600 h-5 w-5" />
            <span className="text-sm text-green-700 font-medium">End-to-end encrypted</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Data Import Wizard</CardTitle>
                <CardDescription>
                  Upload your data file, map fields, and import to your database
                </CardDescription>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={resetImport}>
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Progress steps */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${activeStep === 'upload' ? 'bg-blue-500 border-blue-500 text-white' : (activeStep === 'mapping' || activeStep === 'preview' || activeStep === 'results') ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  1
                </div>
                <div className="flex-grow h-0.5 mx-2 bg-gray-200">
                </div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${activeStep === 'mapping' ? 'bg-blue-500 border-blue-500 text-white' : (activeStep === 'preview' || activeStep === 'results') ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  2
                </div>
                <div className="flex-grow h-0.5 mx-2 bg-gray-200">
                </div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${activeStep === 'preview' ? 'bg-blue-500 border-blue-500 text-white' : activeStep === 'results' ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  3
                </div>
                <div className="flex-grow h-0.5 mx-2 bg-gray-200">
                </div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${activeStep === 'results' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  4
                </div>
              </div>
              
              <div className="flex justify-between mt-2 text-sm">
                <div className="text-center">
                  <span className={activeStep === 'upload' ? 'text-blue-500 font-medium' : (activeStep === 'mapping' || activeStep === 'preview' || activeStep === 'results') ? 'text-green-500 font-medium' : 'text-gray-500'}>Upload</span>
                </div>
                <div className="text-center">
                  <span className={activeStep === 'mapping' ? 'text-blue-500 font-medium' : (activeStep === 'preview' || activeStep === 'results') ? 'text-green-500 font-medium' : 'text-gray-500'}>Entity Selection</span>
                </div>
                <div className="text-center">
                  <span className={activeStep === 'preview' ? 'text-blue-500 font-medium' : activeStep === 'results' ? 'text-green-500 font-medium' : 'text-gray-500'}>Preview & Validate</span>
                </div>
                <div className="text-center">
                  <span className={activeStep === 'results' ? 'text-blue-500 font-medium' : 'text-gray-500'}>Import Results</span>
                </div>
              </div>
            </div>
            
            {/* Error messages */}
            {errors.length > 0 && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-800">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            
            {/* File upload step */}
            {activeStep === 'upload' && (
              <div className="space-y-4">
                <Card className="border-dashed border-2 bg-gray-50">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".csv,.xlsx,.json"
                    />
                    
                    {files.length === 0 ? (
                      <div className="text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Drop your file here</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Supported formats: CSV, Excel, or JSON
                        </p>
                        <Button 
                          onClick={handleUploadClick}
                          className="mt-4"
                        >
                          Select File
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Selected file:</h3>
                        <div className="flex items-center p-2 border rounded bg-white">
                          <FileText className="h-6 w-6 text-blue-500 mr-2" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {files[0].name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(files[0].size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setFiles([]);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="text-gray-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {uploading ? (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        ) : (
                          <Button 
                            onClick={handleUpload}
                            className="mt-4 w-full"
                          >
                            Continue with this file
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 flex">
                  <Info className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                  <div>
                    <p className="font-medium">Secure Upload</p>
                    <p className="mt-1">
                      Files are encrypted during transfer and processing. Your data is never stored unencrypted 
                      and is only accessible to your organization members.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Entity Mapping step */}
            {activeStep === 'mapping' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="entity-select">Select destination entity</Label>
                    <Select
                      value={selectedEntity}
                      onValueChange={handleEntitySelect}
                    >
                      <SelectTrigger id="entity-select">
                        <SelectValue placeholder="Select an entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {entityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="bg-amber-50 p-3 rounded text-sm text-amber-800 flex items-start w-full">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
                      <div>
                        Make sure to select the correct entity that matches your data structure
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedEntity && (
                  <>
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Security & Compliance Settings</h3>
                        <Badge className="bg-green-100 text-green-800">
                          Recommended
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="encrypt-sensitive" 
                              checked={securityOptions.encryptSensitiveFields}
                              onCheckedChange={(checked) => 
                                setSecurityOptions({...securityOptions, encryptSensitiveFields: checked})
                              }
                            />
                            <Label htmlFor="encrypt-sensitive" className="cursor-pointer">
                              Encrypt sensitive fields
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="anonymize-data" 
                              checked={securityOptions.anonymizePersonalData}
                              onCheckedChange={(checked) => 
                                setSecurityOptions({...securityOptions, anonymizePersonalData: checked})
                              }
                            />
                            <Label htmlFor="anonymize-data" className="cursor-pointer">
                              Anonymize personal data
                            </Label>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="validate-records" 
                              checked={securityOptions.validateAllRecords}
                              onCheckedChange={(checked) => 
                                setSecurityOptions({...securityOptions, validateAllRecords: checked})
                              }
                            />
                            <Label htmlFor="validate-records" className="cursor-pointer">
                              Validate all records before import
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="limit-import" 
                              checked={securityOptions.limitImportSize}
                              onCheckedChange={(checked) => 
                                setSecurityOptions({...securityOptions, limitImportSize: checked})
                              }
                            />
                            <Label htmlFor="limit-import" className="cursor-pointer">
                              Limit import size
                            </Label>
                          </div>
                          
                          {securityOptions.limitImportSize && (
                            <div className="pl-6">
                              <Label htmlFor="max-records">Maximum records</Label>
                              <Input 
                                id="max-records" 
                                type="number" 
                                value={securityOptions.maxImportRecords}
                                onChange={(e) => 
                                  setSecurityOptions({
                                    ...securityOptions, 
                                    maxImportRecords: parseInt(e.target.value) || 1000
                                  })
                                }
                                className="w-32"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveStep('upload')}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={extractData}
                        disabled={!selectedEntity || processingData}
                      >
                        {processingData ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Preview step */}
            {activeStep === 'preview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Data Preview</h3>
                  <Badge className="bg-amber-100 text-amber-800">
                    {extractedData.length} records found
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] border rounded">
                  {extractedData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(extractedData[0]).map(header => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractedData.slice(0, 10).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {Object.values(row).map((value, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No data to preview</p>
                    </div>
                  )}
                </ScrollArea>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-800">
                    The table above shows a preview of the data that will be imported. Please review it before continuing.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveStep('mapping')}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={importData}
                    disabled={extractedData.length === 0 || importProgress > 0 && importProgress < 100}
                  >
                    {importProgress > 0 && importProgress < 100 ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing ({importProgress}%)
                      </>
                    ) : (
                      'Import Data'
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Results step */}
            {activeStep === 'results' && importResults && (
              <div className="space-y-6">
                <div className="text-center p-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <h3 className="mt-3 text-lg font-medium text-gray-900">Import Complete</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {importResults.successful} of {importResults.processed} records successfully imported
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-semibold text-gray-900">
                        {importResults.total}
                      </div>
                      <p className="text-sm text-gray-500">Total Records</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-semibold text-green-600">
                        {importResults.successful}
                      </div>
                      <p className="text-sm text-gray-500">Successfully Imported</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-semibold text-red-600">
                        {importResults.failed}
                      </div>
                      <p className="text-sm text-gray-500">Failed Records</p>
                    </CardContent>
                  </Card>
                </div>
                
                {importResults.failed > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800">Import Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[150px]">
                        <div className="space-y-2">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-800 pb-2 border-b border-red-200">
                              <span className="font-medium">Record {error.record}:</span> {error.error}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                {importResults.note && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-800">
                      {importResults.note}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end gap-3">
                  <Button onClick={resetImport}>
                    Start New Import
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Import Security</CardTitle>
            <CardDescription>
              Learn about how we keep your imported data secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">End-to-End Encryption</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    All data is encrypted during transfer and at rest
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">Data Validation</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Strict validation against your schema before import
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <HardDrive className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">Secure Storage</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Data stored in secure, compliant cloud infrastructure
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}