import Fastify, { type FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { paymentRoutes } from './routes/payments.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isTest = process.env['NODE_ENV'] === 'test';

  const app = Fastify({
    logger: isTest ? false : { level: 'debug' },
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });
  await app.register(rateLimit, {
    max: isTest ? 10000 : 200,
    timeWindow: '1 minute',
  });

  // Compat interne : routes sans prefix.
  await app.register(paymentRoutes);

  // Alignement avec l'API Gateway (proxy sans strip prefix)
  await app.register(paymentRoutes, { prefix: '/payment' });
  await app.register(paymentRoutes, { prefix: '/api/payment' });

  app.get('/health', async () => ({
    status: 'ok',
    service: env.SERVICE_NAME,
    timestamp: new Date().toISOString(),
  }));

  return app;
}

