export const POINTS = {
  INSCRIPTION: 50,
  PROFIL_VERIFIE: 100,
  PREMIER_POST: 20,
  POST_PUBLIE: 5,
  REACTION_RECUE: 2,
  REJOINDRE_TRIBU: 10,
  CREER_TRIBU: 30,
  PROFIL_COMPLETE: 25,
  PARRAINAGE: 50,
} as const;

export const LEVELS = [
  { level: 1, name: 'Découvreur', minPoints: 0 },
  { level: 2, name: 'Habitant', minPoints: 100 },
  { level: 3, name: 'Citoyen', minPoints: 300 },
  { level: 4, name: 'Acteur', minPoints: 700 },
  { level: 5, name: 'Ambassadeur', minPoints: 1500 },
  { level: 6, name: 'Triple A', minPoints: 3000 },
] as const;

export const BADGES = {
  PIONNIER: {
    id: 'pionnier',
    name: 'Pionnier',
    description: 'Parmi les 100 premiers inscrits',
    icon: '🌟',
  },
  PREMIER_PAS: {
    id: 'premier_pas',
    name: 'Premier pas',
    description: 'Premier post publié',
    icon: '👣',
  },
  CONNECTEUR: {
    id: 'connecteur',
    name: 'Connecteur',
    description: 'Membre de 5 tribus ou plus',
    icon: '🔗',
  },
  EXPLORATEUR: {
    id: 'explorateur',
    name: 'Explorateur',
    description: '10 acteurs visités sur la carte',
    icon: '🗺️',
  },
  AMBASSADEUR: {
    id: 'ambassadeur',
    name: 'Ambassadeur',
    description: 'Niveau 5 atteint',
    icon: '🏆',
  },
  TRIPLE_A: {
    id: 'triple_a',
    name: 'Triple A',
    description: 'Acteur, Ambassadeur, Accueillant',
    icon: '⭐',
  },
  COMMERCIAL_VERIFIE: {
    id: 'commercial_v',
    name: 'Acteur vérifié',
    description: 'Profil commercial vérifié',
    icon: '✅',
  },
  BATI_REIMS: {
    id: 'bati_reims',
    name: 'Bâtisseur de Reims',
    description: 'Créateur de tribu avec 20+ membres',
    icon: '🏗️',
  },
} as const;

export type BadgeId = keyof typeof BADGES;

export function getLevelForPoints(points: number): (typeof LEVELS)[number] {
  return [...LEVELS].reverse().find((l) => points >= l.minPoints) ?? LEVELS[0]!;
}

