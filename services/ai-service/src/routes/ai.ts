import type { FastifyInstance } from 'fastify';
import { RecommendationService } from '../services/recommendation.service.js';

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  // GET /ai/recommendations?userId=xxx&city=reims&limit=5
  app.get('/ai/recommendations', async (req, reply) => {
    const q = req.query as Record<string, string>;
    const userId = q['userId'];
    const city = q['city']?.toLowerCase() ?? 'reims';

    if (!userId) {
      return reply
        .status(400)
        .send({ code: 'MISSING_USER_ID', message: 'userId requis' });
    }

    const result = await RecommendationService.getRecommendations({
      userId,
      city,
      limit: q['limit'] ? Math.min(Number(q['limit']), 20) : 5,
    });

    return reply.send(result);
  });

  // GET /ai/recommendations/city/:city — Recommandations sans userId (homepage)
  app.get<{ Params: { city: string } }>(
    '/ai/recommendations/city/:city',
    async (req, reply) => {
      const result =
        await RecommendationService.getGeographicFallback(
          req.params.city.toLowerCase(),
        );
      return reply.send(result);
    },
  );

  // GET /ai/health — Etat de la connexion Yuni AI
  app.get('/ai/health', async (_req, reply) => {
    const yuniAiStatus = process.env['YUNI_AI_URL']
      ? 'configured (not tested)'
      : 'not configured (using fallback)';

    return reply.send({
      status: 'ok',
      service: 'ai-service',
      yuniAiUrl: process.env['YUNI_AI_URL'] ?? null,
      yuniAiStatus,
      timestamp: new Date().toISOString(),
    });
  });
}
