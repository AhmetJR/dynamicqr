import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

const ALLOWED_SIZES = new Set([512, 1000, 2000]);

function resolveSize(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10);
  return ALLOWED_SIZES.has(parsed) ? parsed : 1000;
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const requestUrl = new URL(request.url);
    const size = resolveSize(requestUrl.searchParams.get('size'));
    const protocol = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '') || 'https';
    const host = request.headers.get('host') || requestUrl.host;
    const safeSlug = encodeURIComponent(slug);
    const url = `${protocol}://${host}/${safeSlug}`;
    const fileName = `${slug.replace(/[^a-zA-Z0-9._-]+/g, '-') || 'qr'}-${size}px-qr.png`;

    // generate PNG buffer
    const pngBuffer = await QRCode.toBuffer(url, { type: 'png', width: size, margin: 2 });

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error('QR generation failed', err);
    return NextResponse.json({ error: 'QR oluşturulamadı' }, { status: 500 });
  }
}
