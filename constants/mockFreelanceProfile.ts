export type FreelanceService = {
  id: string;
  title: string;
  desc: string;
  price: number;
  unit: string;
};

export type FreelanceSlot = {
  day: string;
  hours: string;
  available: boolean;
};

export type FreelanceReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
  color: string;
};

export type FreelanceProfileMock = {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileType: 'freelance';
  available: boolean;
  coverUrl: string;
  avatarColor: string;
  initials: string;
  photos: string[];
  services: FreelanceService[];
  slots: FreelanceSlot[];
  reviews: FreelanceReview[];
};

export type FreelanceProject = {
  id: string;
  title: string;
  category: string;
  client: string;
  imageUrl: string;
  description: string;
  tags: string[];
  year: string;
};

export const MOCK_FREELANCE_PROJECTS: FreelanceProject[] = [
  {
    id: 'p1',
    title: 'Identité visuelle Belga Queen',
    category: 'Branding',
    client: 'Belga Queen',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=800',
    description: "Refonte complète de l'identité visuelle du restaurant.",
    tags: ['Logo', 'Charte graphique', 'Print'],
    year: '2026',
  },
  {
    id: 'p2',
    title: 'Campagne Jazz au Parvis',
    category: 'Communication',
    client: 'Jazz au Parvis',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800',
    description: 'Affiches et visuels pour la saison jazz 2026.',
    tags: ['Affiche', 'Réseaux sociaux', 'Motion'],
    year: '2026',
  },
  {
    id: 'p3',
    title: 'Site web Cyclistes de Reims',
    category: 'Web Design',
    client: 'Association',
    imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=800',
    description: "Design et intégration du site de l'association.",
    tags: ['UI/UX', 'Figma', 'Web'],
    year: '2025',
  },
  {
    id: 'p4',
    title: 'App mobile startup locale',
    category: 'UI/UX',
    client: 'Startup Reims',
    imageUrl: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=800',
    description: 'Conception UX et prototype interactif.',
    tags: ['Figma', 'Prototype', 'Mobile'],
    year: '2025',
  },
];

export const MOCK_FREELANCE_PROFILE: FreelanceProfileMock = {
  id: 'f3',
  name: 'Marie Design',
  specialty: 'Design & Identité visuelle',
  address: 'Rue de Vesle, 51100 Reims',
  phone: '+33 6 XX XX XX XX',
  website: 'marie-design.fr',
  description:
    "Designer indépendante spécialisée en identité visuelle et communication pour les acteurs locaux rémois. 5 ans d'expérience, 23 projets réalisés.",
  rating: 4.9,
  reviewCount: 28,
  verified: true,
  profileType: 'freelance',
  available: true,
  coverUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=800',
  avatarColor: '#2A2FFF',
  initials: 'MD',
  photos: [
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
    'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=400',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?w=400',
    'https://images.pexels.com/photos/1458457/pexels-photo-1458457.jpeg?w=400',
  ],
  services: [
    { id: 's1', title: 'Identité visuelle complète', desc: 'Logo + charte + déclinaisons', price: 1200, unit: 'projet' },
    { id: 's2', title: 'Design réseaux sociaux', desc: 'Templates + 10 visuels/mois', price: 350, unit: 'mois' },
    { id: 's3', title: 'Consultation créative', desc: 'Séance conseil 2h', price: 150, unit: 'séance' },
  ],
  slots: [
    { day: 'Lundi 12 mai', hours: '9h00 - 11h00', available: true },
    { day: 'Mercredi 14 mai', hours: '14h00 - 16h00', available: true },
    { day: 'Vendredi 16 mai', hours: '9h00 - 12h00', available: false },
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Belga Queen',
      rating: 5,
      date: 'Mars 2026',
      comment: 'Travail exceptionnel, identité parfaite.',
      avatar: 'BQ',
      color: '#16A34A',
    },
    {
      id: 'r2',
      author: 'Jazz au Parvis',
      rating: 5,
      date: 'Fév 2026',
      comment: 'Créative, réactive, professionnelle.',
      avatar: 'JP',
      color: '#D97706',
    },
    {
      id: 'r3',
      author: 'Cyclistes de Reims',
      rating: 4,
      date: 'Jan 2026',
      comment: "Très à l'écoute, bon travail.",
      avatar: 'CR',
      color: '#D97706',
    },
  ],
};

