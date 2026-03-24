'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

const API_BASE =
  process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

type PassportData = {
  userId: string;
  points: number;
  level: number;
  levelName: string;
  nextLevel: {
    level: number;
    name: string;
    pointsNeeded: number;
  } | null;
  badges: string[];
  progress: number;
};

const MOCK: PassportData = {
  userId: 'u1',
  points: 340,
  level: 3,
  levelName: 'Citoyen',
  nextLevel: { level: 4, name: 'Acteur', pointsNeeded: 360 },
  badges: ['pionnier', 'premier_pas', 'connecteur'],
  progress: 48,
};

const ALL_BADGES = [
  {
    id: 'pionnier',
    icon: '\u{1F31F}',
    name: 'Pionnier',
    desc: 'Parmi les 100 premiers inscrits a Reims',
  },
  {
    id: 'premier_pas',
    icon: '\u{1F463}',
    name: 'Premier pas',
    desc: 'Premier post publie sur le mur',
  },
  {
    id: 'connecteur',
    icon: '\u{1F517}',
    name: 'Connecteur',
    desc: 'Membre de 5 tribus ou plus',
  },
  {
    id: 'explorateur',
    icon: '\u{1F5FA}\uFE0F',
    name: 'Explorateur',
    desc: '10 acteurs visites sur la carte',
  },
  {
    id: 'ambassadeur',
    icon: '\u{1F3C6}',
    name: 'Ambassadeur',
    desc: 'Niveau 5 atteint — 1500 points',
  },
  {
    id: 'triple_a',
    icon: '\u{2B50}',
    name: 'Triple A',
    desc: 'Acteur, Ambassadeur, Accueillant',
  },
  {
    id: 'commercial_v',
    icon: '\u{2705}',
    name: 'Acteur verifie',
    desc: 'Profil commercial verifie',
  },
  {
    id: 'bati_reims',
    icon: '\u{1F3D7}\uFE0F',
    name: 'Batisseur de Reims',
    desc: 'Tribu avec 20+ membres creee',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Marie L.', points: 1240, isMe: false },
  { rank: 2, name: 'Jean-Paul M.', points: 890, isMe: false },
  { rank: 3, name: 'Sophie K.', points: 780, isMe: false },
  { rank: 4, name: 'Toi', points: 340, isMe: true },
  { rank: 5, name: 'Marc D.', points: 290, isMe: false },
];

const LEVELS = [
  { level: 1, name: 'Decouvreur' },
  { level: 2, name: 'Habitant' },
  { level: 3, name: 'Citoyen' },
  { level: 4, name: 'Acteur' },
  { level: 5, name: 'Ambassadeur' },
  { level: 6, name: 'Triple A' },
];

function rankIcon(rank: number) {
  if (rank === 1) return '\u{1F947}';
  if (rank === 2) return '\u{1F948}';
  if (rank === 3) return '\u{1F949}';
  return String(rank);
}

function rankColor(rank: number) {
  if (rank === 1) return 'text-[#F59E0B]';
  if (rank === 2) return 'text-[#9CA3AF]';
  if (rank === 3) return 'text-[#CD7F32]';
  return 'text-[#6B7280]';
}

function safeUserId(session: unknown): string | null {
  const s = session as Record<string, Record<string, string>>;
  return (
    s?.['user']?.['id'] ??
    s?.['user']?.['userId'] ??
    s?.['user']?.['_id'] ??
    null
  );
}

export default function PassportPage() {
  const { data: session } = useSession() as unknown as {
    data: unknown;
    isPending: boolean;
  };
  const userId = useMemo(() => safeUserId(session), [session]);

  const [data, setData] = useState<PassportData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) {
        setData(MOCK);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE}/users/gamification/passport/${userId}`,
          { credentials: 'include' },
        );
        if (!res.ok) throw new Error('API error');
        const json = (await res.json()) as PassportData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData(MOCK);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const d = data ?? MOCK;
  const obtainedSet = new Set(d.badges);
  const currentLevelIdx = LEVELS.findIndex(
    (l) => l.level === d.level,
  );
  const totalRequired = d.nextLevel
    ? d.points + d.nextLevel.pointsNeeded
    : d.points;

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* [1] HEADER HERO */}
      <section className="bg-[#0D0F2E] py-12 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#2A2FFF] flex items-center justify-center">
          <span className="font-display font-bold text-[28px] text-white">
            YU
          </span>
        </div>
        <h1 className="font-display font-bold text-[24px] text-white mt-4">
          Yunicitizen
        </h1>
        <span className="mt-3 inline-block bg-[#2A2FFF]/20 border border-[#2A2FFF]/40 text-[#9395FF] font-mono text-[11px] tracking-widest uppercase px-4 py-1.5 rounded-full">
          NIVEAU {d.level} — {d.levelName}
        </span>
        <p className="font-mono text-[12px] text-[#6B7280] mt-3">
          Reims · Membre depuis mars 2026
        </p>
      </section>

      {/* [2] CARTE PASSEPORT PHYSIQUE */}
      <div className="flex justify-center px-4 mt-8 mb-6">
        <div
          className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#2A2FFF] to-[#1A1ECC] p-5 overflow-hidden"
          style={{
            aspectRatio: '1.586 / 1',
            boxShadow: '0 20px 60px rgba(42,47,255,0.40)',
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-[16px] text-white">
              Yunicity
            </span>
            <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest">
              PASSEPORT
            </span>
          </div>
          <div className="mt-4 w-10 h-7 rounded-md bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] opacity-90 border border-[#FDE68A]/50" />
          <p className="font-display font-bold text-[20px] text-white mt-3">
            YUNICITIZEN
          </p>
          <p className="font-mono text-[10px] text-white/70 tracking-[0.15em] mt-1">
            {d.levelName.toUpperCase()} · NIVEAU {d.level}
          </p>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <span className="font-display font-bold text-[24px] text-white">
              {d.points} PTS
            </span>
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-1000"
                style={{ width: `${d.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* [3] SECTION PROGRESSION */}
      <section className="mx-4 -mt-4 bg-white rounded-2xl p-6 shadow-sm relative z-10">
        <h2 className="font-display font-semibold text-[16px] text-[#0D0F2E]">
          Progression vers le niveau{' '}
          {d.nextLevel ? d.nextLevel.level : d.level}
        </h2>
        <p className="font-body text-[14px] text-[#6B7280] mt-1">
          {d.nextLevel
            ? `${d.nextLevel.name} · ${d.nextLevel.pointsNeeded} points restants`
            : 'Niveau maximum atteint'}
        </p>

        <div className="mt-4 h-3 bg-[#F3F4F6] rounded-full relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2A2FFF] to-[#9395FF] rounded-full transition-all duration-1000"
            style={{ width: `${d.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[11px] text-[#6B7280]">
            {d.points} pts
          </span>
          <span className="font-mono text-[11px] text-[#6B7280]">
            {totalRequired} pts requis
          </span>
        </div>

        <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
          {LEVELS.map((l, i) => (
            <span
              key={l.level}
              className={`shrink-0 px-3 py-1 font-mono text-[10px] rounded-full ${
                i === currentLevelIdx
                  ? 'bg-[#2A2FFF] text-white'
                  : i < currentLevelIdx
                    ? 'bg-[#E8E9FF] text-[#2A2FFF]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF]'
              }`}
            >
              {l.name}
            </span>
          ))}
        </div>
      </section>

      {/* [4] GRILLE DES BADGES */}
      <section className="px-4 mt-8">
        <h2 className="font-display font-semibold text-[20px] text-[#0D0F2E]">
          Mes badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {ALL_BADGES.map((badge) => {
            const obtained = obtainedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`bg-white border rounded-2xl p-4 text-center flex flex-col items-center ${
                  obtained
                    ? 'border-[#2A2FFF]/20 bg-[#E8E9FF]/50'
                    : 'border-[#F3F4F6]'
                }`}
                style={
                  obtained
                    ? {}
                    : { filter: 'grayscale(1)', opacity: 0.45 }
                }
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="font-body text-[13px] font-medium mt-2 text-[#0D0F2E]">
                  {badge.name}
                </p>
                <p className="text-[11px] text-[#9CA3AF] leading-snug line-clamp-2 mt-1">
                  {badge.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* [5] CLASSEMENT HEBDO */}
      <section className="px-4 mt-8 pb-12">
        <h2 className="font-display font-semibold text-[20px] text-[#0D0F2E]">
          Classement · Cette semaine · Reims
        </h2>
        <p className="font-body text-[13px] text-[#9CA3AF] mt-1">
          Se remet a zero chaque lundi
        </p>

        <div className="bg-white rounded-2xl mt-4 overflow-hidden">
          {LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className={`flex items-center px-4 py-3 border-b border-[#F3F4F6] ${
                item.isMe
                  ? 'bg-[#E8E9FF] font-medium border-l-2 border-l-[#2A2FFF]'
                  : ''
              }`}
            >
              <span
                className={`w-8 text-center font-display font-bold text-[14px] ${rankColor(item.rank)}`}
              >
                {rankIcon(item.rank)}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 text-white text-[12px] font-display ${
                  item.rank === 1
                    ? 'bg-[#F59E0B]'
                    : item.rank === 2
                      ? 'bg-[#9CA3AF]'
                      : item.rank === 3
                        ? 'bg-[#CD7F32]'
                        : 'bg-[#2A2FFF]'
                }`}
              >
                {item.name.slice(0, 2)}
              </div>
              <span className="font-body text-[14px] text-[#0D0F2E] flex-1 ml-3">
                {item.name}
              </span>
              <span className="font-display font-semibold text-[14px] text-[#2A2FFF]">
                {item.points}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-4 mb-6">
          <button
            type="button"
            className="font-body text-[14px] text-[#6B7280] hover:text-[#2A2FFF] transition-colors"
          >
            Voir le classement complet
          </button>
        </div>
      </section>
    </main>
  );
}
