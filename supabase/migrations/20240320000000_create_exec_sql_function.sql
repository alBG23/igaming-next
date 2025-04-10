-- Create a function to execute SQL queries safely
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow SELECT queries
  IF NOT (lower(trim(sql)) LIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Execute the query and return results as JSON
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated; 