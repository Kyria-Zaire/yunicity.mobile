import { PostRepository } from '../repositories/post.repository.js';
import { moderationQueue } from '../jobs/queues.js';

const VALID_EMOJIS = ['\u{1F44D}', '\u2764\uFE0F', '\u{1F3D9}\uFE0F', '\u{1F389}', '\u{1F91D}'];

export class PostService {
  static async create(payload: {
    authorId: string;
    city: string;
    content: string;
    type: string;
    tribeId?: string | undefined;
  }) {
    if (payload.content.trim().length < 3) {
      return {
        ok: false as const,
        code: 'CONTENT_TOO_SHORT',
        message: 'Contenu trop court (min 3 caractères)',
        statusCode: 400,
      };
    }

    const post = await PostRepository.create(payload);

    // Job de modération automatique (IA — sera implémenté en S3)
    await moderationQueue.add('moderate-post', {
      postId: post.id,
      content: post.content,
    });

    return { ok: true as const, data: post };
  }

  static async react(postId: string, userId: string, emoji: string) {
    if (!VALID_EMOJIS.includes(emoji)) {
      return {
        ok: false as const,
        code: 'INVALID_EMOJI',
        message: 'Réaction invalide',
        statusCode: 400,
      };
    }
    const post = await PostRepository.addReaction(postId, userId, emoji);
    if (!post) {
      return {
        ok: false as const,
        code: 'NOT_FOUND',
        message: 'Post introuvable',
        statusCode: 404,
      };
    }
    return { ok: true as const, data: { reactionCounts: post.reactionCounts } };
  }

  static async listByCity(params: {
    city: string;
    tribeId?: string | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
  }) {
    return PostRepository.findPaginated({
      filter: {
        city: params.city,
        isActive: true,
        deletedAt: null,
        ...(params.tribeId ? { tribeId: params.tribeId } : { tribeId: null }),
      },
      cursor: params.cursor,
      limit: params.limit ?? 20,
    });
  }
}
