import argon2 from 'argon2';
import { prisma, type Prisma } from '@yunicity/database';

export const SEED_USERS = [
  // Yunicitizens (8)
  { email: 'lea.martin@test.fr', name: 'Lea Martin', profileType: 'yunicitizen', quartier: 'Croix-Rouge', points: 340 },
  { email: 'marc.dupont@test.fr', name: 'Marc Dupont', profileType: 'yunicitizen', quartier: 'Centre-ville', points: 120 },
  { email: 'sophie.klein@test.fr', name: 'Sophie K.', profileType: 'yunicitizen', quartier: 'Clairmarais', points: 780 },
  { email: 'thomas.bernard@test.fr', name: 'Thomas Bernard', profileType: 'yunicitizen', quartier: 'Maison-Blanche', points: 55 },
  { email: 'camille.roy@test.fr', name: 'Camille Roy', profileType: 'yunicitizen', quartier: 'Orgeval', points: 210 },
  { email: 'paul.leblanc@test.fr', name: 'Paul Leblanc', profileType: 'yunicitizen', quartier: 'Europe', points: 90 },
  { email: 'marie.petit@test.fr', name: 'Marie Petit', profileType: 'yunicitizen', quartier: 'Wilson', points: 440 },
  { email: 'julien.moreau@test.fr', name: 'Julien Moreau', profileType: 'yunicitizen', quartier: 'Chatillons', points: 175 },

  // Commerciaux (4)
  { email: 'boulangerie@test.fr', name: 'Boulangerie du Marche', profileType: 'commercial', siret: '35299999300037', points: 890 },
  { email: 'restaurant.cellier@test.fr', name: 'Le Cellier', profileType: 'commercial', siret: '35299999300038', points: 650 },
  { email: 'studio.photo@test.fr', name: 'Studio Photo Remois', profileType: 'commercial', siret: '35299999300039', points: 320 },
  { email: 'librairie.bulle@test.fr', name: 'Librairie La Bulle', profileType: 'commercial', siret: '35299999300040', points: 490 },

  // Associations (3)
  { email: 'jazz.parvis@test.fr', name: 'Jazz au Parvis', profileType: 'association', rna: 'W512345678', points: 1240 },
  { email: 'cyclistes.reims@test.fr', name: 'Cyclistes de Reims', profileType: 'association', rna: 'W512345679', points: 560 },
  { email: 'potagers.urbains@test.fr', name: 'Potagers Urbains Reims', profileType: 'association', rna: 'W512345680', points: 290 },

  // Freelances (3)
  { email: 'web.dev@test.fr', name: 'Alexandre Dev', profileType: 'freelance', siret: '35299999300041', points: 180 },
  { email: 'graphiste@test.fr', name: 'Nina Graphiste', profileType: 'freelance', siret: '35299999300042', points: 95 },
  { email: 'coach.sport@test.fr', name: 'Kevin Coach', profileType: 'freelance', siret: '35299999300043', points: 230 },

  // Ecoles (2)
  { email: 'ecole.arts@test.fr', name: 'Ecole des Arts de Reims', profileType: 'ecole', uai: '0511234A', points: 145 },
  { email: 'lycee.clemenceau@test.fr', name: 'Lycee Clemenceau', profileType: 'ecole', uai: '0511235B', points: 88 },
] as const;

function getLevelForPoints(pts: number): number {
  if (pts >= 3000) return 6;
  if (pts >= 1500) return 5;
  if (pts >= 700) return 4;
  if (pts >= 300) return 3;
  if (pts >= 100) return 2;
  return 1;
}

function getBadgesForPoints(pts: number): string[] {
  const badges: string[] = ['pionnier'];
  if (pts >= 100) badges.push('premier_pas');
  if (pts >= 500) badges.push('connecteur');
  if (pts >= 1500) badges.push('ambassadeur');
  if (pts >= 3000) badges.push('triple_a');
  return badges;
}

export async function seedUsers(): Promise<Map<string, string>> {
  const passwordHash = await argon2.hash('TestYunicity2026!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const emailToId = new Map<string, string>();

  for (const u of SEED_USERS) {
    const existing = await prisma.user.findFirst({
      where: { email: u.email },
      select: { id: true },
    });
    if (existing) {
      emailToId.set(u.email, existing.id);
      console.log(`  >> ${u.email} (deja existant)`);
      continue;
    }

    const record = u as Record<string, unknown>;

    const profileData: Record<string, unknown> = {
      displayName: u.name,
      ...('siret' in u ? { siret: record['siret'] } : {}),
      ...('rna' in u ? { rna: record['rna'] } : {}),
      ...('uai' in u ? { uai: record['uai'] } : {}),
      ...('quartier' in u ? { quartier: record['quartier'] } : {}),
    };

    const created = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        profileType: u.profileType as 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole',
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        autoVerified: true,
        emailVerified: true,
        city: 'reims',
        quartier: (record['quartier'] as string) ?? 'Centre-ville',
        cp: '51100',
        lng: 4.0317 + (Math.random() - 0.5) * 0.04,
        lat: 49.2583 + (Math.random() - 0.5) * 0.03,
        profileData: profileData as Prisma.InputJsonValue,
        points: u.points,
        level: getLevelForPoints(u.points),
        badges: getBadgesForPoints(u.points),
        ambassadorLabel: u.points >= 3000 ? 'Triple A' : null,
        plan: 'free',
        consentRgpd: true,
        consentRgpdDate: new Date(),
        consentMarketing: false,
        consentAnalytics: false,
        isActive: true,
      },
      select: { id: true },
    });

    emailToId.set(u.email, created.id);
    console.log(`  + ${u.email} (${u.profileType}) - ${u.points} pts`);
  }

  return emailToId;
}
