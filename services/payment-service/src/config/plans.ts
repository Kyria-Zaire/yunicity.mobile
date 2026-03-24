export const PLANS = {
  PREMIUM: {
    id: 'premium',
    name: 'Yunicity Premium',
    price: 499,
    currency: 'eur',
    interval: 'month' as const,
    trialDays: 7,
    features: [
      'Accès étendu aux tribus',
      'Suppression de la publicité',
      'Badge Premium exclusif',
      'Statistiques de profil avancées',
      'Priorité dans les recherches locales',
    ],
  },
  PACK_COMMERCIAL: {
    id: 'pack_commercial',
    name: 'Pack Commerçants Yunicity',
    price: 2000,
    currency: 'eur',
    interval: 'month' as const,
    trialDays: 0,
    features: [
      'Mise en avant locale',
      'Campagnes digitales ciblées',
      'Programme de fidélité intégré',
      'Événements exclusifs',
      'Statistiques de visibilité',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

