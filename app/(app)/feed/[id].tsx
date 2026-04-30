import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Colors, Fonts } from '@/constants/theme';
import { MOCK_POSTS } from '@/constants/mockPosts';
import { PROFILE_COLORS, type ProfileKind } from '@/constants/mockProfiles';
import { canonicalFeedPostId } from '@/lib/feedCanonicalId';
import { PostActionsRow } from '@/components/feed/PostActionsRow';
import { FeedCommentsListOnly, FeedCommentComposer } from '@/components/feed/FeedCommentsBlock';
import { useFeedCommentComposer } from '@/hooks/useFeedCommentComposer';
import { useAuthStore } from '@/stores/auth.store';
import { useFeedCommentsStore } from '@/stores/feedComments.store';
import { ProfileTypeBadge, type ProfileType } from '@/components/ui/Badge';
import { useUIStore } from '@/stores/ui.store';
import { ShareToUserSheet } from '@/components/feed/ShareToUserSheet';
import { BoosterSheet } from '@/components/feed/BoosterSheet';
import { BoosterToast } from '@/components/feed/BoosterToast';

const PLACEHOLDER = require('../../../assets/images/placeholder.png');

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');

// `expo-av` peut ne pas être présent dans le client natif (dev build non rebuild).
// IMPORTANT: ne pas require au top-level → certains environnements crashent avant le catch.
function getExpoAv() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native') as any;
    // Si le client natif n'embarque pas ExponentAV, éviter d'utiliser expo-av.
    if (!rn?.NativeModules?.ExponentAV) return null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-av') as any;
  } catch {
    return null;
  }
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

