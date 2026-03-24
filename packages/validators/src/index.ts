// ============================================================
// @yunicity/validators — Schemas Zod partagés Yunicity
// ============================================================

import { z } from 'zod';

// --- Profile Type ---

export const profileTypeSchema = z.enum([
  'yunicitizen',
  'commercial',
  'association',
  'freelance',
  'ecole',
]);

// --- Primitives ---

export const emailSchema = z
  .string()
  .email('Email invalide')
  .max(255, 'Email trop long')
  .transform((v) => v.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Format E.164 requis (ex: +33612345678)');

export const passwordSchema = z
  .string()
  .min(12, 'Mot de passe trop court (min 12 caractères)')
  .max(128, 'Mot de passe trop long (max 128 caractères)');

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'ObjectId invalide');

// --- Pagination ---

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// --- Re-export types ---

export type ProfileType = z.infer<typeof profileTypeSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
