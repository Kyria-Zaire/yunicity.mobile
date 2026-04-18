import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Share,
  TextInput,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radii } from '@/constants/theme';
import type { FeedPost, FeedPostType } from '@/constants/mockPosts';
import { PROFILE_COLORS, type ProfileKind } from '@/constants/mockProfiles';

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
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

export function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [expanded, setExpanded] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const heartScale = useRef(new Animated.Value(1)).current;
  const color = PROFILE_COLORS[post.authorType as ProfileKind] ?? Colors.primary;
  const badge = typeBadge(post.type);
  const longText = post.content.length > 120;

  const pulseLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.25, useNativeDriver: true, tension: 200, friction: 4 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }),
    ]).start();
  }, [heartScale]);

  const toggleLike = useCallback(() => {
    setLiked((v) => {
      const next = !v;
      setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      if (next) pulseLike();
      return next;
    });
  }, [pulseLike]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${post.authorName} sur Yunicity :\n\n${post.content}`,
      });
    } catch {
      /* ignore */
    }
  }, [post.authorName, post.content]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarTxt}>{initials(post.authorName)}</Text>
        </View>
        <View style={styles.headerCol}>
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
            <Text style={styles.time}>il y a {post.timestamp}</Text>
          </View>
        </View>
        <Pressable
          hitSlop={12}
          onPress={() => {
            if (Platform.OS === 'ios') {
              ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Annuler', 'Signaler', 'Masquer'], cancelButtonIndex: 0 },
                () => {},
              );
            } else {
              Alert.alert('Menu', 'Actions à venir');
            }
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.gray} />
        </Pressable>
      </View>

      <Text style={styles.body} numberOfLines={expanded ? undefined : 3}>
        {post.content}
      </Text>
      {longText && !expanded ? (
        <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
          <Text style={styles.more}>Voir plus</Text>
        </Pressable>
      ) : null}

      {post.hasImage ? (
        <View style={[styles.media, { backgroundColor: post.imageColor }]}>
          <Text style={styles.mediaEmoji}>{post.imageEmoji ?? '🖼️'}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => setShowReply((v) => !v)}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.gray} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="repeat-outline" size={20} color={Colors.gray} />
          <Text style={styles.actionCount}>{post.shares}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={toggleLike}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#E11D48' : Colors.gray} />
          </Animated.View>
          <Text style={[styles.actionCount, liked && { color: '#E11D48' }]}>{likeCount}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color={Colors.gray} />
        </Pressable>
      </View>

      {showReply ? (
        <View style={styles.replyBox}>
          <TextInput
            value={replyDraft}
            onChangeText={setReplyDraft}
            placeholder="Répondre…"
            placeholderTextColor={Colors.gray}
            style={styles.replyInput}
          />
          <Pressable
            style={styles.replySend}
            onPress={() => {
              setReplyDraft('');
              setShowReply(false);
            }}
          >
            <Text style={styles.replySendTxt}>Envoyer</Text>
          </Pressable>
        </View>
      ) : null}
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
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
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
    borderRadius: Radii.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaEmoji: { fontSize: 48 },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 56 },
  actionCount: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  replyBox: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    borderRadius: Radii.inner,
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  replySend: { paddingHorizontal: 12, paddingVertical: 8 },
  replySendTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
});
