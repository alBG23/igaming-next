import {
  DiscrepancyFinding,
  DiscrepancySeverity,
  DiscrepancyStatus,
  HealActionRequest,
  HealActionResult,
  HealRiskClassification,
  MetricType,
  ReconciliationRunSummary,
  SourceOfTruthType,
  AccuracySystemConfig,
} from '@/types/data-accuracy.types';

export const CURRENT_HEAD_LOGIC_VERSION = 4;

export const DEFAULT_ACCURACY_CONFIG: AccuracySystemConfig = {
  autoHealEnabled: true,
  maxHealDaysPerRun: 5,
  maxHealMonetaryDeltaEur: 10000,
  toleranceWarningPct: 0.1,
  toleranceCriticalPct: 1.0,
  slaFailHours: 4,
  slaWarnHours: 24,
  telegramWebhookConfigured: true,
  slackWebhookConfigured: true,
};

// In-memory ledger of findings and heal actions for auditability & persistence
let persistedFindings: DiscrepancyFinding[] = [];
let healAuditLog: HealActionResult[] = [];

/**
 * Check whether a date is a closed (settled) day vs today (live accruing).
 */
export function isDateClosed(dateStr: string): boolean {
  const target = new Date(dateStr);
  const now = new Date();
  
  // Strip time for exact calendar day comparison
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return targetDay < today;
}

/**
 * Risk Assessment Matrix: evaluates if a discrepancy is safe to auto-heal
 * or requires quarantine / operator review.
 */
export function classifyHealRisk(
  isClosed: boolean,
  prebuiltVal: number,
  sourceVal: number,
  delta: number,
  deltaPct: number,
  logicVersion: number,
  headVersion: number
): { classification: HealRiskClassification; reason: string } {
  // Guard 1: Never heal today's live day (accruing data)
  if (!isClosed) {
    return {
      classification: 'BLOCKED_LIVE_WINDOW',
      reason: 'Transactions still accruing on live day; auto-healing disabled for open windows',
    };
  }

  // Guard 2: Perfect match
  if (Math.abs(delta) < 0.01 || deltaPct < 0.05) {
    return {
      classification: 'ALREADY_HEALTHY',
      reason: 'Values match within acceptable tolerance; no healing necessary',
    };
  }

  // Guard 3: Source is zero or significantly under prebuilt (RISKY: possible replica outage / upstream loss)
  if (sourceVal <= 0 && prebuiltVal > 100) {
    return {
      classification: 'RISKY_MANUAL_REVIEW',
      reason: 'Source of truth has zero/near-zero data while prebuilt has records; potential upstream sync outage',
    };
  }

  if (prebuiltVal > sourceVal * 1.5 && delta > 1000) {
    return {
      classification: 'RISKY_MANUAL_REVIEW',
      reason: 'Prebuilt exceeds source by >50%; rebuilding could overwrite data during temporary source lag',
    };
  }

  // Guard 4: High monetary delta ceiling (> €5,000 or > 15%)
  if (Math.abs(delta) > 5000 || deltaPct > 15.0) {
    return {
      classification: 'RISKY_MANUAL_REVIEW',
      reason: `High variance (Delta: €${Math.abs(delta).toFixed(2)}, ${deltaPct.toFixed(1)}%) exceeds automated safety limits`,
    };
  }

  // Safe Case 1: Outdated logic version on closed day
  if (logicVersion < headVersion) {
    return {
      classification: 'SAFE_AUTO_HEAL',
      reason: `Built by older logic version (v${logicVersion} < v${headVersion}); safe to rebuild with current HEAD logic`,
    };
  }

  // Safe Case 2: Prebuilt under source on closed day (additive and restorative)
  if (prebuiltVal < sourceVal && sourceVal > 0) {
    return {
      classification: 'SAFE_AUTO_HEAL',
      reason: 'Prebuilt under-reported vs source of truth; re-aggregating is safe, additive, and restorative',
    };
  }

  // Default fallback for ambiguous cases
  return {
    classification: 'RISKY_MANUAL_REVIEW',
    reason: 'Discrepancy pattern requires manual verification by an analytics engineer',
  };
}

