import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { twoFactor } from 'better-auth/plugins';
import { prisma } from '@yunicity/database';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password.js';

function buildTrustedOrigins(): string[] {
  const fromCsv = (s: string) =>
    s
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  const origins = new Set<string>(fromCsv(env.CORS_ORIGINS));
  const publicAuthBase = env.BETTER_AUTH_BASE_URL ?? env.WEB_URL;
  origins.add(publicAuthBase);
  origins.add(env.WEB_URL);
  if (env.NODE_ENV !== 'production') {
    for (const o of [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'exp://localhost:8081',
      'exp://127.0.0.1:8081',
    ]) {
      origins.add(o);
    }
  }
  return [...origins];
}

const betterAuthBaseURL = env.BETTER_AUTH_BASE_URL ?? env.WEB_URL;

export const auth = betterAuth({
  // Adaptateur PostgreSQL via Prisma
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // URL « publique » des endpoints auth (doit coller à ce que voit le client, ex. gateway LAN)
  baseURL: betterAuthBaseURL,

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
    requireEmailVerification: false, // tests : OTP désactivé — remettre `env.NODE_ENV === 'production'` avant beta
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

  // Origines autorisées (cookies / CSRF Better Auth)
  trustedOrigins: buildTrustedOrigins(),

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
    // Dev : Expo / cookies + Referer atypiques — évite INVALID_ORIGIN (voir origin-check middleware Better Auth).
    // En prod, rester strict (disableOriginCheck absent / false).
    ...(env.NODE_ENV !== 'production' ? { disableOriginCheck: true as const } : {}),
  },
});

export type Auth = typeof auth;
