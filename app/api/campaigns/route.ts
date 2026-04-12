import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating campaigns
const campaignSchema = z.object({
  title: z.string().min(5),
  category_id: z.number(),
  slug: z.string().min(3),
  image_url: z.string().url().optional(),
  description: z.string().optional(),
  target_amount: z.number().nullable(),
  end_date: z.string().nullable(),
  is_zakat: z.boolean().default(false),
  is_qurban: z.boolean().default(false),
  has_no_target: z.boolean().default(false),
});

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.id, c.title, c.slug, c.status, c.target_amount, c.created_at,
        cat.name as category_name, cat.color_theme as category_color,
        cs.collected_amount, cs.donor_count, cs.views_count,
        CASE 
          WHEN c.is_zakat THEN 'Zakat'
          WHEN c.is_qurban THEN 'Qurban'
          WHEN c.is_bundle THEN 'Bundle'
          ELSE 'Standard'
        END as campaign_type
      FROM campaigns c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN campaign_stats cs ON c.id = cs.campaign_id
      ORDER BY c.created_at DESC
    `;
    
    const res = await query(sql);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('API Campaigns Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = campaignSchema.parse(body);
    
    // Two-step write in a transaction: Create campaign and initialize stats
    const result = await withTransaction(async (client) => {
      const campSql = `
        INSERT INTO campaigns (
          title, category_id, slug, image_url, description, 
          target_amount, end_date, is_zakat, is_qurban, has_no_target
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;
      
      const res = await client.query(campSql, [
        validated.title, validated.category_id, validated.slug, 
        validated.image_url, validated.description, 
        validated.target_amount, validated.end_date, 
        validated.is_zakat, validated.is_qurban, validated.has_no_target
      ]);
      
      const newId = res.rows[0].id;
      
      // Initialize stats
      await client.query('INSERT INTO campaign_stats (campaign_id) VALUES ($1)', [newId]);
      
      return newId;
    });

    return NextResponse.json({ id: result }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
