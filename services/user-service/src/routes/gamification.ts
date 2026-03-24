import type { FastifyInstance } from 'fastify';
import { GamificationService } from '../services/gamification.service.js';
import { getLevelForPoints, LEVELS, POINTS } from '../config/gamification.js';
import { UserRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';

import { isTrustedInternalService } from '../utils/internal-service.js';

export async function gamificationRoutes(
  app: FastifyInstance,
): Promise<void> {
  // GET /gamification/passport/:userId
  app.get<{ Params: { userId: string } }>(
    '/gamification/passport/:userId',
    async (req, reply) => {
      // Passeport : stats consultables par tout utilisateur connecte
      const viewer = req.headers['x-user-id'] as string | undefined;
      const adminKey = req.headers['x-admin-key'] as string | undefined;
      const allowed =
        (adminKey && adminKey === env.ADMIN_API_KEY) ||
        Boolean(viewer);
      if (!allowed) {
        return reply.status(401).send({ code: 'UNAUTHORIZED' });
      }

      const user = await UserRepository.findById(req.params.userId);
      if (!user) return reply.status(404).send({ code: 'NOT_FOUND' });

      const level = getLevelForPoints(user.points);
      const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

      return reply.send({
        userId: user.id,
        points: user.points,
        level: level.level,
        levelName: level.name,
        nextLevel: nextLevel
          ? {
              level: nextLevel.level,
              name: nextLevel.name,
              pointsNeeded: nextLevel.minPoints - user.points,
            }
          : null,
        badges: user.badges,
        ambassadorLabel: user.ambassadorLabel,
        progress: nextLevel
          ? Math.round(
              ((user.points - level.minPoints) /
                (nextLevel.minPoints - level.minPoints)) *
                100,
            )
          : 100,
      });
    },
  );

  // GET /gamification/leaderboard/:city
  app.get<{ Params: { city: string } }>(
    '/gamification/leaderboard/:city',
    async (req, reply) => {
      const board = await GamificationService.getWeeklyLeaderboard(
        req.params.city,
      );
      return reply.send({ city: req.params.city, leaderboard: board });
    },
  );

  // POST /internal/gamification/add-points — endpoint interne inter-services
  app.post('/internal/gamification/add-points', async (req, reply) => {
    if (!isTrustedInternalService(req.headers['x-internal-service'])) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const body = req.body as {
      userId: string;
      action: string;
    };

    const result = await GamificationService.addPoints(
      body.userId,
      body.action as keyof typeof POINTS,
    );

    return reply.send(result);
  });
}

