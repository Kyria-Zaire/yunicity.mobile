'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const ACTIVITY_CARDS = [
  {
    text: '🏪 Le Bon Coin Rémois vient de rejoindre Yunicity',
    style: { left: '0%', top: '10%', maxWidth: 280, zIndex: 1 },
  },
  {
    text: '🎭 Événement : Jazz au Parvis ce soir — 47 participants',
    style: { left: '18%', top: '42%', maxWidth: 300, zIndex: 2 },
  },
  {
    text: '🤝 Nouvelle tribu : Cyclistes de Reims — 23 membres',
    style: { left: '6%', top: '68%', maxWidth: 270, zIndex: 3 },
  },
] as const;

export function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isVerification = pathname?.includes('verification-pending');

  if (isVerification) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[58%_42%] bg-[#0D0F2E] lg:bg-white">
      {/* Gauche desktop — fond uni #0D0F2E (identique landing footer) */}
      <aside className="hidden lg:flex lg:w-[58%] bg-[#0D0F2E] flex-col justify-between p-10 xl:p-14 shrink-0">
        <div>
          <span className="font-display text-4xl font-black text-[#2A2FFF]">
            Yunicity
          </span>
          <p className="font-body text-lg text-[#9395FF] italic mt-3 max-w-sm">
            Le réseau social de ta ville
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[300px] py-6">
          <div className="relative w-full max-w-lg h-[360px]">
            {ACTIVITY_CARDS.map((c, i) => (
              <div
                key={i}
                className="absolute bg-[#1C1F4A] rounded-xl border border-[#2A2FFF]/10 px-4 py-3 shadow-card text-sm text-white/90 font-body leading-snug"
                style={c.style}
              >
                {c.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-4">
          <div className="flex -space-x-2" aria-hidden>
            {['#2A2FFF', '#16A34A', '#D97706', '#7C3AED', '#059669', '#2563EB'].map(
              (bg, j) => (
                <div
                  key={j}
                  className="w-9 h-9 rounded-full border-2 border-[#0D0F2E] shrink-0"
                  style={{ backgroundColor: bg }}
                />
              ),
            )}
          </div>
          <span className="font-mono text-[11px] text-[#6B7280] tracking-wide">
            20+ acteurs déjà là
          </span>
        </div>
      </aside>

      {/* Droite / mobile card */}
      <main className="col-span-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12 lg:py-16 min-h-screen bg-[#0D0F2E] lg:bg-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-hover border border-[#E5E7EB]/80 lg:border-0 lg:shadow-none lg:rounded-none p-6 sm:p-8 lg:p-0">
          <div className="lg:hidden text-center mb-8">
            <span className="font-display text-2xl font-black text-[#2A2FFF]">
              Yunicity
            </span>
          </div>
          <Link
            href="/"
            className="text-[13px] text-[#6B7280] hover:text-[#2A2FFF] transition-colors mb-6 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
          >
            ← Accueil
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
