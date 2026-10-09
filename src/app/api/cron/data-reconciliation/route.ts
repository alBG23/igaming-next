import { NextResponse } from 'next/server';
import { runReconciliation, executeSafeHealing } from '@/lib/data-accuracy/engine';
import { dispatchReconciliationAlerts } from '@/lib/data-accuracy/alerting';

export const dynamic = 'force-dynamic';

/**
 * Data Reconciliation Cron Job Endpoint
 * 
 * Invoked by automated scheduler (e.g., Vercel Cron or Azure Timer).
 * 
 * Execution Lifecycle:
 * 1. Authenticate cron trigger token.
 * 2. Constantly Compare vs Source of Truth across trailing 7-30 days.
 * 3. Classify Discrepancy Risk & Invariants (identity, prebuilt vs source).
 * 4. Safe Auto-Heal: Rebuild prebuilt-under / version-stuck slices within strict budgets.
 * 5. Quarantine Risky Slices (prevent data destruction).
 * 6. Multi-Channel Alerting: Dispatch Slack/Telegram digest + SLA escalation.
 */
export async function GET(request: Request) {
  try {
    // 1. Cron Secret Auth (allow bypass if no secret configured in development)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Run Reconciliation across trailing 7 days
    const summary = await runReconciliation(7);

    // 3. Auto-Heal Safe Discrepancies (bounded by daily & monetary budget)
    const healResult = await executeSafeHealing({ allSafeOnly: true });

    // 4. Dispatch Alerts on critical findings, SLA breaches, or recoveries
    const alertsDispatched = await dispatchReconciliationAlerts(summary);

    return NextResponse.json({
      success: true,
      message: 'Automated data reconciliation cycle completed successfully',
      stats: {
        accuracyScorePct: summary.accuracyScorePct,
        totalChecked: summary.totalChecks,
        matches: summary.matches,
        drifts: summary.drifts,
        mismatches: summary.mismatches,
        safeHealsAttempted: healResult.totalAttempted,
        safeHealsApplied: healResult.totalHealed,
        quarantinedRiskyCount: summary.quarantinedCount,
        alertsSent: alertsDispatched.length,
      },
      runId: summary.runId,
      timestamp: summary.timestamp,
    });
  } catch (error) {
    console.error('Data reconciliation cron error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during data reconciliation' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
