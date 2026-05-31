import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/75">Dinamik QR</p>
            <p className="text-sm text-slate-300">Kısa link, QR ve istatistik paneli</p>
          </div>
          <Link
            href="/admin"
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Admin Paneli
          </Link>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-sm text-cyan-100">
              Hızlı QR üretimi, yerel giriş, canlı tıklama takibi
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              QR bağlantılarını tek panelden oluştur, yönet ve takip et.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Sistem artık tabloyu otomatik kurar, kısa adresleri canlı yönlendirir ve admin tarafında yerel parola ile korunur.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admin"
                className="rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Yönetim ekranını aç
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Özellikleri gör
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/7 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl">
            <div className="rounded-2xl bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Durum</p>
              <p className="mt-2 text-2xl font-semibold text-white">Aktif ve güncel</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Yeni kayıtlar otomatik açılır, admin girişi yerel şifreyle korunur.
              </p>
            </div>
            <div id="features" className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-cyan-200">QR</p>
                <p className="mt-2 text-sm text-slate-300">Hızlı oluşturma ve indirme</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-cyan-200">Admin</p>
                <p className="mt-2 text-sm text-slate-300">Yerel parola ile giriş</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-cyan-200">Takip</p>
                <p className="mt-2 text-sm text-slate-300">Tıklama sayacı ve yönlendirme</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-6 text-sm text-slate-400">
          Dinamik QR yönetimi için sade, hızlı ve yerel kullanım odaklı kurulum.
        </footer>
      </main>
    </div>
  );
}
