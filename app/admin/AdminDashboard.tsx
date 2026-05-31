"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import BrandMark from "../components/BrandMark";

type LinkData = {
  slug: string;
  target_url: string;
  clicks: number;
};

const DOWNLOAD_SIZES = [
  { label: '512 px', value: 512 },
  { label: '1000 px', value: 1000 },
  { label: '2000 px', value: 2000 },
];

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [slug, setSlug] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlugOriginal, setEditingSlugOriginal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [slugExists, setSlugExists] = useState(false);
  const [downloadSizesBySlug, setDownloadSizesBySlug] = useState<Record<string, number>>({});

  const baseUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  const fetchLinks = async () => {
    const response = await fetch("/api/links", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json?.error || text || `Linkler alınamadı (${response.status})`);
      } catch {
        throw new Error(text || `Linkler alınamadı (${response.status})`);
      }
    }

    const data = (await response.json()) as LinkData[];
    // dedupe by slug (keep first/newest)
    const map = new Map<string, LinkData>();
    for (const l of data) {
      if (!map.has(l.slug)) map.set(l.slug, l);
    }
    setLinks(Array.from(map.values()));
  };

  useEffect(() => {
    fetchLinks().catch((err) => setStatusMessage(err?.message ?? "Link listesi alınamadı."));
  }, []);

  // auto-clear status messages after 4s
  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(t);
  }, [statusMessage]);

  // track slug uniqueness on client
  useEffect(() => {
    const s = slug.trim();
    if (!s) {
      setSlugExists(false);
      return;
    }
    const exists = links.some((l) => l.slug === s);
    setSlugExists(exists && !(isEditing && editingSlugOriginal === s));
  }, [slug, links, isEditing, editingSlugOriginal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const nextSlug = slug.trim();
    const nextTarget = targetUrl.trim();

    if (!nextSlug || !nextTarget) {
      setStatusMessage("Lütfen slug ve hedef URL girin.");
      setLoading(false);
      return;
    }

    if (slugExists && !isEditing) {
      setStatusMessage('Bu slug zaten kullanılıyor. Farklı bir slug girin veya düzenleyin.');
      setLoading(false);
      return;
    }

    const prev = links;

    // optimistic update
    if (isEditing && editingSlugOriginal) {
      setLinks((current) =>
        current.map((l) => (l.slug === editingSlugOriginal ? { ...l, target_url: nextTarget } : l)),
      );
    } else {
      setLinks((current) => {
        const existingIndex = current.findIndex((c) => c.slug === nextSlug);
        const next = { slug: nextSlug, target_url: nextTarget, clicks: 0 } as LinkData;

        if (existingIndex >= 0) {
          const copy = [...current];
          copy[existingIndex] = { ...copy[existingIndex], target_url: nextTarget } as LinkData;
          return copy;
        }

        // Insert at top and ensure we don't create duplicates
        const filtered = current.filter((c) => c.slug !== nextSlug);
        return [next, ...filtered];
      });
    }

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: nextSlug, target_url: nextTarget }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json?.error || text || `Kaydetme başarısız (${response.status})`);
        } catch {
          throw new Error(text || `Kaydetme başarısız (${response.status})`);
        }
      }

      setSlug("");
      setTargetUrl("");
      setIsEditing(false);
      setEditingSlugOriginal(null);
      setStatusMessage("QR bağlantısı kaydedildi.");
      await fetchLinks();
    } catch (error: any) {
      setLinks(prev);
      setStatusMessage(error?.message ?? "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deleteSlug: string) => {
    if (!confirm("Bu linki silmek istediğine emin misin?")) {
      return;
    }

    setStatusMessage(null);
    const prev = links;
    setLinks((currentLinks) => currentLinks.filter((item) => item.slug !== deleteSlug));

    try {
      const response = await fetch("/api/links", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: deleteSlug }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json?.error || text || `Silme başarısız (${response.status})`);
        } catch {
          throw new Error(text || `Silme başarısız (${response.status})`);
        }
      }

      // parse success
      const data = await response.json().catch(() => ({}));
      if (data && data.error) throw new Error(data.error);

      setStatusMessage("Link silindi.");
    } catch (error: any) {
      setLinks(prev);
      setStatusMessage(error?.message ?? "Silme sırasında hata oluştu.");
    }
  };

  const handleEditClick = (link: LinkData) => {
    setSlug(link.slug);
    setTargetUrl(link.target_url);
    setIsEditing(true);
    setEditingSlugOriginal(link.slug);
  };

  const handleCancelEdit = () => {
    setSlug("");
    setTargetUrl("");
    setIsEditing(false);
    setEditingSlugOriginal(null);
  };

  const downloadQR = async (slugName: string, size: number) => {
    try {
      const response = await fetch(`/api/qr/${encodeURIComponent(slugName)}?size=${size}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`QR indirilemedi (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = `${slugName}-${size}px-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      setStatusMessage(error?.message ?? 'QR indirilemedi.');
    }
  };

  const getRowDownloadSize = (slugName: string) => downloadSizesBySlug[slugName] ?? 1000;

  const setRowDownloadSize = (slugName: string, value: number) => {
    setDownloadSizesBySlug((current) => ({
      ...current,
      [slugName]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/admin/login';
  };

  const linkCount = links.length;
  const totalClicks = links.reduce((sum, item) => sum + item.clicks, 0);
  const latestTarget = links[0]?.target_url ?? 'Henüz kayıt yok';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#111827_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
          <div className="flex flex-col gap-5 border-b border-white/10 p-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <BrandMark />
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">QR Kod Yönetim Merkezi</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Kısa linkleri oluştur, QR&apos;leri indir ve tıklamaları tek yerden takip et. Dinamik hedef değişse de QR sabit kalır.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Çıkış yap
            </button>
          </div>

          <div className="grid gap-3 border-b border-white/10 p-6 sm:grid-cols-3 sm:p-7">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Toplam link</p>
              <p className="mt-3 text-3xl font-semibold text-white">{linkCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Toplam tıklama</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalClicks}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Son hedef</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200">{latestTarget}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl lg:grid-cols-[0.9fr_1.2fr_auto] lg:items-end"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Kısa URL</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="kampanya-2026"
              disabled={isEditing}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/10 disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-slate-500">Slug değişirse yeni kayıt oluşur, düzenlerken slug kilitlenir.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Hedef URL</label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://ornek.com/uzun-adres"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              disabled={loading}
              type="submit"
              className="rounded-2xl bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Kaydet / Güncelle"}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Vazgeç
              </button>
            ) : null}
          </div>
        </form>

        {statusMessage ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100 shadow-lg shadow-cyan-950/10">
            {statusMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Kayıtlı Linkler</h2>
              <p className="mt-1 text-sm text-slate-400">QR, slug ve hedefi tek satırda gör.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {linkCount} kayıt
            </span>
          </div>
          <div className="border-b border-white/10 px-6 py-3 sm:px-7">
            <p className="text-xs leading-6 text-slate-400">
              Her satırda tek bir boyut seçip direkt indirebilirsin. 512 px hızlı önizleme, 1000 px dengeli baskı, 2000 px yüksek çözünürlük içindir.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">QR</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Hedef</th>
                  <th className="px-6 py-4 font-medium">Tıklama</th>
                  <th className="px-6 py-4 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const qrUrl = `${baseUrl}/${link.slug}`;
                  // Use dynamic QR: encode the short slug URL so the redirect target can be changed later
                  const qrValue = qrUrl;

                  return (
                    <tr key={`${link.slug}-${link.created_at}`} className="border-t border-white/5 align-top transition hover:bg-white/[0.03]">
                      <td className="px-6 py-5">
                        <div className="inline-flex rounded-3xl border border-white/10 bg-white p-2 shadow-lg shadow-black/20">
                          <QRCodeCanvas id={`qr-${link.slug}-${link.created_at}`} value={qrValue} size={90} level="H" />
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-white">
                        <div className="flex flex-col gap-2">
                          <span>{link.slug}</span>
                          <span className="inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                            dinamik
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-300">
                        <p className="max-w-md break-all leading-6 text-slate-100">{link.target_url}</p>
                        <p className="mt-2 text-xs text-slate-500">{qrUrl}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-200">{link.clicks}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <select
                            value={getRowDownloadSize(link.slug)}
                            onChange={(event) => setRowDownloadSize(link.slug, Number(event.target.value))}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                          >
                            {DOWNLOAD_SIZES.map((option) => (
                              <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleEditClick(link)}
                            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-cyan-100 transition hover:bg-cyan-300/20"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => downloadQR(link.slug, getRowDownloadSize(link.slug))}
                            className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-100 transition hover:bg-emerald-300/20"
                          >
                            İndir
                          </button>
                          <button
                            onClick={() => handleDelete(link.slug)}
                            className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100 transition hover:bg-rose-300/20"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {links.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400">
              <p className="text-base font-medium text-slate-300">Henüz hiç QR kod oluşturulmadı.</p>
              <p className="mt-2 text-sm">Yukarıdaki form ile ilk kaydı ekle ve listeyi doldur.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}