'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type PassportResponse = {
  userId: string;
  points: number;
  level: number;
  levelName: string;
  nextLevel: null | {
    level: number;
    name: string;
    pointsNeeded: number;
  };
  badges: string[];
  ambassadorLabel?: string;
  progress: number;
};

const BADGE_META: Record<
  string,
  { label: string; icon: string; tone: string }
> = {
  pionnier: { label: 'Pionnier', icon: '🌟', tone: 'bg-[#E8E9FF] text-[#2A2FFF]' },
  premier_pas: { label: 'Premier pas', icon: '👣', tone: 'bg-[#F3F4F6] text-[#0D0F2E]' },
  connecteur: { label: 'Connecteur', icon: '🔗', tone: 'bg-[#DCFCE7] text-[#16A34A]' },
  explorateur: { label: 'Explorateur', icon: '🗺️', tone: 'bg-[#FEF3C7] text-[#D97706]' },
  ambassadeur: { label: 'Ambassadeur', icon: '🏆', tone: 'bg-[#E8E9FF] text-[#2A2FFF]' },
  triple_a: { label: 'Triple A', icon: '⭐', tone: 'bg-[#1C1F4A] text-white' },
  commercial_v: { label: 'Acteur vérifié', icon: '✅', tone: 'bg-[#DCFCE7] text-[#16A34A]' },
  bati_reims: { label: 'Bâtisseur de Reims', icon: '🏗️', tone: 'bg-[#F5F3FF] text-[#7C3AED]' },
};

export default function ProfilDetailPage() {
  const params = useParams<{ id: string }>();
  const actorId = useMemo(() => params?.id ?? '', [params?.id]);

  const [passport, setPassport] = useState<PassportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/users/gamification/passport/${actorId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Profil: ${res.status}`);
        const json = (await res.json()) as PassportResponse;
        if (!cancelled) setPassport(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [actorId]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] text-[#9395FF] tracking-[0.2em] uppercase">
            Profil complet
          </p>
          <h1 className="font-display text-[36px] font-bold text-[#0D0F2E] mt-2 tracking-tight">
            {passport ? `Niveau ${passport.level} · ${passport.levelName}` : 'Chargement…'}
          </h1>
          <p className="font-body text-[#6B7280] mt-3">
            Passeport gamification de l'acteur sélectionné.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/passport"
            className="h-11 px-6 rounded-xl border border-[#E5E7EB] text-[#0D0F2E] font-display font-semibold hover:bg-[#F3F4F6] transition-colors inline-flex items-center justify-center"
          >
            Ton passeport
          </Link>
          <Link
            href="/premium"
            className="h-11 px-6 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors inline-flex items-center justify-center"
          >
            Premium
          </Link>
        </div>
      </div>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-6">
          {loading ? (
            <p className="font-body text-sm text-[#6B7280]">Chargement…</p>
          ) : error ? (
            <p className="font-body text-sm text-[#DC2626]">{error}</p>
          ) : passport ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
                    Points
                  </p>
                  <p className="font-display font-black text-[44px] text-[#0D0F2E] leading-none mt-2">
                    {passport.points}
                  </p>
                </div>
                <div className="min-w-[220px]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
                    Progression
                  </p>
                  <div className="mt-3 bg-[#F3F4F6] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#2A2FFF] h-full rounded-full transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, passport.progress))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
                  Badges
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {(passport.badges ?? []).length ? (
                    passport.badges.map((b) => {
                      const meta = BADGE_META[b] ?? {
                        label: b,
                        icon: '🏅',
                        tone: 'bg-[#F3F4F6] text-[#0D0F2E]',
                      };
                      return (
                        <span
                          key={b}
                          className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-3 py-2 rounded-full border border-[#E5E7EB] ${meta.tone}`}
                          title={meta.label}
                        >
                          <span aria-hidden>{meta.icon}</span>
                          {meta.label}
                        </span>
                      );
                    })
                  ) : (
                    <p className="font-body text-sm text-[#6B7280]">
                      Aucun badge pour l'instant.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="font-body text-sm text-[#6B7280]">Aucune donnée.</p>
          )}
        </div>

        <aside className="lg:col-span-5 bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-6">
          <p className="font-display font-bold text-[#0D0F2E]">Résumé</p>
          <p className="font-body text-sm text-[#6B7280] mt-2 leading-relaxed">
            En S3-04, le profil complet sera enrichi avec les infos KYC et les actions sociales.
          </p>

          <div className="mt-6 bg-[#F3F4F6] rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
              Prochaine étape
            </p>
            <p className="font-body text-sm text-[#0D0F2E] mt-2">
              Connecte Premium pour débloquer la partie “statistiques avancées”.
            </p>
            <Link
              href="/premium"
              className="mt-4 inline-flex w-full h-11 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors items-center justify-center"
            >
              Voir Premium
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