/**
 * Mock/Sample realistic financial and platform ledger datasets
 * representing comparison between Local Prebuilt vs Source of Truth.
 */
function generateComparisonDataset(daysBack: number = 7): Array<{
  metric: MetricType;
  date: string;
  currency: string;
  sourceOfTruth: SourceOfTruthType;
  sourceValue: number;
  prebuiltValue: number;
  logicVersion: number;
}> {
  const dataset = [];
  const now = new Date();

  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;

    // Normal baseline values
    const baseGGR = 45200 + (i * 1230);
    const baseBonuses = 8400 + (i * 310);
    const baseCorrections = 200 - (i * 15);
    const expectedNGR = baseGGR - baseBonuses + baseCorrections;

    // Case 1: Perfect match closed day
    dataset.push({
      metric: 'ggr' as MetricType,
      date: dateStr,
      currency: 'EUR',
      sourceOfTruth: 'softswiss_replica' as SourceOfTruthType,
      sourceValue: baseGGR,
      prebuiltValue: baseGGR,
      logicVersion: CURRENT_HEAD_LOGIC_VERSION,
    });

    // Case 2: NGR calculation (Simulate a safe healable drift on 2 days ago)
    let prebuiltNGR = expectedNGR;
    let logicVer = CURRENT_HEAD_LOGIC_VERSION;

    if (i === 2) {
      // Outdated logic version + prebuilt under (SAFE AUTO HEAL)
      prebuiltNGR = expectedNGR - 840;
      logicVer = 2; // Old logic version
    } else if (i === 4) {
      // Large risky variance (RISKY MANUAL REVIEW)
      prebuiltNGR = expectedNGR + 7200;
    }

    dataset.push({
      metric: 'ngr' as MetricType,
      date: dateStr,
      currency: 'EUR',
      sourceOfTruth: 'softswiss_replica' as SourceOfTruthType,
      sourceValue: expectedNGR,
      prebuiltValue: prebuiltNGR,
      logicVersion: logicVer,
    });

    // Case 3: Deposits (Affilka / Payments)
    const baseDeposits = 112500 - (i * 2400);
    let prebuiltDeposits = baseDeposits;
    if (i === 1) {
      // Safe under-reported deposit leg (SAFE AUTO HEAL)
      prebuiltDeposits = baseDeposits - 350;
    }

    dataset.push({
      metric: 'total_deposits' as MetricType,
      date: dateStr,
      currency: 'EUR',
      sourceOfTruth: 'softswiss_replica' as SourceOfTruthType,
      sourceValue: baseDeposits,
      prebuiltValue: isToday ? baseDeposits - 1200 : prebuiltDeposits,
      logicVersion: CURRENT_HEAD_LOGIC_VERSION,
    });

    // Case 4: Affiliate Commissions vs Affilka SoT
    const baseAffCommissions = 14500 + (i * 450);
    dataset.push({
      metric: 'affiliate_commissions' as MetricType,
      date: dateStr,
      currency: 'EUR',
      sourceOfTruth: 'affilka' as SourceOfTruthType,
      sourceValue: baseAffCommissions,
      prebuiltValue: baseAffCommissions,
      logicVersion: CURRENT_HEAD_LOGIC_VERSION,
    });
  }

  return dataset;
}

/**
 * Perform end-to-end reconciliation: compare prebuilt aggregates vs Source of Truth.
 */
