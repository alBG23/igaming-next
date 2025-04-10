import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function TestDBPage() {
  // Test basic connectivity
  const { data: users, error: usersError } = await supabase
    .from('users_view')
    .select('*')
    .limit(5)

  // Test metrics tables
  const { data: metrics, error: metricsError } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .limit(5)

  // Test reports
  const { data: incomeReports, error: incomeError } = await supabase
    .from('income_reports')
    .select('*')
    .limit(5)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Users View Test</h2>
          {usersError ? (
            <div className="text-red-500">Error: {usersError.message}</div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(users, null, 2)}
            </pre>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Dashboard Metrics Test</h2>
          {metricsError ? (
            <div className="text-red-500">Error: {metricsError.message}</div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Income Reports Test</h2>
          {incomeError ? (
            <div className="text-red-500">Error: {incomeError.message}</div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(incomeReports, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  )
} 