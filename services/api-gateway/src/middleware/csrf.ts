import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isBetterAuthProxyPath(url: string): boolean {
  const path = (url.split('?')[0] ?? url).toLowerCase();
  return (
    path.startsWith('/auth/') ||
    path === '/auth' ||
    path.startsWith('/api/auth/') ||
    path === '/api/auth'
  );
}

/**
 * Protection CSRF par vérification de l'Origin header.
 * Les requêtes mutation avec cookies doivent provenir d'une origine autorisée.
 * Sans Origin (ex: requêtes serveur-à-serveur sans cookie), on laisse passer.
 */
export function registerCsrfProtection(app: FastifyInstance): void {
  const trustedOrigins = new Set(
    env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  );

  app.addHook('onRequest', async (req, reply) => {
    if (!MUTATION_METHODS.has(req.method)) return;

    // Better Auth (proxy /auth/*, /api/auth/*) : validation d'origine côté auth-service.
    // Expo / RN envoie souvent une Origin non listée ici → faux positif CSRF_REJECTED.
    if (isBetterAuthProxyPath(req.url)) return;

    // Pas de cookie = pas de CSRF (requête sans session, ex: API key)
    if (!req.headers.cookie?.includes('yunicity')) return;

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Les requêtes same-origin sans Origin header (ex: form submit dans certains navigateurs)
    // sont protégées par SameSite=Strict sur les cookies
    if (!origin && !referer) return;

    const requestOrigin = origin ?? new URL(referer as string).origin;

    if (!trustedOrigins.has(requestOrigin)) {
      req.log.warn(
        { origin: requestOrigin, path: req.url },
        'CSRF: origin non autorisée',
      );
      await reply.status(403).send({
        code: 'CSRF_REJECTED',
        message: 'Requête cross-origin non autorisée',
      });
    }
  });
}
