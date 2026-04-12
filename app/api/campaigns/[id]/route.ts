import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Fetch Campaign Details & Stats
    const campSql = `
      SELECT 
        c.*, 
        cat.name as category_name, cat.color_theme as category_color,
        cs.collected_amount, cs.donor_count, cs.views_count, cs.package_sold
      FROM campaigns c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN campaign_stats cs ON c.id = cs.campaign_id
      WHERE c.id = $1
    `;
    const campRes = await query(campSql, [id]);
    if (campRes.rowCount === 0) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    const campaign = campRes.rows[0];

    // 2. Fetch Daily Stats (Last 7 Days)
    const chartSql = `
      SELECT 
        TO_CHAR(d.date, 'Dy') as name,
        COALESCE(SUM(t.amount), 0) as amount
      FROM (
        SELECT CURRENT_DATE - i as date
        FROM generate_series(0, 6) i
      ) d
      LEFT JOIN transactions t ON TO_CHAR(t.created_at, 'YYYY-MM-DD') = TO_CHAR(d.date, 'YYYY-MM-DD') AND t.campaign_id = $1
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const chartRes = await query(chartSql, [id]);

    // 3. Fetch Recent Transactions
    const trxSql = `
      SELECT 
        i.invoice_code, i.donor_name_snapshot, i.created_at as time,
        t.amount, i.status
      FROM transactions t
      JOIN invoices i ON t.invoice_id = i.id AND t.invoice_created_at = i.created_at
      WHERE t.campaign_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `;
    const trxRes = await query(trxSql, [id]);

    // 4. Fetch Updates
    const updatesSql = `SELECT * FROM campaign_updates WHERE campaign_id = $1 ORDER BY created_at DESC`;
    const updatesRes = await query(updatesSql, [id]);

    return NextResponse.json({
      ...campaign,
      chartData: chartRes.rows,
      transactions: trxRes.rows,
      updates: updatesRes.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
