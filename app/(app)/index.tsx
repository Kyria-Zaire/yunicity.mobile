import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, tabBarFloatingLayout } from '@/constants/theme';
import { MOCK_POSTS, type FeedPost } from '@/constants/mockPosts';
import { PostCard } from '@/components/PostCard';
import { useAuthStore } from '@/stores/auth.store';

function cyclePosts(page: number): FeedPost[] {
  return MOCK_POSTS.map((p, i) => ({
    ...p,
    id: `${p.id}-p${page}-${i}`,
  }));
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const user = useAuthStore((s) => s.user);
  const [pages, setPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const data = useMemo(() => {
    const out: FeedPost[] = [];
    for (let p = 0; p < pages; p++) {
      out.push(...cyclePosts(p));
    }
    return out;
  }, [pages]);

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

  const firstName = user?.email?.split('@')[0] ?? 'toi';

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.topBar}>
          <Text style={styles.feedTitle}>Feed</Text>
          <View style={styles.topIcons}>
            <Ionicons name="search-outline" size={22} color={Colors.dark} />
          </View>
        </View>
      </SafeAreaView>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        ListHeaderComponent={
          <View style={styles.hint}>
            <Text style={styles.hintTxt}>
              Salut {firstName} — fil d’actualité Reims (mock)
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
      />
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
  },
  feedTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark },
  topIcons: { flexDirection: 'row', gap: 16 },
  hint: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.pageBg },
  hintTxt: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  footer: { paddingVertical: 16, alignItems: 'center' },
});
