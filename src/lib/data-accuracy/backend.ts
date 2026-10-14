import { NextResponse } from 'next/server';

export async function requestDataAccuracyBackend(
  request: Request,
  path: string,
  init: RequestInit = {},
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required for data-accuracy requests');
  }

  const headers = new Headers(init.headers);
  const sessionCookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('ls_session='));
  const authorization = request.headers.get('authorization');

  if (sessionCookie) headers.set('Cookie', sessionCookie);
  if (authorization) headers.set('Authorization', authorization);

  return fetch(new URL(path, backendUrl), {
    ...init,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
}

export async function forwardDataAccuracyResponse(response: Response) {
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}

export function dataAccuracyBackendError(error: unknown, context: string) {
  console.error(`${context}:`, error);
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : 'Data-accuracy backend request failed',
    },
    { status: 503 },
  );
}
