import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  PORT: z.coerce.number().default(3007),
  SERVICE_NAME: z.string().default('moderation-service'),

  // PostgreSQL
  DATABASE_URL: z.string().min(10),

  // Redis
  REDIS_URL: z.string().default('redis://:changeme_local@redis:6379'),

  // Auth
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET doit faire au moins 32 caracteres'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3010'),

  // OpenAI — optionnel en dev (stub si absent)
  OPENAI_API_KEY: z.string().optional(),

  // Community service
  COMMUNITY_SERVICE_URL: z
    .string()
    .url()
    .default('http://community-service:3003'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Variables d'environnement invalides (moderation-service):");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
