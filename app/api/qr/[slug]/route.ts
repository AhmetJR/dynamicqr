import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const url = `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}/${slug}`;

    // generate PNG buffer
    const pngBuffer = await QRCode.toBuffer(url, { type: 'png', width: 300, margin: 2 });

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="${slug}-qr.png"`,
      },
    });
  } catch (err) {
    console.error('QR generation failed', err);
    return NextResponse.json({ error: 'QR oluşturulamadı' }, { status: 500 });
  }
}
