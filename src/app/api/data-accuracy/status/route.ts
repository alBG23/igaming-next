import { NextResponse } from 'next/server';
import {
  dataAccuracyBackendError,
  forwardDataAccuracyResponse,
  requestDataAccuracyBackend,
} from '@/lib/data-accuracy/backend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);
    const window = new URLSearchParams({
      date_from: start.toISOString().slice(0, 10),
      date_to: end.toISOString().slice(0, 10),
    });

    const responses = await Promise.all([
      requestDataAccuracyBackend(request, `/api/v1/data-qa/cross-source?${window}`),
      requestDataAccuracyBackend(request, '/api/v1/data-qa/findings'),
      requestDataAccuracyBackend(request, '/api/v1/data-qa/loop'),
      requestDataAccuracyBackend(request, '/api/v1/data-qa/loop/runs?limit=5'),
    ]);
    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) return forwardDataAccuracyResponse(failedResponse);

    const [crossSource, findingQueue, loop, runHistory] = await Promise.all(
      responses.map((response: any) => response.json()),
    );
    const comparisons = crossSource.comparisons || [];
    const missing = crossSource.missing || [];
    const rows = [
      ...comparisons.map((item: any) => ({
        id: `${item.metric}:${item.date}:${item.currency}`,
        date: item.date,
        metric: item.metric,
        currency: item.currency,
        sourceOfTruth: `Back Office (${crossSource.source})`,
        sourceValue: item.ref,
        prebuiltValue: item.ours,
        delta: item.delta,
        deltaPct: item.diff_pct,
        status: item.matches ? 'MATCH' : 'DISCREPANCY',
        riskClassification: 'NOT_ASSESSED',
        riskReason: 'Use the backend findings queue for remediation eligibility.',
        isClosedDay: true,
      })),
      ...missing.map((item: any) => ({
        id: `${item.metric}:${item.date}:${item.currency}`,
        date: item.date,
        metric: item.metric,
        currency: item.currency,
        sourceOfTruth: `Back Office (${crossSource.source})`,
        sourceValue: item.ref,
        prebuiltValue: null,
        delta: null,
        deltaPct: null,
        status: 'MISSING',
        riskClassification: 'NOT_ASSESSED',
        riskReason: 'Application value missing; manual review required.',
        isClosedDay: true,
      })),
    ];
    const compared = comparisons.length;
    const matches = comparisons.filter((item: { matches: boolean }) => item.matches).length;
    const discrepancyCount = (crossSource.gaps || []).length + missing.length;
    const totalChecks = compared + missing.length;

    return NextResponse.json({
      success: true,
      crossSource,
      findings: rows,
      findingQueue: findingQueue.findings || [],
      findingSummary: findingQueue.summary || {},
      loop,
      recentRuns: runHistory.runs || [],
      accuracyScorePct: totalChecks
        ? Number(((matches / totalChecks) * 100).toFixed(2))
        : null,
      summary: {
        totalChecks,
        matches,
        critical: discrepancyCount,
        warning: 0,
        safeHealable: 0,
        quarantined: findingQueue.summary?.tier_b || 0,
        openFindings: findingQueue.summary?.open || 0,
      },
    });
  } catch (error) {
    return dataAccuracyBackendError(error, 'Unable to load data-accuracy status');
  }
}
