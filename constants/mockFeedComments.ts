/** Commentaires seed (8) — auteurs résolus via `getProfileById` dans l’UI */
export type MockFeedCommentSeed = {
  id: string;
  authorId: string;
  text: string;
  likes: number;
  time: string;
};

export const MOCK_FEED_COMMENTS: MockFeedCommentSeed[] = [
  { id: 'cm1', authorId: 'u2', text: "Super initiative ! J'y serai vendredi 🎉", likes: 12, time: '5 min' },
  { id: 'cm2', authorId: 'u3', text: 'Enfin une bonne nouvelle ! On vous adore', likes: 8, time: '8 min' },
  { id: 'cm3', authorId: 'a2', text: 'On partage avec nos membres, merci !', likes: 5, time: '12 min' },
  { id: 'cm4', authorId: 'u5', text: "C'est quand même cher pour Reims non ?", likes: 2, time: '15 min' },
  { id: 'cm5', authorId: 'c3', text: 'On sera là ! 🍕', likes: 15, time: '20 min' },
  { id: 'cm6', authorId: 'u1', text: 'Quelle belle initiative pour notre quartier', likes: 7, time: '25 min' },
  {
    id: 'cm7',
    authorId: 'f1',
    text: "J'ai pris des photos du dernier événement, DM si vous voulez !",
    likes: 19,
    time: '30 min',
  },
  { id: 'cm8', authorId: 'u4', text: "Premier commentaire ici, hâte d'y être !", likes: 3, time: '45 min' },
];
