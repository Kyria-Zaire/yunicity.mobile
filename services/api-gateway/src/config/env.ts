import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  SERVICE_NAME: z.string().default('api-gateway'),

  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),

  // Services internes (Docker network)
  AUTH_SERVICE_URL: z.string().url().default('http://auth-service:3001'),
  USER_SERVICE_URL: z.string().url().default('http://user-service:3002'),
  COMMUNITY_SERVICE_URL: z.string().url().default('http://community-service:3003'),
  MAP_SERVICE_URL: z.string().url().default('http://map-service:3004'),
  PAYMENT_SERVICE_URL: z.string().url().default('http://payment-service:3005'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://notification-service:3006'),
  MODERATION_SERVICE_URL: z.string().url().default('http://moderation-service:3007'),
  CRM_SERVICE_URL: z.string().url().default('http://crm-service:3008'),
  AI_SERVICE_URL: z.string().url().default('http://ai-service:3009'),

  // Infrastructure
  REDIS_URL: z.string().default('redis://:changeme_local@redis:6379'),

  // CORS — origines autorisées (séparées par virgule)
  // Inclut le front web Next en dev (3010) + autres clients
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3010,http://localhost:8081'),
});

// Fail fast au démarrage si une variable est manquante ou invalide
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  for (const [field, errors] of Object.entries(fieldErrors)) {
    for (const err of errors ?? []) {
      process.stderr.write(`ENV ERROR [${field}]: ${err}\n`);
    }
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
