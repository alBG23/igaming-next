import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://localhost:5432/luckystart',
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

app.post('/mcp-query', async (req, res) => {
  try {
    const { query, params } = req.body;
    const result = await pool.query(query, params);
    res.json({ data: result.rows, rows: result.rows, error: null });
  } catch (error) {
    console.error('Query Error:', error);
    res.status(500).json({ data: null, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP Server running on port ${PORT}`);
}); 