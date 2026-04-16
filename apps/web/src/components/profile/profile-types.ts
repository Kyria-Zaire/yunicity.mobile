import type { CurrentUser } from '@/hooks/use-current-user';

export type ProfileType = 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';

export type MockProfile = {
  id: string;
  profileType: ProfileType;
  displayName: string;
  city: string;
  quartier?: string;
  points: number;
  level: number;
  levelName: string;
  badges: string[];
  verificationStatus: string;
  bio: string;
  tribes: string[];
  joinedAt: string;
  stats: Record<string, number>;
  followers: number;
  following: number;
  coordinates?: [number, number];
  // Champs spécifiques
  siret?: string;
  rna?: string;
  uai?: string;
  website?: string;
  address?: string;
  hours?: string;
  phone?: string;
  specialty?: string;
  interests?: string[];
  tags?: string[];
  availability?: 'available' | 'busy' | 'on_demand';
  experience?: string;
  activityType?: string;
  studentCount?: number;
  courses?: string[];
  rating?: number;
  reviewCount?: number;
};

export type MockPost = {
  id: string;
  type: 'text' | 'event' | 'offer' | 'question' | 'project';
  content: string;
  time: string;
  reactions: number;
  comments: number;
  image?: boolean;
};

export type MockEvent = {
  id: string;
  title: string;
  date: string;
  dayLabel: string;
  time: string;
  location: string;
  participants: number;
  category: string;
  isPast?: boolean;
};

export type MockReview = {
  id: string;
  author: string;
  note: number;
  text: string;
  date: string;
  helpful: number;
  reply?: string;
};

export type MockOffer = {
  id: string;
  title: string;
  description: string;
  validity: string;
  oldPrice?: string;
  newPrice?: string;
};

export type MockProject = {
  id: string;
  title: string;
  client?: string;
  tags: string[];
  link?: string;
};

export const AVATAR_BG: Record<ProfileType, string> = {
  yunicitizen: '#2A2FFF',
  commercial: '#16A34A',
  association: '#D97706',
  freelance: '#7C3AED',
  ecole: '#DC2626',
};

export const COVER_GRADIENT: Record<ProfileType, string> = {
  yunicitizen: 'from-[#0D0F2E] to-[#1C1F4A]',
  commercial: 'from-[#052e16] to-[#16A34A]',
  association: 'from-[#451a03] to-[#D97706]',
  freelance: 'from-[#2e1065] to-[#7C3AED]',
  ecole: 'from-[#450a0a] to-[#DC2626]',
};

export const TYPE_LABEL: Record<ProfileType, string> = {
  yunicitizen: 'Citoyen',
  commercial: 'Commerce',
  association: 'Association',
  freelance: 'Freelance',
  ecole: 'École',
};

export const BADGE_CONFIG: Record<string, { icon: string; name: string }> = {
  pionnier: { icon: '🌟', name: 'Pionnier' },
  premier_pas: { icon: '👣', name: 'Premier pas' },
  connecteur: { icon: '🔗', name: 'Connecteur' },
  ambassadeur: { icon: '🏆', name: 'Ambassadeur' },
  commercial_v: { icon: '✅', name: 'Acteur vérifié' },
  triple_a: { icon: '⭐', name: 'Triple A' },
};

export function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  const a = parts[0]?.[0] ?? 'Y';
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
  return (a + b).toUpperCase();
}

export function levelProgress(points: number): number {
  const thresholds = [0, 50, 150, 350, 700, 1500, 3000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    const t = thresholds[i]!;
    if (points >= t) {
      const next = thresholds[i + 1];
      if (!next) return 100;
      return Math.round(((points - t) / (next - t)) * 100);
    }
  }
  return 0;
}

// ──────────────────────────────────────
// Mock data
// ──────────────────────────────────────

