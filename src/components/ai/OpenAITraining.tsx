'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileText, Brain } from 'lucide-react';

export default function OpenAITraining() {
  const [trainingData, setTrainingData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTrainingData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleTrainModel = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!trainingData.trim()) {
        throw new Error('Please provide training data');
      }

      setStatus('success');
      // In a real implementation, you would send the training data to your backend
      console.log('Training data:', trainingData);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to train model');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Train Your AI Model</CardTitle>
          <CardDescription>
            Upload your data or paste it directly to train a custom AI model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Training Data</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".txt,.json,.csv"
                onChange={handleUploadFile}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Or Paste Your Data</Label>
            <Textarea
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              placeholder="Paste your training data here..."
              className="min-h-[200px]"
            />
          </div>

          <Button 
            onClick={handleTrainModel}
            disabled={isLoading || !trainingData.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Train Model
          </Button>

          {status === 'success' && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>Model training completed successfully</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Format your data in a clear, structured way</li>
            <li>Include examples of questions and expected answers</li>
            <li>Provide context about your iGaming business</li>
            <li>Include key metrics and their definitions</li>
            <li>Add examples of common queries and their responses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 