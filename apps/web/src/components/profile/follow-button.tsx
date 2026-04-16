'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/config';

export function FollowButton({
  profileId,
  initialFollowing = false,
  onFollowCountDelta,
}: {
  profileId: string;
  initialFollowing?: boolean;
  /** +1 quand abonnement, -1 quand désabonnement (rollback inclus). */
  onFollowCountDelta?: (delta: number) => void;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [hover, setHover] = useState(false);

  async function handleFollow() {
    const newState = !isFollowing;
    setIsFollowing(newState);
    onFollowCountDelta?.(newState ? 1 : -1);

    try {
      await fetch(`${API_URL}/users/${profileId}/follow`, {
        method: newState ? 'POST' : 'DELETE',
        credentials: 'include',
      });
    } catch {
      setIsFollowing(!newState);
      onFollowCountDelta?.(newState ? -1 : 1);
    }
  }

  const label = isFollowing
    ? hover ? 'Se désabonner' : 'Abonné ✓'
    : 'Suivre';

  return (
    <button
      type="button"
      onClick={handleFollow}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`h-10 px-5 rounded-xl font-display font-semibold text-sm transition-all ${
        isFollowing
          ? hover
            ? 'bg-white border-2 border-[#DC2626] text-[#DC2626]'
            : 'bg-white border-2 border-[#2A2FFF] text-[#2A2FFF]'
          : 'bg-[#2A2FFF] text-white shadow-[0_4px_16px_rgba(42,47,255,0.3)] hover:bg-[#1A1ECC]'
      }`}
    >
      {label}
    </button>
  );
}
