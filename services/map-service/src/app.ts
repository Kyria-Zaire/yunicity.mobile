import Fastify, { type FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { mapRoutes } from './routes/map.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isTest = process.env['NODE_ENV'] === 'test';

  const app = Fastify({
    logger: isTest ? false : { level: 'debug' },
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  });

  // Sécurité
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });
  await app.register(rateLimit, {
    max: isTest ? 10000 : 200,
    timeWindow: '1 minute',
  });

  // Routes
  await app.register(mapRoutes);

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    service: 'map-service',
    timestamp: new Date().toISOString(),
  }));

  // Error handler
  app.setErrorHandler(async (error: unknown, _req, reply) => {
    const err = error as Record<string, unknown>;
    const status =
      typeof err['statusCode'] === 'number' ? err['statusCode'] : 500;
    return reply.status(status as number).send({
      code: err['code'] ?? 'INTERNAL_ERROR',
      message: isTest ? String(err['message']) : 'Service error',
    });
  });

  return app;
}
