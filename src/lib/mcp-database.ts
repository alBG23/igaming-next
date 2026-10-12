export class MCPDatabase {
  private readonly serverName = 'supabase'
  private readonly baseUrl =
    typeof window !== 'undefined'
      ? ''
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp-query`, {
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
      throw new Error('MCP server might not be running. Ensure the database service or MCP server is running.')
    }
  }

  async query(query: string, params: any[] = []) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp-query`, {
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