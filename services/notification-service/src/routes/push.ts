import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@yunicity/database';
import { sendPushNotification } from '../providers/push.provider.js';
import { env } from '../config/env.js';

const subscribeSchema = z.object({
  userId: z.string().min(1),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  platform: z.string().optional(),
  city: z.string().min(1),
});

const sendPushSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  url: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export async function pushRoutes(app: FastifyInstance): Promise<void> {
  // GET /push/vapid-key — cle publique VAPID pour le frontend
  app.get('/push/vapid-key', async (_req, reply) => {
    return reply.send({
      publicKey: env.VAPID_PUBLIC_KEY ?? 'dev-vapid-key-placeholder',
    });
  });

  // POST /push/subscribe — enregistrer une souscription push
  app.post('/push/subscribe', async (req, reply) => {
    const body = subscribeSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ errors: body.error.flatten() });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: body.data.endpoint },
      update: {
        userId: body.data.userId,
        p256dh: body.data.keys.p256dh,
        auth: body.data.keys.auth,
        platform: body.data.platform ?? 'web',
        city: body.data.city,
        isActive: true,
      },
      create: {
        userId: body.data.userId,
        endpoint: body.data.endpoint,
        p256dh: body.data.keys.p256dh,
        auth: body.data.keys.auth,
        platform: body.data.platform ?? 'web',
        city: body.data.city,
        isActive: true,
      },
    });

    return reply.status(201).send({ subscribed: true });
  });

  // DELETE /push/unsubscribe — supprimer une souscription
  app.delete('/push/unsubscribe', async (req, reply) => {
    const body = req.body as { endpoint?: string } | undefined;
    if (!body?.endpoint) {
      return reply
        .status(400)
        .send({ code: 'MISSING_ENDPOINT', message: 'endpoint requis' });
    }

    await prisma.pushSubscription.updateMany({
      where: { endpoint: body.endpoint },
      data: { isActive: false },
    });

    return reply.send({ unsubscribed: true });
  });

  // POST /push/send — envoyer une notification push (admin/interne)
  app.post('/push/send', async (req, reply) => {
    const body = sendPushSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ errors: body.error.flatten() });
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: body.data.userId, isActive: true },
    });

    if (subscriptions.length === 0) {
      return reply.send({ sent: 0, message: 'Aucune souscription active' });
    }

    let sent = 0;
    const expired: string[] = [];

    for (const sub of subscriptions) {
      const result = await sendPushNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        {
          title: body.data.title,
          body: body.data.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          url: body.data.url,
          data: body.data.data,
        },
      );

      if (result.ok) {
        sent++;
      } else if (result.error === 'expired') {
        expired.push(sub.endpoint);
      }
    }

    // Cleanup expired subscriptions
    if (expired.length > 0) {
      await prisma.pushSubscription.updateMany({
        where: { endpoint: { in: expired } },
        data: { isActive: false },
      });
    }

    return reply.send({ sent, expired: expired.length });
  });

  // POST /internal/send — endpoint interne pour le worker et autres services
  app.post('/internal/send', async (req, reply) => {
    if (!req.headers['x-internal-service']) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const body = req.body as {
      userId: string;
      type: string;
      channel: string;
      data?: Record<string, unknown> | undefined;
    };

    if (!body.userId || !body.type) {
      return reply.status(400).send({ code: 'VALIDATION_ERROR' });
    }

    // For push channel, send push notifications
    if (body.channel === 'push') {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: body.userId, isActive: true },
      });

      let sent = 0;
      for (const sub of subscriptions) {
        const result = await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          {
            title: 'Yunicity',
            body: body.type,
            data: body.data,
          },
        );
        if (result.ok) sent++;
      }

      return reply.send({ sent });
    }

    // For email channel, log (actual sending handled by email worker queue)
    req.log.info(
      `[NOTIFICATION] ${body.channel}/${body.type} -> user:${body.userId}`,
    );
    return reply.send({ queued: true });
  });
}
