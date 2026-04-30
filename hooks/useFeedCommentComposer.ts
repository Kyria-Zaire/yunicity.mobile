import { useCallback, useRef, useState } from 'react';
import { Keyboard, type TextInput } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useFeedCommentsStore } from '@/stores/feedComments.store';
import { submitPostCommentBestEffort } from '@/lib/postCommentApi';

export type ReplyTarget = { id: string; name: string };

function stripLeadingMention(draft: string, name: string) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return draft.replace(new RegExp(`^@${esc}\\s*`), '');
}

export function useFeedCommentComposer(postId: string, baseCommentCount: number) {
  const user = useAuthStore((s) => s.user);
  const prependComment = useFeedCommentsStore((s) => s.prependComment);
  const bumpAddedCount = useFeedCommentsStore((s) => s.bumpAddedCount);
  const addedCount = useFeedCommentsStore((s) => s.addedCount[postId] ?? 0);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<TextInput>(null);

  const meName =
    user?.profileData?.displayName?.trim() ??
    user?.name?.trim() ??
    user?.email?.split('@')[0] ??
    'Moi';

  const displayTotal = baseCommentCount + addedCount;

  const clearReplyTo = useCallback(() => {
    setReplyTo((prev) => {
      if (prev) {
        setDraft((d) => stripLeadingMention(d, prev.name));
      }
      return null;
    });
  }, []);

  const onSubmit = useCallback(() => {
    const text = draft.trim();
    if (!postId || !text) return;
    prependComment(postId, {
      id: `local-${Date.now()}`,
      authorId: user?.id ?? 'local-user',
      text,
      likes: 0,
      time: "à l'instant",
      likedByMe: false,
    });
    bumpAddedCount(postId);
    setDraft('');
    setReplyTo(null);
    inputRef.current?.blur();
    Keyboard.dismiss();
    void submitPostCommentBestEffort(postId, text);
  }, [draft, postId, prependComment, bumpAddedCount, user?.id]);

  const onReplyTo = useCallback((authorName: string, commentId: string) => {
    setReplyTo({ id: commentId, name: authorName });
    setDraft(`@${authorName} `);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  return {
    draft,
    setDraft,
    inputRef,
    onSubmit,
    onReplyTo,
    meName,
    displayTotal,
    replyTo,
    clearReplyTo,
  };
}
