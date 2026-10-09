export type SourceOfTruthType = 'softswiss_replica' | 'affilka' | 'back_office' | 'stripe_payments';

export type MetricType = 
  | 'ngr' 
  | 'ggr' 
  | 'total_deposits' 
  | 'total_withdrawals' 
  | 'ftd_count' 
  | 'active_players'
  | 'bonus_issues'
  | 'affiliate_commissions';

export type DiscrepancySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type DiscrepancyStatus = 
  | 'MATCH' 
  | 'DRIFT' 
  | 'MISMATCH' 
  | 'DROPPED_SLICE' 
  | 'IDENTITY_VIOLATION';

export type HealRiskClassification = 
  | 'SAFE_AUTO_HEAL' 
  | 'RISKY_MANUAL_REVIEW' 
  | 'BLOCKED_LIVE_WINDOW' 
  | 'ALREADY_HEALTHY';

export type ReviewStatus = 'OPEN' | 'AUTO_HEALED' | 'MANUALLY_RESOLVED' | 'QUARANTINED' | 'AUTO_CLOSED_RECOVERED';

export interface DiscrepancyFinding {
  id: string;
  metric: MetricType;
  date: string;
  currency: string;
  sourceOfTruth: SourceOfTruthType;
  sourceValue: number;
  prebuiltValue: number;
  delta: number;
  deltaPct: number;
  status: DiscrepancyStatus;
  severity: DiscrepancySeverity;
  riskClassification: HealRiskClassification;
  riskReason: string;
  isClosedDay: boolean;
  logicVersion: number;
  currentHeadVersion: number;
  firstSeenAt: string;
  lastEvaluatedAt: string;
  reviewStatus: ReviewStatus;
  slaBreached: boolean;
}

export interface ReconciliationRunSummary {
  runId: string;
  timestamp: string;
  windowStart: string;
  windowEnd: string;
  totalChecks: number;
  matches: number;
  drifts: number;
  mismatches: number;
  accuracyScorePct: number;
  findings: DiscrepancyFinding[];
  healedCount: number;
  quarantinedCount: number;
}

export interface HealActionRequest {
  findingIds?: string[];
  allSafeOnly?: boolean;
  forceOverride?: boolean;
}

export interface HealActionResult {
  findingId: string;
  metric: MetricType;
  date: string;
  currency: string;
  actionTaken: 'REBUILT_FROM_SOURCE' | 'VERSION_UPDATED' | 'REJECTED_RISKY' | 'BUDGET_EXCEEDED';
  previousValue: number;
  healedValue: number;
  success: boolean;
  message: string;
  healedAt: string;
}

export interface AlertNotification {
  id: string;
  type: 'CRITICAL_DISCREPANCY' | 'SLA_BREACH' | 'RECOVERY_RESOLVED' | 'DAILY_DIGEST';
  severity: DiscrepancySeverity;
  title: string;
  summary: string;
  details: string[];
  findingCount: number;
  timestamp: string;
  sentChannels: ('slack' | 'telegram' | 'email')[];
}

export interface AccuracySystemConfig {
  autoHealEnabled: boolean;
  maxHealDaysPerRun: number;
  maxHealMonetaryDeltaEur: number;
  toleranceWarningPct: number;
  toleranceCriticalPct: number;
  slaFailHours: number;
  slaWarnHours: number;
  telegramWebhookConfigured: boolean;
  slackWebhookConfigured: boolean;
}
