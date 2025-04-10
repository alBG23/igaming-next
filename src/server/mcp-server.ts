import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgresql://postgres.dgppxcjafcinmwgzrpnk:Y2unQJNY6J%40PXB6@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
});

app.post('/mcp-query', async (req, res) => {
  try {
    const { query, params } = req.body;
    const result = await pool.query(query, params);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Query Error:', error);
    res.status(500).json({ data: null, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP Server running on port ${PORT}`);
}); 