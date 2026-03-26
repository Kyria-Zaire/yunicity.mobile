import Fastify, { type FastifyInstance } from 'fastify';
import { env } from './config/env.js';
import helmetPlugin from './plugins/helmet.js';
import corsPlugin from './plugins/cors.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import requestIdMiddleware from './middleware/request-id.js';
import { registerSecurityAuditHook } from './middleware/audit-log.js';
import { registerAuthSensitiveRateLimit } from './middleware/auth-sensitive-rate-limit.js';
import { registerCsrfProtection } from './middleware/csrf.js';
import { healthRoutes } from './routes/health.js';
import { proxyRoutes } from './routes/proxy.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isTest = process.env['NODE_ENV'] === 'test';

  const app = Fastify({
    // En test : logger désactivé pour éviter le bruit dans les sorties Vitest
    logger: isTest
      ? false
      : {
          level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
          redact: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.token',
          ],
        },
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  });

  // Plugins de sécurité
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);

  // Middleware
  await app.register(requestIdMiddleware);
  registerCsrfProtection(app);
  registerAuthSensitiveRateLimit(app);
  registerSecurityAuditHook(app);

  // Routes
  await app.register(healthRoutes);
  await app.register(proxyRoutes);

  // Error handler global
  app.setErrorHandler(async (error: unknown, req, reply) => {
    if (reply.statusCode === 429) {
      return reply.send(error);
    }

    const err = error as Record<string, unknown>;

    if (err['validation']) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: err['validation'],
      });
    }

    if (typeof err['statusCode'] === 'number' && err['code']) {
      return reply.status(err['statusCode'] as number).send({
        code: err['code'],
        message: err['message'],
      });
    }

    if (!isTest) {
      req.log.error({ err: error }, 'Unhandled error');
    }

    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : String(err['message'] ?? 'Unknown error'),
    });
  });

  app.setNotFoundHandler(async (_req, reply) => {
    return reply.status(404).send({
      code: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  return app;
}
