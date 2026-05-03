import { z } from 'zod';

/**
 * Variables sans défaut (obligatoires en prod / Railway) :
 * - REDIS_URL : URL complète redis:// ou rediss:// (BullMQ).
 */
const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  SERVICE_NAME: z.string().default('worker'),

  REDIS_URL: z
    .string()
    .min(1)
    .url('REDIS_URL doit être une URL redis complète (redis://… ou rediss://…)'),

  USER_SERVICE_URL: z.string().url().default('http://user-service:3002'),
  NOTIFICATION_SERVICE_URL: z
    .string()
    .url()
    .default('http://notification-service:3006'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Variables d'environnement invalides (worker).");
  console.error(
    'Requis sans valeur par défaut : REDIS_URL (variable Railway / fichier .env).',
  );
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
