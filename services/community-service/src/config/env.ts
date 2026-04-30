import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3003),
  SERVICE_NAME: z.string().default('community-service'),

  // PostgreSQL
  DATABASE_URL: z.string().min(10),

  // Redis
  REDIS_URL: z.string().min(10, 'REDIS_URL requis'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3010'),

  // Cloudflare R2 (media posts) — optionnel en dev
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('yunicity-media'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Variables d'environnement invalides (community-service):");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
