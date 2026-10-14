import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const serviceName = process.env.RENDER_SERVICE_NAME || 
    (process.env.NEXT_PUBLIC_APP_URL?.includes('3ljx') || process.env.NEXT_PUBLIC_APP_URL === 'https://igaming-frontend.onrender.com'
      ? 'igaming-frontend'
      : 'igaming-frontend-dev')

  return NextResponse.json({
    status: 'ok',
    service: serviceName,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Render-Uptime-Hook': 'active'
    }
  })
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Render-Uptime-Hook': 'active'
    }
  })
}
