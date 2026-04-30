-- Better Auth : User peut être créé sans passwordHash (hash sur Account) ; profil par défaut yunicitizen.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "profileType" SET DEFAULT 'yunicitizen'::"ProfileType";
