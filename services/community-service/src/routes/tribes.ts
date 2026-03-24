import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TribeService } from '../services/tribe.service.js';
import type { TribeCategory } from '../models/Tribe.model.js';

const createTribeSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  category: z.enum([
    'culture',
    'sport',
    'business',
    'education',
    'social',
    'ecology',
    'food',
    'art',
    'tech',
    'other',
  ]),
  city: z.string().min(2).max(100),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
});

export async function tribeRoutes(app: FastifyInstance): Promise<void> {
  // GET /tribes?city=reims&category=sport&limit=20&cursor=xxx
  app.get('/tribes', async (req, reply) => {
    const query = req.query as Record<string, string>;
    const city = query['city']?.toLowerCase();
    if (!city) {
      return reply
        .status(400)
        .send({ code: 'MISSING_CITY', message: 'Paramètre city requis' });
    }

    const result = await TribeService.listByCity({
      city,
      category: query['category'] as TribeCategory | undefined,
      cursor: query['cursor'],
      limit: query['limit'] ? Math.min(Number(query['limit']), 50) : 20,
    });

    return reply.send(result);
  });

  // POST /tribes
  app.post('/tribes', async (req, reply) => {
    const parsed = createTribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const creatorId = (req.headers['x-user-id'] as string) ?? 'anonymous';

    const result = await TribeService.create({
      ...parsed.data,
      city: parsed.data.city.toLowerCase(),
      creatorId,
    });
    if (!result.ok) {
      return reply
        .status(result.statusCode)
        .send({ code: result.code, message: result.message });
    }

    return reply.status(201).send(result.data);
  });

  // POST /tribes/:id/join
  app.post<{ Params: { id: string } }>(
    '/tribes/:id/join',
    async (req, reply) => {
      const userId = (req.headers['x-user-id'] as string) ?? 'anonymous';
      const result = await TribeService.join(req.params.id, userId);
      if (!result.ok) {
        return reply
          .status(result.statusCode)
          .send({ code: result.code, message: result.message });
      }
      return reply.send(result.data);
    },
  );

  // POST /tribes/:id/leave
  app.post<{ Params: { id: string } }>(
    '/tribes/:id/leave',
    async (req, reply) => {
      const userId = (req.headers['x-user-id'] as string) ?? 'anonymous';
      const result = await TribeService.leave(req.params.id, userId);
      if (!result.ok) {
        return reply
          .status(result.statusCode)
          .send({ code: result.code, message: result.message });
      }
      return reply.send(result.data);
    },
  );
}
