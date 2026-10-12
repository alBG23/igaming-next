import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://igaming-backend-dev.onrender.com'
  let backendStatus = 'skipped'

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(`${backendUrl}/api/v1/health`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Render-KeepAlive-Hook/1.0' }
    })
    clearTimeout(timeout)
    backendStatus = res.ok ? 'healthy' : `status_${res.status}`
  } catch (err: any) {
    backendStatus = err?.name === 'AbortError' ? 'timeout' : 'unreachable'
  }

  return NextResponse.json({
    status: 'ok',
    frontend: {
      service: 'igaming-frontend-dev',
      uptimeSeconds: Math.floor(process.uptime()),
    },
    backend: {
      target: `${backendUrl}/api/v1/health`,
      status: backendStatus
    },
    timestamp: new Date().toISOString()
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Render-Uptime-Hook': 'active'
    }
  })
}
