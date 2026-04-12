import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = `
      SELECT 
        d.id, d.name, d.email, d.phone, d.created_at,
        COALESCE(SUM(i.total_amount), 0) as total_donated,
        COUNT(i.id) as donation_count
      FROM donors d
      LEFT JOIN invoices i ON d.id = i.donor_id AND i.status = 'PAID'
      GROUP BY d.id
      ORDER BY total_donated DESC
    `;
    
    const res = await query(sql);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('API Donors Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
