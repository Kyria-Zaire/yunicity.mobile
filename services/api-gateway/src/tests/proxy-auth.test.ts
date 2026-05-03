process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

const { buildApp } = await import('../app.js');

function mockFetchResponse(body: unknown, init?: { ok?: boolean; status?: number }): Response {
  const ok = init?.ok ?? true;
  const status = init?.status ?? (ok ? 200 : 500);
  return {
    ok,
    status,
    headers: new Headers(),
    json: async () => body,
  } as Response;
}

describe('API Gateway proxy auth propagation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.includes('/auth/session/verify')) {
          return mockFetchResponse({ user: { id: 'u1' } });
        }
        return mockFetchResponse({ ok: true }, { status: 200 });
      }),
    );

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllGlobals();
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
    const proxyCall = vi.mocked(fetch).mock.calls.find(([u]) => {
      const url = typeof u === 'string' ? u : u instanceof URL ? u.href : u.url;
      return url.includes('/community');
    });
    expect(proxyCall?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-ID': 'u1',
        }),
      }),
    );
  });
});
