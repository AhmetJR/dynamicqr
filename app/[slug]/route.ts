import { redirect } from 'next/navigation';
import data from '@/data.json';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  // JSON dosyasından slug'ı ara
  const linkData = data.links.find((item) => item.slug === slug);

  if (linkData) {
    // Bulursa hedefe yönlendir
    redirect(linkData.target_url);
  } else {
    // Bulamazsa ana sayfaya at
    redirect('/');
  }
}