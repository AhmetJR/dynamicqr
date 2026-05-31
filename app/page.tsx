import Link from "next/link";
import BrandMark from "./components/BrandMark";

export default function Home() {
  const highlights = [
    { label: "Dinamik yönlendirme", value: "Slug sabit, hedef değişken" },
    { label: "Canlı takip", value: "Tıklama sayacı anlık artar" },
    { label: "Kolay erişim", value: "Admin panel ve QR indirme" },
  ];

  const steps = [
    { title: "1. Link oluştur", text: "Kısa slug ve hedef URL gir." },
    { title: "2. QR indir", text: "Aynı QR, hedef değişse bile çalışır." },
    { title: "3. Takip et", text: "Tıklamalar ve düzenlemeler tek panelde." },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_54%,#111827_100%)] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="fade-up sticky top-4 z-20 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/65 px-5 py-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100 sm:inline-flex">
              Canlı sistem
            </span>
            <Link
              href="/admin"
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Admin Paneli
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Dinamik hedef, sabit QR
            </div>

            <h1 className="fade-up max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl" style={{ animationDelay: "0.05s" }}>
              QR bağlantılarını tek panelden oluştur, güncelle ve takip et.
            </h1>

            <p className="fade-up max-w-2xl text-base leading-8 text-slate-300 sm:text-lg" style={{ animationDelay: "0.1s" }}>
              Kısa slug&apos;ı bir kez bas, hedef URL&apos;yi istediğin zaman değiştir. Aynı QR kalır, yönlendirme anında güncellenir.
            </p>

            <div className="fade-up flex flex-wrap gap-3 pt-1" style={{ animationDelay: "0.15s" }}>
              <Link
                href="/admin"
                className="rounded-full bg-white px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Yönetim ekranını aç
              </Link>
              <a
                href="#details"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Detaylara göz at
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="fade-up rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm" style={{ animationDelay: item.label === "Dinamik yönlendirme" ? "0.18s" : item.label === "Canlı takip" ? "0.24s" : "0.3s" }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-4 bottom-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl fade-up" style={{ animationDelay: "0.12s" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Panel özeti</p>
                  <p className="mt-2 text-2xl font-semibold">Aktif ve güncel</p>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Online
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/7">
                  <p className="text-sm text-slate-400">QR akışı</p>
                  <p className="mt-2 text-xl font-semibold text-white">Hızlı üretim</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Kısa link ve hedef yönetimi tek merkezde.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/7">
                  <p className="text-sm text-slate-400">Takip</p>
                  <p className="mt-2 text-xl font-semibold text-white">Canlı sayaç</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Her yönlendirme tıklama olarak kaydedilir.</p>
                </div>
              </div>

              <div id="details" className="mt-4 grid gap-3 sm:grid-cols-3">
                {steps.map((step) => (
                  <div key={step.title} className="fade-up rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition duration-300 hover:border-cyan-300/25 hover:bg-slate-900/80" style={{ animationDelay: step.title === "1. Link oluştur" ? "0.18s" : step.title === "2. QR indir" ? "0.24s" : "0.3s" }}>
                    <p className="text-sm font-semibold text-cyan-200">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Dinamik QR yönetimi için sade, hızlı ve net bir arayüz.</p>
          <p className="text-slate-500">Slug sabit, hedef istediğin zaman değişir.</p>
        </footer>
      </main>
    </div>
  );
}
