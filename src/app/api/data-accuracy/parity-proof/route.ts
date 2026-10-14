import { NextResponse } from 'next/server';
import {
  dataAccuracyBackendError,
  forwardDataAccuracyResponse,
  requestDataAccuracyBackend,
} from '@/lib/data-accuracy/backend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestedDays = Number(new URL(request.url).searchParams.get('days') || 7);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 90) {
      return NextResponse.json({ error: 'days must be an integer from 1 to 90' }, { status: 400 });
    }

    const response = await requestDataAccuracyBackend(
      request,
      `/api/v1/data-qa/parity-proof?days=${requestedDays}`,
    );
    return forwardDataAccuracyResponse(response);
  } catch (error) {
    return dataAccuracyBackendError(error, 'Unable to retrieve data-accuracy parity proof');
  }
}
