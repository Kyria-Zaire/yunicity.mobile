export interface Short {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  authorType: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  isVideo: boolean;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
}

const MOCK_SHORTS: Short[] = [
  {
    id: 'sh1',
    authorId: 'a1',
    authorName: 'Jazz au Parvis',
    authorInitials: 'JP',
    authorColor: '#D97706',
    authorType: 'association',
    description: 'Ambiance du concert de samedi soir 🎷 Venez nombreux ce vendredi !',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=1080',
    isVideo: false,
    likes: 234,
    comments: 45,
    shares: 67,
    tags: ['#jazz', '#reims', '#concert'],
  },
  {
    id: 'sh2',
    authorId: 'c1',
    authorName: 'Boulangerie du Marché',
    authorInitials: 'BM',
    authorColor: '#16A34A',
    authorType: 'commercial',
    description: 'Nos croissants sortent du four à 6h30 chaque matin 🥐 Frais garanti !',
    imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=1080',
    isVideo: false,
    likes: 189,
    comments: 23,
    shares: 12,
    tags: ['#boulangerie', '#reims', '#artisan'],
  },
  {
    id: 'sh3',
    authorId: 'a2',
    authorName: 'Cyclistes de Reims',
    authorInitials: 'CR',
    authorColor: '#D97706',
    authorType: 'association',
    description: 'Balade du dimanche matin 🚴‍♀️ 47 participants ! Rejoins-nous la semaine prochaine',
    imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=1080',
    isVideo: false,
    likes: 156,
    comments: 34,
    shares: 28,
    tags: ['#vélo', '#reims', '#sport'],
  },
  {
    id: 'sh4',
    authorId: 'u3',
    authorName: 'Emma Petit',
    authorInitials: 'EP',
    authorColor: '#2A2FFF',
    authorType: 'yunicitizen',
    description: 'Le coucher de soleil sur la cathédrale hier soir 😍 Reims est magnifique',
    imageUrl: 'https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg?w=1080',
    isVideo: false,
    likes: 412,
    comments: 78,
    shares: 134,
    tags: ['#reims', '#cathédrale', '#sunset'],
  },
  {
    id: 'sh5',
    authorId: 'c4',
    authorName: 'Ao Barber',
    authorInitials: 'AB',
    authorColor: '#16A34A',
    authorType: 'commercial',
    description: 'Nouvelle collection été 💈 Coupe + barbe à 35€. Réservation sur Yunicity !',
    imageUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?w=1080',
    isVideo: false,
    likes: 98,
    comments: 15,
    shares: 8,
    tags: ['#barber', '#reims', '#style'],
  },
  {
    id: 'sh6',
    authorId: 'u1',
    authorName: 'Kyria',
    authorInitials: 'KY',
    authorColor: '#2A2FFF',
    authorType: 'yunicitizen',
    description: 'Marché de producteurs place du Forum 🥦 Chaque samedi matin, venez soutenir le local !',
    imageUrl: 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?w=1080',
    isVideo: false,
    likes: 267,
    comments: 41,
    shares: 56,
    tags: ['#marché', '#local', '#reims'],
  },
  {
    id: 'sh7',
    authorId: 'f3',
    authorName: 'Marie Design',
    authorInitials: 'MD',
    authorColor: '#7C3AED',
    authorType: 'freelance',
    description: 'Nouveau projet identité visuelle pour une startup rémoise 🎨 Fier du résultat !',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=1080',
    isVideo: false,
    likes: 145,
    comments: 19,
    shares: 22,
    tags: ['#design', '#graphisme', '#reims'],
  },
  {
    id: 'sh8',
    authorId: 'u5',
    authorName: 'Sarah Cohen',
    authorInitials: 'SC',
    authorColor: '#2A2FFF',
    authorType: 'yunicitizen',
    description: 'Le nouveau jardin partagé du quartier Croix-Rouge est ouvert ! 🌱 Venez planter avec nous',
    imageUrl: 'https://images.pexels.com/photos/1458457/pexels-photo-1458457.jpeg?w=1080',
    isVideo: false,
    likes: 334,
    comments: 67,
    shares: 89,
    tags: ['#jardin', '#écologie', '#croixrouge'],
  },
];

export default MOCK_SHORTS;
