import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ParsedPlayer {
  id?: number
  name: string
  email: string
  status: 'Active' | 'Inactive'
  vipTier: string
  balance: number
  currency: string
  country: string
  lastLogin?: string
  registeredAt?: string
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values.map(v => v.replace(/^["']|["']$/g, ''))
}

function parseCSV(content: string): ParsedPlayer[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]+/g, ''))
  const players: ParsedPlayer[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0 || !values.some(v => v.length > 0)) continue

    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })

    const email = row['email'] || row['useremail'] || row['mail']
    if (!email || !email.includes('@')) continue

    const name = row['name'] || row['fullname'] || `${row['firstname'] || ''} ${row['lastname'] || ''}`.trim() || email.split('@')[0]
    const statusRaw = (row['status'] || row['state'] || 'Active').toLowerCase()
    const status = statusRaw.includes('inact') || statusRaw.includes('disab') || statusRaw.includes('suspend') ? 'Inactive' : 'Active'
    const vipTier = row['viptier'] || row['tier'] || row['tags'] || row['vip'] || 'Bronze'
    const balance = parseFloat((row['balance'] || row['amount'] || row['amountcents'] || '0').replace(/[^0-9.-]/g, '')) || 0
    const currency = row['currency'] || 'EUR'
    const country = row['country'] || row['ctag'] || 'EU'
    const lastLogin = row['lastlogin'] || row['lastsigninat'] || row['lastseen'] || undefined
    const registeredAt = row['registeredat'] || row['createdat'] || undefined
    const id = parseInt(row['id'] || row['userid'] || '', 10) || undefined

    players.push({
      id,
      name,
      email,
      status,
      vipTier,
      balance,
      currency,
      country,
      lastLogin,
      registeredAt
    })
  }

  return players
}

function parseJSON(content: string): ParsedPlayer[] {
  const parsed = JSON.parse(content)
  const items = Array.isArray(parsed) ? parsed : (parsed.players || parsed.data || [parsed])
  const result: ParsedPlayer[] = []

  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const email = item.email || item.user_email || item.mail
    if (!email) continue

    const name = item.name || item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || email.split('@')[0]
    const statusRaw = String(item.status || 'Active').toLowerCase()
    const status = statusRaw.includes('inact') || statusRaw.includes('disab') ? 'Inactive' : 'Active'

    result.push({
      id: item.id ? Number(item.id) : undefined,
      name,
      email,
      status,
      vipTier: item.vip_tier || item.tier || item.tags || 'Bronze',
      balance: Number(item.balance || item.amount || 0),
      currency: item.currency || 'EUR',
      country: item.country || item.ctag || 'EU',
      lastLogin: item.last_login || item.last_sign_in_at,
      registeredAt: item.registered_at || item.created_at
    })
  }

  return result
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { raw_content, format = 'auto' } = body

    if (!raw_content || typeof raw_content !== 'string') {
      return NextResponse.json({ success: false, error: 'No raw_content provided' }, { status: 400 })
    }

    let players: ParsedPlayer[] = []
    const trimmed = raw_content.trim()

    // Determine format
    const isJson = format === 'json' || (format === 'auto' && (trimmed.startsWith('[') || trimmed.startsWith('{')))
    const isSql = format === 'sql' || (format === 'auto' && (trimmed.toUpperCase().includes('INSERT INTO') || trimmed.toUpperCase().includes('COPY ')))

    const pool = getDbPool()

    if (isSql) {
      // Execute SQL dump directly within transaction
      const client = await pool.connect()
      try {
        await client.query('BEGIN;')
        await client.query(trimmed)
        await client.query('COMMIT;')
        return NextResponse.json({
          success: true,
          message: 'SQL dump successfully executed against PostgreSQL database',
          count: 1
        })
      } catch (sqlErr: any) {
        await client.query('ROLLBACK;')
        throw sqlErr
      } finally {
        client.release()
      }
    }

    if (isJson) {
      players = parseJSON(trimmed)
    } else {
      players = parseCSV(trimmed)
    }

    if (players.length === 0) {
      return NextResponse.json({ success: false, error: 'Could not parse any valid player records from file' }, { status: 400 })
    }

    // Insert into PostgreSQL transaction
    const client = await pool.connect()
    let insertedCount = 0

    try {
      await client.query('BEGIN;')

      // Get next ID baseline
      const idRes = await client.query('SELECT COALESCE(MAX(id), 1000) as max_id FROM users_view;')
      let nextId = Number(idRes.rows[0].max_id) + 1

      for (const p of players) {
        const userId = p.id || nextId++
        const disabled = p.status === 'Inactive'
        const amountCents = Math.round(p.balance * 100)
        const nameParts = p.name.split(' ')
        const firstName = nameParts[0] || 'Player'
        const lastName = nameParts.slice(1).join(' ') || ''
        const lastLogin = p.lastLogin || new Date().toISOString()
        const createdAt = p.registeredAt || new Date().toISOString().split('T')[0]

        // Upsert users_view
        await client.query(`
          INSERT INTO users_view (id, email, disabled, suspended, tags, ctag, created_at, updated_at, last_sign_in_at)
          VALUES ($1, $2, $3, false, $4, $5, $6::timestamp, NOW(), $7::timestamp)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            disabled = EXCLUDED.disabled,
            tags = EXCLUDED.tags,
            ctag = EXCLUDED.ctag,
            last_sign_in_at = EXCLUDED.last_sign_in_at;
        `, [userId, p.email, disabled, p.vipTier, p.country, createdAt, lastLogin])

        // Upsert accounts_view
        await client.query(`
          INSERT INTO accounts_view (id, user_id, amount_cents, currency, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5::timestamp, NOW())
          ON CONFLICT (id) DO UPDATE SET
            amount_cents = EXCLUDED.amount_cents,
            currency = EXCLUDED.currency;
        `, [userId, userId, amountCents, p.currency, createdAt])

        // Upsert profiles_view
        await client.query(`
          INSERT INTO profiles_view (id, user_id, first_name, last_name, full_name, country, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7::timestamp, NOW())
          ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            full_name = EXCLUDED.full_name,
            country = EXCLUDED.country;
        `, [userId, userId, firstName, lastName, p.name, p.country, createdAt])

        insertedCount++
      }

      await client.query('COMMIT;')

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${insertedCount} real players into PostgreSQL database`,
        count: insertedCount,
        players
      })
    } catch (dbErr: any) {
      await client.query('ROLLBACK;')
      console.error('[Import Transaction Error]:', dbErr)
      throw dbErr
    } finally {
      client.release()
    }
  } catch (err: any) {
    console.error('[POST /api/players/import Error]:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
