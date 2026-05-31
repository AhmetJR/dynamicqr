"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/8 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/75">Local access</p>
        <h1 className="mt-3 text-3xl font-semibold">Admin Girişi</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Bu panel yerel parola ile korunuyor. Varsayılan şifre: <span className="font-semibold text-cyan-200">qr-admin-2026</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Kontrol ediliyor..." : "Giriş yap"}
          </button>
        </form>

        <p className="mt-6 text-xs leading-5 text-slate-500">
          İstersen <span className="text-slate-300">ADMIN_PASSWORD</span> ortam değişkeniyle bu yerel şifreyi değiştirebilirsin.
        </p>
      </div>
    </div>
  );
}