import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StoryRing } from '@/constants/mockStories';
import { VideoThumbnail } from '@/components/ui/VideoThumbnail';

const STORY_DURATION = 5000;
const SWIPE_THRESHOLD = 60;
const SWIPE_DOWN_THRESHOLD = 80;

interface Props {
  rings: StoryRing[];
  initialRingIndex: number;
  onClose: () => void;
  onMarkSeen: (userId: string) => void;
}

/**
 * Compat: l’app appelle encore `StoryViewer({ visible, ring, onAllStoriesViewed, onNavigateRing })`.
 * Pour éviter de toucher d'autres fichiers, on supporte les 2 contrats.
 */
type LegacyProps = {
  visible: boolean;
  ring: StoryRing | null;
  onClose: () => void;
  onAllStoriesViewed: (userId: string) => void;
  onNavigateRing: (direction: 'prev' | 'next') => void;
};

function isLegacyProps(p: Props | LegacyProps): p is LegacyProps {
  return (p as LegacyProps).visible !== undefined;
}

export function StoryViewer(props: Props | LegacyProps) {
  const insets = useSafeAreaInsets();

  const rings = isLegacyProps(props) ? (props.ring ? [props.ring] : []) : props.rings;
  const isVisible = isLegacyProps(props) ? props.visible : true;
  const initialRingIndex = isLegacyProps(props) ? 0 : props.initialRingIndex;
  const onClose = props.onClose;
  const onMarkSeen = isLegacyProps(props) ? props.onAllStoriesViewed : props.onMarkSeen;
  const onNavigateRing = isLegacyProps(props) ? props.onNavigateRing : undefined;

  const [ringIndex, setRingIndex] = useState(initialRingIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef<Animated.CompositeAnimation | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isVisible) return;
    setRingIndex(initialRingIndex);
    setStoryIndex(0);
    translateY.setValue(0);
    opacity.setValue(1);
  }, [isVisible, initialRingIndex]);

  const ring = rings[ringIndex];
  const story = ring?.stories[storyIndex];
  const durationMs = story?.duration ?? STORY_DURATION;

  // ── Navigation stories ────────────────────────────────
  const goNext = useCallback(() => {
    if (!ring) return;

    const lastStoryIndex = ring.stories.length - 1;
    const hasNextStory = storyIndex < lastStoryIndex;

    if (hasNextStory) {
      setStoryIndex((i) => i + 1);
      return;
    }

    onMarkSeen(ring.userId);

    // Contrat demandé: dernière story du user => fermer le viewer
    onClose();
  }, [ring, storyIndex, onClose, onMarkSeen]);

  const goPrev = useCallback(() => {
    setStoryIndex((i) => Math.max(0, i - 1));
  }, []);

  // ── Progression ──────────────────────────────────────
  const startProgress = useCallback(() => {
    progress.setValue(0);
    progressAnim.current?.stop();
    progressAnim.current = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false,
    });
    progressAnim.current.start(({ finished }) => {
      if (finished) goNext();
    });
  }, [progress, goNext, durationMs, ringIndex, storyIndex]);

  useEffect(() => {
    if (!isVisible) return;
    if (!ring || !story) return;
    startProgress();
    return () => progressAnim.current?.stop();
  }, [isVisible, ringIndex, storyIndex, ring, story, startProgress]);

  // ── Swipe horizontal (changer d'user) ────────────────
  const changeRing = useCallback(
    (direction: 'prev' | 'next') => {
      if (onNavigateRing) {
        // Legacy: la navigation d’anneau vit à l’extérieur (FeedScreen)
        onNavigateRing(direction);
        setStoryIndex(0);
        return;
      }

      setRingIndex((i) => {
        const next = direction === 'next' ? Math.min(i + 1, rings.length - 1) : Math.max(i - 1, 0);
        return next;
      });
      setStoryIndex(0);
    },
    [onNavigateRing, rings.length],
  );

  const goToNextRing = useCallback(() => changeRing('next'), [changeRing]);
  const goToPrevRing = useCallback(() => changeRing('prev'), [changeRing]);

  const resetPosition = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  const closeWithSwipeDown = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 600, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [translateY, opacity, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10;
        const isVertical = Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 10;
        return isHorizontal || isVertical;
      },
      onPanResponderMove: (_, g) => {
        if (g.dy > 0 && Math.abs(g.dy) > Math.abs(g.dx)) {
          translateY.setValue(g.dy);
          opacity.setValue(1 - g.dy / 300);
        }
      },
      onPanResponderRelease: (_, g) => {
        const isVertical = Math.abs(g.dy) > Math.abs(g.dx);
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy);

        if (g.dy > SWIPE_DOWN_THRESHOLD && isVertical) {
          closeWithSwipeDown();
          return;
        }

        if (g.dx < -SWIPE_THRESHOLD && isHorizontal) {
          goToNextRing();
          resetPosition();
          return;
        }
        if (g.dx > SWIPE_THRESHOLD && isHorizontal) {
          goToPrevRing();
          resetPosition();
          return;
        }

        resetPosition();
      },
    }),
  ).current;

  if (!isVisible || !ring || !story) return null;

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        style={[styles.container, { transform: [{ translateY }], opacity }]}
        {...panResponder.panHandlers}
      >
        {story.isVideo ? (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <VideoThumbnail thumbnailUrl={story.imageUrl} style={styles.videoThumb} rounded={0} />
          </View>
        ) : (
          <Image source={{ uri: story.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
        )}
        <View style={styles.overlay} />

        <View style={[styles.progressRow, { top: insets.top + 8 }]}>
          {ring.stories.map((_, i) => (
            <View key={String(i)} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < storyIndex
                        ? '100%'
                        : i === storyIndex
                          ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                          : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={[styles.header, { top: insets.top + 24 }]}>
          <View style={[styles.avatar, { backgroundColor: ring.avatarColor }]}>
            <Text style={styles.avatarText}>{ring.initials}</Text>
          </View>
          <Text style={styles.userName}>{ring.userName}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={16}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.tapZones}>
          <Pressable style={styles.tapLeft} onPress={goPrev} />
          <Pressable style={styles.tapRight} onPress={goNext} />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {story.isVideo ? <Text style={styles.videoLabel}>Vidéo</Text> : null}
          <TextInput
            placeholder={`Répondre à ${ring.userName}…`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.replyInput}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },

  progressRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff' },

  header: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  userName: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  closeBtn: { padding: 4 },
  closeText: { color: '#fff', fontSize: 20 },

  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', zIndex: 5 },
  tapLeft: { width: '30%', height: '100%' },
  tapRight: { width: '70%', height: '100%' },

  footer: { position: 'absolute', bottom: 0, left: 12, right: 12, zIndex: 10 },
  replyInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  videoThumb: { width: '100%', height: '100%' },
  videoLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', marginBottom: 8 },
});
