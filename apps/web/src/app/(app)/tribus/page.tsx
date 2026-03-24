'use client';

import { useMemo, useState } from 'react';
import { TribeCard, type Tribe } from '@/components/tribes/tribe-card';

const MOCK_TRIBES: Tribe[] = [
  { id: '1', name: 'Cyclistes de Reims', category: 'sport', membersCount: 23, isVerified: true, description: 'Passionnés de vélo, balades et véloroutes autour de Reims.' },
  { id: '2', name: 'Jazz au Parvis', category: 'culture', membersCount: 47, isVerified: true, description: 'Amateurs de jazz, concerts et improvisation à Reims.' },
  { id: '3', name: 'Entrepreneurs Reims', category: 'business', membersCount: 31, isVerified: false, description: "Réseau d'entrepreneurs locaux qui se retrouvent chaque mois." },
  { id: '4', name: 'Potagers Urbains', category: 'ecology', membersCount: 18, isVerified: false, description: 'Jardinage urbain, permaculture et compostage collectif.' },
  { id: '5', name: 'Parents Croix-Rouge', category: 'social', membersCount: 62, isVerified: true, description: 'Entraide et partage entre parents du quartier Croix-Rouge.' },
  { id: '6', name: 'Dev Reims', category: 'tech', membersCount: 29, isVerified: false, description: 'Développeurs, designers et makers de la région rémoise.' },
];

const TABS = [
  { key: 'all', label: 'Toutes' },
  { key: 'culture', label: 'Culture' },
  { key: 'sport', label: 'Sport' },
  { key: 'business', label: 'Business' },
  { key: 'social', label: 'Social' },
  { key: 'ecology', label: 'Écologie' },
  { key: 'tech', label: 'Tech' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function TribusPage() {
  const [tab, setTab] = useState<TabKey>('all');

  const items = useMemo(() => {
    if (tab === 'all') return MOCK_TRIBES;
    return MOCK_TRIBES.filter((t) => t.category === tab);
  }, [tab]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-[34px] sm:text-[36px] text-[#0D0F2E] tracking-tight">
            Les tribus de Reims
          </h1>
          <p className="font-body text-[#6B7280] mt-3 text-base">
            Rejoins une communauté qui te ressemble.
          </p>
        </div>

        <button
          type="button"
          className="h-11 px-6 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors w-full sm:w-auto"
        >
          Créer une tribu
        </button>
      </div>

      <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="inline-flex gap-2 min-w-max pb-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-colors
                  ${active ? 'bg-[#2A2FFF] text-white border-[#2A2FFF]' : 'bg-[#F3F4F6] text-[#374151] border-[#F3F4F6] hover:bg-[#E5E7EB]'}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((tribe) => (
          <TribeCard key={tribe.id} tribe={tribe} />
        ))}
      </section>
    </main>
  );
}

