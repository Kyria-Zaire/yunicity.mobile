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
  // Champs spécifiques
  siret?: string;
  rna?: string;
  uai?: string;
  website?: string;
  address?: string;
  hours?: string;
  specialty?: string;
  avatarUrl?: string;
  // Préférences notifications
  notificationPrefs?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    tribes: boolean;
    marketing: boolean;
  };
  // Abonnement
  subscription?: {
    plan: 'FREE' | 'PREMIUM' | 'PACK_COMMERCIAL';
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd?: string;
  };
};

const MOCK_USER: CurrentUser = {
  id: 'me',
  email: 'lea.martin@email.com',
  displayName: 'Léa Martin',
  profileType: 'yunicitizen',
  verificationStatus: 'verified',
  city: 'Reims',
  quartier: 'Croix-Rouge',
  bio: 'Passionnée de culture locale et de vélo urbain. Membre active des Cyclistes de Reims.',
  phone: '+33612345678',
  points: 340,
  level: 3,
  levelName: 'Citoyen',
  badges: ['pionnier', 'premier_pas', 'connecteur'],
  tribes: ['Cyclistes de Reims', 'Jazz au Parvis'],
  joinedAt: 'mars 2026',
  stats: { posts: 12, tribes: 2, reactions: 47 },
  notificationPrefs: {
    email: true,
    push: true,
    sms: false,
    tribes: true,
    marketing: false,
  },
  subscription: {
    plan: 'FREE',
    status: 'active',
  },
};

function safeUserId(session: unknown): string | null {
  const s = session as Record<string, Record<string, string>> | null;
  return s?.['user']?.['id'] ?? s?.['user']?.['userId'] ?? s?.['user']?.['_id'] ?? null;
}

export function useCurrentUser() {
  const { data: session } = useSession() as unknown as {
    data: unknown;
    isPending: boolean;
  };
  const userId = safeUserId(session);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!userId) {
        // Pas de session — utiliser mock pour dev
        if (!cancelled) {
          setUser(MOCK_USER);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/users/${userId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = (await res.json()) as CurrentUser;
          if (!cancelled) setUser(data);
        } else {
          // Fallback mock en dev
          if (!cancelled) setUser(MOCK_USER);
        }
      } catch {
        if (!cancelled) {
          setUser(MOCK_USER);
          setError('Impossible de charger le profil');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, loading, error, userId };
}
