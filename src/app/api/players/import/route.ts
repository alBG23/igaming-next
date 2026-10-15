import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'
import type { PoolClient } from 'pg'

export const dynamic = 'force-dynamic'

type PlayerStatus = 'Active' | 'Inactive'

interface ImportedPlayer {
  id: string
  name: string | null
  email: string
  status: PlayerStatus
  tier: string | null
  balance: number | null
  currency: string | null
  country: string | null
  lastLogin: string | null
  registeredAt: string | null
}

class ImportValidationError extends Error {}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"' && inQuotes && line[index + 1] === '"') {
      value += '"'
      index += 1
    } else if (character === '"') {
      inQuotes = !inQuotes
    } else if (character === ',' && !inQuotes) {
      values.push(value.trim())
      value = ''
    } else {
      value += character
    }
  }

  if (inQuotes) throw new ImportValidationError('CSV contains an unclosed quoted field.')
  values.push(value.trim())
  return values
}

function getField(record: Record<string, unknown>, ...names: string[]) {
  for (const name of names) {
    const value = record[name]
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim()
  }
  return null
}

function parseImportedPlayer(record: Record<string, unknown>, rowNumber: number): ImportedPlayer {
  const rawId = record.id ?? record.userid ?? record.user_id ?? record.sourceid ?? record.source_id
  const idValue = getField(record, 'id', 'userid', 'user_id', 'sourceid', 'source_id')
  const email = getField(record, 'email', 'useremail', 'user_email', 'mail')
  const statusValue = getField(record, 'status', 'state')?.toLowerCase()

  if (typeof rawId === 'number' && !Number.isSafeInteger(rawId)) {
    throw new ImportValidationError(`Row ${rowNumber}: source player ID exceeds the safe numeric range.`)
  }
  if (!idValue || !/^[1-9]\d*$/.test(idValue)) {
    throw new ImportValidationError(`Row ${rowNumber}: a positive source player ID is required.`)
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ImportValidationError(`Row ${rowNumber}: a valid email is required.`)
  }
  if (!statusValue || !['active', 'inactive', 'disabled', 'suspended'].includes(statusValue)) {
    throw new ImportValidationError(`Row ${rowNumber}: status must be Active, Inactive, Disabled, or Suspended.`)
  }

  const balanceValue = getField(record, 'balance')
  const currency = getField(record, 'currency')?.toUpperCase() ?? null
  const balance = balanceValue === null ? null : Number(balanceValue)
  if (balanceValue !== null && (!Number.isFinite(balance) || !currency)) {
    throw new ImportValidationError(`Row ${rowNumber}: a finite balance and its currency must be provided together.`)
  }
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    throw new ImportValidationError(`Row ${rowNumber}: currency must be a three-letter code.`)
  }
  if (balance !== null && currency) {
    try {
      if (!Number.isSafeInteger(Math.round(balance * minorUnitDivisor(currency)))) {
        throw new ImportValidationError(`Row ${rowNumber}: balance exceeds the supported precision.`)
      }
    } catch (error) {
      if (error instanceof ImportValidationError) throw error
      throw new ImportValidationError(`Row ${rowNumber}: currency is not supported.`)
    }
  }

  const name = getField(record, 'name', 'fullname', 'full_name')
    || [getField(record, 'firstname', 'first_name'), getField(record, 'lastname', 'last_name')].filter(Boolean).join(' ')
    || null

  return {
    id: idValue,
    name,
    email,
    status: statusValue === 'active' ? 'Active' : 'Inactive',
    tier: getField(record, 'viptier', 'vip_tier', 'tier', 'tags'),
    balance,
    currency,
    country: getField(record, 'country', 'ctag'),
    lastLogin: getField(record, 'lastlogin', 'last_login', 'lastsigninat', 'last_sign_in_at'),
    registeredAt: getField(record, 'registeredat', 'registered_at', 'createdat', 'created_at'),
  }
}

function parseCsv(content: string): ImportedPlayer[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) throw new ImportValidationError('CSV must contain a header and at least one player row.')

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/[\s_-]+/g, ''))
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line)
    const record: Record<string, unknown> = {}
    headers.forEach((header, column) => {
      record[header] = values[column] ?? ''
    })
    return parseImportedPlayer(record, index + 2)
  })
}

function parseJson(content: string): ImportedPlayer[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new ImportValidationError('JSON is not valid.')
  }

  const root = parsed as { players?: unknown; data?: unknown }
  const entries = Array.isArray(parsed)
    ? parsed
    : Array.isArray(root?.players)
      ? root.players
      : Array.isArray(root?.data)
        ? root.data
        : null
  if (!entries?.length) throw new ImportValidationError('JSON must contain a non-empty player array.')

  return entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ImportValidationError(`Row ${index + 1}: expected a player object.`)
    }
    return parseImportedPlayer(entry as Record<string, unknown>, index + 1)
  })
}

