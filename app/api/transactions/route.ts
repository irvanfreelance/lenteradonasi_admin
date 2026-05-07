import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { redis, safeFlushCache } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const campaignId = searchParams.get('campaignId');
    
    // Show all data by default unless filtered
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let sql = `
      SELECT 
        i.id, i.invoice_code, i.donor_name_snapshot, i.total_amount, 
        i.status, i.created_at, i.paid_at,
        i.is_wa_checkout_sent, i.is_wa_paid_sent, 
        i.is_email_checkout_sent, i.is_email_paid_sent, 
        i.is_ads_sent,
        pm.name as payment_method,
        JSONB_AGG(DISTINCT jsonb_build_object('id', c.id, 'title', c.title)) FILTER (WHERE c.id IS NOT NULL) as campaigns,
        COUNT(*) OVER() as total_count
      FROM invoices i
      JOIN payment_methods pm ON i.payment_method_id = pm.id
      LEFT JOIN transactions t ON i.id = t.invoice_id AND i.created_at = t.invoice_created_at
      LEFT JOIN campaigns c ON t.campaign_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (startDate) {
      sql += ` AND i.created_at >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND i.created_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    if (status && status !== 'ALL') {
      sql += ` AND i.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (i.invoice_code ILIKE $${params.length + 1} OR i.donor_name_snapshot ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (minAmount) {
      sql += ` AND i.total_amount >= $${params.length + 1}`;
      params.push(minAmount);
    }

    if (maxAmount) {
      sql += ` AND i.total_amount <= $${params.length + 1}`;
      params.push(maxAmount);
    }

    if (campaignId) {
      sql += ` AND t.campaign_id = $${params.length + 1}`;
      params.push(campaignId);
    }
    
    sql += `
      GROUP BY 
        i.id, i.invoice_code, i.donor_name_snapshot, i.total_amount, i.status, i.created_at, i.paid_at, 
        i.is_wa_checkout_sent, i.is_wa_paid_sent, i.is_email_checkout_sent, i.is_email_paid_sent, i.is_ads_sent,
        pm.name
      ORDER BY i.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('API Transactions Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, created_at, status } = body;
    
    if (!id || !created_at || !status) {
      return NextResponse.json({ error: 'ID, created_at, and status are required for partitioned update' }, { status: 400 });
    }

    const sql = `UPDATE invoices SET status = $1 WHERE id = $2 AND created_at = $3 RETURNING *`;
    const res = await query(sql, [status, id, created_at]);

    if (res.rowCount === 0) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    
    await safeFlushCache();
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const created_at = searchParams.get('created_at');
    
    if (!id || !created_at) {
      return NextResponse.json({ error: 'ID and created_at are required for partitioned delete' }, { status: 400 });
    }

    await query('DELETE FROM invoices WHERE id = $1 AND created_at = $2', [id, created_at]);
    await safeFlushCache();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

