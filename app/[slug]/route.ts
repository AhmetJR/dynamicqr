import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ensureLinksTable } from '@/lib/links';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  try {
    await ensureLinksTable();
    const { rows } = await sql`SELECT target_url FROM links WHERE slug = ${slug}`;
    if (rows.length > 0) {
      sql`UPDATE links SET clicks = clicks + 1 WHERE slug = ${slug}`.catch(console.error);
      return NextResponse.redirect(rows[0].target_url);
    }
  } catch (error) {
    console.error('Yönlendirme hatası:', error);
  }
  
  return NextResponse.redirect(new URL('/', request.url));
}