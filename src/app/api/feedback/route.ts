import { NextResponse } from 'next/server';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  rating?: number | null;
  route?: string;
  user_email: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// In-memory fallback cache for fast client feedback loop
const inMemoryFeedback: FeedbackItem[] = [
  {
    id: 'fb-init-1',
    category: 'improvement',
    rating: 5,
    message: 'Add 30-day rolling cohort retention view on dashboard',
    route: '/dashboard',
    user_email: DEFAULT_ADMIN_EMAIL,
    status: 'reviewed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'fb-init-2',
    category: 'data',
    rating: 4,
    message: 'Allow filtering VIP players by crypto vs fiat deposit volume',
    route: '/players',
    user_email: DEFAULT_ADMIN_EMAIL,
    status: 'new',
    created_at: new Date(Date.now() - 36000000).toISOString(),
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, message, rating, route: pageRoute, metadata } = body;

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
      user_email: DEFAULT_ADMIN_EMAIL,
      metadata: metadata || {},
    };

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${backendUrl}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const backendData = await res.json();
        inMemoryFeedback.unshift(backendData);
        return NextResponse.json(backendData, { status: 201 });
      }
    } catch {
      // Backend unavailable or running standalone frontend — use fallback
    }

    const localItem: FeedbackItem = {
      id: `fb-local-${Date.now()}`,
      ...payload,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    inMemoryFeedback.unshift(localItem);

    return NextResponse.json(localItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process feedback', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const res = await fetch(`${backendUrl}/api/v1/feedback`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Return local fallback list
  }

  return NextResponse.json(inMemoryFeedback);
}
