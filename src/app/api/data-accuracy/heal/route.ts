import { NextResponse } from 'next/server';
import { executeSafeHealing } from '@/lib/data-accuracy/engine';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { findingIds, allSafeOnly, forceOverride } = body;

    const result = await executeSafeHealing({
      findingIds,
      allSafeOnly: allSafeOnly ?? true,
      forceOverride: forceOverride ?? false,
    });

    return NextResponse.json({
      success: result.success,
      totalAttempted: result.totalAttempted,
      totalHealed: result.totalHealed,
      results: result.results,
    });
  } catch (error) {
    console.error('Error executing healing operation:', error);
    return NextResponse.json({ error: 'Failed to execute healing operation' }, { status: 500 });
  }
}
