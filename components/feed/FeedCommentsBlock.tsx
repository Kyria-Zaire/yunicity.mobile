import {
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  type Ref,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  type ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Colors, Fonts } from '@/constants/theme';
import { getProfileById, PROFILE_COLORS, type ProfileKind } from '@/constants/mockProfiles';
import {
  useFeedCommentsStore,
  EMPTY_COMMENT_THREAD,
  type FeedCommentRow,
} from '@/stores/feedComments.store';
import { useFeedCommentComposer, type ReplyTarget } from '@/hooks/useFeedCommentComposer';

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

function formatAgo(raw: string) {
  return raw.replace(/(\d+)\s*min\b/i, '$1 min');
}

type Props = {
  postId: string;
  baseCommentCount: number;
  ListComponent?: React.ComponentType<Record<string, unknown>> | typeof FlatList;
  listRef?: React.RefObject<FlatList<FeedCommentRow> | null>;
  showListCountHeader?: boolean;
  disableKeyboardAvoiding?: boolean;
  useBottomSheetTextInput?: boolean;
};

export type FeedCommentsBlockHandle = {
  focusComposer: () => void;
};

export const FeedCommentsBlock = forwardRef(function FeedCommentsBlock(
  {
    postId,
    baseCommentCount,
    ListComponent = FlatList,
    listRef,
    showListCountHeader = false,
    disableKeyboardAvoiding = false,
    useBottomSheetTextInput = false,
  }: Props,
  ref: Ref<FeedCommentsBlockHandle | null>,
) {
  const ensureThread = useFeedCommentsStore((s) => s.ensureThread);
  const toggleCommentLike = useFeedCommentsStore((s) => s.toggleCommentLike);
  const rows = useFeedCommentsStore((s) => s.threads[postId] ?? EMPTY_COMMENT_THREAD);
  const { draft, setDraft, inputRef, onSubmit, onReplyTo, meName, displayTotal, replyTo, clearReplyTo } =
    useFeedCommentComposer(postId, baseCommentCount);

  useImperativeHandle(
    ref,
    () => ({
      focusComposer: () => {
        inputRef.current?.focus();
      },
    }),
    [inputRef],
  );

  const renderItem: ListRenderItem<FeedCommentRow> = useCallback(
    ({ item }) => (
      <CommentRowView
        item={item}
        postId={postId}
        onReply={(name, id) => onReplyTo(name, id)}
        onToggleLike={toggleCommentLike}
      />
    ),
    [postId, onReplyTo, toggleCommentLike],
  );

  const headerCount = useMemo(
    () =>
      showListCountHeader ? (
        <Text style={styles.subHead}>
          {displayTotal} commentaire{displayTotal > 1 ? 's' : ''}
        </Text>
      ) : null,
    [displayTotal, showListCountHeader],
  );

  if (postId) ensureThread(postId);

  if (!postId) {
    return <View style={styles.flex} />;
  }

  const inner = (
    <View style={styles.flex}>
      <ListComponent
        ref={listRef as React.RefObject<FlatList<FeedCommentRow>>}
        data={rows}
        keyExtractor={(item: FeedCommentRow) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={headerCount ?? undefined}
        contentContainerStyle={styles.listPad}
        keyboardShouldPersistTaps="handled"
      />
      <FeedCommentComposer
        replyInputRef={inputRef}
        draft={draft}
        setDraft={setDraft}
        onSubmit={onSubmit}
        meName={meName}
        useBottomSheetTextInput={useBottomSheetTextInput}
        replyTo={replyTo}
        clearReplyTo={clearReplyTo}
      />
    </View>
  );

  if (disableKeyboardAvoiding) return inner;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      {inner}
    </KeyboardAvoidingView>
  );
});

