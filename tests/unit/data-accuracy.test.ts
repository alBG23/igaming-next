import test from 'node:test';
import assert from 'node:assert';
import {
  isDateClosed,
  classifyHealRisk,
  CURRENT_HEAD_LOGIC_VERSION,
  runReconciliation,
  executeSafeHealing,
} from '../../src/lib/data-accuracy/engine';
import { dispatchReconciliationAlerts } from '../../src/lib/data-accuracy/alerting';
import { ReconciliationRunSummary } from '../../src/types/data-accuracy.types';

test('Data Accuracy - isDateClosed correctly identifies closed vs live accruing days', () => {
  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(isDateClosed(today), false, 'Today should be considered an open/accruing window');

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  assert.strictEqual(isDateClosed(yesterday), true, 'Yesterday should be considered a closed settled day');
});

test('Data Accuracy - Risk Matrix: BLOCKED_LIVE_WINDOW on live accruing days', () => {
  const result = classifyHealRisk(
    false, // isClosed = false
    40000,
    45000,
    5000,
    11.1,
    CURRENT_HEAD_LOGIC_VERSION,
    CURRENT_HEAD_LOGIC_VERSION
  );
  assert.strictEqual(result.classification, 'BLOCKED_LIVE_WINDOW');
  assert.match(result.reason, /auto-healing disabled for open windows/i);
});

test('Data Accuracy - Risk Matrix: ALREADY_HEALTHY within tolerance', () => {
  const result = classifyHealRisk(
    true, // isClosed = true
    10000,
    10002,
    2,
    0.02,
    CURRENT_HEAD_LOGIC_VERSION,
    CURRENT_HEAD_LOGIC_VERSION
  );
  assert.strictEqual(result.classification, 'ALREADY_HEALTHY');
});

test('Data Accuracy - Risk Matrix: RISKY_MANUAL_REVIEW when source is depleted/zero (potential replica gap)', () => {
  const result = classifyHealRisk(
    true,
    15000, // prebuilt
    0,     // source
    -15000,
    100.0,
    CURRENT_HEAD_LOGIC_VERSION,
    CURRENT_HEAD_LOGIC_VERSION
  );
  assert.strictEqual(result.classification, 'RISKY_MANUAL_REVIEW');
  assert.match(result.reason, /potential upstream sync outage/i);
});

test('Data Accuracy - Risk Matrix: RISKY_MANUAL_REVIEW when delta exceeds high monetary ceiling (>€5000 or >15%)', () => {
  const result = classifyHealRisk(
    true,
    50000,
    60000,
    10000, // €10,000 delta
    16.6,
    CURRENT_HEAD_LOGIC_VERSION,
    CURRENT_HEAD_LOGIC_VERSION
  );
  assert.strictEqual(result.classification, 'RISKY_MANUAL_REVIEW');
  assert.match(result.reason, /exceeds automated safety limits/i);
});

test('Data Accuracy - Risk Matrix: SAFE_AUTO_HEAL when built by older logic version on closed day', () => {
  const result = classifyHealRisk(
    true,
    42000,
    44000,
    2000,
    4.5,
    CURRENT_HEAD_LOGIC_VERSION - 1, // older version
    CURRENT_HEAD_LOGIC_VERSION
  );
  assert.strictEqual(result.classification, 'SAFE_AUTO_HEAL');
  assert.match(result.reason, /safe to rebuild with current HEAD logic/i);
});

test('Data Accuracy - Risk Matrix: SAFE_AUTO_HEAL when prebuilt is under source on closed day (restorative)', () => {
  const result = classifyHealRisk(
    true,
    30000,
    32000,
    2000,
    6.25,
    CURRENT_HEAD_LOGIC_VERSION,
    CURRENT_HEAD_LOGIC_VERSION
  );
  assert.strictEqual(result.classification, 'SAFE_AUTO_HEAL');
  assert.match(result.reason, /additive, and restorative/i);
});

test('Data Accuracy - runReconciliation produces valid summary and classification counts', async () => {
  const summary = await runReconciliation(7);
  assert.ok(summary.totalChecks > 0);
  assert.ok(summary.accuracyScorePct >= 0 && summary.accuracyScorePct <= 100);
  assert.ok(Array.isArray(summary.findings));

  const hasSafeCandidate = summary.findings.some(f => f.riskClassification === 'SAFE_AUTO_HEAL');
  assert.ok(hasSafeCandidate, 'Sample reconciliation should identify safe heal candidates');
});

test('Data Accuracy - executeSafeHealing heals only non-risky candidates with audit log', async () => {
  // First ensure there are findings by running reconciliation
  await runReconciliation(7);

  const healResult = await executeSafeHealing({ allSafeOnly: true });
  assert.strictEqual(healResult.success, true);
  assert.ok(healResult.totalAttempted >= 0);
  assert.ok(Array.isArray(healResult.results));

  // None of the attempted auto-heals should be rejected as risky
  for (const res of healResult.results) {
    assert.strictEqual(res.success, true);
    assert.notStrictEqual(res.actionTaken, 'REJECTED_RISKY');
  }
});

test('Data Accuracy - Alerting generates structured notifications with channel digests', async () => {
  const mockSummary: ReconciliationRunSummary = {
    runId: 'run_test_alert',
    timestamp: new Date().toISOString(),
    windowStart: '2026-10-07',
    windowEnd: '2026-10-14',
    totalChecks: 10,
    matches: 7,
    drifts: 1,
    mismatches: 2,
    accuracyScorePct: 92.5,
    healedCount: 1,
    quarantinedCount: 1,
    findings: [
      {
        id: 'f_test_crit',
        metric: 'ngr',
        date: '2026-10-12',
        currency: 'EUR',
        sourceOfTruth: 'softswiss_replica',
        sourceValue: 10000,
        prebuiltValue: 8000,
        delta: 2000,
        deltaPct: 20.0,
        status: 'MISMATCH',
        severity: 'CRITICAL',
        riskClassification: 'RISKY_MANUAL_REVIEW',
        riskReason: 'Delta exceeds automated limits',
        isClosedDay: true,
        logicVersion: CURRENT_HEAD_LOGIC_VERSION,
        currentHeadVersion: CURRENT_HEAD_LOGIC_VERSION,
        firstSeenAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        lastEvaluatedAt: new Date().toISOString(),
        reviewStatus: 'OPEN',
        slaBreached: true,
      },
    ],
  };

  const notifications = await dispatchReconciliationAlerts(mockSummary);
  assert.ok(notifications.length >= 1, 'Should generate critical discrepancy and SLA breach alerts');
  const alertTypes = notifications.map(n => n.type);
  assert.ok(alertTypes.includes('CRITICAL_DISCREPANCY'));
  assert.ok(alertTypes.includes('SLA_BREACH'));
});
