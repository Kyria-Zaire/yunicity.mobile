export type CommercialHoraire = { day: string; hours: string };

export type CommercialOffer = {
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
  expires: string;
  badge: string;
};

export type CommercialReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
  color: string;
};

export type CommercialEvent = {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  attendees: number;
  price: string;
};

export type CommercialBusinessMock = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileType: 'commercial';
  coverUrl: string;
  avatarColor: string;
  initials: string;
  horaires: CommercialHoraire[];
  photos: string[];
  offers: CommercialOffer[];
  reviews: CommercialReview[];
  events: CommercialEvent[];
  /** Distance affichée sous le nom (mock). */
  distanceKm: number;
};

/** Référence Belga Queen — données riches pour la refonte profil commercial. */
export const MOCK_COMMERCIAL_PROFILE: CommercialBusinessMock = {
  id: 'c2',
  name: 'Belga Queen',
  category: 'Restaurant',
  address: "Place d'Erlon, 51100 Reims",
  phone: '+33 3 26 47 10 00',
  website: 'www.belgaqueen-reims.fr',
  description:
    'Restaurant belge au cœur de Reims. Spécialités : moules-frites, carbonnade, bières belges. Terrasse ouverte en été. Réservations recommandées le weekend.',
  rating: 4.7,
  reviewCount: 124,
  verified: true,
  profileType: 'commercial',
  coverUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=800',
  avatarColor: '#16A34A',
  initials: 'BQ',
  horaires: [
    { day: 'Lundi', hours: '12h-14h30 · 19h-22h30' },
    { day: 'Mardi', hours: '12h-14h30 · 19h-22h30' },
    { day: 'Mercredi', hours: '12h-14h30 · 19h-22h30' },
    { day: 'Jeudi', hours: '12h-14h30 · 19h-22h30' },
    { day: 'Vendredi', hours: '12h-14h30 · 19h-23h00' },
    { day: 'Samedi', hours: '12h-15h00 · 19h-23h00' },
    { day: 'Dimanche', hours: 'Fermé' },
  ],
  photos: [
    'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=400',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
    'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=400',
    'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?w=400',
    'https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg?w=400',
    'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?w=400',
  ],
  offers: [
    {
      id: 'o1',
      title: 'Happy Hour -30%',
      desc: 'Vendredi 17h-19h',
      imageUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=400',
      expires: '31 mai 2026',
      badge: '🔥 Populaire',
    },
    {
      id: 'o2',
      title: 'Menu du jour 12€',
      desc: 'Entrée + plat + dessert · Midi semaine',
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
      expires: 'Permanent',
      badge: '',
    },
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Léa M.',
      rating: 5,
      date: 'Avril 2026',
      comment:
        'Excellent restaurant, les moules sont fraîches et le service impeccable. On reviendra !',
      avatar: 'LM',
      color: '#2A2FFF',
    },
    {
      id: 'r2',
      author: 'Thomas D.',
      rating: 4,
      date: 'Mars 2026',
      comment: 'Très bonne expérience, un peu bruyant le weekend mais la cuisine est top.',
      avatar: 'TD',
      color: '#2A2FFF',
    },
    {
      id: 'r3',
      author: 'Sarah C.',
      rating: 5,
      date: 'Mars 2026',
      comment: 'Notre adresse préférée à Reims pour les occasions spéciales.',
      avatar: 'SC',
      color: '#2A2FFF',
    },
  ],
  events: [
    {
      id: 'ev1',
      title: 'Soirée Jazz & Moules',
      date: 'Vendredi 9 mai · 20h',
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=400',
      attendees: 34,
      price: 'Sur réservation',
    },
    {
      id: 'ev2',
      title: 'Brunch du Dimanche',
      date: 'Dimanche 11 mai · 11h',
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
      attendees: 18,
      price: '25€/pers',
    },
  ],
  distanceKm: 0.3,
};

function initialsFromName(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0]![0]}${p[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'PR';
}

/** Données étendues pour un commerce : Belga (c2) = mock complet, sinon dérivé minimal. */
export function getCommercialBusinessMock(input: {
  id: string;
  displayName: string;
  category: string;
  addressLine: string;
}): CommercialBusinessMock {
  if (input.id === MOCK_COMMERCIAL_PROFILE.id) {
    return MOCK_COMMERCIAL_PROFILE;
  }

  return {
    ...MOCK_COMMERCIAL_PROFILE,
    id: input.id,
    name: input.displayName,
    category: input.category,
    address: input.addressLine.includes('Reims') ? input.addressLine : `${input.addressLine}, Reims`,
    phone: '+33 3 26 00 00 00',
    website: 'yunicity.fr',
    description: `Découvrez ${input.displayName} — ${input.category} à Reims.`,
    initials: initialsFromName(input.displayName),
    reviewCount: 12,
    rating: 4.5,
    photos: MOCK_COMMERCIAL_PROFILE.photos.slice(0, 3),
    offers: MOCK_COMMERCIAL_PROFILE.offers.slice(0, 1),
    reviews: MOCK_COMMERCIAL_PROFILE.reviews.slice(0, 2),
    events: MOCK_COMMERCIAL_PROFILE.events.slice(0, 1),
    distanceKm: 0.8,
  };
}
