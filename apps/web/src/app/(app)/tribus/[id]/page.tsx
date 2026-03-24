'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PostCard, type CommunityPost } from '@/components/community/post-card';
import type { Tribe } from '@/components/tribes/tribe-card';

const MOCK_TRIBES: Tribe[] = [
  { id: '1', name: 'Cyclistes de Reims', category: 'sport', membersCount: 23, isVerified: true, description: 'Passionnés de vélo, balades et véloroutes autour de Reims.' },
  { id: '2', name: 'Jazz au Parvis', category: 'culture', membersCount: 47, isVerified: true, description: 'Amateurs de jazz, concerts et improvisation à Reims.' },
  { id: '3', name: 'Entrepreneurs Reims', category: 'business', membersCount: 31, isVerified: false, description: "Réseau d'entrepreneurs locaux qui se retrouvent chaque mois." },
  { id: '4', name: 'Potagers Urbains', category: 'ecology', membersCount: 18, isVerified: false, description: 'Jardinage urbain, permaculture et compostage collectif.' },
  { id: '5', name: 'Parents Croix-Rouge', category: 'social', membersCount: 62, isVerified: true, description: 'Entraide et partage entre parents du quartier Croix-Rouge.' },
  { id: '6', name: 'Dev Reims', category: 'tech', membersCount: 29, isVerified: false, description: 'Développeurs, designers et makers de la région rémoise.' },
];

const POSTS: CommunityPost[] = [
  { id: '1', authorName: 'Léa M.', profileType: 'yunicitizen', content: 'Super balade hier soir, itinéraire parfait ! 🚴', type: 'text', reactions: { '👍': 12, '❤️': 5, '🏙️': 3 }, createdAt: 'il y a 2h' },
  { id: '2', authorName: 'Marc Dupont', profileType: 'commercial', content: 'Happy hour ce vendredi 18h au bar du sport, venez nombreux !', type: 'event', createdAt: 'il y a 5h', event: { title: 'Happy Hour Vendredi', date: 'Vendredi 18h', location: 'Bar du Sport, Reims' } },
  { id: '3', authorName: 'Sophie K.', profileType: 'yunicitizen', content: "Quelqu'un connaît un bon réparateur vélo dans le centre ?", type: 'question', reactions: { '🤝': 8 }, createdAt: 'il y a 1j' },
];

const categoryMeta: Record<string, { emoji: string; circle: string }> = {
  sport: { emoji: '🚴', circle: 'bg-[#2A2FFF]/15' },
  culture: { emoji: '🎷', circle: 'bg-[#D97706]/15' },
  business: { emoji: '📈', circle: 'bg-[#16A34A]/15' },
  social: { emoji: '🤝', circle: 'bg-[#7C3AED]/15' },
  ecology: { emoji: '🌿', circle: 'bg-[#059669]/15' },
  tech: { emoji: '🧩', circle: 'bg-[#2563EB]/15' },
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TribeDetailPage() {
  const params = useParams<{ id: string }>();
  const tribe = useMemo(() => MOCK_TRIBES.find((t) => t.id === params?.id) ?? MOCK_TRIBES[0]!, [params?.id]);
  const meta = categoryMeta[tribe.category] ?? { emoji: '🏙️', circle: 'bg-[#2A2FFF]/15' };

  const [isMember, setIsMember] = useState(false);
  const [composer, setComposer] = useState('');
  const [postType, setPostType] = useState<'text' | 'event' | 'question' | 'offer'>('text');

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB]">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D0F2E] to-[#1C1F4A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className={`w-[72px] h-[72px] rounded-2xl ${meta.circle} border border-white/10 flex items-center justify-center text-4xl`} aria-hidden>
                {meta.emoji}
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-black text-[30px] sm:text-[32px] leading-tight tracking-tight">
                  {tribe.name}
                </h1>
                <p className="font-body text-[#9395FF] mt-2 max-w-2xl">{tribe.description}</p>
                <p className="font-mono text-[12px] text-[#6B7280] mt-4">
                  {tribe.membersCount} membres · {cap(tribe.category)} · Créée en mars 2026
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsMember(true)}
                className="h-11 px-6 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors"
              >
                {isMember ? 'Membre ✓' : 'Rejoindre la tribu'}
              </button>
              <button
                type="button"
                className="h-11 px-6 rounded-xl border border-white/15 text-white font-display font-semibold hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
                  <path d="M16 6l-4-4-4 4" />
                  <path d="M12 2v14" />
                </svg>
                Partager
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left */}
        <section className="lg:col-span-8">
          {isMember && (
            <div className="bg-white rounded-2xl border border-[#F3F4F6] p-5 shadow-card">
              <textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Partager quelque chose avec la tribu..."
                className="w-full min-h-[110px] rounded-2xl border border-[#E5E7EB] p-4 font-body text-[15px] text-[#0D0F2E] placeholder:text-[#9CA3AF] focus:outline-none focus:shadow-[0_0_0_4px_rgba(42,47,255,0.08)] focus:border-[#2A2FFF]"
              />
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'text' as const, label: 'Texte' },
                    { key: 'event' as const, label: 'Événement' },
                    { key: 'question' as const, label: 'Question' },
                    { key: 'offer' as const, label: 'Offre' },
                  ].map((t) => {
                    const active = postType === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setPostType(t.key)}
                        className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-colors
                          ${active ? 'bg-[#2A2FFF] text-white border-[#2A2FFF]' : 'bg-[#F3F4F6] text-[#374151] border-[#F3F4F6] hover:bg-[#E5E7EB]'}`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors"
                >
                  Publier
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5">
            {POSTS.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>

        {/* Right */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-[#F3F4F6] p-5 shadow-card">
            <p className="font-display font-bold text-[#0D0F2E]">À propos</p>
            <p className="font-body text-sm text-[#6B7280] leading-relaxed mt-3">{tribe.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tribe.isVerified ? (
                <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  Vérifiée ✓
                </span>
              ) : (
                <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                  Non vérifiée
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#F3F4F6] p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-[#0D0F2E]">Membres ({tribe.membersCount})</p>
              <Link href="#" className="font-body text-sm text-[#2A2FFF] font-semibold hover:underline">
                Voir tous
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-12 h-12 rounded-2xl border border-[#E5E7EB] mx-auto"
                    style={{ background: i === 0 ? '#2A2FFF' : i % 3 === 0 ? '#16A34A' : i % 3 === 1 ? '#D97706' : '#7C3AED' }}
                    aria-hidden
                  />
                  <div className="mt-2 font-body text-[11px] text-[#6B7280] truncate">
                    {i === 0 ? 'Admin 👑' : `Membre ${i + 1}`}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="mt-5 w-full h-10 rounded-xl bg-[#F3F4F6] text-[#0D0F2E] font-display font-semibold hover:bg-[#E5E7EB] transition-colors">
              Voir tous les membres
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#F3F4F6] p-5 shadow-card">
            <p className="font-display font-bold text-[#0D0F2E]">Tribus similaires</p>
            <div className="mt-4 grid gap-3">
              {MOCK_TRIBES.filter((t) => t.id !== tribe.id).slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  href={`/tribus/${t.id}`}
                  className="rounded-2xl border border-[#F3F4F6] p-4 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(13,15,46,0.10)] transition-all"
                >
                  <p className="font-display font-semibold text-[#0D0F2E]">{t.name}</p>
                  <p className="font-body text-sm text-[#6B7280] mt-1 line-clamp-1">{t.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

