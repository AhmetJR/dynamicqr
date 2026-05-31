import { NextResponse } from 'next/server';
import { ensureLinksTable, getLinkBySlug, incrementClicks } from '@/lib/links';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const requestUrl = new URL(request.url);
  const encodedTarget = requestUrl.searchParams.get('u');

  if (encodedTarget) {
    try {
      const decodedTarget = decodeURIComponent(encodedTarget);
      const parsedTarget = new URL(decodedTarget);

      if (parsedTarget.protocol === 'http:' || parsedTarget.protocol === 'https:') {
        return NextResponse.redirect(parsedTarget.toString());
      }
    } catch {
      console.error('Geçersiz self-contained QR hedefi');
    }
  }

  try {
    await ensureLinksTable();
    const link = await getLinkBySlug(slug);
    if (link) {
      void incrementClicks(slug).catch(console.error);
      return NextResponse.redirect(link.target_url);
    }
  } catch (error) {
    console.error('Yönlendirme hatası:', error);
  }
  
  return NextResponse.redirect(new URL('/', request.url));
}