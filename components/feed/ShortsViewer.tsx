import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MOCK_SHORTS, { type Short } from '@/constants/mockShorts';
import { VideoThumbnail } from '@/components/ui/VideoThumbnail';

const { height: H } = Dimensions.get('window');

interface Props {
  onClose: () => void;
}

export function ShortsViewer({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;
  const exitPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx > 15 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => {
        if (g.dx > 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > 80) {
          Animated.timing(translateX, {
            toValue: Dimensions.get('window').width,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(MOCK_SHORTS.map((s) => [s.id, s.likes])),
  );

  const handleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const wasLiked = !!prev[id];
      setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + (wasLiked ? -1 : 1) }));
      return { ...prev, [id]: !wasLiked };
    });
  }, []);

  const data = useMemo(() => MOCK_SHORTS, []);

  const renderItem = useCallback(
    ({ item }: { item: Short }) => (
      <ShortItem
        item={item}
        insets={insets}
        liked={!!liked[item.id]}
        likeCount={counts[item.id] ?? item.likes}
        onLike={() => handleLike(item.id)}
        onClose={onClose}
      />
    ),
    [counts, handleLike, insets, liked, onClose],
  );

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }] }]} {...exitPan.panHandlers}>
      <StatusBar hidden />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={H}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: H, offset: H * index, index })}
      />
    </Animated.View>
  );
}

interface ItemProps {
  item: Short;
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  onClose: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function ShortItem({ item, liked, likeCount, onLike, onClose, insets }: ItemProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [following, setFollowing] = useState(false);

  const likeLabel = useMemo(() => {
    if (likeCount > 999) return `${(likeCount / 1000).toFixed(1)}k`;
    return String(likeCount);
  }, [likeCount]);

  const animateLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  }, [scale]);

  const onLikePress = useCallback(() => {
    onLike();
    animateLike();
  }, [animateLike, onLike]);

  const onOpenAuthor = useCallback(() => {
    router.push({
      pathname: '/(app)/profile/[id]' as any,
      params: { id: item.authorId },
    });
  }, [item.authorId]);

  return (
    <View style={styles.item}>
      {item.isVideo ? (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <VideoThumbnail thumbnailUrl={item.imageUrl} style={styles.videoThumb} rounded={0} />
        </View>
      ) : (
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.78)']}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <Pressable onPress={onClose} style={[styles.closeBtn, { top: insets.top + 12 }]} hitSlop={16}>
        <Ionicons name="close" size={28} color="#fff" />
      </Pressable>

      <View style={[styles.brand, { top: insets.top + 12 }]}>
        <Text style={styles.brandText}>Yunicity</Text>
        <View style={styles.localBadge}>
          <Text style={styles.localBadgeText}>LOCAL</Text>
        </View>
      </View>

      <View style={[styles.info, { paddingBottom: insets.bottom + 80 }]}>
        <Pressable style={styles.authorRow} onPress={onOpenAuthor}>
          <View style={[styles.avatar, { backgroundColor: item.authorColor }]}>
            <Text style={styles.avatarText}>{item.authorInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{item.authorName}</Text>
            <Text style={styles.authorType}>{item.authorType}</Text>
          </View>
          <Pressable
            style={[
              styles.followBtn,
              following && {
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.5)',
              },
            ]}
            onPress={() => setFollowing((f) => !f)}
          >
            <Text style={styles.followText}>{following ? 'Abonné ✓' : 'Suivre'}</Text>
          </Pressable>
        </Pressable>

        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        {item.isVideo ? <Text style={styles.videoLabel}>Vidéo</Text> : null}

        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 80 }]}>
        <Pressable style={styles.actionBtn} onPress={onLikePress}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={32} color={liked ? '#E11D48' : '#fff'} />
          </Animated.View>
          <Text style={styles.actionCount}>{likeLabel}</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => {}}>
          <Ionicons name="chatbubble-outline" size={30} color="#fff" />
          <Text style={styles.actionCount}>{item.comments}</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => {}}>
          <Ionicons name="share-social-outline" size={30} color="#fff" />
          <Text style={styles.actionCount}>{item.shares}</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => {}}>
          <Ionicons name="rocket-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>Boost</Text>
        </Pressable>

        <Pressable
          style={[styles.authorAvatarSmall, { backgroundColor: item.authorColor }]}
          onPress={() =>
            router.push({
              pathname: '/(app)/profile/[id]' as any,
              params: { id: item.authorId },
            })
          }
        >
          <Text style={styles.authorAvatarText}>{item.authorInitials}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  item: { height: H, width: '100%', backgroundColor: '#000' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: H * 0.65 },
  videoThumb: { width: '100%', height: '100%' },

  closeBtn: { position: 'absolute', left: 16, zIndex: 10 },
  brand: { position: 'absolute', right: 16, zIndex: 10, alignItems: 'flex-end', gap: 6 },
  brandText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  localBadge: { backgroundColor: '#2A2FFF', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  localBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  info: { position: 'absolute', bottom: 0, left: 16, right: 90, zIndex: 5 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  authorName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  authorType: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },
  followBtn: { borderWidth: 1.5, borderColor: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
  followText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  description: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  videoLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700' },

  actions: { position: 'absolute', right: 12, bottom: 0, zIndex: 5, alignItems: 'center', gap: 20 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: { color: '#fff', fontSize: 12, fontWeight: '700' },

  authorAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 8,
  },
  authorAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

