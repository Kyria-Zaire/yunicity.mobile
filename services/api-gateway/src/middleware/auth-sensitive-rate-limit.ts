import type { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX = 10;

const bucket = new Map<string, { count: number; resetAt: number }>();

function isSensitiveAuthPath(url: string): boolean {
  const p = url.split('?')[0] ?? '';
  if (/\/users\/[^/]+\/verify-(email|phone)/i.test(p)) return true;
  if (/\/api\/users\/[^/]+\/verify-(email|phone)/i.test(p)) return true;
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

export async function registerAuthSensitiveRateLimit(
  app: FastifyInstance,
): Promise<void> {
  const isTest = process.env['NODE_ENV'] === 'test';
  let redis: Redis | undefined;

  if (!isTest) {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    await redis.connect();

    app.addHook('onClose', async () => {
      await redis?.quit().catch(() => {
        redis?.disconnect();
      });
    });
  }

  app.addHook('preHandler', async (req, reply) => {
    if (!isSensitiveAuthPath(req.url)) return;

    const ip = req.ip ?? '127.0.0.1';
    const now = Date.now();
    let count: number;
    let ttlMs: number;

    if (redis) {
      const key = `auth-sensitive:${ip}:${req.url.split('?')[0]?.toLowerCase() ?? ''}`;
      count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, WINDOW_MS);
        ttlMs = WINDOW_MS;
      } else {
        ttlMs = await redis.pttl(key);
        if (ttlMs <= 0) {
          await redis.pexpire(key, WINDOW_MS);
          ttlMs = WINDOW_MS;
        }
      }
    } else {
      let b = bucket.get(ip);
      if (!b || now > b.resetAt) {
        b = { count: 0, resetAt: now + WINDOW_MS };
        bucket.set(ip, b);
      }
      b.count += 1;
      count = b.count;
      ttlMs = b.resetAt - now;
    }

    if (count > MAX) {
      const retrySec = Math.ceil(ttlMs / 1000);
      return reply.status(429).send({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Trop de tentatives sur les endpoints d'authentification. Reessayez dans ${retrySec}s.`,
        retryAfter: retrySec,
      });
    }
  });
}
