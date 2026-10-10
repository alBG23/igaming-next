import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDbPool } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('revenue_metrics')
      .select('*')
      .order('month', { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }

    // Fallback to PostgreSQL pool
    const pool = getDbPool();
    const result = await pool.query(`
      SELECT 
        ROW_NUMBER() OVER () as id,
        DATE_TRUNC('month', created_at) as month,
        created_at,
        SUM(CASE WHEN action = 'deposit' AND success = true THEN amount_cents ELSE 0 END) / 100.0 as total_revenue,
        SUM(CASE WHEN action = 'withdrawal' AND success = true THEN amount_cents ELSE 0 END) / 100.0 as total_payouts,
        (SUM(CASE WHEN action = 'deposit' AND success = true THEN amount_cents ELSE 0 END) - 
         SUM(CASE WHEN action = 'withdrawal' AND success = true THEN amount_cents ELSE 0 END)) / 100.0 as net_revenue
      FROM public.payments_view
      GROUP BY DATE_TRUNC('month', created_at), created_at
      ORDER BY created_at DESC
      LIMIT 100;
    `);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.warn('Error fetching revenue metrics, returning empty array:', error.message);
    return NextResponse.json([], { status: 200 });
  }
} 