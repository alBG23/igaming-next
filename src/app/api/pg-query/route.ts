import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

// Table mapping aliases for compatibility
const TABLE_ALIASES: Record<string, string> = {
  users: 'users_view',
  payments: 'payments_view',
  game_sessions: 'casino_games_view',
  casino_games: 'casino_games_view',
}

interface FilterCondition {
  column: string
  operator: string
  value: any
}

interface QueryRequest {
  table?: string
  select?: string
  filters?: FilterCondition[]
  order?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
  countOnly?: boolean
  sql?: string
  params?: any[]
}

export async function POST(request: Request) {
  try {
    const body: QueryRequest = await request.json()
    const pool = getDbPool()

    // 1. Direct SQL execution if provided
    if (body.sql) {
      try {
        const result = await pool.query(body.sql, body.params || [])
        return NextResponse.json({
          data: result.rows,
          count: result.rowCount,
          error: null,
        })
      } catch (sqlErr: any) {
        console.warn('[Postgres Query SQL Warning]:', sqlErr.message)
        // If relation does not exist, return empty data rather than breaking
        if (sqlErr.code === '42P01') {
          return NextResponse.json({ data: [], count: 0, error: null })
        }
        return NextResponse.json(
          { data: null, count: 0, error: sqlErr.message },
          { status: 400 }
        )
      }
    }

    // 2. Structured query builder
    const rawTable = body.table || 'users_view'
    const targetTable = TABLE_ALIASES[rawTable] || rawTable

    // Build SELECT clause
    let selectClause = '*'
    if (body.select && body.select.trim() !== '*') {
      // Clean up column selection
      const cols = body.select
        .split(',')
        .map((c) => c.trim())
        .filter((c) => /^[a-zA-Z0-9_\*\.]+$/.test(c))
      if (cols.length > 0) {
        selectClause = cols.join(', ')
      }
    }

    const whereClauses: string[] = []
    const params: any[] = []

    if (body.filters && Array.isArray(body.filters)) {
      for (const filter of body.filters) {
        const { column, operator, value } = filter
        // Validate column identifier
        if (!/^[a-zA-Z0-9_]+$/.test(column)) continue

        const paramIdx = params.length + 1

        switch (operator) {
          case 'eq':
            whereClauses.push(`"${column}" = $${paramIdx}`)
            params.push(value)
            break
          case 'neq':
            whereClauses.push(`"${column}" != $${paramIdx}`)
            params.push(value)
            break
          case 'gt':
            whereClauses.push(`"${column}" > $${paramIdx}`)
            params.push(value)
            break
          case 'gte':
            whereClauses.push(`"${column}" >= $${paramIdx}`)
            params.push(value)
            break
          case 'lt':
            whereClauses.push(`"${column}" < $${paramIdx}`)
            params.push(value)
            break
          case 'lte':
            whereClauses.push(`"${column}" <= $${paramIdx}`)
            params.push(value)
            break
          case 'like':
            whereClauses.push(`"${column}"::text LIKE $${paramIdx}`)
            params.push(value)
            break
          case 'ilike':
            whereClauses.push(`"${column}"::text ILIKE $${paramIdx}`)
            params.push(value)
            break
          case 'is':
            if (value === null) {
              whereClauses.push(`"${column}" IS NULL`)
            } else {
              whereClauses.push(`"${column}" = $${paramIdx}`)
              params.push(value)
            }
            break
          case 'not_null':
            whereClauses.push(`"${column}" IS NOT NULL`)
            break
          case 'in':
            if (Array.isArray(value) && value.length > 0) {
              const inPlaceholders = value
                .map((_, i) => `$${params.length + 1 + i}`)
                .join(', ')
              whereClauses.push(`"${column}" IN (${inPlaceholders})`)
              params.push(...value)
            }
            break
          case 'or':
            // e.g. email.ilike.%test%,tags.ilike.%test%
            if (typeof value === 'string') {
              const parts = value.split(',').map((p) => p.trim())
              const orConditions: string[] = []
              for (const part of parts) {
                const [col, op, ...valParts] = part.split('.')
                const val = valParts.join('.')
                if (col && /^[a-zA-Z0-9_]+$/.test(col)) {
                  const pIdx = params.length + 1
                  if (op === 'ilike') {
                    orConditions.push(`"${col}"::text ILIKE $${pIdx}`)
                    params.push(val)
                  } else if (op === 'eq') {
                    orConditions.push(`"${col}" = $${pIdx}`)
                    params.push(val)
                  }
                }
              }
              if (orConditions.length > 0) {
                whereClauses.push(`(${orConditions.join(' OR ')})`)
              }
            }
            break
        }
      }
    }

    const whereString =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Ordering
    let orderString = ''
    if (body.order?.column && /^[a-zA-Z0-9_]+$/.test(body.order.column)) {
      const dir = body.order.ascending === false ? 'DESC' : 'ASC'
      orderString = `ORDER BY "${body.order.column}" ${dir}`
    }

    // Pagination
    let limitOffsetString = ''
    if (body.limit !== undefined && Number.isInteger(body.limit)) {
      limitOffsetString += ` LIMIT ${body.limit}`
    }
    if (body.offset !== undefined && Number.isInteger(body.offset)) {
      limitOffsetString += ` OFFSET ${body.offset}`
    }

    // Construct query
    const sql = `SELECT ${selectClause} FROM "${targetTable}" ${whereString} ${orderString} ${limitOffsetString};`

    try {
      const result = await pool.query(sql, params)

      // Count query if requested or useful
      let count = result.rowCount
      if (body.countOnly) {
        const countSql = `SELECT count(*)::int as total FROM "${targetTable}" ${whereString};`
        const countRes = await pool.query(countSql, params)
        count = countRes.rows[0]?.total || 0
      }

      return NextResponse.json({
        data: result.rows,
        count,
        error: null,
      })
    } catch (dbErr: any) {
      console.warn(`[Postgres Table Query Warning] (${targetTable}):`, dbErr.message)

      // If table doesn't exist, gracefully return empty results
      if (dbErr.code === '42P01') {
        return NextResponse.json({
          data: [],
          count: 0,
          error: null,
        })
      }

      // If a column doesn't exist (e.g. 42703), retry with SELECT * or return empty
      if (dbErr.code === '42703') {
        try {
          const fallbackRes = await pool.query(`SELECT * FROM "${targetTable}" ${limitOffsetString};`)
          return NextResponse.json({
            data: fallbackRes.rows,
            count: fallbackRes.rowCount,
            error: null,
          })
        } catch {
          return NextResponse.json({ data: [], count: 0, error: null })
        }
      }

      return NextResponse.json(
        { data: [], count: 0, error: dbErr.message },
        { status: 200 }
      )
    }
  } catch (err: any) {
    console.error('[Postgres Route Error]:', err)
    return NextResponse.json(
      { data: [], count: 0, error: err.message },
      { status: 500 }
    )
  }
}
