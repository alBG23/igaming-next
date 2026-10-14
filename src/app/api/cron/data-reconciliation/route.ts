import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function retiredResponse() {
  return NextResponse.json(
    {
      error: 'The frontend reconciliation cron is retired. Scheduled reconciliation is owned by the backend QA loop.',
    },
    { status: 410 },
  );
}

export async function GET() {
  return retiredResponse();
}

export async function POST() {
  return retiredResponse();
}
