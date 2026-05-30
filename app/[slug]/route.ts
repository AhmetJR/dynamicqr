import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  try {
    // Veritabanından hedef linki bul
    const { rows } = await sql`SELECT target_url FROM links WHERE slug = ${slug}`;
    
    if (rows.length > 0) {
      // Asenkron olarak tıklama sayısını 1 artır (Kullanıcıyı bekletmemek için await koymuyoruz)
      sql`UPDATE links SET clicks = clicks + 1 WHERE slug = ${slug}`.catch(console.error);
      
      // Asıl hedefe yönlendir
      redirect(rows[0].target_url);
    }
  } catch (error) {
    console.error('Yönlendirme hatası:', error);
  }
  
  // Link bulunamazsa ana sayfaya gönder
  redirect('/');
}