import { NextResponse } from 'next/server';
import { ensureLinksTable } from '@/lib/links';

export async function GET() {
  try {
    await ensureLinksTable();
    return NextResponse.json({ message: 'Tablo başarıyla oluşturuldu!' }, { status: 200 });
  } catch (error) {
    console.error('Tablo oluşturulamadı:', error);
    return NextResponse.json({ error: 'Tablo oluşturulamadı.' }, { status: 500 });
  }
}