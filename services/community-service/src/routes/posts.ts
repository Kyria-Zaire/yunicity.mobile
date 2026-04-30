import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PostService } from '../services/post.service.js';
import {
  processAndUploadImage,
  validateAndUploadVideo,
} from '../providers/media.provider.js';
import { PostRepository } from '../repositories/post.repository.js';

const createPostSchema = z.object({
  content: z.string().min(3).max(1000),
  type: z
    .enum(['text', 'event', 'offer', 'question', 'announcement'])
    .default('text'),
  tribeId: z.string().optional(),
  city: z.string().min(2).max(100),
});

function requireAuthenticatedUser(
  req: { headers: Record<string, string | string[] | undefined> },
  reply: { status: (n: number) => { send: (b: unknown) => void } },
): string | undefined {
  const userId = req.headers['x-user-id'] as string | undefined;
  if (!userId) {
    reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
    return undefined;
  }
  return userId;
}

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
    const authorId = requireAuthenticatedUser(req, reply);
    if (!authorId) return;

    // Support JSON (sans média) + multipart/form-data (avec média)
    const isMultipart =
      typeof req.headers['content-type'] === 'string' &&
      req.headers['content-type'].includes('multipart/form-data');

    if (!isMultipart) {
      const parsed = createPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({
          code: 'VALIDATION_ERROR',
          errors: parsed.error.flatten(),
        });
      }

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
    }

    // Multipart
    const fields = (req as any).body as Record<string, unknown> | undefined;
    const candidate = {
      content: (fields?.['content'] as any)?.value ?? fields?.['content'],
      type: (fields?.['type'] as any)?.value ?? fields?.['type'],
      tribeId: (fields?.['tribeId'] as any)?.value ?? fields?.['tribeId'],
      city: (fields?.['city'] as any)?.value ?? fields?.['city'],
    };

    const parsed = createPostSchema.safeParse(candidate);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    // On crée d'abord le post pour récupérer son id (cuid),
    // puis on ajoute mediaKeys si upload OK.
    const createRes = await PostService.create({
      ...parsed.data,
      city: parsed.data.city.toLowerCase(),
      authorId,
      mediaKeys: [],
    });
    if (!createRes.ok) {
      return reply
        .status(createRes.statusCode)
        .send({ code: createRes.code, message: createRes.message });
    }

    const postId = createRes.data.id;

    try {
      const file = await (req as any).file?.();
      if (!file) {
        return reply.status(201).send(createRes.data);
      }

      const buffer = await file.toBuffer();
      const mimeType = file.mimetype as string;

      let mediaKeys: string[] = [];
      if (mimeType.startsWith('image/')) {
        const variant = await processAndUploadImage(buffer, mimeType, postId);
        mediaKeys = [variant.original, variant.thumb];
      } else if (mimeType.startsWith('video/')) {
        const video = await validateAndUploadVideo(buffer, mimeType, postId);
        mediaKeys = [video.key];
      } else {
        return reply.status(400).send({
          code: 'INVALID_MEDIA_TYPE',
          message: `Type média non autorisé: ${mimeType}`,
        });
      }

      const updated = await PostRepository.updateMediaKeys(postId, mediaKeys);
      return reply.status(201).send(updated);
    } catch (err) {
      // En cas d'échec upload média, on désactive le post pour éviter
      // des contenus "fantômes" sans média.
      await PostRepository.softDelete(postId);
      throw err;
    }
  });

  // POST /posts/:id/react
  app.post<{ Params: { id: string } }>(
    '/posts/:id/react',
    async (req, reply) => {
      const userId = requireAuthenticatedUser(req, reply);
      if (!userId) return;

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
