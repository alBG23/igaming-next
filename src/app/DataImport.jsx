import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Upload, Database, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import DataImportGuide from '../components/DataImportGuide';
import DataImportFilePicker from '../components/DataImportFilePicker';
import DataImportUtility from '../components/DataImportUtility';
import DataImportSampleData from '../components/DataImportSampleData';

export default function DataImport() {
  const [activeTab, setActiveTab] = useState('guide');
  const [selectedEntity, setSelectedEntity] = useState('MetricsData');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
  };

  const handleImport = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadSuccess(false);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadSuccess(true);
        }, 500);
      }
    }, 300);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
          <p className="text-gray-500 mt-1">
            Import your data into the platform for analytics and visualization
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="guide">Import Guide</TabsTrigger>
            <TabsTrigger value="import">Upload Data</TabsTrigger>
            <TabsTrigger value="largefile">Large File Import</TabsTrigger>
            <TabsTrigger value="testdata">Sample Data</TabsTrigger>
            <TabsTrigger value="history">Import History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guide">
            <DataImportGuide />
          </TabsContent>
          
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-indigo-600" />
                  Upload Data
                </CardTitle>
                <CardDescription>
                  Import new data into the selected entity
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {uploadSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Data imported successfully! Your data is now available for analysis.
                    </AlertDescription>
                  </Alert>
                )}
                
                {!uploadSuccess && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                      Make sure your data file matches the format requirements. See the Import Guide tab for details.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="entity">Select Entity</Label>
                    <Select 
                      value={selectedEntity} 
                      onValueChange={setSelectedEntity}
                    >
                      <SelectTrigger id="entity" className="w-full">
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MetricsData">MetricsData</SelectItem>
                        <SelectItem value="AnomalyAlert">AnomalyAlert</SelectItem>
                        <SelectItem value="ChurnPrediction">ChurnPrediction</SelectItem>
                        <SelectItem value="CohortData">CohortData</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DataImportFilePicker onFileSelected={handleFileSelected} />
                  
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('guide')}
                      disabled={isUploading}
                    >
                      View Import Guide
                    </Button>
                    <Button 
                      onClick={handleImport}
                      disabled={!selectedFile || isUploading || uploadSuccess}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Import Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duplicates">Duplicate Handling</Label>
                      <Select defaultValue="skip">
                        <SelectTrigger id="duplicates" className="w-full">
                          <SelectValue placeholder="Handle duplicates" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">Skip duplicates</SelectItem>
                          <SelectItem value="replace">Replace duplicates</SelectItem>
                          <SelectItem value="allow">Allow duplicates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="validation">Data Validation</Label>
                      <Select defaultValue="strict">
                        <SelectTrigger id="validation" className="w-full">
                          <SelectValue placeholder="Validation mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Strict (fail on errors)</SelectItem>
                          <SelectItem value="loose">Loose (skip invalid rows)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="largefile">
            <DataImportUtility />
          </TabsContent>
          
          <TabsContent value="testdata">
            <DataImportSampleData />
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Import History</CardTitle>
                <CardDescription>
                  View past data imports and their status
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="text-center text-gray-500 py-6">
                    <Database className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Import History</h3>
                    <p>You haven't imported any data yet.</p>
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