'use client';

import { useMemo, useState } from 'react';
import type { MockProfile, MockEvent } from './profile-types';
import {
  AVATAR_BG,
  MOCK_EVENTS_BY_TYPE,
  MOCK_OFFERS,
  MOCK_PROJECTS,
  MOCK_REVIEWS,
  MOCK_POSTS_BY_TYPE,
} from './profile-types';

export function MediaTab({ profile }: { profile: MockProfile }) {
  const [sub, setSub] = useState<'photos' | 'videos'>('photos');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: `m${i}`,
        label: `Photo ${i + 1}`,
        bg: `${AVATAR_BG[profile.profileType]}20`,
      })),
    [profile.profileType],
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b border-[#F3F4F6] pb-2">
        <button
          type="button"
          onClick={() => setSub('photos')}
          className={`font-display text-sm ${sub === 'photos' ? 'text-[#2A2FFF] font-semibold' : 'text-[#6B7280]'}`}
        >
          Photos ({photos.length})
        </button>
        <button
          type="button"
          onClick={() => setSub('videos')}
          className={`font-display text-sm ${sub === 'videos' ? 'text-[#2A2FFF] font-semibold' : 'text-[#6B7280]'}`}
        >
          Vidéos (0)
        </button>
      </div>

      {sub === 'photos' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setLightbox(idx)}
              className="relative aspect-square rounded-xl overflow-hidden group border border-[#F3F4F6]"
              style={{ background: p.bg }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-2xl group-hover:opacity-90">📷</span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">⤢</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="font-body text-sm text-[#6B7280] py-8 text-center">Aucune vidéo pour le moment.</p>
      )}

      {lightbox !== null && (
        <Lightbox
          title={photos[lightbox]?.label ?? ''}
          index={lightbox}
          total={photos.length}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((i) =>
              i === null ? 0 : i <= 0 ? photos.length - 1 : i - 1,
            )
          }
          onNext={() =>
            setLightbox((i) =>
              i === null ? 0 : i >= photos.length - 1 ? 0 : i + 1,
            )
          }
        />
      )}
    </div>
  );
}

function Lightbox({
  title,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  title: string;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="font-display font-semibold truncate">{title}</p>
        <button type="button" onClick={onClose} className="shrink-0 px-3 py-1 rounded-lg bg-white/10">
          Fermer
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <button type="button" onClick={onPrev} className="hidden sm:block p-4 text-white/80 hover:text-white">
          ‹
        </button>
        <div className="w-full max-w-lg aspect-square rounded-2xl bg-white/10 flex items-center justify-center text-6xl mx-4">
          📷
        </div>
        <button type="button" onClick={onNext} className="hidden sm:block p-4 text-white/80 hover:text-white">
          ›
        </button>
      </div>
      <p className="text-center text-white/60 font-mono text-xs pb-4">
        {index + 1} / {total}
      </p>
    </div>
  );
}

const CATEGORY_BAR: Record<string, string> = {
  promo: 'bg-[#2A2FFF]',
  atelier: 'bg-[#16A34A]',
  concert: 'bg-[#D97706]',
  culture: 'bg-[#7C3AED]',
  sport: 'bg-[#059669]',
  admin: 'bg-[#6B7280]',
  projet: 'bg-[#DC2626]',
  info: 'bg-[#2A2FFF]',
  expo: 'bg-[#BE123C]',
};

