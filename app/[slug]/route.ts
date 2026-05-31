import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  try {
    const { rows } = await sql`SELECT target_url FROM links WHERE slug = ${slug}`;
    if (rows.length > 0) {
      sql`UPDATE links SET clicks = clicks + 1 WHERE slug = ${slug}`.catch(console.error);
      redirect(rows[0].target_url);
    }
  } catch (error) {
    console.error('Yönlendirme hatası:', error);
  }
  
  redirect('/');
}