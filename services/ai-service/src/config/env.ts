import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  PORT: z.coerce.number().default(3009),
  SERVICE_NAME: z.string().default('ai-service'),

  // Yuni AI — microservice externe (optionnel — branche plus tard)
  YUNI_AI_URL: z.string().url().optional(),

  // Services internes
  USER_SERVICE_URL: z.string().url().default('http://user-service:3002'),
  COMMUNITY_SERVICE_URL: z
    .string()
    .url()
    .default('http://community-service:3003'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3010'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    'Env invalides (ai-service):',
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
