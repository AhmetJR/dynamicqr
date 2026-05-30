import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS links (
        slug VARCHAR(255) PRIMARY KEY,
        target_url TEXT NOT NULL,
        clicks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return NextResponse.json({ message: 'Tablo başarıyla oluşturuldu!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Tablo oluşturulamadı.' }, { status: 500 });
  }
}