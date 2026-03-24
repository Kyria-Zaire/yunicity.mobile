import { prisma } from '@yunicity/database';

export async function seedPartners(
  userIds: Map<string, string>,
): Promise<void> {
  const existing = await prisma.partner.count();
  if (existing > 0) {
    console.log(`  >> Partenaires (${existing} deja existants)`);
    return;
  }

  const partners = [
    // Actifs
    {
      email: 'jazz.parvis@test.fr',
      businessName: 'Jazz au Parvis',
      contactName: 'Pierre Duval',
      profileType: 'association',
      status: 'active',
      tier: 'premium',
      annualValue: 2000,
    },
    {
      email: 'boulangerie@test.fr',
      businessName: 'Boulangerie du Marche',
      contactName: 'Marie Leroy',
      profileType: 'commercial',
      status: 'active',
      tier: 'premium',
      annualValue: 1000,
    },

    // Negotiating
    {
      email: 'restaurant.cellier@test.fr',
      businessName: 'Le Cellier',
      contactName: 'Jean Cellier',
      profileType: 'commercial',
      status: 'negotiating',
      tier: 'standard',
      annualValue: 0,
    },
    {
      email: 'studio.photo@test.fr',
      businessName: 'Studio Photo Remois',
      contactName: 'Claire Photo',
      profileType: 'commercial',
      status: 'negotiating',
      tier: 'standard',
      annualValue: 0,
    },

    // Contacted
    {
      email: 'librairie.bulle@test.fr',
      businessName: 'Librairie La Bulle',
      contactName: 'Isabelle Bulle',
      profileType: 'commercial',
      status: 'contacted',
      tier: 'standard',
      annualValue: 0,
    },
    {
      email: 'cyclistes.reims@test.fr',
      businessName: 'Cyclistes de Reims',
      contactName: 'Luc Velo',
      profileType: 'association',
      status: 'contacted',
      tier: 'standard',
      annualValue: 0,
    },

    // Leads
    {
      email: 'coach.sport@test.fr',
      businessName: 'Kevin Coach Sport',
      contactName: 'Kevin Coach',
      profileType: 'freelance',
      status: 'lead',
      tier: 'standard',
      annualValue: 0,
    },
    {
      email: 'graphiste@test.fr',
      businessName: 'Nina Design Studio',
      contactName: 'Nina Graphiste',
      profileType: 'freelance',
      status: 'lead',
      tier: 'standard',
      annualValue: 0,
    },
  ] as const;

  for (const p of partners) {
    const userId = userIds.get(p.email) ?? null;
    await prisma.partner.create({
      data: {
        userId,
        businessName: p.businessName,
        contactName: p.contactName,
        email: p.email,
        city: 'reims',
        profileType: p.profileType as 'commercial' | 'association' | 'freelance' | 'ecole',
        status: p.status as 'lead' | 'contacted' | 'negotiating' | 'active' | 'churned' | 'paused',
        tier: p.tier as 'standard' | 'premium',
        annualValue: p.annualValue,
        isActive: true,
        contractSignedAt: p.status === 'active' ? new Date() : null,
      },
    });
  }

  console.log(`  + ${partners.length} partenaires crees`);
}
