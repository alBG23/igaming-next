import { supabase } from '../lib/supabase';

async function getSchema() {
  try {
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public');

    if (tablesError) throw tablesError;

    // Get columns for each table
    const schema = await Promise.all(
      tables.map(async (table) => {
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', table.table_name);

        if (columnsError) throw columnsError;

        return {
          table_name: table.table_name,
          table_type: table.table_type,
          columns: columns
        };
      })
    );

    console.log('Database Schema:');
    console.log(JSON.stringify(schema, null, 2));
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

getSchema(); 