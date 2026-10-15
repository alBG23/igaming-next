import { Pool } from 'pg'

// Global singleton pool for Next.js hot-reloading
const globalForDb = global as unknown as { pgPool?: Pool }

export function getDbPool(): Pool {
  if (!globalForDb.pgPool) {
    const target = (process.env.DATABASE_TARGET || '').toLowerCase()
    let connectionString = process.env.DATABASE_URL

    if (target === 'dev') {
      connectionString =
        process.env.DEV_DATABASE_URL ||
        process.env.DEV_DB_URL ||
        process.env.EXTERNAL_DB ||
        process.env.DATABASE_URL
    } else if (target === 'prod') {
      connectionString =
        process.env.PROD_DATABASE_URL ||
        process.env.PROD_DB_URL ||
        process.env.DATABASE_URL
    } else if (target === 'local') {
      connectionString =
        process.env.LOCAL_DATABASE_URL ||
        process.env.LOCAL_DB_URL ||
        'postgresql://localhost:5432/luckystart'
    }

    if (!connectionString) {
      connectionString =
        process.env.DATABASE_URL ||
        process.env.INTERNAL_DB ||
        'postgresql://localhost:5432/luckystart'
    }

    const isSsl = connectionString.includes('sslmode=require') || connectionString.includes('render.com')

    globalForDb.pgPool = new Pool({
      connectionString,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    globalForDb.pgPool.on('error', (err) => {
      console.error('[Postgres Pool Error]', err)
    })
  }

  return globalForDb.pgPool
}

export async function queryPostgres<T = any>(
  text: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getDbPool()
  const res = await pool.query(text, params)
  return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length }
}
