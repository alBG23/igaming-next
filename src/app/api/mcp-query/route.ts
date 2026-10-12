import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

/**
 * Universal MCP Query Handler
 * Supports localhost, dev, and prod environments:
 * 1. If MCP_SERVER_URL is configured (e.g. external MCP service), proxies the request there.
 * 2. Otherwise, executes directly against the environment's configured PostgreSQL pool
 *    (DATABASE_URL for localhost, dev Render Cloud, or prod).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serverName = 'supabase', query, params = [] } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { data: [], rows: [], error: 'Missing or invalid "query" parameter' },
        { status: 400 }
      )
    }

    // 1. If an external MCP server URL is configured, proxy the request
    const mcpServerUrl = process.env.MCP_SERVER_URL
    if (mcpServerUrl) {
      try {
        const response = await fetch(`${mcpServerUrl.replace(/\/$/, '')}/mcp-query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverName, query, params }),
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          const result = await response.json()
          const rows = result.rows || result.data || []
          return NextResponse.json({
            data: rows,
            rows,
            error: null,
          })
        }
      } catch (proxyError) {
        console.warn('[MCP Query] External MCP server unreachable, falling back to database pool:', proxyError)
      }
    }

    // 2. Direct database execution (localhost / dev / prod via DATABASE_URL)
    const pool = getDbPool()
    const result = await pool.query(query, params)

    return NextResponse.json({
      data: result.rows,
      rows: result.rows,
      error: null,
    })
  } catch (error: any) {
    console.error('MCP Query API Error:', error)
    return NextResponse.json(
      {
        data: [],
        rows: [],
        error: error.message || 'Failed to execute MCP query',
      },
      { status: 200 }
    )
  }
}