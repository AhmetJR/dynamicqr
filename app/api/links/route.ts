import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ensureLinksTable } from '@/lib/links';

export async function GET() {
  try {
    await ensureLinksTable();
    const { rows } = await sql`SELECT * FROM links ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Linkler çekilemedi:', error);
    return NextResponse.json({ error: 'Veriler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureLinksTable();
    const { slug, target_url } = await request.json();
    await sql`
      INSERT INTO links (slug, target_url) 
      VALUES (${slug}, ${target_url})
      ON CONFLICT (slug) 
      DO UPDATE SET target_url = EXCLUDED.target_url;
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link kaydedilemedi:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureLinksTable();
    const { slug } = await request.json();
    await sql`DELETE FROM links WHERE slug = ${slug}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link silinemedi:', error);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}