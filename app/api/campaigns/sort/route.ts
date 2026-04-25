import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { items } = await req.json(); // Array of { id: number, sort: number }
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });

    await withTransaction(async (client) => {
      for (const item of items) {
        await client.query('UPDATE campaigns SET sort = $1 WHERE id = $2', [item.sort, item.id]);
      }
    });

    await redis.flushdb();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Campaigns Sort Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
