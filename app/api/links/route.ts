import { NextResponse } from 'next/server';
import { deleteLink, ensureLinksTable, getLinks, upsertLink } from '@/lib/links';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';

function isAdminAuthorized(request: Request) {
  return request.headers.get('cookie')?.includes(`${ADMIN_COOKIE_NAME}=true`) ?? false;
}

export async function GET(request: Request) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    await ensureLinksTable();
    return NextResponse.json(await getLinks());
  } catch (error) {
    console.error('Linkler çekilemedi:', error);
    return NextResponse.json({ error: 'Veriler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

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
    if (!isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { slug } = await request.json();
    await ensureLinksTable();
    await deleteLink(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link silinemedi:', error);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}