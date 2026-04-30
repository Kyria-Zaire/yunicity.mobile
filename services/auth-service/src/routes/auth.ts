import type { FastifyInstance } from 'fastify';
import { auth } from '../auth/index.js';
import { fromNodeHeaders } from 'better-auth/node';
import { generateEmailOTP, generateSmsOTP, verifyEmailOTP, verifySmsOTP } from '../auth/otp.js';
import { isTrustedInternalService } from '../utils/internal-service.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  function firstHeader(
    headers: Record<string, unknown> | undefined,
    lowerName: string,
  ): string | undefined {
    const v = headers?.[lowerName];
    if (typeof v !== 'string' || !v.trim()) return undefined;
    return v.split(',')[0]?.trim();
  }

  async function handleBetterAuth(
    req: { url: string; method: string; headers: Record<string, unknown>; body?: unknown },
    reply: any,
    urlOverride?: string,
  ) {
    // Derrière api-gateway (fetch interne), Host vaut souvent auth-service:3001.
    // Better Auth compare l’origine de l’URL du Request à trustedOrigins / baseURL.
    const xfHost = firstHeader(req.headers as Record<string, unknown>, 'x-forwarded-host');
    const xfProto = firstHeader(req.headers as Record<string, unknown>, 'x-forwarded-proto');
    const rawHost =
      xfHost ??
      (req.headers?.['host'] as string | undefined) ??
      (req.headers?.['Host'] as string | undefined) ??
      'localhost';
    const scheme = xfProto === 'https' ? 'https' : 'http';
    const url = new URL(urlOverride ?? req.url, `${scheme}://${rawHost}`);
    const headers = new Headers(fromNodeHeaders(req.headers as any));
    // Aligner Origin sur l’URL du Request (sinon Referer exp://… ou un Host interne peut faire échouer validateOrigin).
    headers.set('origin', url.origin);
    const ref = headers.get('referer');
    if (ref) {
      try {
        if (new URL(ref).origin !== url.origin) headers.delete('referer');
      } catch {
        headers.delete('referer');
      }
    }

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const requestInit: RequestInit = {
      method: req.method,
      headers,
      ...(hasBody && req.body ? { body: JSON.stringify(req.body) } : {}),
    };

    const response = await auth.handler(new Request(url.toString(), requestInit));
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    const text = response.body ? await response.text() : null;
    reply.send(text);
  }

  // Better Auth catch-all (canonical): /api/auth/*
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    handler: async (req, reply) => handleBetterAuth(req, reply),
  });

  // Compat: anciens clients qui appellent /auth/* → rewrite vers /api/auth/*
  app.route({
    method: ['GET', 'POST'],
    url: '/auth/*',
    handler: async (req, reply) => {
      const rewritten = req.url.replace(/^\/auth\//, '/api/auth/');
      return handleBetterAuth(req, reply, rewritten);
    },
  });

  // Route utilitaire — vérifier la session depuis d'autres services
  app.get('/auth/session/verify', async (req, reply) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: 'Session invalide ou expirée',
      });
    }

    return reply.send({
      user: session.user,
      session: session.session,
    });
  });

  // POST /internal/verify-otp — endpoint interne pour user-service
  app.post('/internal/verify-otp', async (req, reply) => {
    if (!isTrustedInternalService(req.headers['x-internal-service'])) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const { userId, code, type } = req.body as {
      userId: string;
      code: string;
      type: 'email' | 'sms';
    };

    const valid =
      type === 'email'
        ? await verifyEmailOTP(userId, code)
        : await verifySmsOTP(userId, code);

    if (!valid) {
      return reply
        .status(400)
        .send({ code: 'INVALID_OTP', valid: false });
    }

    return reply.send({ valid: true });
  });

  app.post('/internal/generate-otp', async (req, reply) => {
    const { userId, type } = req.body as {
      userId?: string;
      type?: 'email' | 'sms';
    };

    // Vérifier header interne
    const internalService = req.headers['x-internal-service'];
    if (!internalService) {
      return reply.status(403).send({ message: 'Accès refusé' });
    }

    if (!userId || !type) {
      return reply.status(400).send({ message: 'userId et type requis' });
    }

    const code =
      type === 'email'
        ? await generateEmailOTP(userId)
        : await generateSmsOTP(userId);

    return reply.send({ code, userId, type });
  });
}
