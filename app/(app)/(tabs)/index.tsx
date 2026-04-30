import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  TextInput,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Colors, Fonts, tabBarFloatingLayout } from '@/constants/theme';
import { MOCK_POSTS, type FeedPost } from '@/constants/mockPosts';
import { MOCK_STORY_RINGS, type Story, type StoryRing } from '@/constants/mockStories';
import { PostCard } from '@/components/PostCard';
import { CommentsSheet, type CommentsSheetHandle } from '@/components/feed/CommentsSheet';
import { FeedStoriesBar } from '@/components/feed/FeedStoriesBar';
import { CreateStorySheet, type NewStoryPayload } from '@/components/feed/CreateStorySheet';
import { StoryViewer } from '@/components/feed/StoryViewer';
import { ShortsViewer } from '@/components/feed/ShortsViewer';
import { canonicalFeedPostId } from '@/lib/feedCanonicalId';
import { useFeedCommentsStore } from '@/stores/feedComments.store';
import { useAuthStore } from '@/stores/auth.store';
import { useTabSwipe } from '@/hooks/useTabSwipe';
import { useUIStore } from '@/stores/ui.store';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfilingCategory = { id: string; label: string; emoji: string; color: string };
type ProfilingConfig = { title: string; subtitle: string; emoji: string; categories: ProfilingCategory[] };

