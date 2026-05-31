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
    const body = await request.json();
    const slug = String(body?.slug ?? "").trim();
    const target_url = String(body?.target_url ?? "").trim();

    if (!slug) return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 });
    if (!target_url) return NextResponse.json({ error: 'Hedef URL gerekli' }, { status: 400 });

    await ensureLinksTable();
    await upsertLink(slug, target_url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link kaydedilemedi:', error instanceof Error ? error.stack || error.message : error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body?.slug ?? "").trim();
    if (!slug) return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 });

    await ensureLinksTable();
    await deleteLink(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link silinemedi:', error instanceof Error ? error.stack || error.message : error);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}