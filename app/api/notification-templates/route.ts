import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const templateSchema = z.object({
  event_trigger: z.string().min(3),
  channel: z.enum(['WHATSAPP', 'EMAIL', 'SMS']),
  message_content: z.string().min(10),
  is_active: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        *,
        COUNT(*) OVER() as total_count
      FROM notification_templates
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (search) {
      sql += ` AND (event_trigger ILIKE $1 OR message_content ILIKE $1)`;
      params.push(`%${search}%`);
    }

    sql += `
      ORDER BY event_trigger ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('API Notifications Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = templateSchema.parse(body);
    
    const sql = `
      INSERT INTO notification_templates (event_trigger, channel, message_content, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [validated.event_trigger, validated.channel, validated.message_content, validated.is_active]);
    return NextResponse.json(res.rows[0], { status: 201 });
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

    const validated = templateSchema.partial().parse(data);
    const entries = Object.entries(validated).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return NextResponse.json({ error: 'No data to update' }, { status: 400 });

    const setClause = entries.map(([k, _], i) => `${k} = $${i + 1}`).join(', ');
    const params = entries.map(([_, v]) => v);
    params.push(id);

    const sql = `UPDATE notification_templates SET ${setClause} WHERE id = $${params.length} RETURNING *`;
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

    await query('DELETE FROM notification_templates WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
