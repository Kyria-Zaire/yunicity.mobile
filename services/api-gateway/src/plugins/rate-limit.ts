import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  const isProd = process.env['NODE_ENV'] === 'production';

  await app.register(rateLimit, {
    max: isProd ? 100 : 1000,
    timeWindow: '1 minute',
    // Jamais de Redis en dev/test — store mémoire uniquement
    // Redis sera branché en production via une config séparée
    keyGenerator: (req) => req.ip ?? '127.0.0.1',
    errorResponseBuilder: (_req, context) => ({
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Trop de requêtes. Réessayez dans ${Math.ceil(context.ttl / 1000)} secondes.`,
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
    // Désactiver les headers X-RateLimit-* en test (évite des hooks supplémentaires)
    addHeaders: {
      'x-ratelimit-limit': !process.env['NODE_ENV']?.includes('test'),
      'x-ratelimit-remaining': !process.env['NODE_ENV']?.includes('test'),
      'x-ratelimit-reset': !process.env['NODE_ENV']?.includes('test'),
      'retry-after': !process.env['NODE_ENV']?.includes('test'),
    },
  });
});
