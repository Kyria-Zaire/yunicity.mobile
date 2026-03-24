import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  PORT: z.coerce.number().default(3005),
  SERVICE_NAME: z.string().default('payment-service'),

  // Stripe — optionnel en dev (simulation si absent)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // URLs
  USER_SERVICE_URL: z.string().url().default('http://user-service:3002'),
  WEB_URL: z.string().url().default('http://localhost:3010'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3010'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "❌ Variables d'environnement invalides (payment-service):",
  );
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

