import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service.js';
import { constructWebhookEvent } from '../providers/stripe.provider.js';
import { PLANS } from '../config/plans.js';

const createSubSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  planId: z.enum(['PREMIUM', 'PACK_COMMERCIAL']),
  name: z.string().optional(),
});

export async function paymentRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get('/payments/plans', async (_req, reply) => {
    return reply.send({ plans: Object.values(PLANS) });
  });

  app.post('/payments/subscribe', async (req, reply) => {
    const parsed = createSubSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const { checkoutUrl } = await PaymentService.createSubscription(
      parsed.data,
    );
    return reply.send({ checkoutUrl });
  });

  app.get('/payments/portal', async (req, reply) => {
    const q = req.query as Record<string, string>;
    if (!q['userId'] || !q['email']) {
      return reply.status(400).send({ code: 'MISSING_PARAMS' });
    }

    const { portalUrl } = await PaymentService.getPortalUrl({
      userId: q['userId'],
      email: q['email'],
    });

    return reply.send({ portalUrl });
  });

  app.post('/payments/webhook', async (req, reply) => {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const isProd = process.env['NODE_ENV'] === 'production';

    // Production: signature OBLIGATOIRE
    if (isProd && !sig) {
      req.log.warn({ ip: req.ip }, 'Webhook Stripe sans signature rejete');
      return reply.status(400).send({ code: 'MISSING_SIGNATURE' });
    }

    if (sig) {
      const payload = Buffer.from(
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body),
      );

      const event = constructWebhookEvent(payload, sig);
      if (!event) {
        req.log.warn({ ip: req.ip }, 'Signature Stripe invalide');
        return reply.status(400).send({ code: 'INVALID_SIGNATURE' });
      }

      await PaymentService.handleWebhook(event);
    } else {
      // Dev uniquement — accepter sans signature
      req.log.info('Webhook Stripe sans signature — mode dev');
      await PaymentService.handleWebhook(
        req.body as Parameters<typeof PaymentService.handleWebhook>[0],
      );
    }

    return reply.send({ received: true });
  });
}

