import { MCPDatabase } from '@/lib/mcp-database'

const mcp = new MCPDatabase()

export const dynamic = 'force-dynamic'

interface TableInfo {
  table_name: string
  table_type: string
}

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
  numeric_precision: number | null
  numeric_scale: number | null
}

interface TableSchema extends TableInfo {
  columns: Array<{
    name: string
    type: string
    nullable: boolean
    default: string | null
    maxLength: number | null
    precision: number | null
    scale: number | null
  }>
}

export default async function SchemaPage() {
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
      (tables as TableInfo[]).map(async (table) => {
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
          columns: (columns as ColumnInfo[]).map(column => ({
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

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Database Schema</h1>
        
        <div className="space-y-8">
          {(tableSchemas as TableSchema[]).map((table) => (
            <section key={table.table_name} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">
                {table.table_name} ({table.table_type})
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Column</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Nullable</th>
                      <th className="px-4 py-2 text-left">Default</th>
                      <th className="px-4 py-2 text-left">Constraints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column) => (
                      <tr key={column.name} className="border-t">
                        <td className="px-4 py-2">{column.name}</td>
                        <td className="px-4 py-2">
                          {column.type}
                          {column.maxLength && `(${column.maxLength})`}
                          {column.precision && `(${column.precision},${column.scale})`}
                        </td>
                        <td className="px-4 py-2">{column.nullable ? 'YES' : 'NO'}</td>
                        <td className="px-4 py-2">{column.default || '-'}</td>
                        <td className="px-4 py-2">
                          {column.maxLength && `max length: ${column.maxLength}`}
                          {column.precision && `precision: ${column.precision}, scale: ${column.scale}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error:', error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Database Schema</h1>
        <div className="text-red-500">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
          <div className="mt-4">
            Please check your MCP server connection settings.
          </div>
        </div>
      </div>
    )
  }
} 