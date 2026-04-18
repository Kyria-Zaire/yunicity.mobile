import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput, Animated, Easing } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radii, tabBarFloatingLayout, Shadows } from '@/constants/theme';
import { PostCard } from '@/components/PostCard';
import { postsForTribe } from '@/constants/mockPosts';
import { MOCK_TRIBES } from '@/constants/mockTribes';
import { AppBottomSheet } from '@/components/ui/BottomSheet';

function categoryGradient(category: string): [string, string] {
  switch (category) {
    case 'business':
      return [Colors.primary, Colors.primaryDark];
    case 'culture':
      return [Colors.association, '#B45309'];
    case 'sport':
      return ['#16A34A', '#15803D'];
    case 'ecology':
      return ['#059669', '#047857'];
    case 'food':
      return ['#EA580C', '#C2410C'];
    case 'art':
      return [Colors.freelance, '#5B21B6'];
    case 'tech':
      return ['#0891B2', '#0E7490'];
    default:
      return [Colors.primary, Colors.primaryDark];
  }
}

export default function TribeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { fabBottom, scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const { id, name: nameEnc, category: catRaw } = useLocalSearchParams<{ id: string; name?: string; category?: string }>();
  const tribeId = String(id ?? '');
  const displayName = nameEnc ? decodeURIComponent(String(nameEnc)) : 'Tribu';
  const category = String(catRaw ?? 'other');
  const grad = categoryGradient(category);
  const tribeMeta = MOCK_TRIBES.find((t) => t.id === tribeId);
  const members = tribeMeta?.members ?? 120;
  const emoji = tribeMeta?.emoji ?? '🏘️';
  const createSheetRef = useRef<BottomSheet>(null);
  const [draft, setDraft] = useState('');
  const [joined, setJoined] = useState(false);
  const fabPulse = useRef(new Animated.Value(1)).current;

  const feedPosts = useMemo(() => postsForTribe(tribeId), [tribeId]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.05, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fabPulse]);

  const header = useMemo(
    () => (
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 8 }]}>
        <View style={styles.heroTop}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.85 }]}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>
        </View>
        <Text style={styles.emojiBig}>{emoji}</Text>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {displayName}
        </Text>
        <Text style={styles.heroSub}>{members} membres · Reims</Text>
        <Pressable
          onPress={() => setJoined((j) => !j)}
          style={({ pressed }) => [styles.joinBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.joinTxt}>{joined ? 'Quitter' : 'Rejoindre'}</Text>
        </Pressable>
      </LinearGradient>
    ),
    [category, displayName, emoji, grad, insets.top, joined, members],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={feedPosts}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom + 24 }}
        renderItem={({ item }) => <PostCard post={item} />}
      />

      <Animated.View style={[styles.fabWrap, { bottom: fabBottom, transform: [{ scale: fabPulse }] }]}>
        <Pressable onPress={() => createSheetRef.current?.expand()} style={styles.fabPress}>
          <LinearGradient colors={[Colors.primary, '#4F46E5']} style={styles.fab}>
            <Ionicons name="add" size={28} color={Colors.white} />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <AppBottomSheet ref={createSheetRef} snapPoints={['45%', '88%']}>
        <Text style={styles.sheetTitle}>Post dans la tribu</Text>
        <Text style={styles.sheetMuted}>{displayName}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Partage quelque chose…"
          placeholderTextColor={Colors.gray}
          style={styles.input}
          multiline
        />
        <Pressable
          onPress={() => {
            setDraft('');
            createSheetRef.current?.close();
          }}
          style={styles.publish}
        >
          <Text style={styles.publishTxt}>Publier (bientôt)</Text>
        </Pressable>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 180,
    marginBottom: 0,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBig: { fontSize: 48, marginTop: 8 },
  heroTitle: { marginTop: 4, fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  heroSub: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  joinBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinTxt: { fontFamily: Fonts.bodyBold.family, fontSize: 14, color: Colors.primary },
  fabWrap: { position: 'absolute', right: 20, zIndex: 20 },
  fabPress: {},
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  sheetMuted: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  input: {
    marginTop: 12,
    minHeight: 100,
    borderRadius: Radii.inner,
    backgroundColor: Colors.grayLight,
    padding: 12,
    fontFamily: Fonts.body.family,
    color: Colors.dark,
    textAlignVertical: 'top',
  },
  publish: {
    marginTop: 14,
    height: 48,
    borderRadius: Radii.inner,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishTxt: { color: Colors.white, fontFamily: Fonts.bodyBold.family, fontSize: 15 },
});
