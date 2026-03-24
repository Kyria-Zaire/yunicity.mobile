import type { FastifyInstance } from 'fastify';

/** Fenêtre 15 min, max 10 requêtes / IP (A04) — endpoints auth sensibles uniquement. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX = 10;

const bucket = new Map<string, { count: number; resetAt: number }>();

function isSensitiveAuthPath(url: string): boolean {
  const p = url.split('?')[0] ?? '';
  if (/\/users\/[a-f\d]{24}\/verify-(email|phone)/i.test(p)) return true;
  if (/\/api\/users\/[a-f\d]{24}\/verify-(email|phone)/i.test(p)) return true;
  const lower = p.toLowerCase();
  if (
    (lower.startsWith('/auth') || lower.startsWith('/api/auth')) &&
    /sign-in|sign-up|signin|signup|callback\/credential|reset-password|forgot/i.test(
      lower,
    )
  ) {
    return true;
  }
  return false;
}

export function registerAuthSensitiveRateLimit(app: FastifyInstance): void {
  app.addHook('preHandler', async (req, reply) => {
    if (!isSensitiveAuthPath(req.url)) return;

    const ip = req.ip ?? '127.0.0.1';
    const now = Date.now();
    let b = bucket.get(ip);
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + WINDOW_MS };
      bucket.set(ip, b);
    }
    b.count += 1;
    if (b.count > MAX) {
      const retrySec = Math.ceil((b.resetAt - now) / 1000);
      return reply.status(429).send({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Trop de tentatives sur les endpoints d'authentification. Réessayez dans ${retrySec}s.`,
        retryAfter: retrySec,
      });
    }
  });
}
