"use client";

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type LinkData = {
    slug: string;
    target_url: string;
    clicks: number;
};

export default function AdminPanel() {
    const [links, setLinks] = useState<LinkData[]>([]);
    const [slug, setSlug] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [loading, setLoading] = useState(false);

    // Sayfa yüklendiğinde linkleri çek
    const fetchLinks = async () => {
        const res = await fetch('/api/links');
        const data = await res.json();
        setLinks(data);
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    // Yeni ekle / Güncelle
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, target_url: targetUrl }),
        });
        setSlug('');
        setTargetUrl('');
        setLoading(false);
        fetchLinks();
    };

    // Silme İşlemi
    const handleDelete = async (deleteSlug: string) => {
        if (!confirm('Bu linki silmek istediğine emin misin?')) return;
        await fetch('/api/links', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: deleteSlug }),
        });
        fetchLinks();
    };

    // QR Kodu PNG olarak indirme
    const downloadQR = (slugName: string) => {
        const canvas = document.getElementById(`qr-${slugName}`) as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${slugName}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    // Canlıdaki Vercel domainin (Geliştirme aşamasında localhost)
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className="min-h-screen bg-gray-50 p-8 text-black">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">QR Kod Yönetim Paneli</h1>

                {/* Ekleme/Güncelleme Formu */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Kısa URL (Slug / ID)</label>
                        <input
                            type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                            placeholder="örn: kampanya-2026"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Gidilecek Hedef URL</label>
                        <input
                            type="url" required value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://gidilecek-uzun-adres.com"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button disabled={loading} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        {loading ? 'Kaydediliyor...' : 'Kaydet / Güncelle'}
                    </button>
                </form>

                {/* Link Listesi ve QR Kodlar */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4">QR Kod</th>
                                <th className="p-4">Bilgiler</th>
                                <th className="p-4">İstatistik</th>
                                <th className="p-4">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {links.map((link) => {
                                const qrUrl = `${baseUrl}/${link.slug}`;
                                return (
                                    <tr key={link.slug} className="hover:bg-gray-50">
                                        <td className="p-4 w-32">
                                            <div className="bg-white p-2 border rounded-md inline-block">
                                                <QRCodeCanvas id={`qr-${link.slug}`} value={qrUrl} size={80} level={"H"} />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-blue-600">{baseUrl}/{link.slug}</p>
                                            <p className="text-sm text-gray-500 truncate max-w-xs">{link.target_url}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                {link.clicks} Tıklama
                                            </span>
                                        </td>
                                        <td className="p-4 space-x-2">
                                            <button onClick={() => { setSlug(link.slug); setTargetUrl(link.target_url); }} className="text-sm text-blue-600 hover:underline">Düzenle</button>
                                            <button onClick={() => downloadQR(link.slug)} className="text-sm text-green-600 hover:underline">İndir</button>
                                            <button onClick={() => handleDelete(link.slug)} className="text-sm text-red-600 hover:underline">Sil</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {links.length === 0 && <p className="p-6 text-center text-gray-500">Henüz hiç QR kod oluşturmadın.</p>}
                </div>
            </div>
        </div>
    );
}