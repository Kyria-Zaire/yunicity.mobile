import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { Redis } from 'ioredis';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export default fp(async (app: FastifyInstance) => {
  const isTest = process.env['NODE_ENV'] === 'test';
  const isProd = process.env['NODE_ENV'] === 'production';

  // Redis store pour le rate limiting distribue (multi-instance)
  let redis: Redis | undefined;
  if (!isTest) {
    try {
      redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
      await redis.connect();
    } catch (err) {
      app.log.warn({ err }, 'Redis unavailable for rate limiting — falling back to in-memory');
      redis = undefined;
    }
  }

  await app.register(rateLimit, {
    max: isProd ? 100 : 1000,
    timeWindow: '1 minute',
    redis,
    skipOnError: true, // Si Redis tombe, ne pas bloquer les requetes
    keyGenerator: (req) => {
      const userId = req.headers['x-user-id'] as string | undefined;
      return userId ? `user:${userId}` : `ip:${req.ip ?? '127.0.0.1'}`;
    },
    errorResponseBuilder: (_req, context) => ({
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Trop de requêtes. Réessayez dans ${Math.ceil(context.ttl / 1000)} secondes.`,
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
    addHeaders: {
      'x-ratelimit-limit': !isTest,
      'x-ratelimit-remaining': !isTest,
      'x-ratelimit-reset': !isTest,
      'retry-after': !isTest,
    },
  });
});
