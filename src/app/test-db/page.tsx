import { supabase } from '@/lib/supabase'
import { queryPostgres } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface TableCount {
  table: string
  count: number
  status: 'ok' | 'error'
  error?: string
}

export default async function TestDBPage() {
  // 1. Query Render PostgreSQL directly via pg.Pool
  const tables = [
    'a8r_games_view',
    'traffic_reports',
    'income_reports',
    'player_cohorts',
    'users_view',
    'payments_view',
    'casino_games_view',
    'schema_migrations',
  ]

  const pgCounts: TableCount[] = []
  let pgError: string | null = null
  let latestMigrations: any[] = []

  try {
    const migRes = await queryPostgres(
      'SELECT version, name, applied_at FROM public.schema_migrations ORDER BY version DESC LIMIT 5;'
    )
    latestMigrations = migRes.rows

    for (const t of tables) {
      try {
        const res = await queryPostgres(`SELECT count(*) as count FROM public.${t};`)
        pgCounts.push({
          table: t,
          count: parseInt(res.rows[0]?.count || '0', 10),
          status: 'ok',
        })
      } catch (err: any) {
        pgCounts.push({
          table: t,
          count: 0,
          status: 'error',
          error: err.message,
        })
      }
    }
  } catch (err: any) {
    pgError = err.message
  }

  // 2. Query Supabase PostgREST (frontend anon key)
  const { data: supabaseUsers, error: usersError } = await supabase
    .from('users_view')
    .select('id, email, created_at')
    .limit(5)

  const { data: supabaseGames, error: gamesError } = await supabase
    .from('a8r_games_view')
    .select('id, title, provider')
    .limit(5)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Connectivity & Target Verification</h1>
        <p className="text-muted-foreground mt-1">
          Comparison between direct PostgreSQL (Render Dev Cloud DB) and Supabase PostgREST API.
        </p>
      </div>

      {/* Render PostgreSQL Cloud Database */}
      <section className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              Render PostgreSQL (Cloud Database — Dev)
            </h2>
            <p className="text-sm text-muted-foreground">
              Primary source-of-truth host for migrations, 1M replica rows, and real SoftSwiss vendor data.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Target: {process.env.DATABASE_TARGET?.toUpperCase() || 'DEV'}
          </span>
        </div>

        {pgError ? (
          <div className="p-4 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-lg text-sm">
            PostgreSQL Connection Error: {pgError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pgCounts.map((item) => (
                <div key={item.table} className="p-3 bg-muted/50 rounded-lg border">
                  <div className="text-xs text-muted-foreground font-mono truncate">{item.table}</div>
                  <div className="text-2xl font-bold mt-1">
                    {item.status === 'ok' ? item.count.toLocaleString() : 'Error'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                    {item.status === 'ok' ? 'Live & Verified' : item.error}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Latest Applied Migrations (schema_migrations)</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left font-mono">
                  <thead className="bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Version</th>
                      <th className="p-2.5">Migration Name</th>
                      <th className="p-2.5">Applied At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestMigrations.map((m) => (
                      <tr key={m.version} className="hover:bg-muted/30">
                        <td className="p-2.5 font-bold text-emerald-600">{m.version}</td>
                        <td className="p-2.5">{m.name}</td>
                        <td className="p-2.5 text-muted-foreground">{new Date(m.applied_at).toUTCString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Supabase PostgREST API */}
      <section className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Supabase PostgREST API
            </h2>
            <p className="text-sm text-muted-foreground">
              REST endpoint: <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Anon Key Access
          </span>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          <strong>Security Note:</strong> Queries through the Supabase anon key use PostgREST. If Row-Level Security (RLS) is active without public SELECT policies, or tables are hosted in Render PostgreSQL instead of Supabase, PostgREST returns 0 rows. Use the backend PostgreSQL connection (`queryPostgres` / `/api/pg-query`) for authenticated live analytics.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold text-sm mb-2">users_view via Supabase REST</h3>
            {usersError ? (
              <div className="text-red-500 text-xs font-mono">{usersError.message}</div>
            ) : (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 font-mono">
                {JSON.stringify(supabaseUsers, null, 2)}
              </pre>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold text-sm mb-2">a8r_games_view via Supabase REST</h3>
            {gamesError ? (
              <div className="text-red-500 text-xs font-mono">{gamesError.message}</div>
            ) : (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 font-mono">
                {JSON.stringify(supabaseGames, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}