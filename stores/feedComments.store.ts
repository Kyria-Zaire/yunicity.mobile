import { create } from 'zustand';
import { MOCK_FEED_COMMENTS, type MockFeedCommentSeed } from '@/constants/mockFeedComments';

export type FeedCommentRow = MockFeedCommentSeed & { likedByMe?: boolean };

/** Référence stable pour sélecteurs Zustand (`?? []` recréé à chaque snapshot → boucle getSnapshot). */
export const EMPTY_COMMENT_THREAD: FeedCommentRow[] = [];

type State = {
  /** id canonique du post → fil de commentaires (copie mutable) */
  threads: Record<string, FeedCommentRow[]>;
  /** +N commentaires utilisateur par post (canonique), pour le compteur PostCard */
  addedCount: Record<string, number>;
  ensureThread: (postId: string) => void;
  prependComment: (postId: string, row: FeedCommentRow) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  bumpAddedCount: (postId: string) => void;
};

function cloneSeed(): FeedCommentRow[] {
  return MOCK_FEED_COMMENTS.map((c) => ({ ...c, likedByMe: false }));
}

export const useFeedCommentsStore = create<State>((set, get) => ({
  threads: {},
  addedCount: {},

  ensureThread: (postId) => {
    if (get().threads[postId]?.length) return;
    set((s) => ({ threads: { ...s.threads, [postId]: cloneSeed() } }));
  },

  prependComment: (postId, row) => {
    get().ensureThread(postId);
    set((s) => ({
      threads: {
        ...s.threads,
        [postId]: [row, ...(s.threads[postId] ?? [])],
      },
    }));
  },

  toggleCommentLike: (postId, commentId) => {
    const list = get().threads[postId];
    if (!list) return;
    set({
      threads: {
        ...get().threads,
        [postId]: list.map((row) => {
          if (row.id !== commentId) return row;
          const nextLiked = !row.likedByMe;
          const delta = nextLiked ? 1 : -1;
          return {
            ...row,
            likedByMe: nextLiked,
            likes: Math.max(0, row.likes + delta),
          };
        }),
      },
    });
  },

  bumpAddedCount: (postId) => {
    set((s) => ({
      addedCount: { ...s.addedCount, [postId]: (s.addedCount[postId] ?? 0) + 1 },
    }));
  },
}));
