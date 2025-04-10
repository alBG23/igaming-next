export class MCPDatabase {
  private readonly serverName = 'supabase'
  private readonly baseUrl = 'http://localhost:3001'

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/mcp-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverName: this.serverName,
          query: 'SELECT 1',
          params: []
        })
      })

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      return { success: true }
    } catch (error) {
      console.error('MCP Connection Error:', error)
      throw new Error('MCP server might not be running. Please ensure the MCP server is started with: npx @modelcontextprotocol/server-postgres postgresql://postgres.dgppxcjafcinmwgzrpnk:Y2unQJNY6J%40PXB6@aws-0-eu-central-1.pooler.supabase.com:5432/postgres --port 3001 --host 0.0.0.0')
    }
  }

  async query(query: string, params: any[] = []) {
    try {
      const response = await fetch(`${this.baseUrl}/mcp-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverName: this.serverName,
          query,
          params
        })
      })

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error) {
      console.error('MCP Query Error:', error)
      throw error
    }
  }
} 