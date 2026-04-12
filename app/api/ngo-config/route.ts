import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const configSchema = z.object({
  ngo_name: z.string().min(3),
  logo_url: z.string().url().optional(),
  short_description: z.string().optional(),
  address: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1086b1'),
});

export async function GET() {
  try {
    const res = await query('SELECT * FROM ngo_configs LIMIT 1');
    return NextResponse.json(res.rows[0] || {});
  } catch (error: any) {
    console.error('API NGO Config Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const validated = configSchema.parse(body);
    
    // Check if config exists
    const check = await query('SELECT id FROM ngo_configs LIMIT 1');
    
    let res;
    if (check.rows.length > 0) {
      const sql = `
        UPDATE ngo_configs 
        SET ngo_name = $1, logo_url = $2, short_description = $3, address = $4, primary_color = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      res = await query(sql, [validated.ngo_name, validated.logo_url, validated.short_description, validated.address, validated.primary_color, check.rows[0].id]);
    } else {
      const sql = `
        INSERT INTO ngo_configs (ngo_name, logo_url, short_description, address, primary_color)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      res = await query(sql, [validated.ngo_name, validated.logo_url, validated.short_description, validated.address, validated.primary_color]);
    }
    
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
