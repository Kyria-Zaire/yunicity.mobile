export const MOCK_ASSO = {
  id: 'a1',
  name: 'Jazz au Parvis',
  category: 'Culture & Musique',
  rna: 'W512345678',
  address: 'Parvis de la Cathédrale, 51100 Reims',
  description:
    'Association dédiée au jazz et à la musique improvisée à Reims. Concerts, ateliers, rencontres avec artistes depuis 2018.',
  founded: '2018',
  memberCount: 89,
  coverUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800',
  avatarColor: '#D97706',
  initials: 'JP',
  verified: true,
  stats: {
    actions: 45,
    events: 18,
    members: 89,
    volunteers: 12,
    beneficiaries: 2340,
    hoursVolunteered: 456,
  },
} as const;

export const MOCK_ACTIONS = [
  {
    id: 'ac1',
    title: 'Concert Jazz Gratuit',
    date: '12 Avr 2026',
    participants: 234,
    impact: '234 spectateurs',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=400',
    category: 'Culture',
  },
  {
    id: 'ac2',
    title: 'Atelier Improvisation',
    date: '5 Avr 2026',
    participants: 18,
    impact: '18 musiciens formés',
    imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?w=400',
    category: 'Formation',
  },
  {
    id: 'ac3',
    title: 'Jam Session Mensuelle',
    date: '28 Mar 2026',
    participants: 45,
    impact: '45 participants',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=400',
    category: 'Événement',
  },
] as const;

export const MOCK_EVENTS = [
  {
    id: 'ev1',
    title: 'Concert Quartet Duplessis',
    date: 'Vendredi 9 mai · 20h30',
    location: 'Parvis Cathédrale',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=600',
    attendees: 67,
    maxAttendees: 200,
    price: 'Gratuit',
    description: 'Concert de jazz manouche avec le Quartet Duplessis. Entrée libre.',
    isJoined: false,
    status: 'upcoming',
  },
  {
    id: 'ev2',
    title: 'Atelier Piano Jazz',
    date: 'Samedi 10 mai · 14h',
    location: 'Médiathèque de Reims',
    imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?w=600',
    attendees: 8,
    maxAttendees: 12,
    price: '5€',
    description: 'Atelier débutants et intermédiaires. Matériel fourni.',
    isJoined: false,
    status: 'upcoming',
  },
  {
    id: 'ev3',
    title: 'Jam Session Mensuelle',
    date: 'Dimanche 18 mai · 17h',
    location: 'Bar Le Parvis',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=600',
    attendees: 34,
    maxAttendees: 80,
    price: 'Gratuit',
    description: 'Session ouverte à tous les musiciens. Venez avec vos instruments !',
    isJoined: false,
    status: 'upcoming',
  },
] as const;

export const MOCK_MEMBERS = [
  { id: 'u1', name: 'Léa Martin', role: 'Fondatrice', initials: 'LM', color: '#2A2FFF', joined: 'Jan 2018', active: true, events: 18 },
  { id: 'u2', name: 'Thomas Dubois', role: 'Administrateur', initials: 'TD', color: '#2A2FFF', joined: 'Mars 2018', active: true, events: 12 },
  { id: 'u3', name: 'Emma Petit', role: 'Bénévole', initials: 'EP', color: '#2A2FFF', joined: 'Sep 2019', active: true, events: 8 },
  { id: 'u4', name: 'Lucas Bernard', role: 'Membre', initials: 'LB', color: '#2A2FFF', joined: 'Jan 2020', active: false, events: 3 },
  { id: 'u5', name: 'Sarah Cohen', role: 'Bénévole', initials: 'SC', color: '#2A2FFF', joined: 'Juin 2020', active: true, events: 15 },
] as const;

export const MOCK_SUPPORTERS = [
  { id: 's1', name: 'Ville de Reims', type: 'Institution', amount: 2000, logo: '🏛️', color: '#2A2FFF', since: '2024' },
  { id: 's2', name: 'Cave des Sacres', type: 'Commerce', amount: 500, logo: '🍾', color: '#D97706', since: '2025' },
  { id: 's3', name: 'Belga Queen', type: 'Commerce', amount: 300, logo: '🍺', color: '#16A34A', since: '2025' },
  { id: 's4', name: 'CFA Reims', type: 'École', amount: 0, logo: '📚', color: '#DC2626', since: '2026', inkind: 'Mise à disposition salle' },
] as const;

export const MOCK_ASSO_PUBLIC = {
  ...MOCK_ASSO,
  coverUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800',
  photos: [
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=400',
    'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?w=400',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=400',
    'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?w=400',
    'https://images.pexels.com/photos/1458457/pexels-photo-1458457.jpeg?w=400',
    'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?w=400',
  ],
};

