import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating/updating campaigns
const campaignSchema = z.object({
  title: z.string().min(5),
  category_id: z.number(),
  slug: z.string().min(3),
  image_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  target_amount: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  // Bool flags
  is_zakat: z.boolean().default(false),
  is_qurban: z.boolean().default(false),
  has_no_target: z.boolean().default(false),
  has_no_time_limit: z.boolean().default(false),
  is_urgent: z.boolean().default(false),
  is_verified: z.boolean().default(true),
  is_fixed_amount: z.boolean().default(false),
  is_bundle: z.boolean().default(false),
  // Numeric
  minimum_amount: z.number().default(10000),
  base_commission_pct: z.number().default(0),
  sort: z.number().default(0),
  // Suggestion amounts array
  suggestion_amounts: z.array(z.number()).optional().nullable(),
  status: z.string().default('ACTIVE'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        c.*,
        cat.name as category_name, cat.color_theme as category_color,
        cs.collected_amount, cs.donor_count, cs.views_count,
        CASE 
          WHEN c.is_zakat THEN 'Zakat'
          WHEN c.is_qurban THEN 'Qurban'
          WHEN c.is_bundle THEN 'Bundle'
          ELSE 'Standard'
        END as campaign_type,
        COUNT(*) OVER() as total_count
      FROM campaigns c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN campaign_stats cs ON c.id = cs.campaign_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (categoryId && categoryId !== '0') {
      sql += ` AND c.category_id = $${params.length + 1}`;
      params.push(categoryId);
    }

    if (status && status !== 'ALL') {
      sql += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (c.title ILIKE $${params.length + 1} OR c.slug ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    sql += `
      ORDER BY c.sort ASC, c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const res = await query(sql, params);
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
    
    const result = await withTransaction(async (client) => {
      const campSql = `
        INSERT INTO campaigns (
          title, category_id, slug, image_url, description, 
          target_amount, end_date, is_zakat, is_qurban, has_no_target,
          is_urgent, is_verified, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `;
      
      const res = await client.query(campSql, [
        validated.title, validated.category_id, validated.slug, 
        validated.image_url, validated.description, 
        validated.target_amount, validated.end_date, 
        validated.is_zakat, validated.is_qurban, validated.has_no_target,
        validated.is_urgent, validated.is_verified, validated.status
      ]);
      
      const newId = res.rows[0].id;
      await client.query('INSERT INTO campaign_stats (campaign_id) VALUES ($1)', [newId]);
      return newId;
    });

    return NextResponse.json({ id: result }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ errors: error.issues }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const validated = campaignSchema.partial().parse(data);
    
    // Dynamically build UPDATE query
    const entries = Object.entries(validated).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return NextResponse.json({ error: 'No data to update' }, { status: 400 });

    const setClause = entries.map(([k, _], i) => `${k} = $${i + 1}`).join(', ');
    const params = entries.map(([_, v]) => v);
    params.push(id);

    const sql = `UPDATE campaigns SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`;
    const res = await query(sql, params);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ errors: error.issues }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await query('DELETE FROM campaigns WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