function formatAgo(raw: string) {
  return raw.replace(/(\d+)\s*min\b/i, '$1 min');
}

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const setHideTabBar = useUIStore((s) => s.setHideTabBar);
  const rawId = useLocalSearchParams<{ id: string | string[] }>().id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;
  const canonical = canonicalFeedPostId(typeof idParam === 'string' ? idParam : '');
  const post = useMemo(() => MOCK_POSTS.find((p) => p.id === canonical), [canonical]);

  const user = useAuthStore((s) => s.user);
  const addedComments = useFeedCommentsStore((s) => (canonical ? s.addedCount[canonical] ?? 0 : 0));
  const ensureThread = useFeedCommentsStore((s) => s.ensureThread);

  const { draft, setDraft, inputRef, onSubmit, onReplyTo, meName, replyTo, clearReplyTo } = useFeedCommentComposer(
    canonical,
    post?.comments ?? 0,
  );

  useFocusEffect(
    useCallback(() => {
      setHideTabBar(true);
      return () => setHideTabBar(false);
    }, [setHideTabBar]),
  );

  const [liked, setLiked] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [showBoostToast, setShowBoostToast] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [following, setFollowing] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);
  const shareSheetRef = useRef<BottomSheetModal>(null);
  const boosterSheetRef = useRef<BottomSheetModal>(null);

  const likeDisplayCount = (post?.likes ?? 0) + (liked ? 1 : 0);

  useEffect(() => {
    if (post) {
      setLiked(false);
      setImageFailed(false);
    }
  }, [post]);

  useEffect(() => {
    setBoosted(false);
    setShowBoostToast(false);
  }, [canonical]);

  useEffect(() => {
    if (canonical) ensureThread(canonical);
  }, [canonical, ensureThread]);

  const commentDisplay = (post?.comments ?? 0) + addedComments;

  const pulseLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.25, useNativeDriver: true, tension: 200, friction: 4 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }),
    ]).start();
  }, [heartScale]);

  const toggleLike = useCallback(() => {
    setLiked((v) => {
      const next = !v;
      if (next) pulseLike();
      return next;
    });
  }, [pulseLike]);

  const onShare = useCallback(() => {
    shareSheetRef.current?.present();
  }, []);

  const onPressComments = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const color = useMemo(
    () => (post ? PROFILE_COLORS[post.authorType as ProfileKind] ?? Colors.primary : Colors.primary),
    [post],
  );

  const isSelf = user?.id === post?.authorId;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)');
  }, []);

  if (!post) {
    return (
      <View style={[styles.missingRoot, { paddingTop: insets.top }]}>
        <Pressable onPress={handleBack} style={styles.missingBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
          <Text style={styles.missingBackTxt}>Retour</Text>
        </Pressable>
        <Text style={styles.missingTxt}>Post introuvable</Text>
      </View>
    );
  }

  const av = useMemo(() => getExpoAv(), []);
  const ExpoVideo = av?.Video ?? null;
  const ExpoResizeMode = av?.ResizeMode ?? null;

  const showImage = post.imageUrl && !imageFailed;
  const showEmoji = post.hasImage && (!post.imageUrl || imageFailed);
  const showVideo = !!post.hasVideo && !!post.videoUrl && !!ExpoVideo;

  return (
    <View style={styles.root}>
      <ShareToUserSheet modalRef={shareSheetRef} />
      <BoosterSheet
        modalRef={boosterSheetRef}
        onBoost={() => {
          setBoosted(true);
          setShowBoostToast(true);
        }}
      />
      <BoosterToast visible={showBoostToast} onHidden={() => setShowBoostToast(false)} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
          <Text style={styles.headerBackTxt}>Retour</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Post</Text>
          {boosted ? (
            <View style={styles.boostBadge}>
              <Text style={styles.boostBadgeTxt}>🚀 Boosté</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.headerSide}>
          <Pressable hitSlop={10} onPress={() => boosterSheetRef.current?.present()} style={{ alignSelf: 'flex-end' }}>
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.dark} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authorBlock}>
            <Pressable
              onPress={() => router.push({ pathname: '/(app)/profile/[id]', params: { id: post.authorId } })}
            >
              <View style={[styles.avatarLg, { backgroundColor: color }]}>
                <Text style={styles.avatarLgTxt}>{initials(post.authorName)}</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.authorMid}
              onPress={() => router.push({ pathname: '/(app)/profile/[id]', params: { id: post.authorId } })}
            >
              <Text style={styles.authorName}>{post.authorName}</Text>
              <View style={styles.badgeRow}>
                <ProfileTypeBadge type={post.authorType as ProfileType} />
                <Text style={styles.dot}>·</Text>
                <Text style={styles.time}>il y a {formatAgo(post.timestamp)}</Text>
              </View>
            </Pressable>
            {!isSelf ? (
              <Pressable
                onPress={() => setFollowing((f) => !f)}
                style={({ pressed }) => [styles.followBtn, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.followTxt}>{following ? 'Abonnés' : 'Suivre'}</Text>
              </Pressable>
            ) : (
              <View style={{ width: 88 }} />
            )}
          </View>

          <Text style={styles.bodyFull}>{post.content}</Text>

          {showVideo ? (
            <ExpoVideo
              source={{ uri: post.videoUrl! }}
              style={styles.heroImg}
              useNativeControls
              resizeMode={ExpoResizeMode?.CONTAIN}
              shouldPlay={false}
            />
          ) : null}

          {showImage && !showVideo ? (
            <Pressable onPress={() => setImageZoom(true)}>
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.heroImg}
                resizeMode="cover"
                {...(Platform.OS === 'ios' ? { defaultSource: PLACEHOLDER } : {})}
                onError={() => setImageFailed(true)}
              />
            </Pressable>
          ) : null}
          {showEmoji && !showVideo ? (
            <View style={[styles.emojiHero, { backgroundColor: post.imageColor }]}>
              <Text style={styles.emojiHeroTxt}>{post.imageEmoji ?? '🖼️'}</Text>
            </View>
          ) : null}

          <Text style={styles.statsLine}>
            {likeDisplayCount} j’aime · {commentDisplay} commentaires · {post.shares} partages
          </Text>

          <PostActionsRow
            commentCount={commentDisplay}
            shareCount={post.shares}
            likeCount={likeDisplayCount}
            liked={liked}
            heartScale={heartScale}
            onPressComments={onPressComments}
            onPressLike={toggleLike}
            onPressShare={onShare}
          />

          <Text style={styles.commentsTitle}>Commentaires</Text>
          <FeedCommentsListOnly postId={canonical} onReply={onReplyTo} />
        </ScrollView>

        <View style={[styles.stickyComposer, { paddingBottom: insets.bottom + 8 }]}>
          <FeedCommentComposer
            replyInputRef={inputRef}
            draft={draft}
            setDraft={setDraft}
            onSubmit={onSubmit}
            meName={meName}
            replyTo={replyTo}
            clearReplyTo={clearReplyTo}
          />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={imageZoom} transparent animationType="fade" onRequestClose={() => setImageZoom(false)}>
        <Pressable style={styles.zoomBg} onPress={() => setImageZoom(false)}>
          {post.imageUrl && !post.hasVideo ? (
            <Image
              source={{ uri: post.imageUrl }}
              style={{ width: WIN_W, height: WIN_H * 0.55 }}
              resizeMode="contain"
            />
          ) : null}
          <Text style={styles.zoomHint}>Tap pour fermer</Text>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  missingRoot: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 20 },
  missingBack: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24 },
  missingBackTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 16, color: Colors.dark },
  missingTxt: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.gray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerSide: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 88 },
  headerBackTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  headerTitle: {
    textAlign: 'center',
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.dark,
  },
  boostBadge: {
    marginTop: 4,
    alignSelf: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  boostBadgeTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.primary },
  scrollPad: { paddingHorizontal: 16, paddingTop: 16 },
  authorBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatarLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
  authorMid: { flex: 1, minWidth: 0 },
  authorName: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 6 },
  dot: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  time: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  followBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  followTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  bodyFull: {
    marginTop: 16,
    fontFamily: Fonts.body.family,
    fontSize: 16,
    color: '#0D0F2E',
    lineHeight: 24,
  },
  heroImg: {
    marginTop: 16,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
  },
  emojiHero: {
    marginTop: 16,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiHeroTxt: { fontSize: 56 },
  statsLine: {
    marginTop: 16,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: '#6B7280',
  },
  commentsTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  stickyComposer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  zoomBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomHint: {
    marginTop: 16,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
