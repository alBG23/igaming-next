export type IsolationMode = 'STRICT_ROW_LEVEL' | 'SCHEMA_SEPARATED' | 'VIRTUAL_TENANT';

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
  isolationMode: IsolationMode;
  allowedDomains: string[];
  piiMaskingEnabled: boolean;
  aiKnowledgeScoped: boolean;
  createdAt: string;
}

export interface TenantAuditResult {
  tenantId: string;
  dbIsolationVerified: boolean;
  cacheKeyNamespaced: boolean;
  aiContextIsolated: boolean;
  piiMaskingActive: boolean;
  violationsFound: number;
  lastAuditedAt: string;
}

export interface CrossTenantProbeResult {
  testName: string;
  attemptedAction: string;
  sourceTenantId: string;
  targetTenantId: string;
  blocked: boolean;
  httpStatus: number;
  errorCaptured: string;
  passed: boolean;
}
