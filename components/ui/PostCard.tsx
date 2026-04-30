import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radii } from '@/constants/theme';
import type { FeedPost, FeedPostType } from '@/constants/mockPosts';
import { PROFILE_COLORS, type ProfileKind } from '@/constants/mockProfiles';
import { PostActionsRow } from '@/components/feed/PostActionsRow';
import { ShareToUserSheet } from '@/components/feed/ShareToUserSheet';
import { BoosterSheet } from '@/components/feed/BoosterSheet';
import { BoosterToast } from '@/components/feed/BoosterToast';

const PLACEHOLDER = require('../../assets/images/placeholder.png');

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

function typeBadge(type: FeedPostType): { label: string; bg: string; fg: string } | null {
  switch (type) {
    case 'offer':
      return { label: 'Offre', bg: '#DCFCE7', fg: '#16A34A' };
    case 'event':
      return { label: 'Événement', bg: '#EEF2FF', fg: '#2A2FFF' };
    case 'question':
      return { label: 'Question', bg: '#FEF3C7', fg: '#D97706' };
    default:
      return null;
  }
}

function formatAgo(raw: string) {
  return raw.replace(/(\d+)\s*min\b/i, '$1 min');
}

export interface PostCardProps {
  post: FeedPost;
  disableAuthorNav?: boolean;
  onPressContent?: () => void;
  onPressAuthor?: () => void;
  onOpenComments?: () => void;
  commentCount?: number;
}

export function PostCard({
  post,
  disableAuthorNav,
  onPressContent,
  onPressAuthor,
  onOpenComments,
  commentCount,
}: PostCardProps) {
  const shareSheetRef = useRef<BottomSheetModal>(null);
  const boosterSheetRef = useRef<BottomSheetModal>(null);

  const [liked, setLiked] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [showBoostToast, setShowBoostToast] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const heartScale = useRef(new Animated.Value(1)).current;

  const color = PROFILE_COLORS[post.authorType as ProfileKind] ?? Colors.primary;
  const badge = typeBadge(post.type);
  const longText = post.content.length > 120;
  const commentsShown = commentCount ?? post.comments;

  const likeDisplayCount = post.likes + (liked ? 1 : 0);

  useEffect(() => {
    setLiked(false);
  }, [post.id, post.likes]);

  useEffect(() => {
    setBoosted(false);
    setShowBoostToast(false);
  }, [post.id]);

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

  const openShareSheet = useCallback(() => {
    shareSheetRef.current?.present();
  }, []);

  const openBooster = useCallback(() => {
    boosterSheetRef.current?.present();
  }, []);

  const goDetail = useCallback(() => {
    if (onPressContent) onPressContent();
    else router.push({ pathname: '/(app)/feed/[id]', params: { id: post.id } });
  }, [onPressContent, post.id]);

  const goAuthor = useCallback(() => {
    if (disableAuthorNav) return;
    if (onPressAuthor) onPressAuthor();
    else router.push({ pathname: '/(app)/profile/[id]', params: { id: post.authorId } });
  }, [disableAuthorNav, onPressAuthor, post.authorId]);

  const openComments = useCallback(() => {
    onOpenComments?.();
  }, [onOpenComments]);

  const showVideoThumb = !!post.hasVideo && !!post.thumbnailUrl;
  const showImageBlock = post.imageUrl && !imageFailed && !post.hasVideo;
  const showEmojiFallback = post.hasImage && (!post.imageUrl || imageFailed) && !post.hasVideo;

  return (
    <View style={styles.container}>
      <ShareToUserSheet modalRef={shareSheetRef} />
      <BoosterSheet
        modalRef={boosterSheetRef}
        onBoost={() => {
          setBoosted(true);
          setShowBoostToast(true);
        }}
      />
      <BoosterToast visible={showBoostToast} onHidden={() => setShowBoostToast(false)} />

      {boosted ? (
        <View style={styles.boostBadge}>
          <Text style={styles.boostBadgeTxt}>🚀 Boosté</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={goAuthor} disabled={!!disableAuthorNav} style={styles.avatarPress}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarTxt}>{initials(post.authorName)}</Text>
          </View>
        </Pressable>
        <Pressable onPress={goAuthor} disabled={!!disableAuthorNav} style={styles.headerCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {post.authorName}
            </Text>
            {badge ? (
              <View style={[styles.typePill, { backgroundColor: badge.bg }]}>
                <Text style={[styles.typePillTxt, { color: badge.fg }]}>{badge.label}</Text>
              </View>
            ) : null}
            <Text style={styles.dotSep}>·</Text>
            <Text style={styles.time}>il y a {formatAgo(post.timestamp)}</Text>
          </View>
        </Pressable>
        <Pressable hitSlop={12} onPress={openBooster}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.gray} />
        </Pressable>
      </View>

      <Pressable onPress={goDetail} style={styles.contentPress}>
        <Text style={styles.body} numberOfLines={expanded ? undefined : 3}>
          {post.content}
        </Text>
        {longText && !expanded ? (
          <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
            <Text style={styles.more}>Voir plus</Text>
          </Pressable>
        ) : null}

        {showVideoThumb ? (
          <View style={styles.videoWrap}>
            <Image
              source={{ uri: post.thumbnailUrl! }}
              style={styles.mediaImg}
              resizeMode="cover"
              {...(Platform.OS === 'ios' ? { defaultSource: PLACEHOLDER } : {})}
              onError={() => setImageFailed(true)}
            />
            <View style={styles.playOverlay}>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={22} color={Colors.white} />
              </View>
            </View>
          </View>
        ) : null}
        {showImageBlock ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.mediaImg}
            resizeMode="cover"
            {...(Platform.OS === 'ios' ? { defaultSource: PLACEHOLDER } : {})}
            onError={() => setImageFailed(true)}
          />
        ) : null}
        {showEmojiFallback ? (
          <View style={[styles.media, { backgroundColor: post.imageColor }]}>
            <Text style={styles.mediaEmoji}>{post.imageEmoji ?? '🖼️'}</Text>
          </View>
        ) : null}
      </Pressable>

      <PostActionsRow
        commentCount={commentsShown}
        shareCount={post.shares}
        likeCount={likeDisplayCount}
        liked={liked}
        heartScale={heartScale}
        onPressComments={openComments}
        onPressLike={toggleLike}
        onPressShare={openShareSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  boostBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  boostBadgeTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.primary },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatarPress: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  headerCol: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  name: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark, maxWidth: '46%' },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radii.pill },
  typePillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 10 },
  dotSep: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  time: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  contentPress: {},
  body: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 22,
  },
  more: { marginTop: 4, fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  media: {
    marginTop: 12,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImg: {
    marginTop: 12,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
  },
  videoWrap: { marginTop: 12 },
  playOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaEmoji: { fontSize: 48 },
});
