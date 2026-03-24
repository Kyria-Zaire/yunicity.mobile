import Fastify, { type FastifyInstance } from 'fastify';
import { cronJobs } from './scheduler.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isTest = process.env['NODE_ENV'] === 'test';

  const app = Fastify({
    logger: isTest ? false : { level: 'debug' },
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'worker',
    crons: cronJobs.map((j) => ({
      name: j.name,
      intervalMs: j.intervalMs,
      active: !!j.timer,
    })),
    timestamp: new Date().toISOString(),
  }));

  return app;
}
