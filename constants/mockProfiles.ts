export type ProfileKind = 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Habitant',
  2: 'Citoyen',
  3: 'Acteur',
  4: 'Ambassadeur',
  5: 'Triple A',
};

export const PROFILE_COLORS: Record<ProfileKind, string> = {
  yunicitizen: '#2A2FFF',
  commercial: '#16A34A',
  association: '#D97706',
  freelance: '#7C3AED',
  ecole: '#DC2626',
};

type Yuni = {
  id: string;
  type: 'yunicitizen';
  name: string;
  quartier: string;
  points: number;
  level: number;
  bio: string;
  badges: string[];
  verified: boolean;
};

type Comm = {
  id: string;
  type: 'commercial';
  name: string;
  address: string;
  category: string;
  points: number;
  verified: boolean;
};

type Asso = {
  id: string;
  type: 'association';
  name: string;
  rna: string;
  points: number;
  bio: string;
  verified: boolean;
};

type Free = {
  id: string;
  type: 'freelance';
  name: string;
  specialty: string;
  points: number;
  bio: string;
  verified: boolean;
};

type Ecole = {
  id: string;
  type: 'ecole';
  name: string;
  uai: string;
  points: number;
  bio: string;
  verified: boolean;
};

export type MockProfile = Yuni | Comm | Asso | Free | Ecole;

export const MOCK_PROFILES: MockProfile[] = [
  {
    id: 'u1',
    type: 'yunicitizen',
    name: 'Léa Martin',
    quartier: 'Croix-Rouge',
    points: 340,
    level: 3,
    bio: 'Passionnée de vélo urbain',
    badges: ['pionnier', 'connecteur'],
    verified: true,
  },
  {
    id: 'u2',
    type: 'yunicitizen',
    name: 'Thomas Dubois',
    quartier: 'Clairmarais',
    points: 120,
    level: 2,
    bio: 'Fan de jazz local',
    badges: ['pionnier'],
    verified: true,
  },
  {
    id: 'u3',
    type: 'yunicitizen',
    name: 'Emma Petit',
    quartier: 'Centre',
    points: 780,
    level: 4,
    bio: 'Photographe amateur',
    badges: ['pionnier', 'ambassadeur'],
    verified: true,
  },
  {
    id: 'u4',
    type: 'yunicitizen',
    name: 'Lucas Bernard',
    quartier: 'Épernay',
    points: 45,
    level: 1,
    bio: 'Nouveau sur Reims',
    badges: [],
    verified: false,
  },
  {
    id: 'u5',
    type: 'yunicitizen',
    name: 'Sarah Cohen',
    quartier: 'Jean-Jaurès',
    points: 560,
    level: 4,
    bio: 'Militante écolo',
    badges: ['pionnier', 'vert'],
    verified: true,
  },
  { id: 'c1', type: 'commercial', name: 'Boulangerie du Marché', address: '12 Place du Marché', category: 'Boulangerie', points: 890, verified: true },
  { id: 'c2', type: 'commercial', name: 'Belga Queen', address: "Place d'Erlon", category: 'Restaurant', points: 1240, verified: true },
  { id: 'c3', type: 'commercial', name: 'Eat Night', address: 'Rue Colbert', category: 'Restauration Rapide', points: 450, verified: true },
  { id: 'c4', type: 'commercial', name: 'Ao Barber', address: 'Centre-ville', category: 'Bien-être', points: 320, verified: true },
  { id: 'c5', type: 'commercial', name: 'Cave des Sacres', address: 'Rue de Mars', category: 'Cave à vins', points: 670, verified: true },
  { id: 'c6', type: 'commercial', name: 'Yoga Reims', address: 'Rue Carnot', category: 'Sport & Bien-être', points: 210, verified: true },
  { id: 'c7', type: 'commercial', name: 'Bio Market', address: 'Rue de Vesle', category: 'Alimentation Bio', points: 380, verified: true },
  { id: 'c8', type: 'commercial', name: 'Studio 51', address: 'Boulevard Lundy', category: 'Photo & Vidéo', points: 290, verified: true },
  {
    id: 'a1',
    type: 'association',
    name: 'Jazz au Parvis',
    rna: 'W512345678',
    points: 1240,
    bio: 'Jazz & musique improvisée',
    verified: true,
  },
  {
    id: 'a2',
    type: 'association',
    name: 'Cyclistes de Reims',
    rna: 'W512345679',
    points: 890,
    bio: 'Mobilité douce en ville',
    verified: true,
  },
  {
    id: 'a3',
    type: 'association',
    name: 'Repair Café Reims',
    rna: 'W512345680',
    points: 340,
    bio: 'Réparer plutôt que jeter',
    verified: true,
  },
  {
    id: 'a4',
    type: 'association',
    name: 'Reims Accueil',
    rna: 'W512345681',
    points: 560,
    bio: 'Accueil des nouveaux arrivants',
    verified: true,
  },
  {
    id: 'a5',
    type: 'association',
    name: 'Les Jardins Partagés',
    rna: 'W512345682',
    points: 230,
    bio: 'Jardins collectifs urbains',
    verified: true,
  },
  {
    id: 'f1',
    type: 'freelance',
    name: 'Studio Photo Rémois',
    specialty: 'Photographie',
    points: 320,
    bio: 'Portraits & événements',
    verified: true,
  },
  {
    id: 'f2',
    type: 'freelance',
    name: 'Dev & Co',
    specialty: 'Développement web',
    points: 180,
    bio: 'Sites & applis pour TPE',
    verified: true,
  },
  {
    id: 'f3',
    type: 'freelance',
    name: 'Marie Design',
    specialty: 'Graphisme',
    points: 420,
    bio: 'Identité visuelle & print',
    verified: true,
  },
  {
    id: 'f4',
    type: 'freelance',
    name: 'Traducteur Pro',
    specialty: 'Traduction',
    points: 95,
    bio: 'FR/EN/ES professionnel',
    verified: true,
  },
  {
    id: 'e1',
    type: 'ecole',
    name: 'École des Arts de Reims',
    uai: '0511234A',
    points: 145,
    bio: 'Arts plastiques & design',
    verified: true,
  },
  {
    id: 'e2',
    type: 'ecole',
    name: 'CFA Reims',
    uai: '0511234B',
    points: 280,
    bio: 'Formation professionnelle',
    verified: true,
  },
  {
    id: 'e3',
    type: 'ecole',
    name: 'Lycée Roosevelt',
    uai: '0511234C',
    points: 190,
    bio: 'Enseignement général',
    verified: true,
  },
];

export function getProfileById(id: string): MockProfile | undefined {
  return MOCK_PROFILES.find((p) => p.id === id);
}

export function profileDisplayName(p: MockProfile): string {
  return p.name;
}

export function rankingProfiles(): MockProfile[] {
  return [...MOCK_PROFILES].sort((a, b) => b.points - a.points);
}
