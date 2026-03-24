process.env['NODE_ENV'] = 'test';
process.env['USER_SERVICE_URL'] = 'http://localhost:3002';
process.env['WEB_URL'] = 'http://localhost:3010';

import { describe, it, expect, vi } from 'vitest';
import { PaymentService } from '../services/payment.service.js';

global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

describe('PaymentService (simulation dev)', () => {
  it('createSubscription retourne checkoutUrl en dev', async () => {
    const result = await PaymentService.createSubscription({
      userId: 'u1',
      email: 'test@yunicity.fr',
      planId: 'PREMIUM',
    });

    expect(result.checkoutUrl).toContain('cs_dev_simulation');
  });

  it('handleWebhook checkout.session.completed notifie user-service', async () => {
    await PaymentService.handleWebhook({
      type: 'checkout.session.completed',
      data: {
        object: { metadata: { userId: 'u1', planId: 'PREMIUM' } },
      },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/internal/update-subscription'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('handleWebhook subscription.deleted remet le plan à free', async () => {
    vi.mocked(global.fetch).mockClear();

    await PaymentService.handleWebhook({
      type: 'customer.subscription.deleted',
      data: { object: { metadata: { userId: 'u2' } } },
    });

    const body = JSON.parse(
      (vi.mocked(global.fetch).mock.calls[0]?.[1]?.body as string) ??
        '{}',
    );

    expect(body.plan).toBe('free');
  });
});

