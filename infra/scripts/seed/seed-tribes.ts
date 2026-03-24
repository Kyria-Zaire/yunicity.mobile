import { prisma } from '@yunicity/database';

const SEED_TRIBES = [
  {
    name: 'Cyclistes de Reims',
    slug: 'cyclistes-de-reims',
    description: 'Passionnes de velo urbain, balades et veloroutes autour de Reims. Sorties tous les dimanches matin.',
    category: 'sport',
    city: 'reims',
    membersCount: 23,
    isVerified: true,
    tags: ['velo', 'sport', 'balade', 'ecologie'],
  },
  {
    name: 'Jazz au Parvis',
    slug: 'jazz-au-parvis',
    description: 'Amateurs de jazz, concerts et improvisation a Reims. On se retrouve au Parvis chaque vendredi soir.',
    category: 'culture',
    city: 'reims',
    membersCount: 47,
    isVerified: true,
    tags: ['jazz', 'musique', 'concert', 'culture'],
  },
  {
    name: 'Entrepreneurs Reims',
    slug: 'entrepreneurs-reims',
    description: "Reseau d'entrepreneurs locaux. Afterworks mensuels, partage d'experiences et opportunites de collaboration.",
    category: 'business',
    city: 'reims',
    membersCount: 31,
    isVerified: false,
    tags: ['business', 'startup', 'reseau', 'entrepreneur'],
  },
  {
    name: 'Potagers Urbains',
    slug: 'potagers-urbains-reims',
    description: 'Jardinage urbain, permaculture et compostage collectif. Partageons nos recoltes et savoirs faire.',
    category: 'ecology',
    city: 'reims',
    membersCount: 18,
    isVerified: false,
    tags: ['jardin', 'permaculture', 'ecologie', 'nature'],
  },
  {
    name: 'Parents Croix-Rouge',
    slug: 'parents-croix-rouge',
    description: "Entraide et partage entre parents du quartier Croix-Rouge. Garde d'enfants, bons plans ecole, sorties.",
    category: 'social',
    city: 'reims',
    membersCount: 62,
    isVerified: true,
    tags: ['parents', 'enfants', 'quartier', 'entraide'],
  },
  {
    name: 'Dev Reims',
    slug: 'dev-reims',
    description: 'Developpeurs, designers et makers de la region remoise. Meetups mensuels et hackathons.',
    category: 'tech',
    city: 'reims',
    membersCount: 29,
    isVerified: false,
    tags: ['tech', 'code', 'design', 'maker'],
  },
  {
    name: 'Patrimoine Remois',
    slug: 'patrimoine-remois',
    description: "Passionnes d'histoire et de patrimoine local. Visites guidees, conferences et decouvertes cachees de Reims.",
    category: 'culture',
    city: 'reims',
    membersCount: 34,
    isVerified: true,
    tags: ['patrimoine', 'histoire', 'architecture', 'reims'],
  },
  {
    name: 'Running Club Reims',
    slug: 'running-club-reims',
    description: 'Coureurs de tous niveaux bienvenus ! Sorties 3 fois par semaine, de 5km a semi-marathon.',
    category: 'sport',
    city: 'reims',
    membersCount: 41,
    isVerified: false,
    tags: ['running', 'course', 'sport', 'sante'],
  },
];

export async function seedTribes(
  userIds: Map<string, string>,
): Promise<Map<string, string>> {
  const tribeIds = new Map<string, string>();
  const allIds = [...userIds.values()];

  for (const t of SEED_TRIBES) {
    const existing = await prisma.tribe.findFirst({
      where: { slug: t.slug, city: 'reims' },
      select: { id: true },
    });
    if (existing) {
      tribeIds.set(t.slug, existing.id);
      console.log(`  >> ${t.name} (deja existante)`);
      continue;
    }

    const memberCount = Math.min(t.membersCount, allIds.length);
    const shuffled = [...allIds].sort(() => Math.random() - 0.5);
    const memberUserIds = shuffled.slice(0, memberCount);
    const creatorId = memberUserIds[0] ?? allIds[0] ?? 'seed';

    const created = await prisma.tribe.create({
      data: {
        name: t.name,
        slug: t.slug,
        description: t.description,
        category: t.category as 'sport' | 'culture' | 'business' | 'ecology' | 'social' | 'tech' | 'other',
        city: t.city,
        creatorId,
        membersCount: memberCount,
        isVerified: t.isVerified,
        isPublic: true,
        isActive: true,
        tags: t.tags,
        lng: 4.0317 + (Math.random() - 0.5) * 0.06,
        lat: 49.2583 + (Math.random() - 0.5) * 0.04,
        members: {
          create: memberUserIds.map((userId) => ({ userId })),
        },
      },
      select: { id: true },
    });

    tribeIds.set(t.slug, created.id);
    console.log(`  + ${t.name} (${memberCount} membres)`);
  }

  return tribeIds;
}
