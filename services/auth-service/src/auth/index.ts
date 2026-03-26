import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { twoFactor } from 'better-auth/plugins';
import { prisma } from '@yunicity/database';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password.js';

export const auth = betterAuth({
  // Adaptateur PostgreSQL via Prisma
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // URL de base (pour les redirects email)
  baseURL: env.WEB_URL,

  // Clé secrète — min 32 chars, validée au démarrage
  secret: env.AUTH_SECRET,

  // Session — access token court, refresh long avec rotation
  session: {
    expiresIn: 60 * 15, // 15 minutes — access token
    updateAge: 60 * 5, // Refresh si < 5 min restantes
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  // Email + mot de passe
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // BLOQUANT — email doit être vérifié
    minPasswordLength: 12,
    maxPasswordLength: 128,
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) => verifyPassword(hash, password),
    },
    // Validation de force du mot de passe à l'inscription
    signUpValidator: (data: { password: string }) => {
      const result = validatePasswordStrength(data.password);
      if (!result.valid) {
        return { valid: false, message: result.errors.join(', ') };
      }
      return { valid: true };
    },
  },

  // Reset lockout on successful session creation
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await prisma.user.update({
            where: { id: session.userId },
            data: { loginAttempts: 0, lockedUntil: null },
          });
        },
      },
    },
  },

  // Plugins
  plugins: [
    twoFactor({
      issuer: 'Yunicity',
      backupCodesCount: 10,
    }),
  ],

  // Origines autorisées pour les cookies
  trustedOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),

  // Cookie httpOnly — JAMAIS de JWT en localStorage
  advanced: {
    cookiePrefix: 'yunicity',
    useSecureCookies: env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
      secure: env.NODE_ENV === 'production',
      path: '/',
    },
  },
});

export type Auth = typeof auth;
