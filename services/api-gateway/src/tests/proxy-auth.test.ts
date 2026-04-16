process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

const { buildApp } = await import('../app.js');

describe('API Gateway proxy auth propagation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ user: { id: 'u1' } }),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ ok: true }),
      } as never);

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('propage x-user-id vers /community a partir de la session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/community/posts',
      headers: {
        cookie: 'yunicity.session=test',
      },
      payload: {
        content: 'Bonjour Yunicity',
        city: 'reims',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(vi.mocked(global.fetch).mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-ID': 'u1',
        }),
      }),
    );
  });
});
