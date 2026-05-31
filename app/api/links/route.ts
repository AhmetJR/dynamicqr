import { NextResponse } from 'next/server';
import { deleteLink, ensureLinksTable, getLinks, upsertLink } from '@/lib/links';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await ensureLinksTable();
    return NextResponse.json(await getLinks());
  } catch (error) {
    console.error('Linkler çekilemedi:', error);
    return NextResponse.json({ error: 'Veriler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { slug, target_url } = await request.json();
    await ensureLinksTable();
    await upsertLink(slug, target_url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link kaydedilemedi:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    await ensureLinksTable();
    await deleteLink(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link silinemedi:', error);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}