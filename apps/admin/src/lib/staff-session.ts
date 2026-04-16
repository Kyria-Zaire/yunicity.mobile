import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Base URL du gateway (même origine Better Auth / cookies de session). */
export function authBaseUrl(): string {
  return (
    process.env['AUTH_BASE_URL']?.trim() ||
    process.env['NEXT_PUBLIC_API_URL']?.trim() ||
    'http://localhost:3000'
  );
}

type GetSessionJson = {
  user?: { email?: string; id?: string } | null;
  session?: unknown;
} | null;

/**
 * Vérifie la session Better Auth (cookie) puis que l’email est dans STAFF_EMAILS.
 * STAFF_EMAILS : liste séparée par des virgules (server-only, jamais NEXT_PUBLIC_).
 */
export async function requireStaffSession(
  request: NextRequest,
): Promise<NextResponse | null> {
  const cookie = request.headers.get('cookie') ?? '';
  if (!cookie.includes('yunicity')) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Session requise' },
      { status: 401 },
    );
  }

  const base = authBaseUrl().replace(/\/$/, '');
  let res: Response;
  try {
    res = await fetch(`${base}/api/auth/get-session`, {
      method: 'GET',
      headers: { cookie },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json(
      { code: 'AUTH_UNAVAILABLE', message: 'Impossible de valider la session' },
      { status: 503 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Session invalide ou expirée' },
      { status: 401 },
    );
  }

  let data: GetSessionJson;
  try {
    data = (await res.json()) as GetSessionJson;
  } catch {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Session invalide' },
      { status: 401 },
    );
  }

  const email = data?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Session invalide' },
      { status: 401 },
    );
  }

  const staffList = (process.env['STAFF_EMAILS'] ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (staffList.length === 0) {
    return NextResponse.json(
      {
        code: 'CONFIG_ERROR',
        message:
          'STAFF_EMAILS non configuré : définir les emails autorisés pour le panel admin (variable serveur).',
      },
      { status: 503 },
    );
  }

  if (!staffList.includes(email)) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Accès réservé au personnel autorisé' },
      { status: 403 },
    );
  }

  return null;
}