const PROFILING_DATA: Record<string, ProfilingConfig> = {
  yunicitizen: {
    title: "Qu'est-ce qui t'anime ?",
    subtitle: "Choisis tes centres d'intérêt pour personnaliser ton expérience",
    emoji: '🌍',
    categories: [
      { id: 'jazz', label: 'Jazz & Musique', emoji: '🎷', color: '#D97706' },
      { id: 'velo', label: 'Vélo & Mobilité', emoji: '🚴', color: '#16A34A' },
      { id: 'gastro', label: 'Gastronomie', emoji: '🍽️', color: '#DC2626' },
      { id: 'ecologie', label: 'Écologie', emoji: '🌱', color: '#059669' },
      { id: 'culture', label: 'Culture & Art', emoji: '🎭', color: '#7C3AED' },
      { id: 'sport', label: 'Sport', emoji: '⚡', color: '#16A34A' },
      { id: 'champagne', label: 'Champagne', emoji: '🍾', color: '#D97706' },
      { id: 'photo', label: 'Photographie', emoji: '📸', color: '#0891B2' },
      { id: 'business', label: 'Business', emoji: '💼', color: '#2A2FFF' },
      { id: 'tech', label: 'Tech & Innovation', emoji: '💻', color: '#0891B2' },
      { id: 'famille', label: 'Famille', emoji: '👨‍👩‍👧', color: '#F59E0B' },
      { id: 'solidarite', label: 'Solidarité', emoji: '🤝', color: '#2A2FFF' },
    ],
  },
  commercial: {
    title: "Votre secteur d'activité",
    subtitle: 'Personnalisez votre vitrine et vos recommandations partenaires',
    emoji: '🏪',
    categories: [
      { id: 'resto', label: 'Restauration', emoji: '🍽️', color: '#DC2626' },
      { id: 'bienettre', label: 'Bien-être & Beauté', emoji: '💆', color: '#D97706' },
      { id: 'commerce', label: 'Commerce & Retail', emoji: '🛍️', color: '#2A2FFF' },
      { id: 'services', label: 'Services', emoji: '⚙️', color: '#6B7280' },
      { id: 'culture', label: 'Culture & Loisirs', emoji: '🎭', color: '#7C3AED' },
      { id: 'artisanat', label: 'Artisanat', emoji: '🔨', color: '#B45309' },
      { id: 'sante', label: 'Santé', emoji: '🏥', color: '#16A34A' },
      { id: 'immobilier', label: 'Immobilier', emoji: '🏠', color: '#0891B2' },
    ],
  },
  association: {
    title: "Votre domaine d'action",
    subtitle: 'Connectez-vous aux bons réseaux et événements',
    emoji: '🤝',
    categories: [
      { id: 'culture', label: 'Culture', emoji: '🎭', color: '#7C3AED' },
      { id: 'sport', label: 'Sport', emoji: '⚽', color: '#16A34A' },
      { id: 'solidarite', label: 'Solidarité', emoji: '❤️', color: '#DC2626' },
      { id: 'environnement', label: 'Environnement', emoji: '🌱', color: '#059669' },
      { id: 'education', label: 'Éducation', emoji: '📚', color: '#2A2FFF' },
      { id: 'sante', label: 'Santé', emoji: '🏥', color: '#16A34A' },
      { id: 'jeunesse', label: 'Jeunesse', emoji: '👦', color: '#F59E0B' },
      { id: 'patrimoine', label: 'Patrimoine', emoji: '🏛️', color: '#D97706' },
    ],
  },
  freelance: {
    title: "Votre domaine d'expertise",
    subtitle: 'Trouvez des clients et collaborateurs qui vous correspondent',
    emoji: '💼',
    categories: [
      { id: 'design', label: 'Design & Créa', emoji: '🎨', color: '#7C3AED' },
      { id: 'dev', label: 'Développement', emoji: '💻', color: '#0891B2' },
      { id: 'photo', label: 'Photo & Vidéo', emoji: '📸', color: '#DC2626' },
      { id: 'marketing', label: 'Marketing & Com', emoji: '📣', color: '#D97706' },
      { id: 'conseil', label: 'Conseil & Strat', emoji: '🧠', color: '#2A2FFF' },
      { id: 'redaction', label: 'Rédaction', emoji: '✍️', color: '#059669' },
      { id: 'formation', label: 'Formation', emoji: '🎓', color: '#F59E0B' },
      { id: 'artisanat', label: 'Artisanat & Art', emoji: '🔨', color: '#B45309' },
    ],
  },
  ecole: {
    title: 'Votre établissement',
    subtitle: 'Connectez-vous aux ressources et événements adaptés',
    emoji: '📚',
    categories: [
      { id: 'primaire', label: 'Primaire', emoji: '🎒', color: '#F59E0B' },
      { id: 'college', label: 'Collège', emoji: '📖', color: '#16A34A' },
      { id: 'lycee', label: 'Lycée', emoji: '🎓', color: '#2A2FFF' },
      { id: 'superieur', label: 'Supérieur', emoji: '🏛️', color: '#7C3AED' },
      { id: 'pro', label: 'Formation Pro', emoji: '💼', color: '#0891B2' },
      { id: 'arts', label: 'Arts & Culture', emoji: '🎭', color: '#DC2626' },
      { id: 'sport', label: 'Sport & EPS', emoji: '⚽', color: '#16A34A' },
      { id: 'sciences', label: 'Sciences & Tech', emoji: '🔬', color: '#059669' },
    ],
  },
};

