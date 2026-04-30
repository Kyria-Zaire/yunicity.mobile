-- Avatar Better Auth + pas de changement SQL pour twoFactorEnabled (colonne existante `mfaEnabled`, mappée côté Prisma).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;
