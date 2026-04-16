process.env['NODE_ENV'] = 'test';
process.env['USER_SERVICE_URL'] = 'http://localhost:3002';
process.env['WEB_URL'] = 'http://localhost:3010';
process.env['CORS_ORIGINS'] = 'http://localhost:3010';
process.env['STRIPE_WEBHOOK_SECRET'] = 'whsec_test';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

vi.mock('../services/payment.service.js', () => ({
  PaymentService: {
    createSubscription: vi.fn().mockResolvedValue({
      checkoutUrl: 'https://checkout.stripe.test/session',
    }),
    getPortalUrl: vi.fn().mockResolvedValue({
      portalUrl: 'https://billing.stripe.test/portal',
    }),
    handleWebhook: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../providers/stripe.provider.js', () => ({
  constructWebhookEvent: vi.fn().mockReturnValue({
    type: 'checkout.session.completed',
    data: { object: { metadata: { userId: 'u1', planId: 'PREMIUM' } } },
  }),
}));

const { buildApp } = await import('../app.js');
const { PaymentService } = await import('../services/payment.service.js');
const { constructWebhookEvent } = await import('../providers/stripe.provider.js');

describe('Payment routes auth and webhook', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'user@yunicity.fr',
      }),
    } as never);

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse /payments/subscribe sans x-user-id', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/payments/subscribe',
      payload: { planId: 'PREMIUM' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('UNAUTHORIZED');
  });

  it('utilise le user authentifie pour /payments/subscribe', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/payments/subscribe',
      headers: {
        'x-user-id': 'u1',
      },
      payload: {
        userId: 'attacker',
        email: 'attacker@example.com',
        planId: 'PREMIUM',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(PaymentService.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        email: 'user@yunicity.fr',
        planId: 'PREMIUM',
      }),
    );
  });

  it('verifie les webhooks Stripe avec le raw body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/payments/webhook',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      payload: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { metadata: { userId: 'u1', planId: 'PREMIUM' } } },
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(constructWebhookEvent).toHaveBeenCalledWith(
      expect.any(Buffer),
      'sig_test',
    );
  });
});
