import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ModerationService } from '../services/moderation.service.js';

const moderateSchema = z.object({
  contentId: z.string().min(1),
  contentType: z.enum(['post', 'comment', 'profile', 'tribe']),
  authorId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

const reviewSchema = z.object({
  action: z.enum(['approved', 'flagged', 'rejected']),
  reviewerId: z.string().min(1),
});

const queueQuerySchema = z.object({
  action: z.enum(['approved', 'flagged', 'rejected', 'pending']).optional(),
  contentType: z.enum(['post', 'comment', 'profile', 'tribe']).optional(),
});

export async function moderationRoutes(app: FastifyInstance): Promise<void> {
  // POST /moderation/check — Moderer un contenu (appel interne)
  app.post('/moderation/check', async (req, reply) => {
    const body = moderateSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ errors: body.error.flatten() });
    }

    const result = await ModerationService.moderate(body.data);
    if (!result.ok) {
      return reply
        .status(result.statusCode)
        .send({ code: result.code, message: result.message });
    }

    return reply.send(result.data);
  });

  // GET /moderation/queue — File de moderation
  app.get('/moderation/queue', async (req, reply) => {
    const query = queueQuerySchema.safeParse(req.query);
    if (!query.success) {
      return reply.status(400).send({ errors: query.error.flatten() });
    }

    const items = await ModerationService.getQueue(query.data);
    return reply.send({ items });
  });

  // PATCH /moderation/:id/review — Review manuel
  app.patch<{ Params: { id: string } }>(
    '/moderation/:id/review',
    async (req, reply) => {
      const body = reviewSchema.safeParse(req.body);
      if (!body.success) {
        return reply.status(400).send({ errors: body.error.flatten() });
      }

      const result = await ModerationService.reviewItem(
        req.params.id,
        body.data.action,
        body.data.reviewerId,
      );

      if (!result.ok) {
        return reply
          .status(result.statusCode)
          .send({ code: result.code, message: result.message });
      }

      return reply.send(result.data);
    },
  );
}
