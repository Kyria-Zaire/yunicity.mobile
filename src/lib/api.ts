import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000';

function withTimeout(signal: AbortSignal | undefined | null, ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    // React Native / Hermes n'implémente pas AbortSignal.timeout()
    // donc on s'appuie sur AbortController + timer.
    controller.abort(new Error('Request timed out'));
  }, ms);

  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

// Helper fetch avec gestion d'erreur et token auth
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const token = await AsyncStorage.getItem('yunicity_session');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    };

    const timeout = withTimeout(options.signal, 8000);
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      signal: timeout.signal,
    }).finally(timeout.cleanup);

    if (!res.ok) {
      const err = (await res.json().catch(() => ({ message: 'Erreur réseau' }))) as {
        message?: string;
      };
      return { data: null, error: err.message ?? `Erreur ${res.status}` };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { data: null, error: msg };
  }
}

// ── Auth ────────────────────────────────────────────────

export async function loginApi(email: string, password: string) {
  return apiFetch<{ token: string; user: { id: string; email: string; profileType: string } }>(
    '/auth/sign-in/email',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
}

export async function registerApi(params: {
  email: string;
  password: string;
  name: string;
  profileType: string;
}) {
  return apiFetch<{ id: string; email: string }>('/users', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      profileType: params.profileType,
      profileData: { displayName: params.name },
      consent: { rgpd: true, marketing: false, analytics: false },
    }),
  });
}

export async function logoutApi() {
  await AsyncStorage.removeItem('yunicity_session');
  await AsyncStorage.removeItem('yunicity_user');
}

// ── Profil / Passeport ──────────────────────────────────

export async function getMyProfile() {
  return apiFetch<{
    _id: string;
    email: string;
    profileType: string;
    verificationStatus: { status: string };
    yunicity: { points: number; level: number; badges: string[] };
  }>('/users/me');
}

export async function getPassportApi(userId: string) {
  return apiFetch<{
    userId: string;
    points: number;
    level: number;
    levelName: string;
    nextLevel: { level: number; name: string; pointsNeeded: number } | null;
    badges: string[];
    progress: number;
  }>(`/users/gamification/passport/${userId}`);
}

// ── Tribus ──────────────────────────────────────────────

export async function getTribesApi(city = 'reims', category?: string) {
  const params = new URLSearchParams({ city, limit: '20' });
  if (category) params.set('category', category);
  return apiFetch<{
    items: Array<{
      _id: string;
      name: string;
      description: string;
      category: string;
      membersCount: number;
      isVerified: boolean;
    }>;
    nextCursor: string | null;
  }>(`/community/tribes?${params.toString()}`);
}

export async function joinTribeApi(tribeId: string) {
  return apiFetch<{ membersCount: number }>(`/community/tribes/${tribeId}/join`, {
    method: 'POST',
  });
}

export async function getTribePostsApi(tribeId: string, cursor?: string) {
  const params = new URLSearchParams({ city: 'reims', tribeId, limit: '20' });
  if (cursor) params.set('cursor', cursor);
  return apiFetch<{
    items: Array<{
      _id: string;
      content: string;
      type: string;
      authorId: string;
      reactionCounts: Record<string, number>;
      createdAt: string;
    }>;
    nextCursor: string | null;
  }>(`/community/posts?${params.toString()}`);
}

// ── Carte / Map ─────────────────────────────────────────

export async function getMapDataApi(params: {
  lat: number;
  lng: number;
  radius: number;
  city: string;
}) {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radius: String(params.radius),
    city: params.city,
  });
  return apiFetch<{
    actors: Array<{
      id: string;
      profileType: string;
      displayName: string;
      coordinates: [number, number];
      city: string;
    }>;
    tribes: Array<{ id: string; name: string; category: string; membersCount: number }>;
  }>(`/map/map/data?${q.toString()}`);
}

// ── Recommandations IA ──────────────────────────────────

export async function getRecommendationsApi(userId: string) {
  return apiFetch<{
    actors: Array<{ id: string; name: string; reason: string; score: number }>;
    tribes: Array<{ id: string; name: string; reason: string; score: number }>;
    reason: string;
    source: string;
  }>(`/ai/ai/recommendations?userId=${userId}&city=reims`);
}
