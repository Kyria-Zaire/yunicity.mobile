import type { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

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
 * Middleware d'authentification — valide la session via Better Auth (auth-service).
 * Vérifie le cookie de session httpOnly en appelant /auth/session/verify.
 */
export async function requireAuth(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const cookie = req.headers.cookie;

  if (!cookie || !cookie.includes('yunicity')) {
    await reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
    return;
  }

  try {
    const res = await fetch(
      `${env.AUTH_SERVICE_URL}/auth/session/verify`,
      {
        method: 'GET',
        headers: { cookie },
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!res.ok) {
      await reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: 'Session invalide ou expirée',
      });
      return;
    }

    const data = (await res.json()) as {
      user?: {
        id: string;
        email: string;
        profileType?: string;
        verificationStatus?: string;
      };
    };

    if (!data.user?.id) {
      await reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: 'Session invalide',
      });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      profileType: data.user.profileType ?? 'yunicitizen',
      verificationStatus: data.user.verificationStatus ?? 'pending',
    };
  } catch (err) {
    req.log.error({ err }, 'Auth service unreachable');
    await reply.status(503).send({
      code: 'AUTH_SERVICE_UNAVAILABLE',
      message: 'Service d\'authentification indisponible',
    });
  }
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
