import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3006),
  SERVICE_NAME: z.string().default('notification-service'),
  REDIS_URL: z.string().default('redis://:changeme_local@redis:6379'),
  // Optionnels en dev — simulation si absents
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@yunicity.fr'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
  WEB_URL: z.string().url().default('http://localhost:3010'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3010'),

  // Auth service (pour validation session WebSocket)
  AUTH_SERVICE_URL: z.string().url().default('http://auth-service:3001'),

  // VAPID — Web Push (optionnel en dev)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_CONTACT_EMAIL: z.string().email().default('push@yunicity.fr'),

  // PostgreSQL
  DATABASE_URL: z.string().min(10),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Env invalides (notification-service):');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
