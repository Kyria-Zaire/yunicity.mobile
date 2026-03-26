import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  SERVICE_NAME: z.string().default('worker'),

  // Redis
  REDIS_URL: z.string().default('redis://:changeme_local@redis:6379'),

  // Inter-services
  USER_SERVICE_URL: z.string().url().default('http://user-service:3002'),
  NOTIFICATION_SERVICE_URL: z
    .string()
    .url()
    .default('http://notification-service:3006'),

  // Admin key for internal calls
  ADMIN_API_KEY: z.string().min(32, 'ADMIN_API_KEY requis'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Variables d'environnement invalides (worker):");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
