import type { FastifyInstance } from 'fastify';
import { prisma } from '@yunicity/database';
import { auth } from '../auth/index.js';
import { toNodeHandler } from 'better-auth/node';
import { verifyEmailOTP, verifySmsOTP } from '../auth/otp.js';
import { isTrustedInternalService } from '../utils/internal-service.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const handler = toNodeHandler(auth);

  // Lockout check BEFORE Better Auth processes sign-in
  app.addHook('onRequest', async (req, reply) => {
    if (req.method !== 'POST' || !req.url.includes('/auth/sign-in/email')) return;

    const body = req.body as { email?: string } | undefined;
    if (!body?.email) return;

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
      select: { lockedUntil: true },
    });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60_000,
      );
      await reply.status(429).send({
        code: 'ACCOUNT_LOCKED',
        message: `Compte verrouillé. Réessayez dans ${minutesLeft} minute(s).`,
      });
    }
  });

  // Track failed sign-in attempts AFTER Better Auth responds
  app.addHook('onResponse', async (req, reply) => {
    if (req.method !== 'POST' || !req.url.includes('/auth/sign-in/email')) return;
    if (reply.statusCode < 400) return; // Success — lockout reset via databaseHooks

    const body = req.body as { email?: string } | undefined;
    if (!body?.email) return;

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
      select: { id: true, loginAttempts: true },
    });
    if (!user) return;

    const newAttempts = user.loginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: newAttempts,
        ...(newAttempts >= MAX_LOGIN_ATTEMPTS
          ? { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) }
          : {}),
      },
    });
  });

  // Better Auth catch-all
  app.all('/auth/*', async (req, reply) => {
    reply.hijack();
    handler(req.raw, reply.raw);
  });

  // Route utilitaire — vérifier la session depuis d'autres services
  app.get('/auth/session/verify', async (req, reply) => {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
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
}
