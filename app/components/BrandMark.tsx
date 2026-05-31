type BrandMarkProps = {
  compact?: boolean;
};

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-lg shadow-cyan-950/10">
        <div className="absolute inset-1 rounded-[0.85rem] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.9),_rgba(59,130,246,0.4))] opacity-90" />
        <div className="relative grid h-6 w-6 grid-cols-2 gap-0.5 rounded-md bg-slate-950/90 p-0.5">
          <span className="rounded-[0.2rem] bg-white" />
          <span className="rounded-[0.2rem] bg-white/85" />
          <span className="rounded-[0.2rem] bg-white/80" />
          <span className="rounded-[0.2rem] bg-white" />
        </div>
      </div>
      <div className={compact ? "leading-tight" : "leading-tight"}>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Dinamik QR</p>
        <p className="mt-1 text-sm text-slate-300">Kısa link yönetimi</p>
      </div>
    </div>
  );
}