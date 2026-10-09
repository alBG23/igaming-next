import { NextResponse } from 'next/server';
import { runReconciliation } from '@/lib/data-accuracy/engine';
import { dispatchReconciliationAlerts } from '@/lib/data-accuracy/alerting';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const summary = await runReconciliation(days);
    await dispatchReconciliationAlerts(summary);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error running manual reconciliation:', error);
    return NextResponse.json({ error: 'Failed to run reconciliation' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
