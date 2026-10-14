import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function backendAuthHeaders(request: Request) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const sessionCookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('ls_session='));
  const authorization = request.headers.get('authorization');

  if (sessionCookie) headers.set('Cookie', sessionCookie);
  if (authorization) headers.set('Authorization', authorization);
  return headers;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, message, rating, route: pageRoute, metadata, contact_email } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback message cannot be empty' },
        { status: 400 }
      );
    }

    const payload = {
      category: category || 'general',
      message: message.trim(),
      rating: typeof rating === 'number' ? rating : null,
      route: pageRoute || '/',
      contact_email: typeof contact_email === 'string' ? contact_email.trim() : null,
      metadata: metadata || {},
    };

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/v1/feedback`, {
      method: 'POST',
      headers: backendAuthHeaders(request),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const responseBody = await res.json();
    return NextResponse.json(responseBody, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process feedback',
      },
      { status: 503 }
    );
  }
}

export async function GET(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const res = await fetch(`${backendUrl}/api/v1/feedback`, {
      headers: backendAuthHeaders(request),
      signal: AbortSignal.timeout(2000),
    });
    const responseBody = await res.json();
    return NextResponse.json(responseBody, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve feedback' },
      { status: 503 },
    );
  }
}
