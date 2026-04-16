'use client';

import Link from 'next/link';
import {
  type MockProfile,
  AVATAR_BG,
  BADGE_CONFIG,
  levelProgress,
} from './profile-types';

const MOCK_SIMILAR = [
  { id: '6', name: 'Café des Halles', type: 'commercial' as const },
  { id: '7', name: 'Librairie Pause', type: 'yunicitizen' as const },
  { id: '8', name: 'Collectif Zéro Déchet', type: 'association' as const },
];

type Props = {
  profile: MockProfile;
  showFollowMini?: boolean;
};

export function ProfileSidebar({ profile, showFollowMini }: Props) {
  const progress = levelProgress(profile.points);
  const avatarSlots = Array.from({ length: 8 }, (_, i) => i);

  return (
    <aside className="hidden lg:block w-80 shrink-0 space-y-6 pl-6">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#0D0F2E] p-5 shadow-card">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#9395FF]">Passeport</p>
          <p className="font-display font-bold text-lg text-white mt-1">
            Niveau {profile.level} · {profile.levelName}
          </p>
          <p className="font-mono text-[11px] text-white/60 mt-0.5">{profile.points} points</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full rounded-full bg-[#2A2FFF]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex gap-1 flex-wrap">
            {profile.badges.slice(0, 3).map((b) => (
              <span key={b} className="text-base" title={BADGE_CONFIG[b]?.name}>
                {BADGE_CONFIG[b]?.icon ?? '🏅'}
              </span>
            ))}
          </div>
          <Link href="/passport" className="mt-3 inline-flex font-body text-sm font-semibold text-[#2A2FFF] hover:underline">
            Voir le passeport →
          </Link>
        </div>

        <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-card">
          <p className="font-display font-semibold text-[#0D0F2E]">{profile.followers} abonnés</p>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {avatarSlots.map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-[#E8E9FF]"
                style={{ opacity: 1 - i * 0.06 }}
              />
            ))}
          </div>
          <p className="font-display font-semibold text-[#0D0F2E] mt-5">{profile.following} abonnements</p>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {avatarSlots.map((i) => (
              <div key={`f-${i}`} className="aspect-square rounded-lg bg-[#F3F4F6]" />
            ))}
          </div>
          {showFollowMini && (
            <p className="font-mono text-[10px] text-[#6B7280] mt-4">3 abonnements en commun · mock</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-[#0D0F2E]">Tribus</h3>
            <Link href="/tribus" className="font-body text-xs font-semibold text-[#2A2FFF] hover:underline">
              Voir toutes →
            </Link>
          </div>
          <div className="space-y-2">
            {profile.tribes.slice(0, 4).map((t) => (
              <Link
                key={t}
                href="/tribus"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F9FAFB] transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono text-[9px]"
                  style={{ background: AVATAR_BG[profile.profileType] }}
                >
                  {t.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-body text-sm text-[#0D0F2E] truncate">{t}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-card">
          <h3 className="font-display font-bold text-[#0D0F2E] mb-3">Vous pourriez aussi aimer</h3>
          <div className="space-y-3">
            {MOCK_SIMILAR.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full shrink-0"
                  style={{ background: AVATAR_BG[s.type] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-[#0D0F2E] truncate">{s.name}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 h-8 px-3 rounded-lg bg-[#2A2FFF] text-white font-mono text-[10px] uppercase"
                >
                  Suivre
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