export const MOCK_PROFILES: Record<string, MockProfile> = {
  '1': {
    id: '1', profileType: 'yunicitizen',
    displayName: 'Léa Martin', city: 'Reims', quartier: 'Croix-Rouge',
    points: 340, level: 3, levelName: 'Citoyen',
    badges: ['pionnier', 'premier_pas', 'connecteur'],
    verificationStatus: 'verified',
    bio: 'Passionnée de culture locale et de vélo urbain. Membre active des Cyclistes de Reims. Toujours partante pour découvrir de nouvelles initiatives !',
    tribes: ['Cyclistes de Reims', 'Jazz au Parvis'],
    joinedAt: 'mars 2026',
    stats: { posts: 12, tribes: 2, reactions: 47 },
    followers: 34, following: 52,
    coordinates: [4.031, 49.258],
    interests: ['Vélo', 'Jazz', 'Culture locale', 'Street food', 'Bénévolat'],
  },
  '2': {
    id: '2', profileType: 'commercial',
    displayName: 'Boulangerie du Marché', city: 'Reims', quartier: 'Centre',
    points: 890, level: 4, levelName: 'Acteur',
    badges: ['pionnier', 'commercial_v'],
    verificationStatus: 'verified',
    bio: 'Pain au levain, viennoiseries, café du matin. Ouvert 7j/7 dès 6h30. Ingrédients locaux, farine bio de la Marne.',
    siret: '352 999 993 00037',
    website: 'boulangerie-marche-reims.fr',
    address: '12 Place du Marché, 51100 Reims',
    hours: 'Lun-Dim 6h30-19h30',
    phone: '+33 3 26 47 00 00',
    activityType: 'Boulangerie-Pâtisserie',
    tags: ['boulangerie', 'artisan', 'bio', 'local', 'terrasse'],
    tribes: ['Entrepreneurs Reims'],
    joinedAt: 'mars 2026',
    stats: { posts: 28, followers: 47, events: 3 },
    followers: 128, following: 15,
    coordinates: [4.032, 49.254],
    rating: 4.7, reviewCount: 23,
  },
  '3': {
    id: '3', profileType: 'association',
    displayName: 'Jazz au Parvis', city: 'Reims',
    points: 1240, level: 5, levelName: 'Ambassadeur',
    badges: ['pionnier', 'ambassadeur', 'commercial_v'],
    verificationStatus: 'verified',
    bio: 'Association culturelle dédiée au jazz et à la musique improvisée à Reims depuis 2018. Concerts, jam sessions, ateliers pour tous niveaux.',
    rna: 'W512345678',
    address: 'Parvis de la Cathédrale, 51100 Reims',
    phone: '+33 3 26 00 00 00',
    website: 'jazzauparvis.fr',
    tribes: ['Jazz au Parvis'],
    joinedAt: 'mars 2026',
    stats: { members: 47, events: 12, followers: 234 },
    followers: 234, following: 8,
    coordinates: [4.034, 49.253],
  },
  '4': {
    id: '4', profileType: 'freelance',
    displayName: 'Studio Photo Rémois', city: 'Reims', quartier: 'Boucicaut',
    points: 320, level: 3, levelName: 'Citoyen',
    badges: ['pionnier'],
    verificationStatus: 'verified',
    bio: 'Photographe indépendant — portraits, événements, produits. Disponible pour missions locales. 8 ans d\'expérience en photo événementielle et corporate.',
    siret: '352 999 993 00039',
    specialty: 'Photographie & Vidéo',
    experience: '8 ans',
    availability: 'available',
    tags: ['photo', 'vidéo', 'portrait', 'événement', 'corporate'],
    tribes: ['Dev Reims'],
    joinedAt: 'mars 2026',
    stats: { posts: 8, projects: 15, followers: 32 },
    followers: 67, following: 42,
    coordinates: [4.035, 49.261],
  },
  '5': {
    id: '5', profileType: 'ecole',
    displayName: 'École des Arts de Reims', city: 'Reims',
    points: 145, level: 2, levelName: 'Habitant',
    badges: ['pionnier'],
    verificationStatus: 'verified',
    bio: 'Formation aux arts plastiques, design et photographie. Cours pour tous niveaux, du débutant au confirmé. Expositions régulières.',
    uai: '0511234A',
    address: '5 Rue des Arts, 51100 Reims',
    phone: '+33 3 26 00 00 01',
    website: 'ecole-arts-reims.fr',
    studentCount: 320,
    courses: ['Dessin', 'Peinture', 'Photographie', 'Design graphique', 'Sculpture', 'Art numérique'],
    tribes: ['Art Reims'],
    joinedAt: 'mars 2026',
    stats: { students: 320, courses: 24, events: 8 },
    followers: 189, following: 5,
    coordinates: [4.029, 49.26],
  },
};

