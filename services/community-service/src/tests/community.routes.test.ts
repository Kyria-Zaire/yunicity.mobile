process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['CORS_ORIGINS'] = 'http://localhost:3010';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

vi.mock('../services/post.service.js', () => ({
  PostService: {
    create: vi.fn(),
    react: vi.fn(),
    listByCity: vi.fn(),
  },
}));

vi.mock('../services/tribe.service.js', () => ({
  TribeService: {
    create: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
    listByCity: vi.fn(),
  },
}));

const { buildApp } = await import('../app.js');

describe('Community routes auth', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse POST /posts sans x-user-id', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/posts',
      payload: {
        content: 'Bonjour Yunicity',
        city: 'reims',
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('UNAUTHORIZED');
  });

  it('refuse POST /tribes/:id/join sans x-user-id', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tribes/tribe-1/join',
    });

    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('UNAUTHORIZED');
  });
});
