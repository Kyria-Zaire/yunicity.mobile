export type MockTribe = {
  id: string;
  name: string;
  category: string;
  members: number;
  description: string;
  postsToday: number;
  emoji: string;
};

export const MOCK_TRIBES: MockTribe[] = [
  { id: 't1', name: 'Cyclistes de Reims', category: 'sport', members: 147, description: 'Balades et mobilité douce en ville', postsToday: 5, emoji: '🚴' },
  { id: 't2', name: 'Jazz au Parvis', category: 'culture', members: 89, description: 'Jazz et musique improvisée', postsToday: 2, emoji: '🎷' },
  { id: 't3', name: 'Jardins Partagés', category: 'ecology', members: 234, description: 'Jardiner ensemble en ville', postsToday: 8, emoji: '🌱' },
  { id: 't4', name: 'Entrepreneurs Reims', category: 'business', members: 312, description: 'Réseau des entrepreneurs locaux', postsToday: 12, emoji: '💼' },
  { id: 't5', name: 'Foodies Rémois', category: 'food', members: 456, description: 'Bons plans resto et cuisine locale', postsToday: 19, emoji: '🍽️' },
  { id: 't6', name: 'Photo Urbaine', category: 'art', members: 78, description: 'Capturer Reims sous tous les angles', postsToday: 3, emoji: '📸' },
  { id: 't7', name: 'Dev & Tech Reims', category: 'tech', members: 123, description: 'Tech, code et innovation locale', postsToday: 6, emoji: '💻' },
  { id: 't8', name: 'Sport Collectif', category: 'sport', members: 198, description: 'Foot, basket, rugby... ensemble', postsToday: 4, emoji: '⚽' },
];
