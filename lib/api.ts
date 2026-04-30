import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000';

function withTimeout(signal: AbortSignal | undefined | null, ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Request timed out'));
  }, ms);

  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  return { signal: controller.signal, cleanup: () => clearTimeout(timeoutId) };
}

/** ID utilisateur issu du cache `yunicity_user` — requis par la gateway (mode dev) pour propager `X-User-ID` vers `/users/*`. */
async function getStoredUserId(): Promise<string | undefined> {
  try {
    const userJson = await AsyncStorage.getItem('yunicity_user');
    if (!userJson) return undefined;
    const u = JSON.parse(userJson) as { id?: string };
    return typeof u.id === 'string' && u.id.length > 0 ? u.id : undefined;
  } catch {
    return undefined;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status?: number; code?: string }> {
  try {
    const token = await AsyncStorage.getItem('yunicity_session');
    const userId = await getStoredUserId();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'X-User-ID': userId } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    };

    const timeout = withTimeout(options.signal, 8000);
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      signal: timeout.signal,
    }).finally(timeout.cleanup);

    if (!res.ok) {
      const err = (await res
        .json()
        .catch(() => ({ message: 'Erreur reseau' }))) as {
        code?: string;
        message?: string;
      };
      return {
        data: null,
        error: err.message ?? `Erreur ${res.status}`,
        status: res.status,
        code: err.code,
      };
    }

    const data = (await res.json()) as T;
    return { data, error: null, status: res.status };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { data: null, error: msg, status: 0, code: 'NETWORK' };
  }
}

// ── Auth ────────────────────────────────────────────────

/**
 * Corps renvoyé par POST `/auth/sign-in/email` (Better Auth exposé par la gateway).
 * - `token` : JWT à envoyer en `Authorization: Bearer` (stocké `yunicity_session`).
 * - `user` : session Better Auth, en pratique souvent `{ id, email, name?, image?, … }`.
 *   Le champ `profileType` n’est **pas** garanti dans cette réponse ; il est porté par le
 *   profil métier User Service — le récupérer via {@link getMyProfile} après connexion.
 */
export type LoginApiResponse = {
  token: string;
  user: {
    id: string;
    email?: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
    /** Présent seulement si la gateway / plugin l’injecte ; sinon absent. */
    profileType?: string;
  };
};

export async function loginApi(email: string, password: string) {
  return apiFetch<LoginApiResponse>('/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

type SignUpEmailResponse = {
  token?: string | null;
  user?: { id?: string; email?: string; name?: string };
};

function pickSignUpUser(body: SignUpEmailResponse | null): {
  id: string;
  email?: string;
} | null {
  if (!body?.user?.id) return null;
  return { id: body.user.id, email: body.user.email };
}

export type RegisterApiResult = {
  data: { id: string; email: string } | null;
  error: string | null;
  status?: number;
  code?: string;
};

export async function registerApi(params: {
  email: string;
  password: string;
  name: string;
  profileType: string;
}): Promise<RegisterApiResult> {
  const authRes = await apiFetch<SignUpEmailResponse>('/auth/sign-up/email', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      name: params.name,
    }),
  });

  if (authRes.error || !authRes.data) {
    return {
      data: null,
      error: authRes.error,
      status: authRes.status,
      code: authRes.code,
    };
  }

  const signedUp = pickSignUpUser(authRes.data);
  if (!signedUp) {
    return {
      data: null,
      error: 'Réponse inscription invalide',
      status: authRes.status ?? 500,
      code: 'SIGNUP_INVALID',
    };
  }

  const userId = signedUp.id;

  const profileRes = await apiFetch<{ id?: string }>(`/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'X-User-ID': userId,
    },
    body: JSON.stringify({
      profileType: params.profileType,
      profileData: { displayName: params.name },
      consent: { rgpd: true, marketing: false, analytics: false },
    }),
  });

  if (profileRes.error) {
    return {
      data: null,
      error: profileRes.error,
      status: profileRes.status,
      code: profileRes.code,
    };
  }

  return {
    data: { id: userId, email: params.email },
    error: null,
    status: 201,
  };
}

export async function logoutApi() {
  await AsyncStorage.removeItem('yunicity_session');
  await AsyncStorage.removeItem('yunicity_user');
}

export async function verifyOtpApi(userId: string, code: string) {
  return apiFetch<{ success: boolean }>(`/users/${userId}/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function resendOtpApi(userId: string, email: string) {
  return apiFetch<{ success: boolean; message: string; remaining: number }>(
    `/users/${userId}/resend-otp`,
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );
}

export async function patchUserOnboardingApi(userId: string, payload: { quartier: string; interests: string[] }) {
  // Onboarding juste après signup: pas encore de session → on passe X-User-ID (dev) pour autoriser PATCH /users/:id
  return apiFetch<{ ok: boolean }>(`/users/${userId}`, {
    method: 'PATCH',
    headers: { 'X-User-ID': userId },
    body: JSON.stringify(payload),
  });
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
    nextLevel: {
      level: number;
      name: string;
      pointsNeeded: number;
    } | null;
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
  return apiFetch<{ membersCount: number }>(
    `/community/tribes/${tribeId}/join`,
    { method: 'POST' },
  );
}

export async function getTribePostsApi(tribeId: string, cursor?: string) {
  const params = new URLSearchParams({
    city: 'reims',
    tribeId,
    limit: '20',
  });
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
    tribes: Array<{
      id: string;
      name: string;
      category: string;
      membersCount: number;
    }>;
  }>(`/map/map/data?${q.toString()}`);
}

// ── Recommandations IA ──────────────────────────────────

export async function getRecommendationsApi(userId: string) {
  return apiFetch<{
    actors: Array<{
      id: string;
      name: string;
      reason: string;
      score: number;
    }>;
    tribes: Array<{
      id: string;
      name: string;
      reason: string;
      score: number;
    }>;
    reason: string;
    source: string;
  }>(`/ai/ai/recommendations?userId=${userId}&city=reims`);
}
