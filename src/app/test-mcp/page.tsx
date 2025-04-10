import { mcpDb } from '@/lib/mcp-db'

export const dynamic = 'force-dynamic'

export default async function TestMCPPage() {
  // Test basic connectivity
  const connectionTest = await mcpDb.testConnection()

  // Test querying users
  const users = await mcpDb.query(`
    SELECT id, email, created_at 
    FROM users_view 
    LIMIT 5
  `)

  // Test querying metrics
  const metrics = await mcpDb.query(`
    SELECT * 
    FROM dashboard_metrics 
    LIMIT 5
  `)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">MCP Database Connection Test</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          {connectionTest.success ? (
            <div className="text-green-600">
              Successfully connected to database: {connectionTest.data.db_name}
            </div>
          ) : (
            <div className="text-red-500">
              Connection failed: {connectionTest.error?.message}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Users View Test</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(users, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Dashboard Metrics Test</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
} 