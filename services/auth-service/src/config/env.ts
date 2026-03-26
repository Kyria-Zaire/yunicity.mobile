import dotenv from 'dotenv';
import { z } from 'zod';

// Charge l'env local en dev (pnpm dev)
dotenv.config({ path: '.env.local' });
dotenv.config();

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  SERVICE_NAME: z.string().default('auth-service'),

  // PostgreSQL
  DATABASE_URL: z.string().min(10),

  // Redis
  REDIS_URL: z.string().min(10, 'REDIS_URL requis'),

  // Auth secrets
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET doit faire au moins 32 caractères'),

  // CORS (origines autorisées, séparées par virgule)
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3010'),

  // Twilio (OTP SMS) — optionnel en dev
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),

  // Resend (emails) — optionnel en dev
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@yunicity.fr'),

  // App URLs
  WEB_URL: z.string().url().default('http://localhost:3010'),

  /** CSV — noms autorisés pour X-Internal-Service sur /internal/* */
  INTERNAL_SERVICE_NAMES: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Variables d'environnement invalides (auth-service):");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
