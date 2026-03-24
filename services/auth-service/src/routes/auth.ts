import type { FastifyInstance } from 'fastify';
import { auth } from '../auth/index.js';
import { toNodeHandler } from 'better-auth/node';
import { verifyEmailOTP, verifySmsOTP } from '../auth/otp.js';
import { isTrustedInternalService } from '../utils/internal-service.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Better Auth gère ses propres routes via un handler Node.js natif
  // On le monte sur /auth/* dans Fastify
  const handler = toNodeHandler(auth);

  app.all('/auth/*', async (req, reply) => {
    // Adapter la requête Fastify vers Node IncomingMessage
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
