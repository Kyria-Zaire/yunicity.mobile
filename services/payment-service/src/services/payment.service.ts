import {
  createCheckoutSession,
  createOrRetrieveCustomer,
  createPortalSession,
} from '../providers/stripe.provider.js';
import type { PlanId } from '../config/plans.js';
import { env } from '../config/env.js';

export class PaymentService {
  static async createSubscription(params: {
    userId: string;
    email: string;
    planId: PlanId;
    name?: string | undefined;
  }): Promise<{ checkoutUrl: string }> {
    const customerId = await createOrRetrieveCustomer({
      email: params.email,
      userId: params.userId,
      name: params.name,
    });

    const checkoutUrl = await createCheckoutSession({
      customerId,
      planId: params.planId,
      successUrl: `${env.WEB_URL}/premium/success?plan=${params.planId}`,
      cancelUrl: `${env.WEB_URL}/premium`,
      userId: params.userId,
    });

    return { checkoutUrl };
  }

  static async getPortalUrl(params: {
    userId: string;
    email: string;
  }): Promise<{ portalUrl: string }> {
    const customerId = await createOrRetrieveCustomer({
      email: params.email,
      userId: params.userId,
    });

    const portalUrl = await createPortalSession({
      customerId,
      returnUrl: `${env.WEB_URL}/profil`,
    });

    return { portalUrl };
  }

  static async handleWebhook(event: {
    type: string;
    data: { object: unknown };
  }): Promise<void> {
    const obj = event.data.object as Record<string, unknown>;
    const meta = obj['metadata'] as Record<string, string> | undefined;

    if (event.type === 'checkout.session.completed') {
      if (meta?.['userId']) {
        await fetch(`${env.USER_SERVICE_URL}/internal/update-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service': 'payment-service',
          },
          body: JSON.stringify({
            userId: meta['userId'],
            plan: meta['planId'] === 'PREMIUM' ? 'premium' : 'free',
          }),
        }).catch(() => {});
      }
      return;
    }

    if (event.type === 'customer.subscription.deleted') {
      if (meta?.['userId']) {
        await fetch(`${env.USER_SERVICE_URL}/internal/update-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service': 'payment-service',
          },
          body: JSON.stringify({
            userId: meta['userId'],
            plan: 'free',
          }),
        }).catch(() => {});
      }
    }
  }
}

