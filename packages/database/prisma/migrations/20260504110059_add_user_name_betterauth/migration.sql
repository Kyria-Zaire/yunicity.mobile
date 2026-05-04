-- Better Auth requires a "name" column on "User". The Prisma schema declares it (line 81)
-- but no prior migration added it to the DB, causing INSERT failures during sign-up.
ALTER TABLE "User" ADD COLUMN "name" TEXT;