export const MOCK_POSTS_BY_TYPE: Record<ProfileType, MockPost[]> = {
  yunicitizen: [
    { id: 'p1', type: 'text', content: 'Super balade à vélo ce matin dans le parc de Champagne ! Le soleil est de retour 🚴☀️', time: 'il y a 2h', reactions: 12, comments: 3 },
    { id: 'p2', type: 'question', content: 'Quelqu\'un connaît un bon réparateur de vélo à Croix-Rouge ? Mon dérailleur a lâché...', time: 'il y a 1j', reactions: 5, comments: 8 },
    { id: 'p3', type: 'text', content: 'Merci à tous pour le concert de vendredi au Parvis, c\'était magique 🎷', time: 'il y a 3j', reactions: 24, comments: 6, image: true },
    { id: 'p4', type: 'event', content: 'Je participe à la Vélorution Reims samedi prochain ! Qui est partant ?', time: 'il y a 5j', reactions: 18, comments: 11 },
    { id: 'p5', type: 'text', content: 'Nouveau badge débloqué : Connecteur ! 🏅 Merci la communauté', time: 'il y a 1sem', reactions: 31, comments: 4 },
  ],
  commercial: [
    { id: 'p1', type: 'offer', content: '🎁 Happy Hour Vendredi — 2 boissons achetées = 1 offerte ! Valable de 17h à 19h.', time: 'il y a 3h', reactions: 22, comments: 5 },
    { id: 'p2', type: 'text', content: 'Nouvelle fournée de pains spéciaux ce matin : campagne au sésame, complet aux noix. Dépêchez-vous ! 🥖', time: 'il y a 1j', reactions: 15, comments: 2 },
    { id: 'p3', type: 'event', content: 'Atelier fabrication de pain ce samedi de 10h à 12h — inscriptions ouvertes ! Places limitées.', time: 'il y a 2j', reactions: 34, comments: 12, image: true },
    { id: 'p4', type: 'text', content: 'Merci à nos clients fidèles ! 1 an déjà sur la Place du Marché. On fête ça la semaine prochaine 🎂', time: 'il y a 5j', reactions: 67, comments: 18 },
    { id: 'p5', type: 'offer', content: 'Menu du jour : entrée + plat + dessert à 14€. Disponible du lundi au vendredi midi.', time: 'il y a 1sem', reactions: 9, comments: 1 },
  ],
  association: [
    { id: 'p1', type: 'event', content: 'Concert Jazz au Parvis — Vendredi 21 mars à 20h30. Entrée libre. 🎷', time: 'il y a 4h', reactions: 45, comments: 8 },
    { id: 'p2', type: 'text', content: 'L\'AG annuelle aura lieu le 5 avril. Tous les membres sont invités — convocation envoyée par mail.', time: 'il y a 2j', reactions: 12, comments: 15 },
    { id: 'p3', type: 'question', content: 'On cherche des bénévoles pour la Fête de la Musique ! Qui est dispo ? 🙋', time: 'il y a 4j', reactions: 28, comments: 21, image: true },
    { id: 'p4', type: 'text', content: 'Retour en images sur la jam session du week-end. Merci aux 60 personnes présentes !', time: 'il y a 1sem', reactions: 56, comments: 9, image: true },
    { id: 'p5', type: 'event', content: 'Atelier découverte jazz pour débutants — samedi 22 mars, 14h-16h. Instruments fournis.', time: 'il y a 1sem', reactions: 19, comments: 7 },
  ],
  freelance: [
    { id: 'p1', type: 'project', content: 'Nouveau shooting corporate terminé pour une startup rémoise ! Très content du résultat 📸', time: 'il y a 6h', reactions: 18, comments: 4, image: true },
    { id: 'p2', type: 'text', content: 'Disponible cette semaine pour des portraits pro. DM si intéressé !', time: 'il y a 2j', reactions: 7, comments: 2 },
    { id: 'p3', type: 'offer', content: 'Offre lancement : shooting portrait 1h à -30% pour les Yunicitizens. Code : YUNI30', time: 'il y a 4j', reactions: 24, comments: 9 },
    { id: 'p4', type: 'project', content: 'Reportage complet du festival de jazz au Parvis. 200+ photos, ambiance incroyable 🎶', time: 'il y a 1sem', reactions: 42, comments: 11, image: true },
    { id: 'p5', type: 'text', content: 'Investissement dans un nouveau drone pour les prises de vue aériennes. Hâte de tester !', time: 'il y a 2sem', reactions: 15, comments: 3 },
  ],
  ecole: [
    { id: 'p1', type: 'event', content: 'Portes ouvertes samedi 22 mars de 10h à 17h. Venez découvrir nos ateliers et rencontrer les enseignants !', time: 'il y a 5h', reactions: 28, comments: 6 },
    { id: 'p2', type: 'text', content: 'Félicitations à nos élèves de 3e année pour leur exposition "Reims en couleurs" ! 🎨', time: 'il y a 2j', reactions: 45, comments: 12, image: true },
    { id: 'p3', type: 'text', content: 'Inscriptions ouvertes pour le trimestre de printemps. Nouveaux cours de photographie argentique !', time: 'il y a 5j', reactions: 16, comments: 8 },
    { id: 'p4', type: 'event', content: 'Conférence "L\'art numérique en 2026" — Jeudi 27 mars à 18h. Intervenante : Marie Dupont.', time: 'il y a 1sem', reactions: 22, comments: 5 },
    { id: 'p5', type: 'text', content: 'Notre partenariat avec le Musée des Beaux-Arts est renouvelé pour 2026. Visites guidées incluses dans les cours.', time: 'il y a 2sem', reactions: 33, comments: 7 },
  ],
};

