"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type LinkData = {
  slug: string;
  target_url: string;
  clicks: number;
};

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [slug, setSlug] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlugOriginal, setEditingSlugOriginal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [slugExists, setSlugExists] = useState(false);

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

  const downloadQR = (slugName: string, createdAt: string) => {
    const canvas = document.getElementById(`qr-${slugName}-${createdAt}`) as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${slugName}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(35,44,81,0.18),_transparent_35%),linear-gradient(180deg,#0f172a_0%,#111827_100%)] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">Admin panel</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">QR Kod Yönetim Merkezi</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Kısa linkleri oluştur, QR kodlarını indir ve tıklamaları tek yerden takip et.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Çıkış yap
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl lg:grid-cols-[1fr_1.2fr_auto]"
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

          <button
            disabled={loading}
            type="submit"
            className="self-end rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Kaydet / Güncelle"}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="self-end ml-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Vazgeç
            </button>
          ) : null}
        </form>

        {statusMessage ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            {statusMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">Kayıtlı Linkler</h2>
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
                  // QR should encode the actual target URL so scanners open the real target (e.g. YouTube)
                  const qrValue = link.target_url || qrUrl;

                  return (
                    <tr key={`${link.slug}-${link.created_at}`} className="border-t border-white/5 align-top hover:bg-white/[0.03]">
                      <td className="px-6 py-5">
                        <div className="inline-flex rounded-2xl border border-white/10 bg-white p-2">
                          <QRCodeCanvas id={`qr-${link.slug}-${link.created_at}`} value={qrValue} size={88} level="H" />
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-white">{link.slug}</td>
                      <td className="px-6 py-5 text-slate-300">
                        <p className="max-w-md break-all">{link.target_url}</p>
                        <p className="mt-1 text-xs text-slate-500">{qrValue}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-200">{link.clicks}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleEditClick(link)}
                            className="text-cyan-300 transition hover:text-cyan-200"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => downloadQR(link.slug, link.created_at)}
                            className="text-emerald-300 transition hover:text-emerald-200"
                          >
                            İndir
                          </button>
                          <button
                            onClick={() => handleDelete(link.slug)}
                            className="text-rose-300 transition hover:text-rose-200"
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
            <div className="px-6 py-10 text-center text-slate-400">
              Henüz hiç QR kod oluşturulmadı. Yukarıdaki form ile ilk kaydı ekle.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}