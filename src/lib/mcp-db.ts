// MCP Database Client
export class MCPDatabase {
  private serverName: string = 'supabase'
  private baseUrl: string = 'http://localhost:3000'

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      console.log('Attempting to connect to MCP server at:', this.baseUrl)
      
      const response = await fetch(`${this.baseUrl}/api/mcp-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverName: this.serverName,
          query: sql,
          params: params || []
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('MCP Server Response Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      
      if (!result || !Array.isArray(result.rows)) {
        console.error('Invalid MCP Server Response:', result)
        throw new Error('Invalid response format from MCP server')
      }

      return result.rows
    } catch (error) {
      console.error('MCP Query Error:', error)
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        console.error('MCP server might not be running. Please ensure the MCP server is started.')
      }
      throw error
    }
  }

  async testConnection() {
    try {
      console.log('Testing MCP server connection...')
      const result = await this.query('SELECT current_database() as db_name')
      console.log('MCP Connection Test Success:', result[0])
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('MCP Connection Error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown connection error')
      }
    }
  }
}

// Create a singleton instance
export const mcpDb = new MCPDatabase() 