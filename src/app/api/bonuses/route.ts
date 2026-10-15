import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface BonusRecord {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  amount_cents: number
  amount_wager_cents: number
  amount_locked_cents: number
  valid_until: string
  activated_at: string | null
  finished_at: string | null
  strategy?: string
  type: 'bonus' | 'freespin'
  game_id?: string
  spins_count?: number
  spins_used?: number
}

interface BonusQueryRow {
  id: number | string
  created_at: string
  account_id: number | string
  title: string
  status: string
  amount_cents: number | string | null
  amount_wager_cents: number | string | null
  amount_locked_cents: number | string | null
  valid_until: string
  activated_at: string | null
  finished_at: string | null
  strategy: string | null
  type: 'bonus' | 'freespin'
  game_id: string | null
  spins_count: number | string | null
  spins_used: number | string | null
}

function numberOrZero(value: number | string | null): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapBonusRecord(row: BonusQueryRow): BonusRecord {
  return {
    id: String(row.id),
    created_at: row.created_at,
    account_id: String(row.account_id),
    title: row.title,
    status: row.status,
    amount_cents: numberOrZero(row.amount_cents),
    amount_wager_cents: numberOrZero(row.amount_wager_cents),
    amount_locked_cents: numberOrZero(row.amount_locked_cents),
    valid_until: row.valid_until,
    activated_at: row.activated_at,
    finished_at: row.finished_at,
    strategy: row.strategy ?? undefined,
    type: row.type,
    game_id: row.game_id ?? undefined,
    spins_count: numberOrZero(row.spins_count),
    spins_used: numberOrZero(row.spins_used),
  }
}

function buildFilters(searchParams: URLSearchParams): { where: string; values: string[] } {
  const clauses: string[] = []
  const values: string[] = []
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const status = searchParams.get('status')
  const search = searchParams.get('search')?.trim()

  if (startDate) {
    values.push(startDate)
    clauses.push(`created_at >= $${values.length}`)
  }
  if (endDate) {
    values.push(endDate)
    clauses.push(`created_at <= $${values.length}`)
  }
  if (status && status !== 'all') {
    values.push(status)
    clauses.push(`status = $${values.length}`)
  }
  if (search) {
    values.push(`%${search}%`)
    clauses.push(`(title ILIKE $${values.length} OR account_id::text ILIKE $${values.length})`)
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
}

const BONUS_SELECT = `
  SELECT
    id::text,
    created_at::text,
    account_id::text,
    title,
    status,
    COALESCE(amount_cents, 0)::bigint AS amount_cents,
    COALESCE(amount_wager_cents, 0)::bigint AS amount_wager_cents,
    COALESCE(amount_locked_cents, 0)::bigint AS amount_locked_cents,
    valid_until::text,
    activated_at::text,
    finished_at::text,
    COALESCE(strategy, 'deposit_match') AS strategy,
    'bonus' AS type,
    NULL::text AS game_id,
    0::bigint AS spins_count,
    0::bigint AS spins_used
  FROM bonus_issues_view
`

const FREESPIN_SELECT = `
  SELECT
    id::text,
    created_at::text,
    account_id::text,
    title,
    status,
    COALESCE(win_amount_cents, 0)::bigint AS amount_cents,
    0::bigint AS amount_wager_cents,
    0::bigint AS amount_locked_cents,
    valid_until::text,
    NULL::text AS activated_at,
    NULL::text AS finished_at,
    COALESCE(provider, 'slots') AS strategy,
    'freespin' AS type,
    COALESCE(provider, 'slots') AS game_id,
    COALESCE(freespins_total, 0)::bigint AS spins_count,
    COALESCE(freespins_performed, 0)::bigint AS spins_used
  FROM freespin_issues_view
`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const { where, values } = buildFilters(searchParams)
    const pool = getDbPool()
    const queries: Promise<{ rows: BonusQueryRow[] }>[] = []

    if (!type || type === 'all' || type === 'bonus') {
      queries.push(pool.query<BonusQueryRow>(`${BONUS_SELECT} ${where} ORDER BY created_at DESC`, values))
    }
    if (!type || type === 'all' || type === 'freespin') {
      queries.push(pool.query<BonusQueryRow>(`${FREESPIN_SELECT} ${where} ORDER BY created_at DESC`, values))
    }
    if (queries.length === 0) {
      return NextResponse.json({ data: [], count: 0, error: 'Unsupported bonus type.' }, { status: 400 })
    }

    const results = await Promise.all(queries)
    const records: BonusRecord[] = results
      .flatMap(result => result.rows)
      .map(mapBonusRecord)
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())

    const bonuses = records.filter(record => record.type === 'bonus')
    const freespins = records.filter(record => record.type === 'freespin')
    const totalBonusAmount = bonuses.reduce((sum, record) => sum + record.amount_cents, 0)
    const totalFreespinsWinAmount = freespins.reduce((sum, record) => sum + record.amount_cents, 0)
    const activeWageringAmount = bonuses.reduce(
      (sum, record) => sum + (record.status === 'active' ? record.amount_wager_cents : 0),
      0,
    )
    const completedCount = records.filter(record => record.status === 'completed').length

    return NextResponse.json({
      data: records,
      count: records.length,
      metrics: {
        totalBonusesIssued: bonuses.length,
        totalBonusAmount,
        totalFreespinsIssued: freespins.reduce((sum, record) => sum + (record.spins_count ?? 0), 0),
        totalFreespinsWinAmount,
        activeWageringAmount,
        completionRate: records.length > 0 ? (completedCount / records.length) * 100 : 0,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load bonus analytics.'
    console.error('[Bonuses API] Failed to load bonus analytics:', error)
    return NextResponse.json({ data: null, count: 0, error: message }, { status: 500 })
  }
}
