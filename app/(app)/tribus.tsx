import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radii, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { TribeCard, type TribeListItem } from '@/components/TribeCard';
import { MOCK_TRIBES } from '@/constants/mockTribes';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATS = ['Tous', '🎭 Culture', '🚴 Sport', '💼 Business', '🌱 Écologie', '🍕 Food', '🎨 Art', '💻 Tech'] as const;

const CAT_TO_SLUG: Record<string, string> = {
  '🎭 Culture': 'culture',
  '🚴 Sport': 'sport',
  '💼 Business': 'business',
  '🌱 Écologie': 'ecology',
  '🍕 Food': 'food',
  '🎨 Art': 'art',
  '💻 Tech': 'tech',
};

function toListItem(t: (typeof MOCK_TRIBES)[0]): TribeListItem {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    members: t.members,
    postsToday: t.postsToday,
    emoji: t.emoji,
    isVerified: true,
    isMember: false,
  };
}

export default function TribusScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const [tab, setTab] = useState<'mine' | 'explore'>('mine');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('Tous');
  const [createOpen, setCreateOpen] = useState(false);

  const all = useMemo(() => MOCK_TRIBES.map(toListItem), []);
  const mine: TribeListItem[] = useMemo(() => [], []);
  const list = tab === 'mine' ? mine : all;

  const filtered = useMemo(() => {
    let rows = list;
    const s = q.trim().toLowerCase();
    if (s) rows = rows.filter((t) => t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    if (cat !== 'Tous') {
      const slug = CAT_TO_SLUG[cat];
      if (slug) rows = rows.filter((t) => t.category === slug);
    }
    return rows;
  }, [list, q, cat]);

  function goDetail(t: TribeListItem) {
    router.push({
      pathname: '/(app)/tribes/[id]' as const,
      params: { id: t.id, name: encodeURIComponent(t.name), category: t.category },
    });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Tribus 🏘️</Text>
          <Text style={styles.sub}>Rejoins ta communauté</Text>
        </View>
        <Pressable onPress={() => setCreateOpen(true)} style={({ pressed }) => [styles.plus, pressed && { opacity: 0.88 }]}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.tabRail}>
        {(
          [
            ['mine', 'Mes tribus'],
            ['explore', 'Explorer'],
          ] as const
        ).map(([k, label]) => (
          <Pressable
            key={k}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setTab(k);
            }}
            style={[styles.tabInner, tab === k && styles.tabInnerActive]}
          >
            <Text style={[styles.tabTxt, tab === k && styles.tabTxtActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'explore' ? (
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.gray} style={{ marginRight: 8 }} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Rechercher une tribu..."
              placeholderTextColor={Colors.gray}
              style={styles.searchInput}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCat(c)}
                style={[styles.catChip, cat === c && styles.catChipOn]}
              >
                <Text style={[styles.catChipTxt, cat === c && styles.catChipTxtOn]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={{ height: 8 }} />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: scrollPaddingBottom }]}
        ListEmptyComponent={
          tab === 'mine' ? (
            <EmptyState
              title={"Tu n'as pas encore rejoint de tribu"}
              description="Découvre les communautés locales."
              actionLabel="Explorer les tribus →"
              onAction={() => setTab('explore')}
            />
          ) : (
            <EmptyState title="Aucun résultat" description="Essaie un autre filtre." />
          )
        }
        renderItem={({ item }) => <TribeCard tribe={item} onPress={() => goDetail(item)} />}
      />

      <Modal visible={createOpen} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setCreateOpen(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Créer une tribu</Text>
            <Text style={styles.modalTxt}>Bientôt disponible.</Text>
            <Pressable onPress={() => setCreateOpen(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnTxt}>OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark },
  sub: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  tabRail: {
    marginHorizontal: 20,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radii.min,
    padding: 4,
    gap: 4,
  },
  tabInner: { flex: 1, height: 40, borderRadius: Radii.inner, alignItems: 'center', justifyContent: 'center' },
  tabInnerActive: { backgroundColor: Colors.primary, ...Shadows.card },
  tabTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.gray },
  tabTxtActive: { color: Colors.white },
  searchWrap: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body.family, fontSize: 15, color: Colors.dark },
  catScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  catChipOn: { backgroundColor: '#EEF2FF', borderColor: Colors.primary },
  catChipTxt: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.dark },
  catChipTxtOn: { color: Colors.primary, fontFamily: Fonts.bodySemi.family },
  listContent: { paddingHorizontal: 20, paddingTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 20 },
  modalTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  modalTxt: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  modalBtn: {
    marginTop: 16,
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalBtnTxt: { fontFamily: Fonts.bodySemi.family, color: Colors.white },
});
