process.env['NODE_ENV'] = 'test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';

import { describe, it, expect, vi } from 'vitest';
import { sendPushNotification } from '../providers/push.provider.js';

vi.mock('../config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    VAPID_PUBLIC_KEY: undefined,
    VAPID_PRIVATE_KEY: undefined,
    VAPID_CONTACT_EMAIL: 'push@yunicity.fr',
    REDIS_URL: 'redis://localhost:6379',
    DATABASE_URL: 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test',
  },
}));

vi.mock('@yunicity/database', () => ({
  prisma: {
    pushSubscription: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

const mockSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
  keys: {
    p256dh: 'BLk3...test-key-p256dh',
    auth: 'aGk...test-key-auth',
  },
};

describe('Push Provider', () => {
  it('envoie une notification en mode stub (sans VAPID)', async () => {
    const result = await sendPushNotification(mockSubscription, {
      title: 'Nouvelle activite',
      body: 'Votre tribu a un nouveau post',
    });

    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('retourne ok avec des donnees supplementaires', async () => {
    const result = await sendPushNotification(mockSubscription, {
      title: 'Yunicity',
      body: 'Vous avez gagne un badge !',
      url: '/passport',
      data: { badgeId: 'premier_post' },
    });

    expect(result.ok).toBe(true);
  });
});
