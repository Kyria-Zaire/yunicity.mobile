import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CrmService } from '../services/crm.service.js';
import type { PartnerStatus } from '../models/Partner.model.js';

const createPartnerSchema = z
  .object({
    userId: z.string().min(1).optional(),
    companyName: z.string().min(1).max(255).optional(),
    siret: z.string().regex(/^\d{14}$/, 'SIRET doit contenir 14 chiffres').optional(),
    contactEmail: z.string().email().max(255),
    contactPhone: z
      .string()
      .regex(/^\+[1-9]\d{7,14}$/, 'Format E.164 requis')
      .optional(),
    tier: z.enum(['standard', 'premium']).optional(),
    /** Waitlist landing beta */
    source: z.enum(['inscription', 'referral', 'cold_outreach', 'event']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source === 'inscription') return;
    if (!data.userId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'userId requis',
        path: ['userId'],
      });
    }
    if (!data.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'companyName requis',
        path: ['companyName'],
      });
    }
  });

const updateStatusSchema = z.object({
  status: z.enum([
    'lead',
    'contacted',
    'negotiating',
    'active',
    'paused',
    'churned',
  ]),
});

const pipelineQuerySchema = z.object({
  status: z
    .enum(['lead', 'contacted', 'negotiating', 'active', 'paused', 'churned'])
    .optional(),
  tier: z.enum(['standard', 'premium']).optional(),
});

export async function crmRoutes(app: FastifyInstance): Promise<void> {
  // POST /crm/partners — Creer un partenaire
  app.post('/crm/partners', async (req, reply) => {
    const body = createPartnerSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ errors: body.error.flatten() });
    }

    const result = await CrmService.createPartner(body.data);
    if (!result.ok) {
      return reply
        .status(result.statusCode)
        .send({ code: result.code, message: result.message });
    }

    return reply.status(201).send(result.data);
  });

  // GET /crm/pipeline — Pipeline partenaires
  app.get('/crm/pipeline', async (req, reply) => {
    const query = pipelineQuerySchema.safeParse(req.query);
    if (!query.success) {
      return reply.status(400).send({ errors: query.error.flatten() });
    }

    const partners = await CrmService.getPipeline(query.data);
    return reply.send({ partners });
  });

  // GET /crm/stats — Statistiques CRM
  app.get('/crm/stats', async (_req, reply) => {
    const stats = await CrmService.getStats();
    return reply.send(stats);
  });

  // PATCH /crm/partners/:id/status — Changer le statut
  app.patch<{ Params: { id: string } }>(
    '/crm/partners/:id/status',
    async (req, reply) => {
      const body = updateStatusSchema.safeParse(req.body);
      if (!body.success) {
        return reply.status(400).send({ errors: body.error.flatten() });
      }

      const result = await CrmService.updateStatus(
        req.params.id,
        body.data.status as PartnerStatus,
      );

      if (!result.ok) {
        return reply
          .status(result.statusCode)
          .send({ code: result.code, message: result.message });
      }

      return reply.send(result.data);
    },
  );
}
