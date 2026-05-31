import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

// Yardımcı Fonksiyon: JSON'u oku
async function getLinks() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Tüm linkleri getir
export async function GET() {
  const links = await getLinks();
  return NextResponse.json(links);
}

// Yeni link ekle veya olanı güncelle
export async function POST(request: Request) {
  try {
    const { slug, target_url } = await request.json();
    let links = await getLinks();
    
    const existingIndex = links.findIndex((link: any) => link.slug === slug);
    
    if (existingIndex > -1) {
      links[existingIndex].target_url = target_url; // Güncelle
    } else {
      links.push({ slug, target_url, clicks: 0, created_at: new Date().toISOString() }); // Yeni ekle
    }

    await fs.writeFile(dataFilePath, JSON.stringify(links, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}

// Link Sil
export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    let links = await getLinks();
    links = links.filter((link: any) => link.slug !== slug);
    
    await fs.writeFile(dataFilePath, JSON.stringify(links, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}