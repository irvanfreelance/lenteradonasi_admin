import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    
    // Partition-aware: Encourage filtering by created_at range
    // Default to last 30 days if not specified
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    let sql = `
      SELECT 
        i.id, i.invoice_code, i.donor_name_snapshot, i.total_amount, 
        i.status, i.created_at, i.paid_at,
        pm.name as payment_method,
        ARRAY_AGG(c.title) as campaigns
      FROM invoices i
      JOIN payment_methods pm ON i.payment_method_id = pm.id
      LEFT JOIN transactions t ON i.id = t.invoice_id AND i.created_at = t.invoice_created_at
      LEFT JOIN campaigns c ON t.campaign_id = c.id
      WHERE i.created_at >= $1
    `;
    
    const params: any[] = [startDate];
    
    if (status) {
      sql += ` AND i.status = $${params.length + 1}`;
      params.push(status);
    }
    
    sql += `
      GROUP BY i.id, i.invoice_code, i.donor_name_snapshot, i.total_amount, i.status, i.created_at, i.paid_at, pm.name
      ORDER BY i.created_at DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);
    
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('API Transactions Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
