import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    path: string[];
  };
};

function isAllowedRequest(method: string, path: string[]) {
  if (path.length === 1 && path[0] === 'proposals') return method === 'GET';
  if (path.length === 1 && path[0] === 'generate') return method === 'POST';
  return (
    method === 'POST' &&
    path.length === 3 &&
    path[0] === 'proposals' &&
    /^\d+$/.test(path[1]) &&
    ['approve', 'reject'].includes(path[2])
  );
}

function backendHeaders(request: Request) {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');
  const authorization = request.headers.get('authorization');
  const userAgent = request.headers.get('user-agent');
  const sessionCookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('ls_session='));

  if (contentType) headers.set('content-type', contentType);
  if (accept) headers.set('accept', accept);
  if (authorization) headers.set('authorization', authorization);
  if (sessionCookie) headers.set('cookie', sessionCookie);
  headers.set('user-agent', userAgent || 'Bright-UI-Curator-Proxy/1.0');
  return headers;
}

async function proxyCuratorRequest(request: Request, context: RouteContext) {
  const { path } = context.params;
  if (!isAllowedRequest(request.method, path)) {
    return NextResponse.json({ error: 'Curator endpoint not found.' }, { status: 404 });
  }

  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!backendBaseUrl) {
    return NextResponse.json(
      { error: 'Server configuration is missing NEXT_PUBLIC_API_URL.' },
      { status: 500 },
    );
  }

  let backendUrl: URL;
  try {
    backendUrl = new URL(
      `${backendBaseUrl.replace(/\/+$/, '')}/api/v1/curator/${path.map(encodeURIComponent).join('/')}${new URL(request.url).search}`,
    );
  } catch {
    return NextResponse.json(
      { error: 'Server configuration contains an invalid NEXT_PUBLIC_API_URL.' },
      { status: 500 },
    );
  }

  if (!['http:', 'https:'].includes(backendUrl.protocol)) {
    return NextResponse.json(
      { error: 'Server configuration must use an HTTP(S) NEXT_PUBLIC_API_URL.' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: backendHeaders(request),
      body: request.method === 'GET' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    headers.set('cache-control', 'no-store');
    return new NextResponse(response.body, { status: response.status, headers });
  } catch (error) {
    console.error('Curator backend request failed:', error);
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return NextResponse.json(
      {
        error: timedOut
          ? 'The curator service request timed out.'
          : 'Unable to reach the curator service.',
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return proxyCuratorRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyCuratorRequest(request, context);
}
