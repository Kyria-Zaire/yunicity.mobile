import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3002),
  SERVICE_NAME: z.string().default('user-service'),

  // PostgreSQL
  DATABASE_URL: z.string().min(10),

  // Redis
  REDIS_URL: z.string().default('redis://:changeme_local@redis:6379'),

  // Auth
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET doit faire au moins 32 caractères'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3010'),

  // Cloudflare R2 (KYC docs) — optionnel en dev
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('yunicity-kyc-docs'),

  // Inter-services
  AUTH_SERVICE_URL: z.string().url().default('http://auth-service:3001'),
  /** Noms autorisés pour X-Internal-Service (CSV). Vide = liste par défaut. */
  INTERNAL_SERVICE_NAMES: z.string().optional(),

  // Admin
  ADMIN_API_KEY: z.string().min(32, 'ADMIN_API_KEY requis'),

  // ClamAV — optionnel en dev
  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.coerce.number().default(3310),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Variables d'environnement invalides (user-service):");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
