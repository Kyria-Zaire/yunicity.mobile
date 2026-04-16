'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FollowButton } from './follow-button';
import { ProfileMiniMap } from './profile-mini-map';
import {
  type MockProfile,
  AVATAR_BG,
  COVER_GRADIENT,
  TYPE_LABEL,
  initials,
} from './profile-types';

export function CoverHeader({
  profile,
  showOwnerControls,
  isAccountOwner,
  visitorPreview,
  onToggleVisitorPreview,
  onContact,
  onFollowCountDelta,
}: {
  profile: MockProfile;
  /** Affiche composer / modifier profil / partage propriétaire */
  showOwnerControls: boolean;
  /** Compte connecté = propriétaire de ce profil */
  isAccountOwner: boolean;
  visitorPreview: boolean;
  onToggleVisitorPreview: () => void;
  onContact: () => void;
  onFollowCountDelta?: (delta: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* Cover gradient */}
      <div className={`relative h-48 sm:h-56 md:h-64 bg-gradient-to-br ${COVER_GRADIENT[profile.profileType]} overflow-hidden`}>
        {/* Geometric pattern overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="hex" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
              <polygon points="20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#hex)" />
        </svg>

        {showOwnerControls && (
          <button
            type="button"
            className="absolute bottom-3 right-3 h-8 px-3 rounded-lg bg-black/30 backdrop-blur text-white font-mono text-[11px] hover:bg-black/50 transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Modifier la couverture
          </button>
        )}
      </div>

      {/* Avatar + info row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
          {/* Avatar */}
          <div className="relative shrink-0 ml-0 sm:ml-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-display font-bold text-2xl border-4 border-white shadow-lg"
              style={{ background: AVATAR_BG[profile.profileType] }}
            >
              {initials(profile.displayName)}
            </div>
            {showOwnerControls && (
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#E5E7EB] shadow flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                aria-label="Changer la photo"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="font-display font-bold text-2xl text-[#0D0F2E] tracking-tight truncate">
              {profile.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ background: AVATAR_BG[profile.profileType], color: 'white' }}
              >
                {TYPE_LABEL[profile.profileType]}
              </span>
              {profile.verificationStatus === 'verified' && (
                <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  Vérifié ✓
                </span>
              )}
              {profile.rating != null && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#D97706]">
                  ⭐ {profile.rating}/5
                  <span className="text-[#9CA3AF]">({profile.reviewCount} avis)</span>
                </span>
              )}
            </div>
            <p className="font-mono text-[12px] text-[#6B7280] mt-1">
              {profile.followers} abonnés · {profile.following} abonnements · {profile.stats['posts'] ?? 0} publications
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:pb-1">
            {!showOwnerControls ? (
              <>
                <FollowButton
                  profileId={profile.id}
                  {...(onFollowCountDelta ? { onFollowCountDelta } : {})}
                />
                <button
                  type="button"
                  onClick={onContact}
                  className="h-10 px-5 rounded-xl border border-[#E5E7EB] font-display font-semibold text-sm text-[#0D0F2E] hover:bg-[#F3F4F6] transition-colors"
                >
                  Contacter
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((p) => !p)}
                    className="w-10 h-10 rounded-xl border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                    aria-label="Plus d'options"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <>
                      <button type="button" className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-label="Fermer" />
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#F3F4F6] shadow-lg py-1 z-50">
                        <button type="button" className="w-full px-4 py-2.5 text-left font-body text-sm text-[#6B7280] hover:bg-[#F3F4F6]">
                          Signaler
                        </button>
                        <button type="button" className="w-full px-4 py-2.5 text-left font-body text-sm text-[#DC2626] hover:bg-[#FEF2F2]">
                          Bloquer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/settings"
                  className="h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm hover:bg-[#1A1ECC] transition-colors inline-flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Modifier le profil
                </Link>
                {isAccountOwner && (
                  <button
                    type="button"
                    onClick={onToggleVisitorPreview}
                    className="h-10 px-4 rounded-xl border border-[#E5E7EB] font-body text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                  >
                    {visitorPreview ? 'Retour édition' : 'Voir comme visiteur'}
                  </button>
                )}
                <ShareButton displayName={profile.displayName} />
              </>
            )}
          </div>
        </div>

        {profile.coordinates && (
          <div className="mt-6 pb-6">
            <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB]">
              <ProfileMiniMap lngLat={profile.coordinates} />
            </div>
            <p className="font-mono text-[11px] text-[#6B7280] mt-2 inline-flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#E8E9FF] text-[#2A2FFF]">Environ 2 km de vous</span>
              <span className="text-[#9CA3AF]">(si géoloc active · mock)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareButton({ displayName }: { displayName: string }) {
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `${displayName} — Yunicity`,
        url: window.location.href,
      }).catch(() => { /* cancelled */ });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="h-10 px-4 rounded-xl border border-[#E5E7EB] font-body text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors inline-flex items-center gap-2"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Partager
    </button>
  );
}
