import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

/** Résout l’utilisateur via la session Better Auth pour propager X-User-ID (A01).
 *  Accepte :
 *   - cookie httpOnly Better Auth (web) — préfixe `yunicity`
 *   - header `Authorization: Bearer <token>` (mobile RN — pas de cookie jar fiable)
 */
async function resolveUserIdFromSession(
  req: FastifyRequest,
): Promise<string | undefined> {
  const cookie = req.headers.cookie;
  const authHeader = req.headers.authorization;
  const hasYunicityCookie =
    typeof cookie === 'string' && cookie.includes('yunicity');
  const hasBearer =
    typeof authHeader === 'string' &&
    authHeader.toLowerCase().startsWith('bearer ');

  if (!hasYunicityCookie && !hasBearer) return undefined;

  const fwHeaders: Record<string, string> = {};
  if (hasYunicityCookie) fwHeaders['cookie'] = cookie!;
  if (hasBearer) fwHeaders['authorization'] = authHeader!;

  try {
    const res = await fetch(
      `${env.AUTH_SERVICE_URL}/auth/session/verify`,
      {
        method: 'GET',
        headers: fwHeaders,
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

function shouldResolveUserId(pathOnly: string): boolean {
  return (
    /^\/users(\/|$)/i.test(pathOnly) ||
    /^\/api\/users(\/|$)/i.test(pathOnly) ||
    /^\/community(\/|$)/i.test(pathOnly) ||
    /^\/api\/community(\/|$)/i.test(pathOnly) ||
    /^\/payment(\/|$)/i.test(pathOnly) ||
    /^\/api\/payment(\/|$)/i.test(pathOnly)
  );
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

    const authz = req.headers.authorization;
    if (typeof authz === 'string' && authz.trim()) {
      headers['Authorization'] = authz.trim();
    }

    const pathOnly = targetPath.split('?')[0] ?? targetPath;

    // Better Auth valide Origin contre trustedOrigins. Expo envoie souvent
    // `exp://192.168.x.x:8081`, qui n’est pas dans la liste — d’où "invalid origin".
    // En dev : on normalise toujours vers l’URL publique du gateway (Host + schéma).
    const isAuthRoute =
      /^\/auth(\/|$)/i.test(pathOnly) || /^\/api\/auth(\/|$)/i.test(pathOnly);
    if (isAuthRoute) {
      const host = req.headers.host;
      const xfProto = req.headers['x-forwarded-proto'];
      const firstProto =
        typeof xfProto === 'string' ? xfProto.split(',')[0]?.trim() : undefined;
      const scheme = firstProto === 'https' ? 'https' : 'http';
      const derivedOrigin =
        typeof host === 'string' && host.trim()
          ? `${scheme}://${host.trim()}`
          : 'http://localhost:3000';

      // auth-service reconstruit l’URL du Request Better Auth : sans çi, Host = auth-service:3001
      // → origine interne ≠ trustedOrigins / baseURL → "invalid origin".
      if (typeof host === 'string' && host.trim()) {
        headers['x-forwarded-host'] = host.trim();
        headers['x-forwarded-proto'] = scheme;
      }

      const isDev = process.env['NODE_ENV'] !== 'production';
      if (isDev) {
        headers['origin'] = derivedOrigin;
      } else {
        const originHeader = req.headers.origin;
        if (typeof originHeader === 'string' && originHeader.trim()) {
          headers['origin'] = originHeader;
        } else {
          headers['origin'] = derivedOrigin;
        }
      }
    }

    // Mobile / Expo : Bearer + X-User-ID (pas de cookie session httpOnly).
    // En `development`, propager X-User-ID sans exiger ALLOW_DEV_AUTH pour le dev local.
    // En prod : uniquement si ALLOW_DEV_AUTH=true (équiv. feature flag — à remplacer par vérif JWT).
    const clientUserId = req.headers['x-user-id'];
    const allowForwardClientUserId =
      typeof clientUserId === 'string' &&
      clientUserId.trim() &&
      (env.ALLOW_DEV_AUTH === true || process.env['NODE_ENV'] === 'development');
    if (allowForwardClientUserId) {
      headers['X-User-ID'] = clientUserId.trim();
    }

    let userId = req.user?.id;
    if (!userId && shouldResolveUserId(pathOnly)) {
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

    // Forward Set-Cookie (Better Auth session cookies) to the client.
    // Node's fetch supports getSetCookie() (array) on Headers.
    const getSetCookie = (response.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie;
    const setCookies = typeof getSetCookie === 'function' ? getSetCookie.call(response.headers) : [];
    if (setCookies.length > 0) {
      reply.header('set-cookie', setCookies);
    } else {
      const single = response.headers.get('set-cookie');
      if (single) reply.header('set-cookie', single);
    }

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
