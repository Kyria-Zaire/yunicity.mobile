import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0D0F2E] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-display font-black text-[72px] sm:text-[100px] lg:text-[120px] leading-none text-[#2A2FFF]/[0.22]"
          style={{ transform: 'translateY(-8%)' }}
        >
          404
        </span>
      </div>
      <div className="relative z-10 text-center max-w-xl">
        <span className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-[#9395FF] px-4 py-1.5 rounded-full border border-[#2A2FFF]/25 bg-[#1C1F4A]/50">
          Page introuvable
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mt-8 tracking-tight">
          Tu t&apos;es perdu dans la ville ?
        </h1>
        <p className="font-body text-lg text-[#9395FF] mt-6 leading-relaxed">
          Parfois les ruelles de Reims — et du web — nous mènent ailleurs que prévu.
          <br />
          Pas de panique : l&apos;accueil t&apos;attend.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center mt-10 h-12 px-10 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] hover:shadow-[0_12px_40px_rgba(42,47,255,0.45)] active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9395FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F2E]"
        >
          Retour à l&apos;accueil
        </Link>
        <p className="mt-8">
          <Link
            href="/"
            className="text-sm text-[#6B7280] hover:text-[#9395FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
          >
            Ou explore la carte de Reims →
          </Link>
        </p>
      </div>
    </div>
  );
}
