'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { API_URL } from '@/lib/config';

type YuRecommendation = {
  id: string;
  type: 'actor' | 'tribe' | 'event';
  name: string;
  reason: string;
  score: number;
  city: string;
};

type YuResult = {
  actors: YuRecommendation[];
  tribes: YuRecommendation[];
  reason: string;
  source: 'yuni_ai' | 'geographic_fallback' | 'stub';
};

const MOCK_YU: YuResult = {
  source: 'stub',
  reason: 'Decouvrez les acteurs de Reims',
  actors: [
    {
      id: '1',
      type: 'actor',
      name: 'Boulangerie du Marche',
      reason: 'Commerce populaire',
      score: 0.95,
      city: 'reims',
    },
    {
      id: '2',
      type: 'actor',
      name: 'Studio Photo',
      reason: 'Creatif local',
      score: 0.88,
      city: 'reims',
    },
    {
      id: '3',
      type: 'actor',
      name: 'Asso Jazz au Parvis',
      reason: 'Culture active',
      score: 0.82,
      city: 'reims',
    },
  ],
  tribes: [
    {
      id: 't1',
      type: 'tribe',
      name: 'Cyclistes de Reims',
      reason: 'Sport populaire',
      score: 0.91,
      city: 'reims',
    },
    {
      id: 't2',
      type: 'tribe',
      name: 'Entrepreneurs Reims',
      reason: 'Reseau business',
      score: 0.85,
      city: 'reims',
    },
  ],
};

const MOCK_POSTS = [
  {
    avatar: 'LM',
    name: 'Lea M.',
    type: 'yunicitizen',
    text: 'Super balade hier soir \u{1F6B4}',
    time: 'il y a 2h',
  },
  {
    avatar: 'BX',
    name: 'Brasserie X',
    type: 'commercial',
    text: 'Happy hour vendredi 18h !',
    time: 'il y a 5h',
  },
  {
    avatar: 'SK',
    name: 'Sophie K.',
    type: 'yunicitizen',
    text: "Quelqu'un connait un reparateur velo ?",
    time: 'il y a 1j',
  },
];

function safeUserId(session: unknown): string | null {
  const s = session as Record<string, Record<string, string>>;
  return s?.['user']?.['id'] ?? s?.['user']?.['userId'] ?? s?.['user']?.['_id'] ?? null;
}

function typeColor(type: string) {
  if (type === 'commercial') return 'bg-[#DCFCE7] text-[#16A34A]';
  return 'bg-[#E8E9FF] text-[#2A2FFF]';
}

export default function DashboardPage() {
  const { data: session } = useSession() as unknown as {
    data: unknown;
    isPending: boolean;
  };
  const userId = useMemo(() => safeUserId(session), [session]);
  const [yuData, setYuData] = useState<YuResult>(MOCK_YU);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/ai/ai/recommendations?userId=${userId}&city=reims`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = (await res.json()) as YuResult;
          if (!cancelled) setYuData(json);
        }
      } catch {
        /* keep mock */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const allRecs = [...yuData.actors, ...yuData.tribes];

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* [1] HEADER */}
      <section className="bg-white border-b px-4 sm:px-6 py-6">
        <h1 className="font-display font-bold text-[28px] text-[#0D0F2E]">Bonjour {'\u{1F44B}'}</h1>
        <p className="font-mono text-[12px] text-[#9395FF] mt-1">Mercredi 18 mars 2026 · Reims</p>
      </section>

      <YuSection yuData={yuData} allRecs={allRecs} />

      <ActivitySection />

      {/* [4] CARTE RAPIDE + PASSEPORT */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-8 pb-12">
        {/* Card Carte */}
        <div className="bg-[#0D0F2E] rounded-2xl p-5 relative overflow-hidden">
          <div className="h-32 bg-[#1C1F4A] rounded-xl flex items-center justify-center">
            <span className="font-mono text-[12px] text-[#6B7280]">Carte interactive</span>
          </div>
          <span className="absolute top-3 left-3 bg-[#16A34A] text-white font-mono text-[10px] px-2 py-0.5 rounded-full">
            5 acteurs actifs
          </span>
          <Link
            href="/map"
            className="mt-3 inline-flex bg-[#2A2FFF] text-white font-mono text-[12px] rounded-lg px-4 py-2 hover:bg-[#1A1ECC] transition-colors"
          >
            Ouvrir la carte
          </Link>
        </div>

        {/* Card Passeport mini */}
        <div className="bg-gradient-to-br from-[#2A2FFF] to-[#1A1ECC] rounded-2xl p-5">
          <p className="font-mono text-[11px] text-white/70 uppercase tracking-widest">
            NIVEAU 3 · CITOYEN
          </p>
          <p className="font-display font-bold text-[28px] text-white mt-1">340 pts</p>
          <div className="h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-white/80 rounded-full" style={{ width: '48%' }} />
          </div>
          <p className="font-body text-[13px] text-white/70 mt-2">360 pts pour devenir Acteur</p>
          <Link
            href="/passport"
            className="mt-4 inline-flex bg-white/15 border border-white/20 text-white font-mono text-[12px] rounded-lg px-4 py-2 hover:bg-white/25 transition-colors"
          >
            Mon passeport &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}

function YuSection({ yuData, allRecs }: { yuData: YuResult; allRecs: YuRecommendation[] }) {
  return (
    <section className="px-4 mt-6">
      <div className="flex items-center gap-2">
        <span className="text-lg">{'\u{2728}'}</span>
        <h2 className="font-display font-semibold text-[18px] text-[#0D0F2E]">
          Yu recommande pour toi
        </h2>
      </div>
      <p className="font-mono text-[10px] text-[#9CA3AF] mt-1">
        source: {yuData.source} — les recommandations IA arrivent avec Yuni AI
      </p>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x mt-4">
        {allRecs.map((rec) => (
          <div
            key={rec.id}
            className="flex-shrink-0 w-52 snap-start bg-white border border-[#F3F4F6] rounded-2xl p-4"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-display ${
                rec.type === 'actor' ? 'bg-[#E8E9FF] text-[#2A2FFF]' : 'bg-[#DCFCE7] text-[#16A34A]'
              }`}
            >
              {rec.type === 'actor' ? '\u{1F3EA}' : '\u{1F465}'}
            </div>
            <p className="font-body text-[14px] font-medium text-[#0D0F2E] mt-2 line-clamp-1">
              {rec.name}
            </p>
            <p className="text-[12px] text-[#6B7280] line-clamp-2 mt-1">{rec.reason}</p>
            <div className="h-1 bg-[#F3F4F6] rounded-full mt-3">
              <div
                className="h-full bg-[#2A2FFF] rounded-full"
                style={{ width: `${Math.round(rec.score * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivitySection() {
  return (
    <section className="px-4 mt-8">
      <h2 className="font-display font-semibold text-[18px] text-[#0D0F2E]">Dans tes tribus</h2>
      <div className="mt-3 space-y-2">
        {MOCK_POSTS.map((post) => (
          <div
            key={post.name + post.text}
            className="bg-white border border-[#F3F4F6] rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#2A2FFF] flex items-center justify-center text-white text-[11px] font-display shrink-0">
              {post.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body text-[13px] font-medium text-[#0D0F2E]">
                  {post.name}
                </span>
                <span
                  className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${typeColor(post.type)}`}
                >
                  {post.type}
                </span>
              </div>
              <p className="font-body text-[14px] text-[#374151] line-clamp-1">{post.text}</p>
            </div>
            <span className="font-mono text-[11px] text-[#9CA3AF] shrink-0">{post.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
