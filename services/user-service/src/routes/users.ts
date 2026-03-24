import type { FastifyInstance } from 'fastify';
import {
  createUserSchema,
  patchUserOnboardingSchema,
} from '../schemas/user.schema.js';
import { UserService } from '../services/user.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { GamificationService } from '../services/gamification.service.js';
import { env } from '../config/env.js';

import { checkOTPRateLimit } from '../utils/otp-rate-limit.js';
function requireUserAccess(
  req: { params: { id: string }; headers: Record<string, string | string[] | undefined> },
  reply: { status: (n: number) => { send: (b: unknown) => void } },
): boolean {
  const userId = req.headers['x-user-id'] as string | undefined;
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  if (adminKey && adminKey === env.ADMIN_API_KEY) return true;
  if (!userId || req.params.id !== userId) {
    reply.status(403).send({ code: 'FORBIDDEN', message: 'Accès refusé' });
    return false;
  }
  return true;
}

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // GET /users/me — profil de l'utilisateur connecte
  app.get('/users/me', async (req, reply) => {
    const userId = req.headers['x-user-id'] as string | undefined;
    if (!userId) {
      return reply.status(401).send({ code: 'UNAUTHORIZED' });
    }
    const result = await UserService.findById(userId);
    if (!result.ok) {
      return reply.status(404).send({ code: 'NOT_FOUND' });
    }
    return reply.send(result.data);
  });

  // POST /users — Inscription
  app.post('/users', async (req, reply) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const result = await UserService.create(parsed.data);

    if (!result.ok) {
      return reply.status(result.statusCode).send({
        code: result.code,
        message: result.message,
      });
    }

    return reply.status(201).send(result.data);
  });

  // GET /users/:id — Profil (self ou admin)
  app.get<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    if (!requireUserAccess(req, reply)) return;

    const result = await UserService.findById(req.params.id);
    if (!result.ok) {
      return reply
        .status(404)
        .send({ code: 'NOT_FOUND', message: result.message });
    }
    return reply.send(result.data);
  });

  // PATCH /users/:id — Préférences onboarding (quartier, intérêts)
  app.patch<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    if (!requireUserAccess(req, reply)) return;

    const parsed = patchUserOnboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const result = await UserService.mergeProfileData(req.params.id, {
      quartier: parsed.data.quartier,
      interests: parsed.data.interests,
      onboardingCompletedAt: new Date().toISOString(),
    });
    if (!result.ok) {
      return reply.status(result.statusCode).send({
        code: result.code,
        message: result.message,
      });
    }
    return reply.send({ ok: true, ...result.data });
  });

  // POST /users/:id/verify-email — Vérification OTP email
  app.post<{ Params: { id: string } }>(
    '/users/:id/verify-email',
    async (req, reply) => {
      const { code } = req.body as { code?: string };
      if (!code) {
        return reply
          .status(400)
          .send({ code: 'MISSING_CODE', message: 'Code OTP requis' });
      }

      const ip = req.ip ?? 'unknown';
      const { allowed } = await checkOTPRateLimit(ip, 'email-otp', 10, 900);
      if (!allowed) {
        return reply.status(429).send({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de tentatives. Réessayez dans 15 minutes.',
        });
      }

      const user = await UserRepository.findById(req.params.id);
      if (!user) {
        return reply.status(404).send({ code: 'NOT_FOUND' });
      }

      const verifyRes = await fetch(
        `${env.AUTH_SERVICE_URL}/internal/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service': 'user-service',
          },
          body: JSON.stringify({
            userId: req.params.id,
            code,
            type: 'email',
          }),
          signal: AbortSignal.timeout(3000),
        },
      ).catch(() => null);

      if (!verifyRes?.ok) {
        req.log.warn(
          { userId: req.params.id, ip },
          '[AUDIT] OTP email verification failed',
        );
        return reply.status(400).send({
          code: 'INVALID_OTP',
          message: 'Code invalide ou expire',
        });
      }

      if (user.profileType === 'yunicitizen') {
        await UserRepository.updateVerificationStatus(
          req.params.id,
          'verified',
          { verifiedAt: new Date(), autoVerified: true },
        );

        void GamificationService.addPoints(
          req.params.id,
          'PROFIL_VERIFIE',
        ).catch(() => {});

        return reply.send({
          verified: true,
          autoVerified: true,
          message: 'Bienvenue sur Yunicity ! Votre profil est active.',
        });
      }
      await UserRepository.updateVerificationStatus(
        req.params.id,
        'pending',
      );
      return reply.send({
        verified: false,
        emailVerified: true,
        message:
          'Email verifie. Veuillez maintenant uploader vos documents KYC.',
        nextStep: 'kyc_upload',
      });
    },
  );

  // POST /users/:id/verify-phone — Vérification OTP SMS
  app.post<{ Params: { id: string } }>(
    '/users/:id/verify-phone',
    async (req, reply) => {
      const { code } = req.body as { code?: string };
      if (!code) {
        return reply
          .status(400)
          .send({ code: 'MISSING_CODE', message: 'Code SMS requis' });
      }

      const ip = req.ip ?? 'unknown';
      const { allowed } = await checkOTPRateLimit(ip, 'sms-otp', 10, 900);
      if (!allowed) {
        return reply.status(429).send({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de tentatives. Réessayez dans 15 minutes.',
        });
      }

      const user = await UserRepository.findById(req.params.id);
      if (!user) {
        return reply.status(404).send({ code: 'NOT_FOUND' });
      }

      const verifyRes = await fetch(
        `${env.AUTH_SERVICE_URL}/internal/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service': 'user-service',
          },
          body: JSON.stringify({
            userId: req.params.id,
            code,
            type: 'sms',
          }),
          signal: AbortSignal.timeout(3000),
        },
      ).catch(() => null);

      if (!verifyRes?.ok) {
        req.log.warn(
          { userId: req.params.id, ip },
          '[AUDIT] OTP SMS verification failed',
        );
        return reply.status(400).send({
          code: 'INVALID_OTP',
          message: 'Code SMS invalide ou expire',
        });
      }

      return reply.send({ phoneVerified: true });
    },
  );
}