export const MOCK_EVENTS_BY_TYPE: Record<ProfileType, MockEvent[]> = {
  yunicitizen: [
    { id: 'e1', title: 'Vélorution Reims', date: '2026-03-29', dayLabel: 'SAM 29', time: '10h00', location: 'Place d\'Erlon', participants: 45, category: 'sport' },
    { id: 'e2', title: 'Jam Session Jazz', date: '2026-04-04', dayLabel: 'VEN 4', time: '20h30', location: 'Parvis Cathédrale', participants: 80, category: 'culture' },
  ],
  commercial: [
    { id: 'e1', title: 'Happy Hour Vendredi', date: '2026-03-28', dayLabel: 'VEN 28', time: '17h00-19h00', location: '12 Place du Marché', participants: 25, category: 'promo' },
    { id: 'e2', title: 'Atelier Pain Maison', date: '2026-03-29', dayLabel: 'SAM 29', time: '10h00-12h00', location: '12 Place du Marché', participants: 12, category: 'atelier' },
    { id: 'e3', title: 'Vente Privée Anniversaire', date: '2026-04-05', dayLabel: 'SAM 5', time: '08h00-14h00', location: '12 Place du Marché', participants: 0, category: 'promo' },
  ],
  association: [
    { id: 'e1', title: 'Concert Jazz au Parvis', date: '2026-03-28', dayLabel: 'VEN 28', time: '20h30', location: 'Parvis Cathédrale', participants: 120, category: 'concert' },
    { id: 'e2', title: 'AG Annuelle', date: '2026-04-05', dayLabel: 'SAM 5', time: '14h00', location: 'Salle des fêtes', participants: 35, category: 'admin' },
    { id: 'e3', title: 'Atelier Jazz Débutants', date: '2026-04-12', dayLabel: 'SAM 12', time: '14h00-16h00', location: 'Parvis Cathédrale', participants: 15, category: 'atelier' },
  ],
  freelance: [
    { id: 'e1', title: 'Shooting Portrait Collectif', date: '2026-03-30', dayLabel: 'DIM 30', time: '14h00', location: 'Studio Boucicaut', participants: 8, category: 'projet' },
    { id: 'e2', title: 'Workshop Photo de Rue', date: '2026-04-06', dayLabel: 'DIM 6', time: '10h00-13h00', location: 'Centre-ville Reims', participants: 12, category: 'atelier' },
  ],
  ecole: [
    { id: 'e1', title: 'Portes Ouvertes', date: '2026-03-29', dayLabel: 'SAM 29', time: '10h00-17h00', location: '5 Rue des Arts', participants: 200, category: 'info' },
    { id: 'e2', title: 'Conférence Art Numérique', date: '2026-03-27', dayLabel: 'JEU 27', time: '18h00', location: 'Amphithéâtre A', participants: 60, category: 'culture' },
    { id: 'e3', title: 'Expo "Reims en couleurs"', date: '2026-04-01', dayLabel: 'MAR 1', time: '10h00-18h00', location: 'Galerie école', participants: 150, category: 'expo' },
  ],
};

