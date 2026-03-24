import { z } from 'zod';

export const profileTypeSchema = z.enum([
  'yunicitizen',
  'commercial',
  'association',
  'freelance',
  'ecole',
]);

export const createUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(12).max(128),
  profileType: profileTypeSchema,
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .optional(),
  profileData: z.record(z.unknown()).default({}),
  consent: z.object({
    rgpd: z.literal(true, {
      errorMap: () => ({ message: 'RGPD requis' }),
    }),
    marketing: z.boolean().default(false),
    analytics: z.boolean().default(false),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const patchUserOnboardingSchema = z.object({
  quartier: z.string().min(1).max(100),
  interests: z.array(z.string().min(1).max(50)).max(5),
});
