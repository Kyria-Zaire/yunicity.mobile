import type { FastifyInstance } from 'fastify';

/**
 * Journalise les réponses 401/403 pour la traçabilité sécurité (A09).
 */
export function registerSecurityAuditHook(app: FastifyInstance): void {
  app.addHook('onResponse', async (req, reply) => {
    const code = reply.statusCode;
    if (code !== 401 && code !== 403) return;

    req.log.warn(
      {
        requestId: req.id,
        method: req.method,
        url: req.url,
        status: code,
        ip: req.ip,
        userId: req.user?.id,
      },
      'Security event',
    );
  });
}