export function FeedCommentComposer({
  replyInputRef,
  draft,
  setDraft,
  onSubmit,
  meName,
  useBottomSheetTextInput = false,
  replyTo,
  clearReplyTo,
}: {
  replyInputRef: React.RefObject<any>;
  draft: string;
  setDraft: (t: string) => void;
  onSubmit: () => void;
  meName: string;
  useBottomSheetTextInput?: boolean;
  replyTo?: ReplyTarget | null;
  clearReplyTo?: () => void;
}) {
  const InputCmp = useBottomSheetTextInput ? BottomSheetTextInput : TextInput;
  return (
    <View style={styles.composerWrap}>
      {replyTo ? (
        <View style={styles.replyPillRow}>
          <View style={styles.replyPill}>
            <Text style={styles.replyPillTxt} numberOfLines={1}>
              @{replyTo.name}
            </Text>
            <Pressable hitSlop={10} onPress={clearReplyTo} accessibilityLabel="Annuler la réponse">
              <Text style={styles.replyPillClose}>✕</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <View style={styles.composerOuter}>
        <View style={[styles.meAv, { backgroundColor: Colors.primary }]}>
          <Text style={styles.meAvTxt}>{initials(meName)}</Text>
        </View>
        <InputCmp
          ref={replyInputRef as any}
          value={draft}
          onChangeText={setDraft}
          placeholder="Ajouter un commentaire..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          autoFocus={false}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={onSubmit}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.publish,
            !draft.trim() && styles.publishOff,
            pressed && draft.trim() && { opacity: 0.92 },
          ]}
        >
          <Text style={styles.publishTxt}>Publier</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CommentRowView({
  item,
  postId,
  onReply,
  onToggleLike,
}: {
  item: FeedCommentRow;
  postId: string;
  onReply: (name: string, commentId: string) => void;
  onToggleLike: (postId: string, commentId: string) => void;
}) {
  const profile = getProfileById(item.authorId);
  const name = profile ? ('name' in profile ? profile.name : '?') : item.authorId;
  const kind = (profile?.type ?? 'yunicitizen') as ProfileKind;
  const color = PROFILE_COLORS[kind] ?? Colors.primary;
  const liked = !!item.likedByMe;

  return (
    <View style={styles.row}>
      <View style={[styles.av, { backgroundColor: color }]}>
        <Text style={styles.avTxt}>{initials(name)}</Text>
      </View>
      <View style={styles.col}>
        <View style={styles.nameLine}>
          <Text style={styles.authorName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.time}>il y a {formatAgo(item.time)}</Text>
        </View>
        <Text style={styles.bodyTxt}>{item.text}</Text>
        <View style={styles.actRow}>
          <Pressable onPress={() => onToggleLike(postId, item.id)} style={styles.likeBtn}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? '#E11D48' : Colors.gray} />
            <Text style={styles.likeNum}>{item.likes}</Text>
          </Pressable>
          <Pressable onPress={() => onReply(name, item.id)} hitSlop={8}>
            <Text style={styles.reply}>Répondre</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function FeedCommentsListOnly({
  postId,
  onReply,
}: {
  postId: string;
  onReply: (name: string, commentId: string) => void;
}) {
  const ensureThread = useFeedCommentsStore((s) => s.ensureThread);
  const toggleCommentLike = useFeedCommentsStore((s) => s.toggleCommentLike);
  const rows = useFeedCommentsStore((s) => s.threads[postId] ?? EMPTY_COMMENT_THREAD);
  if (postId) ensureThread(postId);
  return (
    <View style={styles.threadOnly}>
      {rows.map((item) => (
        <CommentRowView key={item.id} item={item} postId={postId} onReply={onReply} onToggleLike={toggleCommentLike} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listPad: { paddingBottom: 12, gap: 0 },
  subHead: {
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  av: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 12, color: Colors.white },
  col: { flex: 1, minWidth: 0 },
  nameLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  authorName: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark, maxWidth: '70%' },
  dot: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  time: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  bodyTxt: {
    marginTop: 4,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeNum: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  reply: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.primary },
  composerWrap: {
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  replyPillRow: { paddingHorizontal: 4, paddingTop: 8 },
  replyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    maxWidth: '100%',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  replyPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.primary, flexShrink: 1 },
  replyPillClose: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  composerOuter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  meAv: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meAvTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 11, color: Colors.white },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  publish: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  publishOff: { opacity: 0.4 },
  publishTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  threadOnly: { gap: 0 },
});
