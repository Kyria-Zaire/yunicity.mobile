export type ActorType = 'commercial' | 'association' | 'freelance' | 'ecole' | 'yunicitizen';

export type MapActor = {
  id: string;
  name: string;
  type: ActorType;
  category: string;
  lat: number;
  lng: number;
  address: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  activeToday: boolean;
};

export type MapEvent = {
  id: string;
  title: string;
  organizer: string;
  lat: number;
  lng: number;
  date: string;
  imageUrl: string;
  attendees: number;
  category: string;
  color: string;
};

export type MapPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  likes: number;
  time: string;
};

// Acteurs avec vraies coordonnées Reims
export const MAP_ACTORS: MapActor[] = [
  {
    id: 'c2',
    name: 'Belga Queen',
    type: 'commercial',
    category: 'Restaurant',
    lat: 49.2583,
    lng: 4.0317,
    address: "Place d'Erlon",
    imageUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=400',
    rating: 4.7,
    reviews: 124,
    isOpen: true,
    activeToday: true,
  },
  {
    id: 'c1',
    name: 'Boulangerie du Marché',
    type: 'commercial',
    category: 'Boulangerie',
    lat: 49.261,
    lng: 4.028,
    address: 'Place du Marché',
    imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=400',
    rating: 4.9,
    reviews: 89,
    isOpen: true,
    activeToday: true,
  },
  {
    id: 'c4',
    name: 'Ao Barber',
    type: 'commercial',
    category: 'Bien-être',
    lat: 49.256,
    lng: 4.035,
    address: 'Centre-ville',
    imageUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?w=400',
    rating: 4.8,
    reviews: 67,
    isOpen: true,
    activeToday: false,
  },
  {
    id: 'a1',
    name: 'Jazz au Parvis',
    type: 'association',
    category: 'Culture',
    lat: 49.253,
    lng: 4.033,
    address: 'Parvis Cathédrale',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=400',
    rating: 4.9,
    reviews: 203,
    isOpen: false,
    activeToday: true,
  },
  {
    id: 'a2',
    name: 'Cyclistes de Reims',
    type: 'association',
    category: 'Sport',
    lat: 49.262,
    lng: 4.02,
    address: "Parc de la Patte d'Oie",
    imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=400',
    rating: 4.6,
    reviews: 45,
    isOpen: false,
    activeToday: true,
  },
  {
    id: 'f3',
    name: 'Marie Design',
    type: 'freelance',
    category: 'Graphisme',
    lat: 49.257,
    lng: 4.029,
    address: 'Rue de Vesle',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
    rating: 5.0,
    reviews: 28,
    isOpen: true,
    activeToday: false,
  },
  {
    id: 'e1',
    name: 'École des Arts',
    type: 'ecole',
    category: 'Formation',
    lat: 49.2545,
    lng: 4.037,
    address: 'Rue des Arts',
    imageUrl: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?w=400',
    rating: 4.5,
    reviews: 156,
    isOpen: true,
    activeToday: false,
  },
  {
    id: 'c5',
    name: 'Cave des Sacres',
    type: 'commercial',
    category: 'Cave à vins',
    lat: 49.2595,
    lng: 4.026,
    address: 'Rue de Mars',
    imageUrl: 'https://images.pexels.com/photos/1458457/pexels-photo-1458457.jpeg?w=400',
    rating: 4.8,
    reviews: 91,
    isOpen: true,
    activeToday: true,
  },
];

// Événements géolocalisés
export const MAP_EVENTS: MapEvent[] = [
  {
    id: 'ev1',
    title: 'Concert Jazz',
    organizer: 'Jazz au Parvis',
    lat: 49.253,
    lng: 4.033,
    date: 'Ce soir 20h30',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=400',
    attendees: 47,
    category: 'Culture',
    color: '#D97706',
  },
  {
    id: 'ev2',
    title: 'Balade vélo',
    organizer: 'Cyclistes de Reims',
    lat: 49.262,
    lng: 4.02,
    date: 'Demain 9h',
    imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=400',
    attendees: 23,
    category: 'Sport',
    color: '#16A34A',
  },
  {
    id: 'ev3',
    title: 'Happy Hour',
    organizer: 'Belga Queen',
    lat: 49.2583,
    lng: 4.0317,
    date: 'Vendredi 18h',
    imageUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=400',
    attendees: 34,
    category: 'Resto',
    color: '#2A2FFF',
  },
  {
    id: 'ev4',
    title: 'Atelier peinture',
    organizer: 'École des Arts',
    lat: 49.2545,
    lng: 4.037,
    date: 'Samedi 14h',
    imageUrl: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?w=400',
    attendees: 12,
    category: 'Art',
    color: '#DC2626',
  },
];

// Posts géolocalisés
export const MAP_POSTS: MapPost[] = [
  {
    id: 'mp1',
    authorName: 'Kyria',
    authorInitials: 'KY',
    authorColor: '#2A2FFF',
    content: 'Magnifique coucher de soleil sur la cathédrale 😍',
    lat: 49.2535,
    lng: 4.0325,
    imageUrl: 'https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg?w=400',
    likes: 89,
    time: '2h',
  },
  {
    id: 'mp2',
    authorName: 'Thomas',
    authorInitials: 'TD',
    authorColor: '#2A2FFF',
    content: 'Le marché du samedi est incroyable ce matin !',
    lat: 49.261,
    lng: 4.027,
    imageUrl: null,
    likes: 34,
    time: '1h',
  },
  {
    id: 'mp3',
    authorName: 'Emma',
    authorInitials: 'EP',
    authorColor: '#2A2FFF',
    content: 'Nouveau spot street art découvert 🎨',
    lat: 49.2565,
    lng: 4.0345,
    imageUrl: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=400',
    likes: 156,
    time: '30min',
  },
];

