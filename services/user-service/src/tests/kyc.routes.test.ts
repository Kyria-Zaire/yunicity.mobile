process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['ADMIN_API_KEY'] = 'test_admin_key_min_32_chars_yunicity_ok';
process.env['AUTH_SERVICE_URL'] = 'http://localhost:3001';

import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

vi.mock('../services/kyc.service.js', () => ({
  KycService: {
    uploadDocument: vi.fn(),
    verifySiretAuto: vi.fn(),
  },
}));

const { buildApp } = await import('../app.js');

describe('KYC routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse POST /users/:id/kyc/upload sans utilisateur correspondant', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users/user-b/kyc/upload?docType=kbis',
      headers: {
        'x-user-id': 'user-a',
      },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json<{ code: string }>().code).toBe('FORBIDDEN');
  });
});
