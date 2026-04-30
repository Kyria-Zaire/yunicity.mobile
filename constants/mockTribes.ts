export interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  coverUrl: string;
  members: number;
  activeToday: number;
  postsToday: number;
  activityLevel: 'très active' | 'active' | 'calme';
  isPublic: boolean;
  quartier: string;
  badges: string[];
  rules: string[];
  moderators: string[];
  isMember: boolean;
  isFounder: boolean;
  stats: { actions: number; events: number; votes: number };
  note?: string;
}

export const MOCK_TRIBES: Tribe[] = [
  {
    id: 't1',
    name: 'La Tribu Gourmande',
    emoji: '🍽️',
    color: '#DC2626',
    coverUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=800',
    description:
      'En partenariat avec les restaurants partenaires de Reims. Découvrez la gastronomie locale et partagez des moments conviviaux.',
    category: 'food',
    members: 234,
    activeToday: 45,
    postsToday: 12,
    activityLevel: 'très active',
    isPublic: true,
    quartier: 'Toute la ville',
    badges: ['🍾 Tribu Champagne', '🤝 Partenaires officiels'],
    rules: ['Respecter les établissements', 'Partager les bons plans', 'Bienveillance entre membres'],
    moderators: ['c2', 'c3'],
    isMember: true,
    isFounder: false,
    stats: { actions: 189, events: 34, votes: 22 },
  },
  {
    id: 't2',
    name: 'La Tribu Event',
    emoji: '🥂',
    color: '#D97706',
    coverUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=800',
    description:
      'En partenariat avec les maisons de champagne et bars de Reims. Tournées et événements exclusifs pour soutenir nos commerçants.',
    category: 'culture',
    members: 312,
    activeToday: 89,
    postsToday: 19,
    activityLevel: 'très active',
    isPublic: true,
    quartier: 'Centre-ville',
    badges: ['🏆 Tribu la plus active', '🍾 Maisons de Champagne'],
    rules: ['Inscription via Yurpass obligatoire', 'Respecter les lieux', "Partager l'expérience"],
    moderators: ['a1', 'c5'],
    isMember: true,
    isFounder: false,
    stats: { actions: 267, events: 56, votes: 34 },
    note: 'Inscription aux événements via Yurpass',
  },
  {
    id: 't3',
    name: 'Tribu Culture',
    emoji: '🎭',
    color: '#7C3AED',
    coverUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800',
    description:
      'Pour valoriser la culture et les talents locaux rémois. Podcasts, interviews, micro-trottoirs et rencontres avec artistes.',
    category: 'culture',
    members: 156,
    activeToday: 28,
    postsToday: 7,
    activityLevel: 'active',
    isPublic: true,
    quartier: 'Toute la ville',
    badges: ['🎨 Tribu Créative', '🎤 Créateurs locaux'],
    rules: ['Valoriser les talents locaux', 'Contenu original uniquement', 'Respect des artistes'],
    moderators: ['f3', 'u3'],
    isMember: false,
    isFounder: false,
    stats: { actions: 134, events: 28, votes: 15 },
  },
  {
    id: 't4',
    name: 'Tribu Sport',
    emoji: '⚡',
    color: '#16A34A',
    coverUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=800',
    description:
      "Pour les amoureux du sport et de l'activité physique. Événements sportifs, rencontres entre sportifs et challenges communautaires.",
    category: 'sport',
    members: 289,
    activeToday: 67,
    postsToday: 15,
    activityLevel: 'très active',
    isPublic: true,
    quartier: 'Toute la ville',
    badges: ['🏅 Tribu Sportive', '💪 Challenges actifs'],
    rules: ['Fair-play obligatoire', 'Accueillir tous les niveaux', 'Partager les résultats'],
    moderators: ['a2', 'u2'],
    isMember: false,
    isFounder: false,
    stats: { actions: 198, events: 45, votes: 27 },
  },
  {
    id: 't5',
    name: 'Tribu Business',
    emoji: '💼',
    color: '#0891B2',
    coverUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=800',
    description:
      "Pour les jeunes entrepreneurs et porteurs de projets rémois. Networking, rencontres avec entrepreneurs et partage d'expériences.",
    category: 'business',
    members: 198,
    activeToday: 34,
    postsToday: 8,
    activityLevel: 'active',
    isPublic: true,
    quartier: 'Toute la ville',
    badges: ['🚀 Tribu Entrepreneuriale', '🤝 Réseau local'],
    rules: ['Networking bienveillant', 'Pas de démarchage agressif', 'Partager ses ressources'],
    moderators: ['c5', 'f2'],
    isMember: false,
    isFounder: false,
    stats: { actions: 145, events: 32, votes: 19 },
  },
];

export const TRIBE_CATEGORIES = [
  { id: 'all', label: 'Toutes', emoji: '🌍' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'sport', label: 'Sport', emoji: '🏃' },
  { id: 'business', label: 'Business', emoji: '💼' },
] as const;

