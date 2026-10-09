import { TenantConfig } from '@/types/tenant.types';

export class TenantIsolationViolationError extends Error {
  constructor(message: string, public readonly sourceTenant: string, public readonly targetTenant: string) {
    super(message);
    this.name = 'TenantIsolationViolationError';
  }
}

export const REGISTERED_TENANTS: TenantConfig[] = [
  {
    id: 'tenant_luckystart',
    name: 'Lucky Start Casino',
    slug: 'luckystart',
    status: 'ACTIVE',
    isolationMode: 'STRICT_ROW_LEVEL',
    allowedDomains: ['luckystart.com', 'analytics.luckystart.com'],
    piiMaskingEnabled: true,
    aiKnowledgeScoped: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'tenant_aurora',
    name: 'Aurora Gaming Group',
    slug: 'aurora',
    status: 'ACTIVE',
    isolationMode: 'STRICT_ROW_LEVEL',
    allowedDomains: ['auroracasino.io'],
    piiMaskingEnabled: true,
    aiKnowledgeScoped: true,
    createdAt: '2026-04-20T00:00:00Z',
  },
  {
    id: 'tenant_solaris',
    name: 'Solaris Bet',
    slug: 'solaris',
    status: 'ACTIVE',
    isolationMode: 'STRICT_ROW_LEVEL',
    allowedDomains: ['solarisbet.com'],
    piiMaskingEnabled: true,
    aiKnowledgeScoped: true,
    createdAt: '2026-08-01T00:00:00Z',
  },
];

/**
 * Resolves active tenant from request headers or fallback.
 */
export function resolveTenantFromHeaders(headers: Headers): TenantConfig {
  const tenantId = headers.get('x-tenant-id');
  const matched = REGISTERED_TENANTS.find(t => t.id === tenantId || t.slug === tenantId);
  return matched || REGISTERED_TENANTS[0];
}

/**
 * Scopes cache key strictly to tenant namespace to prevent cross-tenant cache bleeding.
 */
export function scopeCacheKey(tenantId: string, baseKey: string): string {
  if (!tenantId) throw new Error('Cannot construct cache key without tenant ID');
  return `tenant:${tenantId}:${baseKey}`;
}

/**
 * Asserts that the target entity belongs to the active tenant.
 * Throws TenantIsolationViolationError immediately on mismatch.
 */
export function assertTenantAccess(activeTenantId: string, entityTenantId: string): void {
  if (activeTenantId !== entityTenantId) {
    throw new TenantIsolationViolationError(
      `Cross-tenant access forbidden! Tenant '${activeTenantId}' attempted accessing entity of '${entityTenantId}'`,
      activeTenantId,
      entityTenantId
    );
  }
}

/**
 * Applies row-level tenant filter to Supabase queries.
 */
export function applyTenantScope<T>(query: any, tenantId: string): any {
  return query.eq('tenant_id', tenantId);
}
