process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { ModerationService } from '../services/moderation.service.js';

vi.mock('@yunicity/database', () => ({
  prisma: {
    moderationLog: {
      create: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    OPENAI_API_KEY: undefined,
    REDIS_URL: 'redis://localhost:6379',
  },
}));

const basePayload = {
  contentId: 'post-1',
  contentType: 'post' as const,
  authorId: 'user-1',
  content: 'Bonjour, comment allez-vous ?',
};

describe('ModerationService', () => {
  it('approuve un contenu sans mots interdits (mode stub)', async () => {
    const result = await ModerationService.moderate(basePayload);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.action).toBe('approved');
      expect(result.data.score).toBe(0);
      expect(result.data.flaggedCategories).toEqual([]);
    }
  });

  it('rejette un contenu avec des mots interdits', async () => {
    const result = await ModerationService.moderate({
      ...basePayload,
      content: 'Tu es un connard et un salaud',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.action).toBe('rejected');
      expect(result.data.score).toBe(1.0);
      expect(result.data.flaggedCategories).toContain('forbidden_words');
      expect(result.data.reason).toContain('connard');
      expect(result.data.reason).toContain('salaud');
    }
  });

  it('detecte les mots interdits en majuscules', async () => {
    const result = await ModerationService.moderate({
      ...basePayload,
      content: 'NAZI propaganda ici',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.action).toBe('rejected');
      expect(result.data.flaggedCategories).toContain('forbidden_words');
    }
  });

  it('checkForbiddenWords retourne les mots trouves', () => {
    const result = ModerationService.checkForbiddenWords(
      'Sale fdp va te faire ntm',
    );
    expect(result.flagged).toBe(true);
    expect(result.words).toContain('fdp');
    expect(result.words).toContain('ntm');
  });
});
