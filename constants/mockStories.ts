export interface Story {
  id: string;
  imageUrl: string;
  duration: number;
  isVideo?: boolean;
  /** Texte seul (story publiée depuis l’app) */
  text?: string | null;
}

export interface StoryRing {
  userId: string;
  userName: string;
  userType: string;
  initials: string;
  avatarColor: string;
  seen: boolean;
  stories: Story[];
}

export const MOCK_STORY_RINGS: StoryRing[] = [
  {
    userId: 'u1',
    userName: 'Léa',
    userType: 'yunicitizen',
    initials: 'LM',
    avatarColor: '#2A2FFF',
    seen: false,
    stories: [
      {
        id: 's1a',
        imageUrl: 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?w=800',
        duration: 5000,
      },
      {
        id: 's1b',
        imageUrl: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'c2',
    userName: 'Belga Queen',
    userType: 'commercial',
    initials: 'BQ',
    avatarColor: '#16A34A',
    seen: false,
    stories: [
      {
        id: 's2a',
        imageUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'a1',
    userName: 'Jazz',
    userType: 'association',
    initials: 'JP',
    avatarColor: '#D97706',
    seen: false,
    stories: [
      {
        id: 's3a',
        imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800',
        duration: 5000,
      },
      {
        id: 's3b',
        imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'u3',
    userName: 'Emma',
    userType: 'yunicitizen',
    initials: 'EP',
    avatarColor: '#2A2FFF',
    seen: false,
    stories: [
      {
        id: 's4a',
        imageUrl: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'c1',
    userName: 'Boulangerie',
    userType: 'commercial',
    initials: 'BM',
    avatarColor: '#16A34A',
    seen: false,
    stories: [
      {
        id: 's5a',
        imageUrl: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=800',
        duration: 5000,
      },
      {
        id: 's5b',
        imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'a2',
    userName: 'Cyclistes',
    userType: 'association',
    initials: 'CR',
    avatarColor: '#D97706',
    seen: false,
    stories: [
      {
        id: 's6a',
        imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'f3',
    userName: 'Marie',
    userType: 'freelance',
    initials: 'MD',
    avatarColor: '#7C3AED',
    seen: false,
    stories: [
      {
        id: 's7a',
        imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'u5',
    userName: 'Sarah',
    userType: 'yunicitizen',
    initials: 'SC',
    avatarColor: '#2A2FFF',
    seen: false,
    stories: [
      {
        id: 's8a',
        imageUrl: 'https://images.pexels.com/photos/1458457/pexels-photo-1458457.jpeg?w=800',
        duration: 5000,
      },
      {
        id: 's8b',
        imageUrl: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'c4',
    userName: 'Ao Barber',
    userType: 'commercial',
    initials: 'AB',
    avatarColor: '#16A34A',
    seen: false,
    stories: [
      {
        id: 's9a',
        imageUrl: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
  {
    userId: 'u2',
    userName: 'Thomas',
    userType: 'yunicitizen',
    initials: 'TD',
    avatarColor: '#2A2FFF',
    seen: false,
    stories: [
      {
        id: 's10a',
        imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=800',
        duration: 5000,
      },
    ],
  },
];

export default MOCK_STORY_RINGS;