export const TRIBE_POSTS: Record<string, any[]> = {
  t1: [
    {
      id: 'tp1',
      authorId: 'c2',
      content: 'Nouveau parcours dégustation cette semaine chez nos partenaires de la place d’Erlon 🍾',
      type: 'event',
      likes: 54,
      comments: 18,
      time: '1h',
    },
    {
      id: 'tp2',
      authorId: 'c3',
      content: 'On cherche vos meilleures adresses brunch pour le dimanche. Vos recommandations ?',
      type: 'question',
      likes: 29,
      comments: 31,
      time: '5h',
    },
    {
      id: 'tp3',
      authorId: 'u1',
      content: 'Soirée accords mets-champagne testée hier, ambiance parfaite et service au top.',
      type: 'text',
      likes: 63,
      comments: 14,
      imageUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=400',
      time: '1j',
    },
  ],
  t2: [
    {
      id: 'tp4',
      authorId: 'a1',
      content: 'Tournée partenaires vendredi 20h : 3 lieux, 1 pass Yurpass, ambiance festive toute la soirée 🥂',
      type: 'event',
      likes: 96,
      comments: 37,
      time: '38 min',
    },
    {
      id: 'tp5',
      authorId: 'c5',
      content: 'Ouverture des inscriptions VIP pour la prochaine soirée maisons de champagne.',
      type: 'text',
      likes: 72,
      comments: 16,
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=400',
      time: '3h',
    },
    {
      id: 'tp6',
      authorId: 'u2',
      content: 'Qui vient à la tournée centre-ville demain ? On peut former des groupes par quartier.',
      type: 'question',
      likes: 18,
      comments: 24,
      time: '1j',
    },
  ],
  t3: [
    {
      id: 'tp7',
      authorId: 'f3',
      content: 'On prépare une série d’interviews de créateurs rémois. Qui voulez-vous voir en premier ?',
      type: 'question',
      likes: 34,
      comments: 27,
      time: '2h',
    },
    {
      id: 'tp8',
      authorId: 'u3',
      content: 'Micro-trottoir tourné cet après-midi place Royale. Merci aux participants 🎤',
      type: 'text',
      likes: 41,
      comments: 9,
      imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=400',
      time: '9h',
    },
    {
      id: 'tp9',
      authorId: 'f3',
      content: 'Appel à talents : envoyez vos projets visuels pour la prochaine vitrine locale.',
      type: 'text',
      likes: 26,
      comments: 11,
      time: '2j',
    },
  ],
  t4: [
    {
      id: 'tp10',
      authorId: 'a2',
      content: 'Challenge du week-end : 5 km, 10 km ou sortie libre. Postez vos résultats ⚡',
      type: 'event',
      likes: 88,
      comments: 29,
      time: '50 min',
    },
    {
      id: 'tp11',
      authorId: 'u2',
      content: 'Séance running ouverte à tous jeudi 19h au parc Léo Lagrange. Débutants bienvenus.',
      type: 'event',
      likes: 52,
      comments: 13,
      imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=400',
      time: '6h',
    },
    {
      id: 'tp12',
      authorId: 'a2',
      content: 'Quel sport voulez-vous mettre en avant pour le prochain mois : running, crossfit ou vélo ?',
      type: 'question',
      likes: 21,
      comments: 19,
      time: '1j',
    },
  ],
  t5: [
    {
      id: 'tp13',
      authorId: 'f2',
      content: 'Petit-déjeuner networking mardi prochain : 12 places, pitchs de 2 minutes max 💼',
      type: 'event',
      likes: 44,
      comments: 15,
      time: '1h',
    },
    {
      id: 'tp14',
      authorId: 'c5',
      content: 'Partagez vos outils préférés pour gérer prospection, CRM et suivi client au quotidien.',
      type: 'question',
      likes: 17,
      comments: 22,
      time: '7h',
    },
    {
      id: 'tp15',
      authorId: 'f2',
      content: 'Retour d’expérience après notre dernier meetup entrepreneurs : beaucoup de mises en relation utiles.',
      type: 'text',
      likes: 31,
      comments: 8,
      imageUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=400',
      time: '2j',
    },
  ],
};

export const MOCK_POLLS = [
  {
    id: 'poll1',
    tribeId: 't2',
    question: 'Quel format d’événement voulez-vous pour la prochaine tournée Yurpass ?',
    options: [
      { id: 'o1', text: 'Tournée bars partenaires', votes: 48 },
      { id: 'o2', text: 'Soirée maison de champagne', votes: 37 },
      { id: 'o3', text: 'Afterwork networking festif', votes: 21 },
    ],
    totalVotes: 106,
    userVote: null,
    closes: 'Dans 2 jours',
  },
  {
    id: 'poll2',
    tribeId: 't4',
    question: 'Quel challenge lance-t-on le mois prochain dans Tribu Sport ?',
    options: [
      { id: 'o4', text: '30 km cumulés en équipe', votes: 35 },
      { id: 'o5', text: 'Défi gainage 21 jours', votes: 27 },
      { id: 'o6', text: 'Tournoi multisports du dimanche', votes: 41 },
    ],
    totalVotes: 103,
    userVote: null,
    closes: 'Dans 5 jours',
  },
] as const;
