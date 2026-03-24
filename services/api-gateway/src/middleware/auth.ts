import type { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      profileType: string;
      verificationStatus: string;
    };
  }
}

/**
 * Middleware d'authentification — à utiliser avec preHandler sur les routes protégées.
 * Implémentation complète JWT arrivera en S1 avec Better Auth.
 * Pour S0 : stub qui laisse passer en dev, bloque en prod sans token.
 */
export async function requireAuth(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    await reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
    return;
  }

  // TODO(S1): Implémenter la validation JWT Better Auth ici
  // Pour S0 : stub minimal
  req.user = {
    id: 'stub-user-id',
    email: 'stub@yunicity.fr',
    profileType: 'yunicitizen',
    verificationStatus: 'verified',
  };
}

/**
 * Middleware vérification profil — logique différenciée par profileType.
 * Yunicitizen vérifié par OTP → accès complet
 * Yunicitizen non vérifié → accès lecture seule (pas bloqué sur routes de base)
 * Profils pros non vérifiés → features sociales bloquées (KYC requis)
 */
export async function requireVerified(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!req.user) {
    await reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
    return;
  }

  // Vérifié → accès autorisé
  if (req.user.verificationStatus === 'verified') {
    return;
  }

  // Profils pros non vérifiés → features sociales bloquées
  // mais dashboard/upload KYC restent accessibles (géré au niveau routes)
  if (req.user.profileType !== 'yunicitizen') {
    await reply.status(403).send({
      code: 'VERIFICATION_REQUIRED',
      message:
        'Votre profil professionnel est en cours de vérification.',
      nextStep: 'kyc_upload',
    });
    return;
  }

  // Yunicitizen avec email non encore vérifié → accès limité (lecture)
  // On ne bloque pas — on laisse passer avec un flag dans le header
  reply.header(
    'X-Verification-Status',
    req.user.verificationStatus,
  );
}