function minorUnitDivisor(currency: string) {
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits
  if (typeof digits !== 'number') throw new Error('Currency precision is unavailable.')
  return 10 ** digits
}

export async function POST(request: Request) {
  let players: ImportedPlayer[]
  try {
    const body = await request.json()
    if (!body || typeof body.raw_content !== 'string') {
      throw new ImportValidationError('Player export content is required.')
    }

    const content = body.raw_content.trim()
    if (/^\s*(insert|update|delete|create|drop|alter|select)\b/i.test(content)) {
      throw new ImportValidationError('Only CSV and JSON player exports are supported; SQL is not accepted.')
    }
    const format = body.format || (content.startsWith('{') || content.startsWith('[') ? 'json' : 'csv')
    if (format !== 'json' && format !== 'csv') {
      throw new ImportValidationError('Only CSV and JSON player exports are supported; SQL is not accepted.')
    }
    players = format === 'json' ? parseJson(content) : parseCsv(content)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Invalid player import.' },
      { status: 400 },
    )
  }

  let client: PoolClient
  try {
    client = await getDbPool().connect()
  } catch (error) {
    console.error('[POST /api/players/import] Database connection failed:', error)
    return NextResponse.json(
      { success: false, error: 'Player data source is unavailable; no records were imported.' },
      { status: 503 },
    )
  }
  try {
    await client.query('BEGIN')

    for (const player of players) {
      const disabled = player.status === 'Inactive'
      const user = await client.query(`
        INSERT INTO users_view (id, email, disabled, suspended, tags, ctag, created_at, updated_at, last_sign_in_at)
        VALUES ($1, $2, $3, false, $4, $5, $6::timestamp, NOW(), $7::timestamp)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          disabled = EXCLUDED.disabled,
          tags = COALESCE(EXCLUDED.tags, users_view.tags),
          ctag = COALESCE(EXCLUDED.ctag, users_view.ctag),
          created_at = COALESCE(EXCLUDED.created_at, users_view.created_at),
          last_sign_in_at = COALESCE(EXCLUDED.last_sign_in_at, users_view.last_sign_in_at)
        WHERE users_view.email = EXCLUDED.email
        RETURNING id
      `, [
        player.id,
        player.email,
        disabled,
        player.tier,
        player.country,
        player.registeredAt,
        player.lastLogin,
      ])
      if (user.rowCount !== 1) {
        throw new ImportValidationError(`Source ID conflict for import row ${player.id}; no records were committed.`)
      }

      if (player.balance !== null && player.currency !== null) {
        const amountMinor = Math.round(player.balance * minorUnitDivisor(player.currency))
        await client.query(`
          INSERT INTO accounts_view (id, user_id, amount_cents, currency, created_at, updated_at)
          VALUES ($1, $1, $2, $3, $4::timestamp, NOW())
          ON CONFLICT (id) DO UPDATE SET
            amount_cents = EXCLUDED.amount_cents,
            currency = EXCLUDED.currency
        `, [player.id, amountMinor, player.currency, player.registeredAt])
      }

      if (player.name || player.country) {
        const [firstName = null, ...lastNameParts] = (player.name || '').split(/\s+/).filter(Boolean)
        await client.query(`
          INSERT INTO profiles_view (id, user_id, first_name, last_name, full_name, country, created_at, updated_at)
          VALUES ($1, $1, $2, $3, $4, $5, $6::timestamp, NOW())
          ON CONFLICT (id) DO UPDATE SET
            first_name = COALESCE(EXCLUDED.first_name, profiles_view.first_name),
            last_name = COALESCE(EXCLUDED.last_name, profiles_view.last_name),
            full_name = COALESCE(EXCLUDED.full_name, profiles_view.full_name),
            country = COALESCE(EXCLUDED.country, profiles_view.country)
        `, [
          player.id,
          firstName,
          lastNameParts.join(' ') || null,
          player.name,
          player.country,
          player.registeredAt,
        ])
      }
    }

    await client.query('COMMIT')
    return NextResponse.json({ success: true, count: players.length })
  } catch (error) {
    await client.query('ROLLBACK')
    if (error instanceof ImportValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 })
    }
    console.error('[POST /api/players/import] Import failed:', error)
    return NextResponse.json(
      { success: false, error: 'Player import failed; no records were committed.' },
      { status: 503 },
    )
  } finally {
    client.release()
  }
}
