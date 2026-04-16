'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { API_URL } from '@/lib/config';

export type ProfileType = 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  profileType: ProfileType;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  city: string;
  quartier?: string;
  bio?: string;
  phone?: string;
  points: number;
  level: number;
  levelName: string;
  badges: string[];
  tribes: string[];
  joinedAt: string;
  stats: Record<string, number>;
  siret?: string;
  rna?: string;
  uai?: string;
  website?: string;
  address?: string;
  hours?: string;
  specialty?: string;
  avatarUrl?: string;
  notificationPrefs?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    tribes: boolean;
    marketing: boolean;
  };
  subscription?: {
    plan: 'FREE' | 'PREMIUM' | 'PACK_COMMERCIAL';
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd?: string;
  };
};

function safeUserId(session: unknown): string | null {
  const s = session as Record<string, Record<string, string>> | null;
  return s?.['user']?.['id'] ?? s?.['user']?.['userId'] ?? s?.['user']?.['_id'] ?? null;
}

/** Mappe la réponse `GET /users/me` (user-service) vers `CurrentUser` pour l’UI. */
function mapUserMeJsonToCurrentUser(raw: unknown): CurrentUser {
  const r = raw as Record<string, unknown>;
  const profileData = (r['profileData'] as Record<string, unknown> | undefined) ?? {};
  const email = String(r['email'] ?? '');
  const displayName =
    (typeof profileData['displayName'] === 'string' && profileData['displayName'].trim()) ||
    (typeof profileData['name'] === 'string' && profileData['name'].trim()) ||
    (email.includes('@') ? email.split('@')[0] : email) ||
    'Membre';

  const rawStatus = String(r['verificationStatus'] ?? 'pending');
  const verificationStatus: CurrentUser['verificationStatus'] =
    rawStatus === 'verified' || rawStatus === 'rejected' ? rawStatus : 'pending';

  const level = typeof r['level'] === 'number' && Number.isFinite(r['level']) ? r['level'] : 1;

  const out: CurrentUser = {
    id: String(r['id'] ?? ''),
    email,
    displayName,
    profileType: (r['profileType'] as CurrentUser['profileType']) ?? 'yunicitizen',
    verificationStatus,
    city: typeof r['city'] === 'string' ? r['city'] : '',
    points: typeof r['points'] === 'number' && Number.isFinite(r['points']) ? r['points'] : 0,
    level,
    levelName:
      (typeof profileData['levelName'] === 'string' && profileData['levelName']) ||
      `Niveau ${level}`,
    badges: Array.isArray(r['badges']) ? (r['badges'] as string[]) : [],
    tribes: Array.isArray(profileData['tribes']) ? (profileData['tribes'] as string[]) : [],
    joinedAt:
      typeof r['createdAt'] === 'string'
        ? new Date(r['createdAt']).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        : '',
    stats:
      typeof profileData['stats'] === 'object' && profileData['stats'] !== null
        ? (profileData['stats'] as Record<string, number>)
        : { posts: 0, tribes: 0, reactions: 0 },
  };

  if (typeof r['quartier'] === 'string') out.quartier = r['quartier'];
  if (typeof profileData['bio'] === 'string') out.bio = profileData['bio'];
  if (typeof r['phone'] === 'string') out.phone = r['phone'];
  if (typeof profileData['siret'] === 'string') out.siret = profileData['siret'];
  if (typeof profileData['rna'] === 'string') out.rna = profileData['rna'];
  if (typeof profileData['uai'] === 'string') out.uai = profileData['uai'];
  if (typeof profileData['website'] === 'string') out.website = profileData['website'];
  if (typeof profileData['address'] === 'string') out.address = profileData['address'];
  if (typeof profileData['hours'] === 'string') out.hours = profileData['hours'];
  if (typeof profileData['specialty'] === 'string') out.specialty = profileData['specialty'];
  if (typeof profileData['avatarUrl'] === 'string') out.avatarUrl = profileData['avatarUrl'];

  return out;
}

export function useCurrentUser() {
  const { data: session, isPending: sessionPending } = useSession() as unknown as {
    data: unknown;
    isPending: boolean;
  };
  const userId = safeUserId(session);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPending) {
      return;
    }

    if (!userId) {
      setUser(null);
      setFetchLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setFetchLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          credentials: 'include',
        });
        if (cancelled) return;

        if (res.ok) {
          const raw: unknown = await res.json();
          setUser(mapUserMeJsonToCurrentUser(raw));
        } else {
          setUser(null);
          if (res.status === 401) {
            setError('Session expirée');
          } else {
            setError('Impossible de charger le profil');
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setError('Impossible de charger le profil');
        }
      } finally {
        if (!cancelled) {
          setFetchLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, sessionPending]);

  const loading = sessionPending || (!!userId && fetchLoading);

  return { user, loading, error, userId };
}
