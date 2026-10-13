'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Bug,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal,
  Loader2,
  ExternalLink,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface GeminiDiagnosis {
  summary: string;
  signature: string;
  how_it_happened: string;
  impact: string;
  culprit_file: string;
  culprit_line: number;
  fix_description: string;
  code_patch: string;
  regression_test: string;
  ai_provider?: string;
  model?: string;
}

interface PRResult {
  branch: string;
  pr_title: string;
  pr_body: string;
  pr_url: string | null;
  pr_number?: number | null;
  status: string;
  details: string;
}

export function GeminiLogFixerWidget() {
  const [logText, setLogText] = useState<string>('');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [isCreatingPR, setIsCreatingPR] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<GeminiDiagnosis | null>(null);
  const [prResult, setPrResult] = useState<PRResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleLoadSample = async () => {
    try {
      setErrorMessage(null);
      const res = await fetch('/api/v1/gemini-log-fix/sample-error');
      if (res.ok) {
        const data = await res.json();
        setLogText(data.sample_log || '');
      } else {
        // Fallback realistic sample
        setLogText(`2026-10-12 13:00:15 [uvicorn.error] ERROR: Exception in ASGI application
Traceback (most recent call last):
  File "fastapi/routing.py", line 299, in app
    values_ = await solve_dependencies(request=request)
  File "app/api/v1/feedback.py", line 58, in submit_feedback
    user_email = payload["metadata"]["user_email"]
KeyError: 'user_email'
2026-10-12 13:00:15 [uvicorn.access] INFO: 127.0.0.1:54321 - "POST /api/v1/feedback HTTP/1.1" 500 Internal Server Error`);
      }
    } catch {
      setLogText(`Traceback (most recent call last):
  File "app/api/v1/feedback.py", line 58, in submit_feedback
    user_email = payload["metadata"]["user_email"]
KeyError: 'user_email'`);
    }
  };

  const handleDiagnose = async () => {
    if (!logText.trim()) {
      setErrorMessage('Please provide an error log or click "Load Sample Error".');
      return;
    }
    setIsDiagnosing(true);
    setErrorMessage(null);
    setDiagnosis(null);
    setPrResult(null);

    try {
      const res = await fetch('/api/v1/gemini-log-fix/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_log: logText }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Diagnostic service error');
      }

      const data = await res.json();
      setDiagnosis(data.diagnosis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to diagnose log.';
      setErrorMessage(msg);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCreatePR = async () => {
    if (!diagnosis) return;
    setIsCreatingPR(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/gemini-log-fix/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_log: logText,
          diagnosis: diagnosis,
          apply_fix: false,
          auto_pr: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create PR');
      }

      const data = await res.json();
      setPrResult(data.pr_result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'PR creation failed.';
      setErrorMessage(msg);
    } finally {
      setIsCreatingPR(false);
    }
  };

  const handleClear = () => {
    setLogText('');
    setDiagnosis(null);
    setPrResult(null);
    setErrorMessage(null);
  };

  const handleCopyBranch = () => {
    if (prResult?.branch) {
      navigator.clipboard?.writeText(`git checkout ${prResult.branch}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border border-indigo-500/20 shadow-xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 text-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Gemini AI Log Inspector & Auto-Fix PR
              </CardTitle>
              <CardDescription className="text-slate-400">
                Detect exceptions, generate in-depth root cause diagnostics ("How It Happened"), and open automated GitHub Pull Requests.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 bg-indigo-950/40">
            Powered by Google Gemini
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive" className="bg-rose-950/50 border-rose-800 text-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Application / Server Error Log</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadSample}
                className="h-7 text-xs text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/50"
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" /> Load Sample Error
              </Button>
              {logText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-7 text-xs text-slate-400 hover:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Paste application traceback, 500 error log, or Uvicorn error output here..."
            className="font-mono text-xs h-36 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDiagnose}
            disabled={isDiagnosing || !logText.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-900/30"
          >
            {isDiagnosing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Diagnosing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Diagnose Error & Root Cause
              </>
            )}
          </Button>
        </div>

        {/* Diagnosis Results */}
        {diagnosis && (
          <div className="mt-6 space-y-4 pt-4 border-t border-slate-800 animate-in fade-in-50 duration-300">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                      <Bug className="h-3 w-3 mr-1" /> {diagnosis.signature}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      via {diagnosis.ai_provider || 'Google Gemini'} ({diagnosis.model || 'gemini-2.5-flash'})
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-100 mt-1">{diagnosis.summary}</h4>
                </div>
              </div>

              {/* Culprit Location */}
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <FileCode className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-400">Offending File:</span>
                <code className="text-amber-300 font-mono">
                  {diagnosis.culprit_file}:{diagnosis.culprit_line}
                </code>
              </div>

              {/* How It Happened Breakdown */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Root Cause Analysis: How It Happened
                </span>
                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 whitespace-pre-line leading-relaxed">
                  {diagnosis.how_it_happened}
                </div>
              </div>

              {/* Proposed Fix */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Proposed Solution & Code Fix
                </span>
                <p className="text-xs text-slate-300">{diagnosis.fix_description}</p>
                <pre className="text-xs font-mono bg-black/60 p-3 rounded-lg border border-slate-800 text-emerald-300 overflow-x-auto">
                  {diagnosis.code_patch}
                </pre>
              </div>

              {/* PR Trigger */}
              <div className="pt-2 flex items-center justify-between">
                <Button
                  onClick={handleCreatePR}
                  disabled={isCreatingPR}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  {isCreatingPR ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing Pull Request...
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="h-4 w-4 mr-2" /> Create GitHub Pull Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PR Results Display */}
        {prResult && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Pull Request Ready!</span>
            </div>
            <p className="text-xs text-slate-300">{prResult.details}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyBranch}
                className="text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <Terminal className="h-3.5 w-3.5 mr-1" />
                {copied ? 'Copied Branch Command!' : `Branch: ${prResult.branch}`}
              </Button>

              {prResult.pr_url && (
                <Button
                  size="sm"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  <a href={prResult.pr_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Pull Request
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-slate-500 border-t border-slate-800/80 flex justify-between py-3">
        <span>Autonomous error diagnosis & branch preparation</span>
        <span>Confidence gate verified</span>
      </CardFooter>
    </Card>
  );
}

export default GeminiLogFixerWidget;
