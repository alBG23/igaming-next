import { NextResponse } from 'next/server';
import {
  dataAccuracyBackendError,
  forwardDataAccuracyResponse,
  requestDataAccuracyBackend,
} from '@/lib/data-accuracy/backend';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const requestedDays = Number(new URL(request.url).searchParams.get('days') || 7);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 90) {
      return NextResponse.json({ error: 'days must be an integer from 1 to 90' }, { status: 400 });
    }

    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (requestedDays - 1));
    const query = new URLSearchParams({
      date_from: start.toISOString().slice(0, 10),
      date_to: end.toISOString().slice(0, 10),
      send: 'true',
    });
    const response = await requestDataAccuracyBackend(
      request,
      `/api/v1/data-qa/cross-source?${query}`,
    );
    return forwardDataAccuracyResponse(response);
  } catch (error) {
    return dataAccuracyBackendError(error, 'Unable to run data-accuracy reconciliation');
  }
}
