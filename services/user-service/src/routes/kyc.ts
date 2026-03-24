import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { KycService, type KycDocType } from '../services/kyc.service.js';
import { env } from '../config/env.js';

function assertKycUser(
  req: { params: { id: string }; headers: Record<string, string | string[] | undefined> },
  reply: { status: (n: number) => { send: (b: unknown) => void } },
): boolean {
  const userId = req.headers['x-user-id'] as string | undefined;
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  if (adminKey && adminKey === env.ADMIN_API_KEY) return true;
  if (!userId || req.params.id !== userId) {
    reply.status(403).send({ code: 'FORBIDDEN' });
    return false;
  }
  return true;
}

export async function kycRoutes(app: FastifyInstance): Promise<void> {
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
      files: 1, // Un fichier par requête
    },
  });

  // POST /users/:id/kyc/upload
  app.post<{ Params: { id: string }; Querystring: { docType: string } }>(
    '/users/:id/kyc/upload',
    async (req, reply) => {
      const userId = req.params.id;
      const docType = (req.query.docType ?? 'other') as KycDocType;

      const file = await req.file();
      if (!file) {
        return reply
          .status(400)
          .send({ code: 'NO_FILE', message: 'Aucun fichier fourni' });
      }

      const buffer = await file.toBuffer();
      const mimeType = file.mimetype;

      const result = await KycService.uploadDocument({
        userId,
        docType,
        buffer,
        mimeType,
      });

      if (!result.ok) {
        return reply
          .status(400)
          .send({ code: result.code, message: result.message });
      }

      req.log.info(
        { userId, docType },
        '[AUDIT] KYC document uploaded',
      );
      return reply.status(201).send({
        message: 'Document reçu — en cours de vérification',
      });
    },
  );

  // POST /users/:id/kyc/verify-siret
  app.post<{
    Params: { id: string };
    Body: { siret: string };
  }>('/users/:id/kyc/verify-siret', async (req, reply) => {
    if (!assertKycUser(req, reply)) return;

    const { siret } = req.body as { siret?: string };
    if (!siret) {
      return reply
        .status(400)
        .send({ code: 'MISSING_SIRET', message: 'SIRET requis' });
    }

    const result = await KycService.verifySiretAuto({
      userId: req.params.id,
      siret,
    });

    if (!result.ok) {
      return reply
        .status(400)
        .send({ code: result.code, message: result.message });
    }

    return reply.send({
      verified: true,
      autoVerified: result.autoVerified,
      businessName: result.businessName,
    });
  });
}
