import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MapService } from '../services/map.service.js';

const mapQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(10000).default(2000),
  city: z.string().min(2),
  types: z.string().optional(),
});

export async function mapRoutes(app: FastifyInstance): Promise<void> {
  // GET /map/data?lat=49.25&lng=4.03&radius=2000&city=reims
  app.get('/map/data', async (req, reply) => {
    const parsed = mapQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const { lat, lng, radius, city, types } = parsed.data;
    const result = await MapService.getMapData({
      lat,
      lng,
      radius,
      city: city.toLowerCase(),
      types: types?.split(',').filter(Boolean),
    });

    return reply.send(result);
  });

  // GET /map/actors — acteurs seuls
  app.get('/map/actors', async (req, reply) => {
    const parsed = mapQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        errors: parsed.error.flatten(),
      });
    }

    const { lat, lng, radius, types } = parsed.data;
    const actors = await MapService.getActorsNearby({
      lat,
      lng,
      radius,
      types: types?.split(','),
    });
    return reply.send({ items: actors, count: actors.length });
  });
}
