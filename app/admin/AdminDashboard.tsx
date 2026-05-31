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
      const errorText = await response.text();
      throw new Error(errorText || `Linkler alınamadı (${response.status})`);
    }

    const data = (await response.json()) as LinkData[];
    setLinks(data);
  };

  useEffect(() => {
    fetchLinks().catch(() => setStatusMessage("Link listesi alınamadı."));
  }, []);

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

        return [next, ...current];
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
        const errorText = await response.text();
        throw new Error(errorText || `Kaydetme başarısız (${response.status})`);
      }

      setSlug("");
      setTargetUrl("");
      setIsEditing(false);
      setEditingSlugOriginal(null);
      setStatusMessage("QR bağlantısı kaydedildi.");
      await fetchLinks();
    } catch (error) {
      setLinks(prev);
      setStatusMessage("Kayıt sırasında hata oluştu.");
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
        const errorText = await response.text();
        throw new Error(errorText || `Silme başarısız (${response.status})`);
      }

      setStatusMessage("Link silindi.");
    } catch (error) {
      setLinks(prev);
      setStatusMessage("Silme sırasında hata oluştu.");
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

  const downloadQR = (slugName: string) => {
    const canvas = document.getElementById(`qr-${slugName}`) as HTMLCanvasElement;
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
    window.location.href = "/admin/login";
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

                  return (
                    <tr key={link.slug} className="border-t border-white/5 align-top hover:bg-white/[0.03]">
                      <td className="px-6 py-5">
                        <div className="inline-flex rounded-2xl border border-white/10 bg-white p-2">
                          <QRCodeCanvas id={`qr-${link.slug}`} value={qrUrl} size={88} level="H" />
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-white">{link.slug}</td>
                      <td className="px-6 py-5 text-slate-300">
                        <p className="max-w-md break-all">{link.target_url}</p>
                        <p className="mt-1 text-xs text-slate-500">{qrUrl}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-200">{link.clicks}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setSlug(link.slug);
                              setTargetUrl(link.target_url);
                            }}
                            className="text-cyan-300 transition hover:text-cyan-200"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => downloadQR(link.slug)}
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