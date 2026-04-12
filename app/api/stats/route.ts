import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch KPI Summary
    // Note: We use raw SQL as per AGENTS.md
    const summaryQuery = `
      SELECT 
        (SELECT COALESCE(SUM(collected_amount), 0) FROM campaign_stats) as total_revenue,
        (SELECT COALESCE(SUM(donor_count), 0) FROM campaign_stats) as total_donors,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'ACTIVE') as active_campaigns,
        (SELECT COUNT(*) FROM invoices WHERE status = 'PAID') as success_transactions
    `;
    
    const summaryRes = await query(summaryQuery);
    const summary = summaryRes.rows[0];

    // 2. Fetch Weekly Revenue Trend
    // Partition-aware: We usually want to specify a date range to help Postgres prune partitions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendQuery = `
      SELECT 
        TO_CHAR(created_at, 'Dy') as day,
        SUM(total_amount) as value
      FROM invoices
      WHERE status = 'PAID' AND created_at >= $1
      GROUP BY day, DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at) ASC
    `;
    
    const trendRes = await query(trendQuery, [sevenDaysAgo.toISOString()]);
    
    // 3. Target NGO (Configurable in ngo_configs, let's assume a default for now)
    const configRes = await query('SELECT ngo_name FROM ngo_configs LIMIT 1');
    
    return NextResponse.json({
      summary: {
        totalRevenue: Number(summary.total_revenue),
        totalDonors: Number(summary.total_donors),
        activeCampaigns: Number(summary.active_campaigns),
        successTransactions: Number(summary.success_transactions),
        targetRevenue: 1500000000, // Hardcoded for now, could be in ngo_configs
      },
      revenueTrend: trendRes.rows.map(row => ({
        day: row.day,
        value: Number(row.value)
      })),
      ngoName: configRes.rows[0]?.ngo_name || 'Lentera Donasi'
    });
  } catch (error: any) {
    console.error('API Stats Error:', error);
    
    // Return mock data if database not yet migrated/seeded (for UX during development)
    return NextResponse.json({
      summary: {
        totalRevenue: 850450000,
        totalDonors: 4231,
        activeCampaigns: 12,
        successTransactions: 5120,
        targetRevenue: 1500000000,
      },
      revenueTrend: [
        { day: 'Mon', value: 15000000 },
        { day: 'Tue', value: 22000000 },
        { day: 'Wed', value: 18000000 },
        { day: 'Thu', value: 35000000 },
        { day: 'Fri', value: 55000000 },
        { day: 'Sat', value: 28000000 },
        { day: 'Sun', value: 20000000 },
      ],
      isMock: true,
      error: error.message
    });
  }
}
