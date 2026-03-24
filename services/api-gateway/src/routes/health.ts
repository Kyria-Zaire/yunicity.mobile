import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      config: { rateLimit: { max: 300, timeWindow: '1 minute' } },
    },
    async (_req, reply) => {
      return reply.send({
        status: 'ok',
        service: 'api-gateway',
        version: process.env['npm_package_version'] ?? '0.1.0',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      });
    },
  );

  app.get('/health/ready', async (_req, reply) => {
    // Readiness check : vérifie que les dépendances critiques répondent
    // Pour S0 : toujours ready (les vraies vérifications arriveront en S1)
    return reply.send({ ready: true });
  });
}
