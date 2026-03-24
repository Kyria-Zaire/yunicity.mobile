import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

export default fp(async (app: FastifyInstance) => {
  app.addHook('onRequest', async (req, reply) => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    req.id = requestId;
    // Ne PAS await reply.header() — FastifyReply est thenable en v5,
    // await provoquerait un deadlock (attend la fin de la réponse)
    reply.header('X-Request-ID', requestId);
  });
});
