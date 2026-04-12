import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const pmSchema = z.object({
  name: z.string().min(2),
  type: z.string(),
  provider: z.string(),
  admin_fee_flat: z.number().default(0),
  admin_fee_pct: z.number().default(0),
  is_active: z.boolean().default(true),
});

export async function GET() {
  try {
    const res = await query('SELECT * FROM payment_methods ORDER BY sort ASC, type ASC, name ASC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('API Payment Methods Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = pmSchema.parse(body);
    
    const sql = `
      INSERT INTO payment_methods (name, type, provider, admin_fee_flat, admin_fee_pct, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await query(sql, [validated.name, validated.type, validated.provider, validated.admin_fee_flat, validated.admin_fee_pct, validated.is_active]);
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

    const validated = pmSchema.partial().parse(data);
    const entries = Object.entries(validated).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return NextResponse.json({ error: 'No data to update' }, { status: 400 });

    const setClause = entries.map(([k, _], i) => `${k} = $${i + 1}`).join(', ');
    const params = entries.map(([_, v]) => v);
    params.push(id);

    const sql = `UPDATE payment_methods SET ${setClause} WHERE id = $${params.length} RETURNING *`;
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

    await query('DELETE FROM payment_methods WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
