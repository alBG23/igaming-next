'use client';

import React, { useState, useEffect } from 'react';
import { getDataSource, setDataSource, testDataSourceHealth, DATA_SOURCES, DataSourceType } from '@/lib/data-source';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Cloud, RefreshCw, CheckCircle2, AlertCircle, Server } from 'lucide-react';

interface DataSourceSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
  onSourceChange?: (newSource: DataSourceType) => void;
}

export function DataSourceSwitcher({
  variant = 'compact',
  className = '',
  onSourceChange,
}: DataSourceSwitcherProps) {
  const [source, setCurrentSource] = useState<DataSourceType>('postgres');
  const [testing, setTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    connected: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    setCurrentSource(getDataSource());

    const handleSourceChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ source: DataSourceType }>;
      if (customEvent.detail?.source) {
        setCurrentSource(customEvent.detail.source);
      }
    };

    window.addEventListener('bright:data-source-change', handleSourceChange);
    return () => {
      window.removeEventListener('bright:data-source-change', handleSourceChange);
    };
  }, []);

  const handleToggle = (targetSource: DataSourceType) => {
    if (targetSource === source) return;
    setDataSource(targetSource);
    setCurrentSource(targetSource);
    setHealthStatus(null);
    if (onSourceChange) {
      onSourceChange(targetSource);
    }
  };

  const handleRunHealthCheck = async () => {
    setTesting(true);
    try {
      const result = await testDataSourceHealth(source);
      setHealthStatus({
        connected: result.connected,
        latencyMs: result.latencyMs,
        message: result.message,
      });
    } finally {
      setTesting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-1.5 rounded-lg border bg-card/60 backdrop-blur-sm ${className}`}>
        <div className="flex items-center gap-1.5 px-2 py-0.5">
          {source === 'postgres' ? (
            <Server className="h-4 w-4 text-emerald-500" />
          ) : (
            <Cloud className="h-4 w-4 text-sky-500" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data Source:
          </span>
        </div>

        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Button
            type="button"
            size="sm"
            variant={source === 'postgres' ? 'default' : 'ghost'}
            className="h-7 text-xs px-2.5 font-medium rounded-r-none"
            onClick={() => handleToggle('postgres')}
          >
            <Database className="h-3.5 w-3.5 mr-1" />
            PostgreSQL
          </Button>
          <Button
            type="button"
            size="sm"
            variant={source === 'supabase' ? 'default' : 'ghost'}
            className="h-7 text-xs px-2.5 font-medium rounded-l-none"
            onClick={() => handleToggle('supabase')}
          >
            <Cloud className="h-3.5 w-3.5 mr-1" />
            Supabase
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 ml-1"
          title="Verify Connection"
          disabled={testing}
          onClick={handleRunHealthCheck}
        >
          <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
        </Button>

        {healthStatus && (
          <Badge
            variant={healthStatus.connected ? 'secondary' : 'destructive'}
            className="h-5 text-[10px] px-1.5 gap-1"
          >
            {healthStatus.connected ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            ) : (
              <AlertCircle className="h-2.5 w-2.5" />
            )}
            {healthStatus.latencyMs}ms
          </Badge>
        )}
      </div>
    );
  }

  // Full / Detailed Variant
  const meta = DATA_SOURCES[source];

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base tracking-tight">Active Data Layer Feature Flag</h3>
            <Badge variant="outline" className="text-xs font-mono uppercase">
              {meta.shortLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={source === 'postgres' ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => handleToggle('postgres')}
          >
            <Database className="h-4 w-4" />
            PostgreSQL (Dev)
          </Button>
          <Button
            type="button"
            variant={source === 'supabase' ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => handleToggle('supabase')}
          >
            <Cloud className="h-4 w-4" />
            Supabase (Replica)
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-mono bg-muted px-2 py-0.5 rounded">
            NEXT_PUBLIC_DATA_SOURCE: {source}
          </span>
          <span>Target: {meta.target}</span>
        </div>

        <div className="flex items-center gap-2">
          {healthStatus && (
            <span
              className={`flex items-center gap-1 font-medium ${
                healthStatus.connected ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {healthStatus.connected ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {healthStatus.message}
            </span>
          )}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1"
            disabled={testing}
            onClick={handleRunHealthCheck}
          >
            <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </div>
    </div>
  );
}
