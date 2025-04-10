import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { serverName, query, params } = await request.json()

    // Here you would use the Cursor API to execute the query
    // For now, we'll use a placeholder response
    const response = await fetch('http://localhost:3001/mcp-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serverName,
        query,
        params
      })
    })

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('MCP Query API Error:', error)
    return NextResponse.json(
      { error: 'Failed to execute query' },
      { status: 500 }
    )
  }
} 