function profilingConfigFor(profileType: string | undefined | null): ProfilingConfig {
  return PROFILING_DATA[profileType ?? ''] ?? PROFILING_DATA['yunicitizen'];
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function mineInitials(
  user:
    | { profileData?: { displayName?: string }; email?: string; name?: string }
    | null
    | undefined,
) {
  const dn = user?.profileData?.displayName?.trim();
  if (dn) {
    const parts = dn.split(/\s+/).filter(Boolean);
    const letters = parts.map((w: string) => w[0]).join('');
    if (letters) return letters.toUpperCase().slice(0, 2);
  }
  const mail = user?.email?.trim();
  if (mail && mail.length >= 2) return mail.slice(0, 2).toUpperCase();
  return 'KY';
}

function cyclePosts(page: number): FeedPost[] {
  return MOCK_POSTS.map((p, i) => ({
    ...p,
    id: `${p.id}-p${page}-${i}`,
  }));
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const meId = user?.id ?? 'local-me';
  const swipe = useTabSwipe('/(app)/(tabs)');
  const setHideTabBar = useUIStore((s) => s.setHideTabBar);

  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const [showProfilingFilter, setShowProfilingFilter] = useState(false);
  const [pages, setPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [shortsMode, setShortsMode] = useState(false);

  const commentsModalRef = useRef<BottomSheetModal>(null);
  const commentsSheetRef = useRef<CommentsSheetHandle>(null);
  const [commentsTarget, setCommentsTarget] = useState<{ id: string; base: number } | null>(null);

  const createStoryRef = useRef<BottomSheetModal>(null);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [ringsSeen, setRingsSeen] = useState<Record<string, boolean>>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerRing, setViewerRing] = useState<StoryRing | null>(null);

  const addedMap = useFeedCommentsStore((s) => s.addedCount);

  const data = useMemo(() => {
    const out: FeedPost[] = [];
    for (let p = 0; p < pages; p++) {
      out.push(...cyclePosts(p));
    }
    return out;
  }, [pages]);

  const filteredData = useMemo(() => {
    if (!isSearching) return data;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) => p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q),
    );
  }, [data, isSearching, searchQuery]);

  const commentCountForPost = useCallback(
    (post: FeedPost) => {
      const cid = canonicalFeedPostId(post.id);
      return post.comments + (addedMap[cid] ?? 0);
    },
    [addedMap],
  );

  const openComments = useCallback((post: FeedPost) => {
    const id = canonicalFeedPostId(post.id);
    setCommentsTarget({ id, base: post.comments });
    requestAnimationFrame(() => {
      commentsModalRef.current?.present();
      commentsSheetRef.current?.focusInput();
      setTimeout(() => commentsSheetRef.current?.focusInput(), 320);
    });
  }, []);

  const closeSearchMode = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearching(false);
    setSearchQuery('');
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    Keyboard.dismiss();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPages(1);
      setRefreshing(false);
    }, 800);
  }, []);

  const onEndReached = useCallback(() => {
    if (loadingMore || pages > 12) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPages((n) => n + 1);
      setLoadingMore(false);
    }, 400);
  }, [loadingMore, pages]);

  const mockRingsWithSeen = useMemo(
    () => MOCK_STORY_RINGS.map((r) => ({ ...r, seen: ringsSeen[r.userId] ?? r.seen })),
    [ringsSeen],
  );

  const myRing = useMemo(
    (): StoryRing => ({
      userId: meId,
      userName: 'Votre story',
      userType: 'yunicitizen',
      initials: mineInitials(user),
      avatarColor: '#2A2FFF',
      seen: ringsSeen[meId] ?? false,
      stories: myStories,
    }),
    [meId, user, myStories, ringsSeen],
  );

  const displayRings = useMemo(() => [myRing, ...mockRingsWithSeen], [myRing, mockRingsWithSeen]);

  const onAllStoriesViewed = useCallback((userId: string) => {
    setRingsSeen((m) => ({ ...m, [userId]: true }));
  }, []);

  const openViewer = useCallback((ring: StoryRing) => {
    if (!ring.stories.length) return;
    setViewerRing(ring);
    setViewerOpen(true);
  }, []);

  const navigateViewerRing = useCallback(
    (direction: 'prev' | 'next') => {
      setViewerRing((current) => {
        if (!current) return null;
        const idx = displayRings.findIndex((r) => r.userId === current.userId);
        if (idx < 0) return current;
        const step = direction === 'next' ? 1 : -1;
        for (let j = idx + step; j >= 0 && j < displayRings.length; j += step) {
          const r = displayRings[j];
          if (r.stories.length > 0) return r;
        }
        return current;
      });
    },
    [displayRings],
  );

  const onPressRing = useCallback(
    (index: number) => {
      const ring = displayRings[index];
      if (!ring) return;
      openViewer(ring);
    },
    [displayRings, openViewer],
  );

  const onPressMineWithStories = useCallback(() => {
    openViewer(myRing);
  }, [myRing, openViewer]);

  const onPublishStory = useCallback((payload: NewStoryPayload) => {
    const isVideo = !!payload.videoUri?.trim();
    const st: Story = {
      id: payload.id,
      imageUrl: payload.imageUri?.trim()
        ? payload.imageUri!
        : payload.videoUri?.trim()
          ? payload.videoUri!
          : '',
      duration: isVideo ? 10000 : 5000,
      isVideo,
      text: payload.text?.trim() ? payload.text.trim() : null,
    };
    setMyStories((s) => [st, ...s]);
  }, []);

  const listHeader = useMemo(
    () => (
      <FeedStoriesBar
        rings={displayRings}
        meUserId={meId}
        onPressMine={() => createStoryRef.current?.present()}
        onPressMineWithStories={onPressMineWithStories}
        onPressRing={onPressRing}
      />
    ),
    [displayRings, meId, onPressMineWithStories, onPressRing],
  );

  useFocusEffect(
    useCallback(() => {
      return () => setHideTabBar(false);
    }, [setHideTabBar]),
  );

  useEffect(() => {
    setHideTabBar(shortsMode);
  }, [setHideTabBar, shortsMode]);

  useEffect(() => {
    let timeout: any;
    const checkProfiling = async () => {
      try {
        const interests = await AsyncStorage.getItem('yunicity_interests');
        const parsed = interests ? (JSON.parse(interests) as unknown[]) : [];
        if (Array.isArray(parsed) && parsed.length < 3) {
          timeout = setTimeout(() => setShowProfilingFilter(true), 6000);
        }
      } catch {
        timeout = setTimeout(() => setShowProfilingFilter(true), 6000);
      }
    };
    checkProfiling();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  if (shortsMode) {
    return <ShortsViewer onClose={() => setShortsMode(false)} />;
  }

  return (
    <View style={styles.root} {...swipe.panHandlers}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.topBar}>
          {!isSearching ? (
            <>
              <Text style={styles.feedTitle}>Feed</Text>
              <View style={styles.headerActions}>
                <Pressable
                  hitSlop={12}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsSearching(true);
                  }}
                  style={({ pressed }) => [pressed && { opacity: 0.75 }]}
                >
                  <Ionicons name="search-outline" size={22} color={Colors.dark} />
                </Pressable>
                <Pressable
                  onPress={() => setShortsMode((v) => !v)}
                  style={({ pressed }) => [styles.shortsToggle, pressed && { opacity: 0.9 }]}
                >
                  <Ionicons name="play-outline" size={18} color="#0D0F2E" />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.searchRow}>
              <Pressable onPress={closeSearchMode} style={styles.searchBack}>
                <Ionicons name="chevron-back" size={22} color={Colors.dark} />
                <Text style={styles.searchBackTxt}>Retour</Text>
              </Pressable>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher dans le fil…"
                placeholderTextColor={Colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              <Pressable
                hitSlop={10}
                onPress={handleCloseSearch}
                style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={22} color="#0D0F2E" />
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onOpenComments={() => openComments(item)}
            commentCount={commentCountForPost(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
      />
      <CommentsSheet
        ref={commentsSheetRef}
        modalRef={commentsModalRef}
        postId={commentsTarget?.id ?? ''}
        baseCommentCount={commentsTarget?.base ?? 0}
        onDismiss={() => setCommentsTarget(null)}
      />
      <CreateStorySheet modalRef={createStoryRef} meProfileId={meId} onPublish={onPublishStory} />
      <StoryViewer
        visible={viewerOpen}
        ring={viewerRing}
        onClose={() => {
          setViewerOpen(false);
          setViewerRing(null);
        }}
        onAllStoriesViewed={onAllStoriesViewed}
        onNavigateRing={navigateViewerRing}
      />
      {showProfilingFilter ? (
        <ProfilingFilterModal
          profileType={(user as any)?.profileType ?? 'yunicitizen'}
          userId={user?.id ?? null}
          onClose={() => setShowProfilingFilter(false)}
        />
      ) : null}
    </View>
  );
}

function ProfilingFilterModal({
  profileType,
  userId,
  onClose,
}: {
  profileType: string;
  userId: string | null;
  onClose: () => void;
}) {
  const cfg = useMemo(() => profilingConfigFor(profileType), [profileType]);
  const [selected, setSelected] = useState<string[]>([]);
  const translateY = useRef(new Animated.Value(900)).current;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem('yunicity_interests');
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (mounted && Array.isArray(parsed)) {
          setSelected(parsed.filter((x) => typeof x === 'string') as string[]);
        }
      } catch {
        // ignore
      }
    };
    load();
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }).start();
    return () => {
      mounted = false;
    };
  }, [translateY]);

  const close = useCallback(() => {
    Animated.timing(translateY, { toValue: 900, duration: 220, useNativeDriver: true }).start(() => onClose());
  }, [onClose, translateY]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const canSubmit = selected.length >= 3;

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    const payload = selected.slice(0, 24);
    await AsyncStorage.setItem('yunicity_interests', JSON.stringify(payload));
    if (userId) {
      try {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
          body: JSON.stringify({ profileData: { interests: payload } }),
        });
      } catch {
        // mode demo/offline
      }
    }
    close();
  }, [canSubmit, close, selected, userId]);

  return (
    <View style={profilingStyles.root} pointerEvents="box-none">
      <Pressable style={profilingStyles.backdrop} onPress={close} />
      <Animated.View style={[profilingStyles.card, { transform: [{ translateY }] }]}>
        <View style={profilingStyles.handle} />

        <View style={profilingStyles.head}>
          <View style={[profilingStyles.heroEmojiWrap, { backgroundColor: 'rgba(42,47,255,0.10)' }]}>
            <Text style={profilingStyles.heroEmoji}>{cfg.emoji}</Text>
          </View>
          <Text style={profilingStyles.title}>{cfg.title}</Text>
          <Text style={profilingStyles.subtitle}>{cfg.subtitle}</Text>

          <Text style={[profilingStyles.counter, canSubmit && { color: '#16A34A' }]}>
            {canSubmit ? `✓ ${selected.length} sélectionnés` : `${selected.length} sélectionnés · min 3`}
          </Text>
        </View>

        <FlatList
          data={cfg.categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={profilingStyles.grid}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => {
            const isOn = selected.includes(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                style={[
                  profilingStyles.tag,
                  isOn && { borderColor: item.color, borderWidth: 2, backgroundColor: `${item.color}14` },
                ]}
              >
                {isOn ? (
                  <View style={[profilingStyles.check, { backgroundColor: item.color }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                ) : null}
                <View style={[profilingStyles.tagEmojiWrap, { backgroundColor: `${item.color}22` }]}>
                  <Text style={profilingStyles.tagEmoji}>{item.emoji}</Text>
                </View>
                <Text style={profilingStyles.tagLabel}>{item.label}</Text>
              </Pressable>
            );
          }}
        />

        <View style={profilingStyles.footer}>
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[
              profilingStyles.cta,
              !canSubmit && { backgroundColor: '#E5E7EB' },
            ]}
          >
            <Text style={[profilingStyles.ctaText, !canSubmit && { color: '#9CA3AF' }]}>
              Personnaliser mon expérience 🚀
            </Text>
          </Pressable>
          <Pressable onPress={close} hitSlop={10}>
            <Text style={profilingStyles.skip}>Passer pour l'instant</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  safe: { backgroundColor: Colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    minHeight: 48,
  },
  feedTitle: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.dark },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shortsToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBack: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  searchBackTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
  },
  clearBtn: { padding: 4 },
  footer: { paddingVertical: 16, alignItems: 'center' },
});

const profilingStyles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  card: {
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  head: { paddingHorizontal: 18, alignItems: 'center', paddingBottom: 10 },
  heroEmojiWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroEmoji: { fontSize: 40 },
  title: { fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark, textAlign: 'center' },
  subtitle: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, textAlign: 'center' },
  counter: { marginTop: 10, fontFamily: Fonts.bodyMedium.family, fontSize: 13, color: Colors.gray },
  grid: { paddingHorizontal: 18, paddingBottom: 160, gap: 12 },
  tag: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    minHeight: 74,
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagEmojiWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tagEmoji: { fontSize: 18 },
  tagLabel: { marginTop: 10, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
  },
  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: '#fff' },
  skip: { marginTop: 12, textAlign: 'center', fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
});