export async function runReconciliation(
  windowDays: number = 7,
  config: AccuracySystemConfig = DEFAULT_ACCURACY_CONFIG
): Promise<ReconciliationRunSummary> {
  const rawRows = generateComparisonDataset(windowDays);
  const now = new Date();
  const runId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const findings: DiscrepancyFinding[] = [];
  let matches = 0;
  let drifts = 0;
  let mismatches = 0;

  for (const row of rawRows) {
    const isClosed = isDateClosed(row.date);
    const delta = Number((row.prebuiltValue - row.sourceValue).toFixed(2));
    const denom = row.sourceValue !== 0 ? Math.abs(row.sourceValue) : 1;
    const deltaPct = Number((Math.abs(delta) / denom * 100).toFixed(3));

    let status: DiscrepancyStatus = 'MATCH';
    let severity: DiscrepancySeverity = 'INFO';

    if (Math.abs(delta) > 0.01) {
      if (deltaPct > config.toleranceCriticalPct) {
        status = 'MISMATCH';
        severity = 'CRITICAL';
        mismatches++;
      } else if (deltaPct > config.toleranceWarningPct) {
        status = 'DRIFT';
        severity = 'WARNING';
        drifts++;
      } else {
        status = 'MATCH';
        matches++;
      }
    } else {
      matches++;
    }

    const { classification, reason } = classifyHealRisk(
      isClosed,
      row.prebuiltValue,
      row.sourceValue,
      delta,
      deltaPct,
      row.logicVersion,
      CURRENT_HEAD_LOGIC_VERSION
    );

    const findingId = `fnd_${row.metric}_${row.date}_${row.currency}`;
    const existing = persistedFindings.find(f => f.id === findingId);

    const firstSeenAt = existing ? existing.firstSeenAt : now.toISOString();
    const hoursOpen = (now.getTime() - new Date(firstSeenAt).getTime()) / (1000 * 60 * 60);
    const slaBreached = severity === 'CRITICAL' 
      ? hoursOpen > config.slaFailHours 
      : (severity === 'WARNING' ? hoursOpen > config.slaWarnHours : false);

    const finding: DiscrepancyFinding = {
      id: findingId,
      metric: row.metric,
      date: row.date,
      currency: row.currency,
      sourceOfTruth: row.sourceOfTruth,
      sourceValue: row.sourceValue,
      prebuiltValue: row.prebuiltValue,
      delta,
      deltaPct,
      status,
      severity,
      riskClassification: classification,
      riskReason: reason,
      isClosedDay: isClosed,
      logicVersion: row.logicVersion,
      currentHeadVersion: CURRENT_HEAD_LOGIC_VERSION,
      firstSeenAt,
      lastEvaluatedAt: now.toISOString(),
      reviewStatus: existing?.reviewStatus || (status === 'MATCH' ? 'AUTO_CLOSED_RECOVERED' : 'OPEN'),
      slaBreached,
    };

    findings.push(finding);
  }

  // Update persisted findings cache
  persistedFindings = findings;

  const totalChecks = rawRows.length;
  const accuracyScorePct = Number(((matches / (totalChecks || 1)) * 100).toFixed(2));

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - windowDays);

  return {
    runId,
    timestamp: now.toISOString(),
    windowStart: startDate.toISOString().split('T')[0],
    windowEnd: now.toISOString().split('T')[0],
    totalChecks,
    matches,
    drifts,
    mismatches,
    accuracyScorePct,
    findings,
    healedCount: findings.filter(f => f.reviewStatus === 'AUTO_HEALED').length,
    quarantinedCount: findings.filter(f => f.riskClassification === 'RISKY_MANUAL_REVIEW').length,
  };
}

/**
 * Execute Safe Auto-Healing for eligible findings while respecting safety budgets and guards.
 */
