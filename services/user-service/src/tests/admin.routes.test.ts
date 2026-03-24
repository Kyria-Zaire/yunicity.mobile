process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['ADMIN_API_KEY'] = 'test_admin_key_yunicity_2026_ok';

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';

// Mock repositories and queues before importing app
vi.mock('../repositories/user.repository.js', () => ({
  UserRepository: {
    findPaginated: vi.fn().mockResolvedValue({
      items: [],
      nextCursor: null,
      hasNextPage: false,
    }),
    updateVerificationStatus: vi.fn().mockResolvedValue(undefined),
    countByStatus: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('../jobs/queues.js', () => ({
  emailQueue: { add: vi.fn().mockResolvedValue(undefined) },
  kycQueue: { add: vi.fn().mockResolvedValue(undefined) },
}));

// Mock database connection
vi.mock('../config/database.js', () => ({
  connectDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@yunicity/database', () => ({
  prisma: {
    user: {
      update: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

const { buildApp } = await import('../app.js');
const { UserRepository } = await import('../repositories/user.repository.js');

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Admin routes', () => {
  it('retourne 403 sans X-Admin-Key', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/stats',
    });
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.code).toBe('FORBIDDEN');
  });

  it('retourne 200 avec X-Admin-Key valide sur /admin/stats', async () => {
    vi.mocked(UserRepository.countByStatus)
      .mockResolvedValueOnce(5)   // pending
      .mockResolvedValueOnce(2)   // under_review
      .mockResolvedValueOnce(10)  // verified
      .mockResolvedValueOnce(1);  // rejected

    const res = await app.inject({
      method: 'GET',
      url: '/admin/stats',
      headers: { 'x-admin-key': 'test_admin_key_yunicity_2026_ok' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      pending: 5,
      under_review: 2,
      verified: 10,
      rejected: 1,
    });
  });

  it('retourne 400 si reject sans motif', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/admin/users/fake-id/reject',
      headers: {
        'x-admin-key': 'test_admin_key_yunicity_2026_ok',
        'content-type': 'application/json',
      },
      payload: { reason: '' },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.code).toBe('REASON_REQUIRED');
  });
});