export const MOCK_REVIEWS: MockReview[] = [
  { id: 'r1', author: 'Sophie K.', note: 5, text: 'Pain excellent, équipe adorable ! Je viens tous les matins.', date: 'mars 2026', helpful: 8 },
  { id: 'r2', author: 'Marc D.', note: 5, text: 'Les croissants sont incroyables. Meilleurs de Reims sans hésiter.', date: 'mars 2026', helpful: 5, reply: 'Merci Marc ! On met tout notre cœur dans nos viennoiseries.' },
  { id: 'r3', author: 'Léa M.', note: 4, text: 'Très bonne boulangerie, un peu d\'attente le samedi matin mais ça vaut le coup.', date: 'mars 2026', helpful: 3 },
  { id: 'r4', author: 'Paul B.', note: 5, text: 'Meilleure boulangerie du centre-ville ! Le pain de campagne au levain est exceptionnel.', date: 'mars 2026', helpful: 12 },
];

export const MOCK_OFFERS: MockOffer[] = [
  { id: 'o1', title: 'Happy Hour Vendredi', description: '2 boissons achetées = 1 offerte. Tous les vendredis de 17h à 19h.', validity: '31 mars 2026' },
  { id: 'o2', title: 'Menu du Jour', description: 'Entrée + plat + dessert à prix réduit. Disponible du lundi au vendredi midi.', validity: 'Tous les midis', oldPrice: '18€', newPrice: '14€' },
];

export const MOCK_PROJECTS: MockProject[] = [
  { id: 'pj1', title: 'Identité visuelle Restaurant X', client: 'Restaurant Le Cellier', tags: ['Logo', 'Charte graphique', 'Menu'] },
  { id: 'pj2', title: 'Shooting événementiel Jazz au Parvis', client: 'Jazz au Parvis', tags: ['Photo', 'Événement', 'Concert'] },
  { id: 'pj3', title: 'Portraits corporate Startup Tech', client: 'Confidentiel', tags: ['Portrait', 'Corporate', 'LinkedIn'] },
  { id: 'pj4', title: 'Reportage Vélorution Reims', tags: ['Photo', 'Reportage', 'Sport'] },
];

/** Aligne l’utilisateur connecté (mock ou API) sur la structure profil publique + champs mockés du même profileType. */
export function currentUserToMockProfile(user: CurrentUser): MockProfile {
  const refByType = {
    yunicitizen: MOCK_PROFILES['1'],
    commercial: MOCK_PROFILES['2'],
    association: MOCK_PROFILES['3'],
    freelance: MOCK_PROFILES['4'],
    ecole: MOCK_PROFILES['5'],
  } as const;
  const base = refByType[user.profileType] ?? MOCK_PROFILES['1']!;
  return {
    ...base,
    id: user.id === 'me' ? '1' : user.id,
    displayName: user.displayName,
    profileType: user.profileType,
    verificationStatus: user.verificationStatus,
    city: user.city,
    bio: user.bio ?? base.bio,
    points: user.points,
    level: user.level,
    levelName: user.levelName,
    badges: user.badges,
    tribes: user.tribes,
    joinedAt: user.joinedAt,
    stats: { ...base.stats, ...user.stats },
    ...(user.quartier !== undefined ? { quartier: user.quartier } : {}),
    ...(user.phone !== undefined ? { phone: user.phone } : {}),
    ...(user.siret !== undefined ? { siret: user.siret } : {}),
    ...(user.rna !== undefined ? { rna: user.rna } : {}),
    ...(user.uai !== undefined ? { uai: user.uai } : {}),
    ...(user.website !== undefined ? { website: user.website } : {}),
    ...(user.address !== undefined ? { address: user.address } : {}),
    ...(user.hours !== undefined ? { hours: user.hours } : {}),
    ...(user.specialty !== undefined ? { specialty: user.specialty } : {}),
  };
}
