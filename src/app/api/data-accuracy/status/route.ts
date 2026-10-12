import { NextResponse } from 'next/server';
import { getAccuracySystemState, runReconciliation } from '@/lib/data-accuracy/engine';
import { getAlertHistory } from '@/lib/data-accuracy/alerting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let state = getAccuracySystemState();

    // If no findings yet evaluated, execute initial reconciliation pass
    if (state.findings.length === 0) {
      await runReconciliation(7);
      state = getAccuracySystemState();
    }

    const alerts = getAlertHistory();

    const total = state.findings.length;
    const matches = state.findings.filter(f => f.status === 'MATCH').length;
    const critical = state.findings.filter(f => f.severity === 'CRITICAL' && f.reviewStatus === 'OPEN').length;
    const warning = state.findings.filter(f => f.severity === 'WARNING' && f.reviewStatus === 'OPEN').length;
    const safeHealable = state.findings.filter(f => f.riskClassification === 'SAFE_AUTO_HEAL' && f.reviewStatus === 'OPEN').length;
    const quarantined = state.findings.filter(f => f.riskClassification === 'RISKY_MANUAL_REVIEW').length;

    return NextResponse.json({
      success: true,
      accuracyScorePct: total > 0 ? Number(((matches / total) * 100).toFixed(2)) : 100,
      summary: {
        totalChecks: total,
        matches,
        critical,
        warning,
        safeHealable,
        quarantined,
        healed24h: state.auditLog.filter(l => l.success).length,
      },
      findings: state.findings,
      auditLog: state.auditLog.slice(0, 20),
      recentAlerts: alerts.slice(0, 10),
      config: state.config,
      headVersion: state.headVersion,
    });
  } catch (error) {
    console.error('Error fetching accuracy system status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
