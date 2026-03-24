process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { PostService } from '../services/post.service.js';
import { PostRepository } from '../repositories/post.repository.js';
import * as queues from '../jobs/queues.js';

vi.mock('../repositories/post.repository.js');
vi.mock('../jobs/queues.js', () => ({
  moderationQueue: { add: vi.fn().mockResolvedValue(undefined) },
}));

describe('PostService.create', () => {
  it('rejette un contenu trop court', async () => {
    const result = await PostService.create({
      authorId: 'u1',
      city: 'reims',
      content: 'AB',
      type: 'text',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CONTENT_TOO_SHORT');
  });

  it('crée le post et déclenche le job de modération', async () => {
    vi.mocked(PostRepository.create).mockResolvedValueOnce({
      id: 'post-1',
      content: 'Post test valide',
      city: 'reims',
    } as never);
    const result = await PostService.create({
      authorId: 'u1',
      city: 'reims',
      content: 'Post test valide',
      type: 'text',
    });
    expect(result.ok).toBe(true);
    expect(queues.moderationQueue.add).toHaveBeenCalledWith(
      'moderate-post',
      expect.objectContaining({ postId: 'post-1' }),
    );
  });
});

describe('PostService.react', () => {
  it('rejette une réaction emoji invalide', async () => {
    const result = await PostService.react('post-1', 'u1', '\u{1F608}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_EMOJI');
  });

  it('retourne NOT_FOUND si le post n\'existe pas', async () => {
    vi.mocked(PostRepository.addReaction).mockResolvedValueOnce(null);
    const result = await PostService.react('post-1', 'u1', '\u{1F44D}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('NOT_FOUND');
  });
});
