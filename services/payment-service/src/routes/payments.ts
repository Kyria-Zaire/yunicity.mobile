import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service.js';
import { constructWebhookEvent } from '../providers/stripe.provider.js';
import { PLANS } from '../config/plans.js';
import { env } from '../config/env.js';

const createSubSchema = z.object({
  planId: z.enum(['PREMIUM', 'PACK_COMMERCIAL']),
  name: z.string().optional(),
});

type AuthenticatedUser = {
  id: string;
  email: string;
};

async function requireAuthenticatedUser(
  req: {
    headers: Record<string, string | string[] | undefined>;
    log: { error: (payload: unknown, msg: string) => void };
  },
  reply: {
    status: (n: number) => { send: (b: unknown) => void };
  },
): Promise<AuthenticatedUser | undefined> {
  const userId = req.headers['x-user-id'] as string | undefined;
  if (!userId) {
    reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
    return undefined;
  }

  try {
    const response = await fetch(`${env.USER_SERVICE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: 'Unable to resolve authenticated user',
      });
      return undefined;
    }

    const data = (await response.json()) as {
      id?: string;
      email?: string;
    };

    if (data.id !== userId || !data.email) {
      reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: 'Unable to resolve authenticated user',
      });
      return undefined;
    }

    return {
      id: data.id,
      email: data.email,
    };
  } catch (err) {
    req.log.error({ err, userId }, 'User service unavailable for payment auth');
    reply.status(503).send({
      code: 'USER_SERVICE_UNAVAILABLE',
      message: 'User service unavailable',
    });
    return undefined;
  }
}

export async function paymentRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get('/payments/plans', async (_req, reply) => {
    return reply.send({ plans: Object.values(PLANS) });
  });

  app.post('/payments/subscribe', async (req, reply) => {
    const user = await requireAuthenticatedUser(req, reply);
    if (!user) return;

    const parsed = createSubSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const { checkoutUrl } = await PaymentService.createSubscription({
      ...parsed.data,
      userId: user.id,
      email: user.email,
    });
    return reply.send({ checkoutUrl });
  });

  app.get('/payments/portal', async (req, reply) => {
    const user = await requireAuthenticatedUser(req, reply);
    if (!user) return;

    const { portalUrl } = await PaymentService.getPortalUrl({
      userId: user.id,
      email: user.email,
    });

    return reply.send({ portalUrl });
  });

  await app.register(async (webhookApp) => {
    webhookApp.addContentTypeParser(
      'application/json',
      { parseAs: 'buffer' },
      (_req, body, done) => {
        done(null, body);
      },
    );

    webhookApp.post('/payments/webhook', async (req, reply) => {
      const sig = req.headers['stripe-signature'] as string | undefined;
      const isProd = process.env['NODE_ENV'] === 'production';
      const payload = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(String(req.body ?? ''));

      if (isProd && !sig) {
        req.log.warn({ ip: req.ip }, 'Webhook Stripe sans signature rejete');
        return reply.status(400).send({ code: 'MISSING_SIGNATURE' });
      }

      if (sig) {
        const event = constructWebhookEvent(payload, sig);
        if (!event) {
          req.log.warn({ ip: req.ip }, 'Signature Stripe invalide');
          return reply.status(400).send({ code: 'INVALID_SIGNATURE' });
        }

        await PaymentService.handleWebhook(event);
      } else {
        try {
          const event = JSON.parse(
            payload.toString('utf8'),
          ) as Parameters<typeof PaymentService.handleWebhook>[0];
          req.log.info('Webhook Stripe sans signature - mode dev');
          await PaymentService.handleWebhook(event);
        } catch {
          return reply.status(400).send({ code: 'INVALID_PAYLOAD' });
        }
      }

      return reply.send({ received: true });
    });
  });
}
