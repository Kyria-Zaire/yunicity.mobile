import type { FastifyInstance } from 'fastify';
import { prisma, type Prisma } from '@yunicity/database';
import { UserRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';
import { GamificationService } from '../services/gamification.service.js';
import { isTrustedInternalService } from '../utils/internal-service.js';

const TWO_DAYS_AGO = 2 * 24 * 60 * 60 * 1000;

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Middleware auth admin — header X-Admin-Key
  app.addHook('preHandler', async (req, reply) => {
    const isInternal = typeof req.url === 'string' &&
      req.url.startsWith('/internal/');
    if (isInternal && isTrustedInternalService(req.headers['x-internal-service'])) {
      return;
    }

    const key = req.headers['x-admin-key'];
    if (!key || key !== env.ADMIN_API_KEY) {
      return reply
        .status(403)
        .send({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
  });

  // GET /admin/users?status=pending&profileType=commercial&limit=20&cursor=
  app.get('/admin/users', async (req, reply) => {
    const q = req.query as Record<string, string>;
    const cursor = q['cursor'] || undefined;
    const filter: Prisma.UserWhereInput = {};
    if (q['status']) filter.verificationStatus = q['status'] as 'pending' | 'under_review' | 'verified' | 'rejected';
    if (q['profileType']) filter.profileType = q['profileType'] as 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';
    const result = await UserRepository.findPaginated({
      filter,
      ...(cursor ? { cursor } : {}),
      limit: Math.min(Number(q['limit'] ?? 20), 50),
    });
    return reply.send(result);
  });

  // PATCH /admin/users/:id/verify
  app.patch<{ Params: { id: string } }>(
    '/admin/users/:id/verify',
    async (req, reply) => {
      await UserRepository.updateVerificationStatus(req.params.id, 'verified', {
        verifiedAt: new Date(),
        autoVerified: false,
      });
      void GamificationService.addPoints(req.params.id, 'PROFIL_VERIFIE')
        .catch((err: unknown) => {
          req.log.error(
            { err },
            'Failed to award verification points',
          );
        });
      req.log.info({ userId: req.params.id }, '[AUDIT] User verified');
      return reply.send({ verified: true });
    },
  );

  // PATCH /admin/users/:id/reject
  app.patch<{ Params: { id: string } }>(
    '/admin/users/:id/reject',
    async (req, reply) => {
      const body = req.body as { reason?: string };
      if (!body.reason?.trim()) {
        return reply.status(400).send({
          code: 'REASON_REQUIRED',
          message: 'Motif de rejet obligatoire',
        });
      }
      await UserRepository.updateVerificationStatus(
        req.params.id,
        'rejected',
      );
      req.log.info(
        { userId: req.params.id, reason: body.reason },
        '[AUDIT] User rejected',
      );
      return reply.send({ rejected: true, reason: body.reason });
    },
  );

  // GET /admin/stats
  app.get('/admin/stats', async (_req, reply) => {
    const [pending, under_review, verified, rejected] = await Promise.all([
      UserRepository.countByStatus('pending'),
      UserRepository.countByStatus('under_review'),
      UserRepository.countByStatus('verified'),
      UserRepository.countByStatus('rejected'),
    ]);
    return reply.send({ pending, under_review, verified, rejected });
  });

  // POST /internal/update-subscription — endpoint pour payment-service
  app.post('/internal/update-subscription', async (req, reply) => {
    if (!req.headers['x-internal-service']) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const body = req.body as
      | { userId: string; plan: 'free' | 'premium' }
      | undefined;

    if (!body?.userId || !body.plan) {
      return reply.status(400).send({ code: 'VALIDATION_ERROR' });
    }

    await prisma.user.update({
      where: { id: body.userId },
      data: { plan: body.plan },
    });

    return reply.send({ updated: true });
  });

  // POST /internal/reset-weekly-leaderboard — appel du worker
  app.post('/internal/reset-weekly-leaderboard', async (req, reply) => {
    if (!isTrustedInternalService(req.headers['x-internal-service'])) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const body = req.body as { city?: string } | undefined;
    if (!body?.city) {
      return reply.status(400).send({ code: 'MISSING_CITY' });
    }

    await GamificationService.resetWeeklyLeaderboard(body.city);
    return reply.send({ reset: true, city: body.city });
  });

  // GET /internal/weekly-digest-users — users actifs pour le digest
  app.get('/internal/weekly-digest-users', async (req, reply) => {
    if (!isTrustedInternalService(req.headers['x-internal-service'])) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        consentMarketing: true,
      },
      select: { id: true, email: true },
      take: 1000,
    });

    return reply.send({ users });
  });

  // GET /internal/pending-kyc-users — users pro en attente KYC > 48h
  app.get('/internal/pending-kyc-users', async (req, reply) => {
    if (!isTrustedInternalService(req.headers['x-internal-service'])) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const cutoff = new Date(Date.now() - TWO_DAYS_AGO);
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        profileType: { not: 'yunicitizen' },
        verificationStatus: 'pending',
        createdAt: { lt: cutoff },
      },
      select: { id: true, email: true, profileType: true },
      take: 500,
    });

    return reply.send({ users });
  });
}
