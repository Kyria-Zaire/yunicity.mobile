import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

/** Résout l’utilisateur via la session Better Auth pour propager X-User-ID (A01). */
async function resolveUserIdFromSession(
  req: FastifyRequest,
): Promise<string | undefined> {
  const cookie = req.headers.cookie;
  if (!cookie || !cookie.includes('yunicity')) return undefined;

  try {
    const res = await fetch(
      `${env.AUTH_SERVICE_URL}/auth/session/verify`,
      {
        method: 'GET',
        headers: { cookie },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) return undefined;
    const json = (await res.json()) as { user?: { id: string } };
    return json.user?.id;
  } catch {
    return undefined;
  }
}

// Map des services internes
const SERVICE_MAP: Record<string, string> = {
  '/auth': env.AUTH_SERVICE_URL,
  '/users': env.USER_SERVICE_URL,
  '/community': env.COMMUNITY_SERVICE_URL,
  '/map': env.MAP_SERVICE_URL,
  '/payment': env.PAYMENT_SERVICE_URL,
  '/notifications': env.NOTIFICATION_SERVICE_URL,
  '/moderation': env.MODERATION_SERVICE_URL,
  '/crm': env.CRM_SERVICE_URL,
  '/ai': env.AI_SERVICE_URL,

  // Prefix utilisé par better-auth côté front (ex: /api/auth/...)
  '/api/auth': env.AUTH_SERVICE_URL,
  '/api/users': env.USER_SERVICE_URL,
  '/api/community': env.COMMUNITY_SERVICE_URL,
  '/api/map': env.MAP_SERVICE_URL,
  '/api/payment': env.PAYMENT_SERVICE_URL,
  '/api/notifications': env.NOTIFICATION_SERVICE_URL,
  '/api/moderation': env.MODERATION_SERVICE_URL,
  '/api/crm': env.CRM_SERVICE_URL,
  '/api/ai': env.AI_SERVICE_URL,
};

/**
 * Forward une requête vers un service interne.
 * Implémentation complète du reverse proxy arrivera en S1.
 * Pour S0 : proxy minimal avec fetch.
 */
async function proxyRequest(
  serviceUrl: string,
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const targetPath = req.url;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': req.id as string,
      'X-Forwarded-For': req.ip,
    };

    // Forward cookies pour l'authentification Better Auth (session httpOnly)
    if (req.headers.cookie) {
      headers['cookie'] = req.headers.cookie;
    }

    const pathOnly = targetPath.split('?')[0] ?? targetPath;
    const isUserServicePath =
      /^\/users(\/|$)/i.test(pathOnly) ||
      /^\/api\/users(\/|$)/i.test(pathOnly);

    let userId = req.user?.id;
    if (!userId && isUserServicePath) {
      userId = await resolveUserIdFromSession(req);
    }
    if (userId) {
      headers['X-User-ID'] = userId;
    }

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const response = await fetch(`${serviceUrl}${targetPath}`, {
      method: req.method,
      headers,
      ...(hasBody ? { body: JSON.stringify(req.body) } : {}),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await response.json()) as unknown;
    await reply.status(response.status).send(data);
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      await reply.status(504).send({ code: 'GATEWAY_TIMEOUT', message: 'Service timeout' });
      return;
    }
    // Service down ou non démarré (normal en S0)
    await reply.status(503).send({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service temporarily unavailable',
    });
  }
}

export async function proxyRoutes(app: FastifyInstance): Promise<void> {
  for (const [prefix, serviceUrl] of Object.entries(SERVICE_MAP)) {
    app.all(prefix, async (req, reply) => proxyRequest(serviceUrl, req, reply));
    app.all(`${prefix}/*`, async (req, reply) => proxyRequest(serviceUrl, req, reply));
  }
}
