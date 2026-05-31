import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM links ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Veriler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { slug, target_url } = await request.json();
    await sql`
      INSERT INTO links (slug, target_url) 
      VALUES (${slug}, ${target_url})
      ON CONFLICT (slug) 
      DO UPDATE SET target_url = EXCLUDED.target_url;
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    await sql`DELETE FROM links WHERE slug = ${slug}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}