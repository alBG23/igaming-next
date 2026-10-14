import {
  dataAccuracyBackendError,
  forwardDataAccuracyResponse,
  requestDataAccuracyBackend,
} from '@/lib/data-accuracy/backend';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const on = new URL(request.url).searchParams.get('on');
    if (on !== 'true' && on !== 'false') {
      return Response.json({ error: 'on must be true or false' }, { status: 400 });
    }

    const response = await requestDataAccuracyBackend(
      request,
      `/api/v1/data-qa/loop/autofix?on=${on}`,
      { method: 'POST' },
    );
    return forwardDataAccuracyResponse(response);
  } catch (error) {
    return dataAccuracyBackendError(error, 'Unable to update the data-accuracy auto-fix switch');
  }
}
