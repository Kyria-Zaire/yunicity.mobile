import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@yunicity/database';

const updateModerationSchema = z.object({
  postId: z.string().min(1),
  action: z.enum(['approved', 'flagged', 'rejected']),
});

export async function internalRoutes(app: FastifyInstance): Promise<void> {
  // POST /internal/moderation-result — callback du moderation-service
  app.post('/internal/moderation-result', async (req, reply) => {
    if (!req.headers['x-internal-service']) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const body = updateModerationSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ errors: body.error.flatten() });
    }

    const update: Record<string, unknown> = { isModerated: true };
    if (body.data.action === 'rejected') {
      update['isActive'] = false;
    }
    if (body.data.action === 'flagged') {
      update['isFlagged'] = true;
    }

    const post = await prisma.post.update({
      where: { id: body.data.postId },
      data: update,
    }).catch(() => null);

    if (!post) {
      return reply
        .status(404)
        .send({ code: 'POST_NOT_FOUND', message: 'Post introuvable' });
    }

    return reply.send({ postId: post.id, action: body.data.action });
  });
}
