import { NextResponse } from 'next/server'
import { MCPDatabase } from '@/lib/mcp-database'

const mcp = new MCPDatabase()

export async function GET() {
  try {
    // Test MCP connection first
    await mcp.testConnection()
    
    // Get all tables in the public schema
    const tablesQuery = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    const { data: tables, error: tablesError } = await mcp.query(tablesQuery)
    
    if (tablesError) {
      throw tablesError
    }

    // Get columns for each table
    const tableSchemas = await Promise.all(
      tables.map(async (table: { table_name: string }) => {
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          ORDER BY ordinal_position
        `
        
        const { data: columns, error: columnsError } = await mcp.query(columnsQuery, [table.table_name])
        
        if (columnsError) {
          throw columnsError
        }

        return {
          ...table,
          columns: columns.map((column: any) => ({
            name: column.column_name,
            type: column.data_type,
            nullable: column.is_nullable === 'YES',
            default: column.column_default,
            maxLength: column.character_maximum_length,
            precision: column.numeric_precision,
            scale: column.numeric_scale
          }))
        }
      })
    )

    return NextResponse.json({ success: true, data: tableSchemas })
  } catch (error) {
    console.error('Schema API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
} 