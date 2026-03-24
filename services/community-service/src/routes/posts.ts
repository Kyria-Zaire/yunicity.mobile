import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PostService } from '../services/post.service.js';

const createPostSchema = z.object({
  content: z.string().min(3).max(1000),
  type: z
    .enum(['text', 'event', 'offer', 'question', 'announcement'])
    .default('text'),
  tribeId: z.string().optional(),
  city: z.string().min(2).max(100),
});

export async function postRoutes(app: FastifyInstance): Promise<void> {
  // GET /posts?city=reims&tribeId=xxx&limit=20&cursor=xxx
  app.get('/posts', async (req, reply) => {
    const query = req.query as Record<string, string>;
    const city = query['city']?.toLowerCase();
    if (!city) {
      return reply
        .status(400)
        .send({ code: 'MISSING_CITY', message: 'Paramètre city requis' });
    }

    const result = await PostService.listByCity({
      city,
      tribeId: query['tribeId'],
      cursor: query['cursor'],
      limit: query['limit'] ? Math.min(Number(query['limit']), 50) : 20,
    });
    return reply.send(result);
  });

  // POST /posts
  app.post('/posts', async (req, reply) => {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const authorId = (req.headers['x-user-id'] as string) ?? 'anonymous';
    const result = await PostService.create({
      ...parsed.data,
      city: parsed.data.city.toLowerCase(),
      authorId,
    });
    if (!result.ok) {
      return reply
        .status(result.statusCode)
        .send({ code: result.code, message: result.message });
    }
    return reply.status(201).send(result.data);
  });

  // POST /posts/:id/react
  app.post<{ Params: { id: string } }>(
    '/posts/:id/react',
    async (req, reply) => {
      const userId = (req.headers['x-user-id'] as string) ?? 'anonymous';
      const emoji = (req.body as { emoji?: string }).emoji ?? '';
      const result = await PostService.react(req.params.id, userId, emoji);
      if (!result.ok) {
        return reply
          .status(result.statusCode)
          .send({ code: result.code, message: result.message });
      }
      return reply.send(result.data);
    },
  );
}
