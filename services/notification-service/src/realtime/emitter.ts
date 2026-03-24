import type { FastifyInstance } from 'fastify';
import { emitToCity, emitToTribe, type YunicityEvent } from './socket.js';

export async function realtimeRoutes(app: FastifyInstance): Promise<void> {
  // POST /internal/emit — endpoint interne pour les autres services
  app.post('/internal/emit', async (req, reply) => {
    // Vérifier que c'est un appel interne
    const isInternal = req.headers['x-internal-service'];
    if (!isInternal) {
      return reply.status(403).send({ code: 'FORBIDDEN' });
    }

    const body = req.body as {
      event: string;
      city?: string | undefined;
      tribeId?: string | undefined;
      data: Record<string, unknown>;
    };

    if (body.tribeId) {
      emitToTribe(body.tribeId, body.event as YunicityEvent, body.data);
    } else if (body.city) {
      emitToCity(body.city, body.event as YunicityEvent, body.data);
    }

    return reply.send({ emitted: true });
  });
}
