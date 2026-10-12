import { CrossTenantProbeResult } from '@/types/tenant.types';
import { assertTenantAccess } from './context';

export interface TenantKnowledgeRule {
  id: string;
  tenantId: string;
  ruleCategory: 'prompt_prefix' | 'retrieval_guard' | 'custom_glossary';
  content: string;
  isPrivate: boolean;
}

// In-memory tenant knowledge base (scoped per-tenant)
const TENANT_KNOWLEDGE_STORE: TenantKnowledgeRule[] = [
  {
    id: 'tk_001',
    tenantId: 'tenant_luckystart',
    ruleCategory: 'custom_glossary',
    content: 'Lucky VIP threshold is Net Deposits >= €5,000 in trailing 30 days.',
    isPrivate: true,
  },
  {
    id: 'tk_002',
    tenantId: 'tenant_aurora',
    ruleCategory: 'custom_glossary',
    content: 'Aurora VIP threshold is GGR >= €10,000. Do not disclose Lucky Start promos.',
    isPrivate: true,
  },
];

/**
 * Retrieve curated AI knowledge strictly scoped to the requesting tenant.
 * Guarantees zero cross-bleed of prompt knowledge or custom rules.
 */
export function getScopedTenantKnowledge(tenantId: string): TenantKnowledgeRule[] {
  return TENANT_KNOWLEDGE_STORE.filter(k => k.tenantId === tenantId);
}

/**
 * Execute automated isolation verification probe.
 * Simulates a malicious cross-tenant prompt injection / query attempt
 * and asserts that the isolation boundary blocks it.
 */
export function runCrossTenantIsolationProbe(
  sourceTenantId: string,
  targetTenantId: string
): CrossTenantProbeResult {
  try {
    assertTenantAccess(sourceTenantId, targetTenantId);
    
    // If we reach here, isolation FAILED
    return {
      testName: 'Cross-Tenant AI Memory Access Probe',
      attemptedAction: `Query AI knowledge for target ${targetTenantId}`,
      sourceTenantId,
      targetTenantId,
      blocked: false,
      httpStatus: 200,
      errorCaptured: 'None (Data leaked)',
      passed: false,
    };
  } catch (err: any) {
    // Correctly blocked!
    return {
      testName: 'Cross-Tenant AI Memory Access Probe',
      attemptedAction: `Query AI knowledge for target ${targetTenantId}`,
      sourceTenantId,
      targetTenantId,
      blocked: true,
      httpStatus: 403,
      errorCaptured: err.message,
      passed: true,
    };
  }
}