export async function executeSafeHealing(
  request: HealActionRequest,
  config: AccuracySystemConfig = DEFAULT_ACCURACY_CONFIG
): Promise<{
  success: boolean;
  totalAttempted: number;
  totalHealed: number;
  results: HealActionResult[];
}> {
  if (!config.autoHealEnabled && !request.forceOverride) {
    return {
      success: false,
      totalAttempted: 0,
      totalHealed: 0,
      results: [],
    };
  }

  const results: HealActionResult[] = [];
  let dayBudgetUsed = 0;
  let monetaryDeltaAccumulated = 0;

  // Filter candidates
  const candidates = persistedFindings.filter(f => {
    if (f.reviewStatus === 'AUTO_HEALED' || f.status === 'MATCH') return false;
    if (request.findingIds && request.findingIds.length > 0) {
      return request.findingIds.includes(f.id);
    }
    return f.riskClassification === 'SAFE_AUTO_HEAL';
  });

  for (const candidate of candidates) {
    const isRisky = candidate.riskClassification === 'RISKY_MANUAL_REVIEW' || 
                    candidate.riskClassification === 'BLOCKED_LIVE_WINDOW';

    if (isRisky && !request.forceOverride) {
      results.push({
        findingId: candidate.id,
        metric: candidate.metric,
        date: candidate.date,
        currency: candidate.currency,
        actionTaken: 'REJECTED_RISKY',
        previousValue: candidate.prebuiltValue,
        healedValue: candidate.prebuiltValue,
        success: false,
        message: `Heal rejected: ${candidate.riskReason}`,
        healedAt: new Date().toISOString(),
      });
      continue;
    }

    // Circuit Breaker: Max Days Budget
    if (dayBudgetUsed >= config.maxHealDaysPerRun && !request.forceOverride) {
      results.push({
        findingId: candidate.id,
        metric: candidate.metric,
        date: candidate.date,
        currency: candidate.currency,
        actionTaken: 'BUDGET_EXCEEDED',
        previousValue: candidate.prebuiltValue,
        healedValue: candidate.prebuiltValue,
        success: false,
        message: `Exceeded max safe heal days limit (${config.maxHealDaysPerRun} days/run)`,
        healedAt: new Date().toISOString(),
      });
      continue;
    }

    // Circuit Breaker: Max Monetary Delta Budget
    const absDelta = Math.abs(candidate.delta);
    if ((monetaryDeltaAccumulated + absDelta) > config.maxHealMonetaryDeltaEur && !request.forceOverride) {
      results.push({
        findingId: candidate.id,
        metric: candidate.metric,
        date: candidate.date,
        currency: candidate.currency,
        actionTaken: 'BUDGET_EXCEEDED',
        previousValue: candidate.prebuiltValue,
        healedValue: candidate.prebuiltValue,
        success: false,
        message: `Exceeded max monetary heal delta limit (€${config.maxHealMonetaryDeltaEur})`,
        healedAt: new Date().toISOString(),
      });
      continue;
    }

    // Execute heal: update value to source value, bump logic version, mark healed
    const previous = candidate.prebuiltValue;
    candidate.prebuiltValue = candidate.sourceValue;
    candidate.delta = 0;
    candidate.deltaPct = 0;
    candidate.status = 'MATCH';
    candidate.reviewStatus = 'AUTO_HEALED';
    candidate.logicVersion = CURRENT_HEAD_LOGIC_VERSION;

    dayBudgetUsed++;
    monetaryDeltaAccumulated += absDelta;

    const actionResult: HealActionResult = {
      findingId: candidate.id,
      metric: candidate.metric,
      date: candidate.date,
      currency: candidate.currency,
      actionTaken: candidate.logicVersion < candidate.currentHeadVersion ? 'VERSION_UPDATED' : 'REBUILT_FROM_SOURCE',
      previousValue: previous,
      healedValue: candidate.sourceValue,
      success: true,
      message: `Successfully healed slice from ${candidate.sourceOfTruth}. Delta: €${absDelta.toFixed(2)}`,
      healedAt: new Date().toISOString(),
    };

    results.push(actionResult);
    healAuditLog.unshift(actionResult);
  }

  return {
    success: results.some(r => r.success),
    totalAttempted: candidates.length,
    totalHealed: results.filter(r => r.success).length,
    results,
  };
}

/**
 * Get current cached findings & audit log
 */
export function getAccuracySystemState() {
  return {
    findings: persistedFindings,
    auditLog: healAuditLog,
    headVersion: CURRENT_HEAD_LOGIC_VERSION,
    config: DEFAULT_ACCURACY_CONFIG,
  };
}
