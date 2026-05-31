"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "../../components/BrandMark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setErrorMessage("Şifre yanlış. Tekrar dene.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setErrorMessage("Giriş sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_46%,#111827_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="float-slow absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="float-slower absolute bottom-10 right-6 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan-200/80">Dinamik QR</p>
              <h1 className="fade-up mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight">
                Admin erişimi, düzenli ve hızlı bir kontrol alanı.
              </h1>
              <p className="fade-up mt-4 max-w-md text-sm leading-7 text-slate-300" style={{ animationDelay: "0.08s" }}>
                Kısa bağlantıları yönet, QR&apos;leri indir ve hedef URL&apos;leri tek panelden değiştir.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Erişim</p>
                <p className="mt-2 text-sm text-slate-200">Parola korumalı</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">QR</p>
                <p className="mt-2 text-sm text-slate-200">Dinamik yönlendirme</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Takip</p>
                <p className="mt-2 text-sm text-slate-200">Canlı tıklama sayacı</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 fade-up">
              <div className="mb-8">
                <BrandMark compact />
              </div>

              <h1 className="fade-up text-3xl font-semibold tracking-tight sm:text-4xl" style={{ animationDelay: "0.05s" }}>Admin Girişi</h1>
              <p className="fade-up mt-3 max-w-lg text-sm leading-7 text-slate-300" style={{ animationDelay: "0.1s" }}>
              Bu panel yerel parola ile korunuyor. Varsayılan şifre: <span className="font-semibold text-cyan-200">qr-admin-2026</span>
            </p>

              <form onSubmit={handleSubmit} className="fade-up mt-8 space-y-4" style={{ animationDelay: "0.15s" }}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Parola</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/10"
                  placeholder="Admin parolası"
                  autoComplete="current-password"
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              ) : null}

              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Kontrol ediliyor..." : "Giriş yap"}
              </button>
            </form>

            <p className="fade-up mt-6 text-xs leading-5 text-slate-500" style={{ animationDelay: "0.2s" }}>
              İstersen <span className="text-slate-300">ADMIN_PASSWORD</span> ortam değişkeniyle bu yerel şifreyi değiştirebilirsin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}