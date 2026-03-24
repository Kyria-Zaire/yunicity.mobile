'use client';

import Link from 'next/link';

export default function ProfilRootPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="rounded-2xl border border-[#F3F4F6] bg-white shadow-card p-6">
        <p className="font-mono text-[11px] text-[#9395FF] tracking-[0.2em] uppercase">
          Profil
        </p>
        <h1 className="font-display text-[36px] font-bold text-[#0D0F2E] mt-2 tracking-tight">
          Sélectionne un profil complet.
        </h1>
        <p className="font-body text-[#6B7280] mt-3">
          Depuis la carte, clique sur un acteur pour voir son passeport et son profil.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/map"
            className="h-12 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors inline-flex items-center justify-center"
          >
            Ouvrir la carte
          </Link>
          <Link
            href="/passport"
            className="h-12 rounded-xl border border-[#E5E7EB] text-[#0D0F2E] font-display font-semibold hover:bg-[#F3F4F6] transition-colors inline-flex items-center justify-center"
          >
            Ton passeport
          </Link>
        </div>
      </div>
    </main>
  );
}