export function EventsTab({ profile }: { profile: MockProfile }) {
  const [sub, setSub] = useState<'upcoming' | 'past'>('upcoming');
  const events = MOCK_EVENTS_BY_TYPE[profile.profileType] ?? [];
  const upcoming = events;
  const past: MockEvent[] = [];

  const next7 = useMemo(() => {
    const out: { d: Date; label: string; has: boolean }[] = [];
    const base = new Date(2026, 2, 23);
    for (let i = 0; i < 7; i++) {
      const dt = new Date(base);
      dt.setDate(base.getDate() + i);
      const iso = dt.toISOString().slice(0, 10);
      const has = events.some((ev) => ev.date === iso);
      out.push({
        d: dt,
        label: dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        has,
      });
    }
    return out;
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {next7.map((day, i) => (
          <div
            key={i}
            className={`shrink-0 w-14 rounded-xl border px-2 py-2 text-center ${
              day.has ? 'border-[#2A2FFF] bg-[#E8E9FF]' : 'border-[#E5E7EB] bg-white'
            }`}
          >
            <p className="font-mono text-[9px] uppercase text-[#6B7280] truncate">{day.label.split(' ')[0]}</p>
            <p className="font-display font-bold text-[#0D0F2E] text-sm">{day.d.getDate()}</p>
            {day.has && <div className="w-1.5 h-1.5 rounded-full bg-[#2A2FFF] mx-auto mt-1" />}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSub('upcoming')}
          className={`px-4 py-2 rounded-xl font-display text-sm ${sub === 'upcoming' ? 'bg-[#2A2FFF] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}
        >
          À venir
        </button>
        <button
          type="button"
          onClick={() => setSub('past')}
          className={`px-4 py-2 rounded-xl font-display text-sm ${sub === 'past' ? 'bg-[#2A2FFF] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}
        >
          Passés
        </button>
      </div>

      <div className="space-y-4">
        {sub === 'upcoming' &&
          upcoming.map((ev) => <EventCard key={ev.id} ev={ev} profile={profile} />)}
        {sub === 'upcoming' && upcoming.length === 0 && (
          <p className="font-body text-sm text-[#6B7280] text-center py-6">Aucun événement à venir.</p>
        )}
        {sub === 'past' && (
          <p className="font-body text-sm text-[#6B7280] text-center py-6">
            {past.length === 0 ? 'Aucun événement passé dans les données mock.' : null}
          </p>
        )}
      </div>
    </div>
  );
}

function EventCard({ ev, profile }: { ev: MockEvent; profile: MockProfile }) {
  const [going, setGoing] = useState(false);
  const bar = CATEGORY_BAR[ev.category] ?? 'bg-[#2A2FFF]';

  return (
    <div className="relative flex gap-4 bg-white rounded-2xl border border-[#F3F4F6] p-4 overflow-hidden shadow-card">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar}`} aria-hidden />
      <div className="shrink-0 text-center pl-2">
        <p className="font-display font-bold text-[28px] text-[#2A2FFF] leading-none">{ev.dayLabel.split(' ')[1]}</p>
        <p className="font-mono text-[10px] text-[#6B7280] uppercase">{ev.dayLabel.split(' ')[0]}</p>
        <p className="font-body text-xs text-[#6B7280] mt-1">{ev.time}</p>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base text-[#0D0F2E]">{ev.title}</h3>
        <p className="font-body text-sm text-[#6B7280] mt-1">📍 {ev.location} · ~2 km</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-[10px] text-[#6B7280]">{ev.participants} participants</span>
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white bg-[#E5E7EB]"
                style={{ background: AVATAR_BG[profile.profileType] }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => setGoing((g) => !g)}
            className={`h-9 px-4 rounded-xl font-display text-sm ${
              going ? 'bg-[#E8E9FF] text-[#2A2FFF] border border-[#2A2FFF]' : 'bg-[#2A2FFF] text-white'
            }`}
          >
            {going ? "Je n'y vais plus" : "J'y vais"}
          </button>
          <button type="button" className="h-9 px-4 rounded-xl border border-[#E5E7EB] font-body text-sm text-[#6B7280]">
            Partager
          </button>
        </div>
      </div>
    </div>
  );
}

const DISTRIBUTION = [
  { stars: 5, pct: 70 },
  { stars: 4, pct: 20 },
  { stars: 3, pct: 7 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

export function ReviewsTab({ profile }: { profile: MockProfile }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const avg = profile.rating ?? 4.7;
  const count = profile.reviewCount ?? 23;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-card">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="text-center sm:text-left">
            <p className="font-display font-black text-5xl text-[#D97706]">{avg.toFixed(1)}</p>
            <p className="font-mono text-xs text-[#6B7280] mt-1">{count} avis</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {DISTRIBUTION.map((row) => (
              <div key={row.stars} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#6B7280] w-16 shrink-0">
                  {'⭐'.repeat(row.stars)}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full bg-[#2A2FFF] rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="font-mono text-[10px] text-[#6B7280] w-8">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#E8E9FF] rounded-2xl border border-[#2A2FFF]/20 p-5">
        <p className="font-display font-semibold text-[#0D0F2E] mb-3">Laisser un avis</p>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              className={`text-2xl ${s <= rating ? '' : 'opacity-30'}`}
              aria-label={`${s} étoiles`}
            >
              ⭐
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Votre commentaire (optionnel)"
          className="w-full rounded-xl border border-[#C7D2FE] px-3 py-2 font-body text-sm mb-3 bg-white"
        />
        <button
          type="button"
          disabled={rating === 0 || submitted}
          onClick={() => setSubmitted(true)}
          className="h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm disabled:opacity-50"
        >
          {submitted ? 'Merci !' : 'Publier mon avis'}
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_REVIEWS.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-[#F3F4F6] p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center font-display text-xs text-[#6B7280]">
                {r.author[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-semibold text-sm text-[#0D0F2E]">{r.author}</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{r.date}</span>
                </div>
                <p className="text-sm mt-0.5">{'⭐'.repeat(r.note)}</p>
                <p className="font-body text-sm text-[#374151] mt-2">{r.text}</p>
                <div className="flex gap-4 mt-3">
                  <button type="button" className="font-body text-xs text-[#6B7280] hover:text-[#2A2FFF]">
                    Utile ? 👍 {r.helpful}
                  </button>
                  <button type="button" className="font-body text-xs text-[#6B7280] hover:text-[#2A2FFF]">
                    Répondre
                  </button>
                </div>
                {r.reply && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-[#E5E7EB] bg-[#F9FAFB] rounded-r-lg p-3">
                    <p className="font-mono text-[10px] text-[#6B7280] uppercase">Réponse du commerçant</p>
                    <p className="font-body text-sm text-[#374151] mt-1">{r.reply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OffersTab() {
  return (
    <div className="space-y-4">
      {MOCK_OFFERS.map((o) => (
        <div key={o.id} className="relative bg-white rounded-2xl border border-[#F3F4F6] p-5 shadow-card overflow-hidden">
          <span className="absolute top-3 right-3 bg-[#DC2626] text-white font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
            Offre
          </span>
          <h3 className="font-display font-semibold text-lg text-[#0D0F2E] pr-20">{o.title}</h3>
          <p className="font-body text-sm text-[#6B7280] mt-2">{o.description}</p>
          {o.oldPrice && o.newPrice && (
            <p className="mt-2 font-body text-sm">
              <span className="line-through text-[#9CA3AF]">{o.oldPrice}</span>{' '}
              <span className="text-[#DC2626] font-semibold">{o.newPrice}</span>
            </p>
          )}
          <p className="font-mono text-[11px] text-[#6B7280] mt-2">Validité : {o.validity}</p>
          <button
            type="button"
            className="mt-4 h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm"
          >
            Profiter de l&apos;offre
          </button>
        </div>
      ))}
    </div>
  );
}

export function PortfolioTab({ profile }: { profile: MockProfile }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {MOCK_PROJECTS.map((pj) => (
        <div key={pj.id} className="bg-white rounded-2xl border border-[#F3F4F6] overflow-hidden shadow-card">
          <div
            className="h-32 flex items-center justify-center text-4xl"
            style={{ background: `${AVATAR_BG[profile.profileType]}18` }}
          >
            {pj.tags.some((t) => t.toLowerCase().includes('photo')) ? '📷' : '🎨'}
          </div>
          <div className="p-4">
            <h3 className="font-display font-semibold text-[#0D0F2E]">{pj.title}</h3>
            <p className="font-mono text-[10px] text-[#6B7280] mt-1">{pj.client ?? 'Confidentiel'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pj.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-[#F3F4F6] font-body text-xs text-[#6B7280]">
                  {t}
                </span>
              ))}
            </div>
            {pj.link && (
              <a
                href={pj.link}
                className="inline-block mt-3 font-body text-sm font-semibold text-[#2A2FFF] hover:underline"
              >
                Voir le projet →
              </a>
            )}
            {!pj.link && (
              <span className="inline-block mt-3 font-body text-sm text-[#9CA3AF]">Portfolio Yunicity</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const MOCK_MEMBERS = ['Sophie K.', 'Marc D.', 'Léa M.', 'Paul B.', 'Julie R.', 'Thomas L.'];
const MOCK_ASSOC_PROJECTS = [
  { id: 'x1', title: 'Scène jazz été 2026', desc: 'Programmation et partenaires' },
  { id: 'x2', title: 'Ateliers jeunes publics', desc: 'Partenariat écoles' },
];

export function AssociationMembersTab() {
  return (
    <section>
      <h3 className="font-display font-bold text-[#0D0F2E] mb-4">Membres</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOCK_MEMBERS.map((name) => (
          <div key={name} className="flex items-center gap-2 p-3 rounded-xl border border-[#F3F4F6] bg-white shadow-card">
            <div className="w-8 h-8 rounded-full bg-[#E8E9FF] flex items-center justify-center font-mono text-[10px] text-[#2A2FFF]">
              {name[0]}
            </div>
            <span className="font-body text-sm text-[#0D0F2E] truncate">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AssociationProjectsTab() {
  return (
    <section>
      <h3 className="font-display font-bold text-[#0D0F2E] mb-4">Projets</h3>
      <div className="space-y-3">
        {MOCK_ASSOC_PROJECTS.map((p) => (
          <div key={p.id} className="p-4 rounded-2xl border border-[#F3F4F6] bg-white shadow-card">
            <p className="font-display font-semibold text-[#0D0F2E]">{p.title}</p>
            <p className="font-body text-sm text-[#6B7280] mt-1">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

