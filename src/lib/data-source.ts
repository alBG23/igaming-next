/**
 * Unified Data Source Provider & Feature Flag Management
 * Allows dynamic switching between Internal PostgreSQL (Local / Dev) and Supabase (Cloud Replica).
 */

export type DataSourceType = 'postgres' | 'supabase';

export interface DataSourceMetadata {
  id: DataSourceType;
  label: string;
  shortLabel: string;
  description: string;
  target: string;
  defaultPort: number | string;
  badgeVariant: 'default' | 'secondary' | 'outline';
}

export const DATA_SOURCES: Record<DataSourceType, DataSourceMetadata> = {
  postgres: {
    id: 'postgres',
    label: 'Internal PostgreSQL (Local / Dev)',
    shortLabel: 'PostgreSQL',
    description: 'Direct connection to local PostgreSQL or Render Cloud dev database (luckystart / igaming_dev).',
    target: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    defaultPort: 5432,
    badgeVariant: 'default',
  },
  supabase: {
    id: 'supabase',
    label: 'Supabase (Cloud Replica)',
    shortLabel: 'Supabase',
    description: 'Authoritative cloud replica views (users_view, payment_transactions, bets).',
    target: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Cloud Endpoint',
    defaultPort: 443,
    badgeVariant: 'secondary',
  },
};

const STORAGE_KEY = 'bright_data_source';

/**
 * Resolves the currently active data source.
 * Precedence:
 * 1. Client-side localStorage override ('bright_data_source')
 * 2. Environment variable NEXT_PUBLIC_DATA_SOURCE ('postgres' | 'supabase')
 * 3. Default to 'postgres'
 */
export function getDataSource(): DataSourceType {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'postgres' || stored === 'supabase') {
        return stored;
      }
    } catch {
      // Ignore localStorage access restrictions in sandboxes
    }
  }

  const envSource = (process.env.NEXT_PUBLIC_DATA_SOURCE || '').toLowerCase().trim();
  if (envSource === 'supabase') {
    return 'supabase';
  }

  return 'postgres';
}

/**
 * Sets the active data source and notifies listeners.
 */
export function setDataSource(source: DataSourceType): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, source);
      window.dispatchEvent(new CustomEvent('bright:data-source-change', { detail: { source } }));
    } catch {
      // Storage unavailable
    }
  }
}

export function isPostgres(): boolean {
  return getDataSource() === 'postgres';
}

export function isSupabase(): boolean {
  return getDataSource() === 'supabase';
}

export function getActiveDataSourceMetadata(): DataSourceMetadata {
  return DATA_SOURCES[getDataSource()];
}

/**
 * Probe health and connectivity of the selected data source.
 */
export async function testDataSourceHealth(source: DataSourceType): Promise<{
  connected: boolean;
  latencyMs: number;
  message: string;
  error?: string;
}> {
  const start = performance.now();

  try {
    if (source === 'postgres') {
      const res = await fetch('/api/pg-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT 1 as alive', params: [] }),
      });
      const latencyMs = Math.round(performance.now() - start);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        connected: true,
        latencyMs,
        message: `PostgreSQL is healthy (${latencyMs}ms)`,
      };
    } else {
      // Probe Supabase endpoint
      const { testSupabaseConnection } = await import('@/lib/supabase');
      const result = await testSupabaseConnection();
      const latencyMs = Math.round(performance.now() - start);

      if (result.connected) {
        return {
          connected: true,
          latencyMs,
          message: `Supabase connection verified (${latencyMs}ms)`,
        };
      } else {
        return {
          connected: false,
          latencyMs,
          message: 'Supabase probe failed',
          error: result.error || 'Connection refused',
        };
      }
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      latencyMs,
      message: `${DATA_SOURCES[source].shortLabel} unreachable`,
      error: err.message || 'Unknown network error',
    };
  }
}
