import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radii, Shadows } from '@/constants/theme';
import { MOCK_PROFILES, PROFILE_COLORS, type MockProfile, type ProfileKind } from '@/constants/mockProfiles';
import { ProfileTypeBadge, type ProfileType } from '@/components/ui/Badge';

type TabKey = 'followers' | 'following';

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'YU';
}

function isVerified(p: MockProfile): boolean {
  return 'verified' in p ? !!p.verified : false;
}

function displayName(p: MockProfile): string {
  return 'name' in p ? p.name : 'Profil';
}

function locationLine(p: MockProfile): string {
  if ('quartier' in p) return `📍 ${p.quartier} · Reims`;
  if ('address' in p) return `📍 ${p.address}, Reims`;
  return '📍 Reims';
}

function profileType(p: MockProfile): ProfileType {
  return (p.type as ProfileType) ?? 'yunicitizen';
}

function avatarColor(p: MockProfile): string {
  return PROFILE_COLORS[p.type as ProfileKind] ?? Colors.primary;
}

function usernameFromProfile(p: MockProfile): string {
  const n = displayName(p)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 14);
  return n || 'yunicity';
}

export default function FollowersScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ userId?: string; initialTab?: TabKey }>();
  const userId = String(params.userId ?? 'u1');
  const initialTab = (params.initialTab === 'following' ? 'following' : 'followers') as TabKey;

  const meId = 'u1';
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [query, setQuery] = useState('');

  const owner = useMemo(() => MOCK_PROFILES.find((p) => p.id === userId) ?? MOCK_PROFILES[0]!, [userId]);
  const username = useMemo(() => usernameFromProfile(owner), [owner]);

  const followers = useMemo(() => MOCK_PROFILES.slice(0, 12), []);
  const following = useMemo(
    () => [MOCK_PROFILES[0], MOCK_PROFILES[1], MOCK_PROFILES[2], MOCK_PROFILES[3], MOCK_PROFILES[4], MOCK_PROFILES[7], MOCK_PROFILES[8], MOCK_PROFILES[9]].filter(Boolean) as MockProfile[],
    [],
  );

  const list = tab === 'followers' ? followers : following;
  const [followingSet, setFollowingSet] = useState<Set<string>>(() => new Set(following.map((p) => p.id)));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => displayName(p).toLowerCase().includes(q));
  }, [list, query]);

  const counts = useMemo(
    () => ({ followers: followers.length, following: following.length }),
    [followers.length, following.length],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerLeft}>
          <Ionicons name="chevron-back" size={22} color={Colors.dark} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          @{username}
        </Text>
        <Pressable
          onPress={() => Alert.alert('Yuni AI', 'Yuni AI arrive bientôt !')}
          hitSlop={12}
          style={styles.headerRight}
        >
          <View style={styles.yuCircle}>
            <Text style={styles.yuTxt}>Yu</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        <Pressable onPress={() => setTab('followers')} style={styles.tabBtn}>
          <Text style={[styles.tabTxt, tab === 'followers' && styles.tabTxtOn]}>
            Abonnés {counts.followers}
          </Text>
          <View style={[styles.underline, tab === 'followers' && styles.underlineOn]} />
        </Pressable>
        <Pressable onPress={() => setTab('following')} style={styles.tabBtn}>
          <Text style={[styles.tabTxt, tab === 'following' && styles.tabTxtOn]}>
            Abonnements {counts.following}
          </Text>
          <View style={[styles.underline, tab === 'following' && styles.underlineOn]} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.gray} style={{ marginRight: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher"
          placeholderTextColor={Colors.textMuted}
          style={styles.search}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const name = displayName(item);
          const isMe = item.id === meId;
          const iFollow = followingSet.has(item.id);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/(app)/profile/[id]', params: { id: item.id } })}
              style={styles.row}
            >
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { backgroundColor: avatarColor(item) }]}>
                  <Text style={styles.avatarTxt}>{initials(name)}</Text>
                </View>
                {isVerified(item) ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={12} color={Colors.white} />
                  </View>
                ) : null}
              </View>

              <View style={styles.mid}>
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
                <View style={styles.metaRow}>
                  <ProfileTypeBadge type={profileType(item)} />
                  <Text style={styles.loc} numberOfLines={1}>
                    {locationLine(item)}
                  </Text>
                </View>
              </View>

              {!isMe ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setFollowingSet((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  }}
                  style={[styles.followBtn, iFollow ? styles.followBtnOff : styles.followBtnOn]}
                >
                  <Text style={[styles.followTxt, iFollow ? styles.followTxtOff : styles.followTxtOn]}>
                    {iFollow ? 'Abonné ✓' : 'Suivre'}
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerLeft: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  headerRight: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  yuCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yuTxt: { fontFamily: Fonts.title.family, fontSize: 12, color: Colors.white },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingTop: 12 },
  tabTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.textMuted },
  tabTxtOn: { color: Colors.dark },
  underline: { marginTop: 10, height: 2, width: '100%', backgroundColor: 'transparent' },
  underlineOn: { backgroundColor: Colors.primary },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
  },
  search: { flex: 1, paddingVertical: 10, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: Radii.min,
    ...Shadows.card,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  mid: { flex: 1, marginLeft: 12 },
  name: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  loc: { flex: 1, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  followBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  followBtnOn: { backgroundColor: Colors.primary },
  followBtnOff: { backgroundColor: Colors.grayLight },
  followTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13 },
  followTxtOn: { color: Colors.white },
  followTxtOff: { color: Colors.dark },
});

