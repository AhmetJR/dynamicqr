import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const links = JSON.parse(data);
    
    const linkData = links.find((item: any) => item.slug === slug);

    if (linkData) {
      // Bulunduysa asıl hedefe yönlendir (Tıklama sayısını basit sistemde artırmıyoruz, hız için)
      redirect(linkData.target_url);
    }
  } catch (error) {
    console.error(error);
  }
  
  // Link bulunamazsa ana sayfaya at
  redirect('/');
}