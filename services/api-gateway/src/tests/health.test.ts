import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';

// Force le mode test avant tout
process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';

describe('API Gateway — Health', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 10000);

  afterAll(async () => {
    await app.close();
  }, 5000);

  it('GET /health → 200 avec status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ status: string; service: string }>();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api-gateway');
  });

  it('GET /route-inconnue → 404 avec code NOT_FOUND', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/route-inconnue',
    });
    expect(res.statusCode).toBe(404);
    const body = res.json<{ code: string }>();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('X-Request-ID présent dans la réponse', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });
});
