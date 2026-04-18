import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radii, tabBarFloatingLayout } from '@/constants/theme';
import { ProfileTypeBadge, type ProfileType } from '@/components/ui/Badge';
import { PostCard } from '@/components/PostCard';
import { MOCK_POSTS } from '@/constants/mockPosts';
import { LEVEL_NAMES } from '@/constants/mockProfiles';
import { useAuthStore } from '@/stores/auth.store';
import { AppBottomSheet } from '@/components/ui/BottomSheet';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

function profileTint(type: ProfileType) {
  switch (type) {
    case 'commercial':
      return Colors.commercial;
    case 'association':
      return Colors.association;
    case 'freelance':
      return Colors.freelance;
    case 'ecole':
      return Colors.ecole;
    default:
      return Colors.primary;
  }
}

const { width: WIN_W } = Dimensions.get('window');
const GRID_GAP = 2;
const GRID_PAD = 16;
const CELL = (WIN_W - GRID_PAD * 2 - GRID_GAP * 2) / 3;

const GRID_MOCK = [
  { id: 'g1', c: '#2A2FFF', e: '🏙️' },
  { id: 'g2', c: '#16A34A', e: '🥐' },
  { id: 'g3', c: '#D97706', e: '🎷' },
  { id: 'g4', c: '#7C3AED', e: '🎨' },
  { id: 'g5', c: '#DC2626', e: '🎓' },
  { id: 'g6', c: '#0891B2', e: '📷' },
  { id: 'g7', c: '#EA580C', e: '🍕' },
  { id: 'g8', c: '#0D0F2E', e: '⭐' },
  { id: 'g9', c: '#B45309', e: '🚴' },
  { id: 'g10', c: '#5B21B6', e: '💼' },
  { id: 'g11', c: '#15803D', e: '🌿' },
  { id: 'g12', c: '#1C1F4A', e: '🤝' },
];

const MOMENTS = [
  { id: 'm1', label: 'Badges', icon: '⭐' },
  { id: 'm2', label: 'Top posts', icon: '🏆' },
  { id: 'm3', label: 'Événements', icon: '📅' },
  { id: 'm4', label: 'Tribus', icon: '🤝' },
];

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const setUserNull = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const meQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) throw new Error('Impossible de charger le profil');
    return (await res.json()) as {
      _id: string;
      email: string;
      profileType: ProfileType;
      verificationStatus?: { status?: string };
      profileData?: { displayName?: string; bio?: string };
    };
  }, [user?.id]);

  const passportQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/gamification/passport/${user.id}`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) throw new Error('Impossible de charger le passeport');
    return (await res.json()) as {
      points: number;
      level: number;
      progress: number;
    };
  }, [user?.id]);

  const displayName =
    meQuery.data?.profileData?.displayName?.trim() ?? user?.email?.split('@')[0] ?? 'Utilisateur';
  const firstName = displayName.split(/\s+/)[0];
  const profileType = (meQuery.data?.profileType ?? user?.profileType ?? 'yunicitizen') as ProfileType;
  const verified =
    meQuery.data?.verificationStatus?.status === 'verified' || user?.verificationStatus === 'verified';
  const bio = meQuery.data?.profileData?.bio?.trim() ?? '';
  const points = passportQuery.data?.points ?? 0;
  const level = passportQuery.data?.level ?? 1;
  const progressPct = Math.max(0, Math.min(100, passportQuery.data?.progress ?? 0));
  const tint = profileTint(profileType);

  const [tab, setTab] = useState<'grid' | 'list' | 'tagged'>('grid');
  const [gridModal, setGridModal] = useState<string | null>(null);
  const momentRef = useRef<BottomSheet>(null);
  const [momentTitle, setMomentTitle] = useState('');

  const myPosts = useMemo(() => {
    if (!user?.id) return [];
    return MOCK_POSTS.filter((p) => p.authorId === user.id);
  }, [user?.id]);

  function initials(name: string) {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function handleLogout() {
    setUserNull(null);
    router.replace('/(auth)/login');
  }

  if (!user?.id) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <EmptyState title="Non connecté" description="Connecte-toi pour voir ton profil." />
      </View>
    );
  }

  if (meQuery.loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 48 }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (meQuery.error) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <EmptyState title="Profil indisponible" description={meQuery.error} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        <View style={[styles.topSafe, { paddingTop: insets.top }]}>
          <Text style={styles.topName}>{firstName}</Text>
          <Pressable onPress={() => {}} hitSlop={12}>
            <Ionicons name="settings-outline" size={24} color={Colors.dark} />
          </Pressable>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: tint }]}>
              <Text style={styles.avatarTxt}>{initials(displayName)}</Text>
            </View>
            {verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              </View>
            ) : null}
          </View>
          <View style={styles.stats}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>24</Text>
              <Text style={styles.statLab}>Posts</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>1,2k</Text>
              <Text style={styles.statLab}>Abonnés</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>318</Text>
              <Text style={styles.statLab}>Abonnements</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text style={styles.fullName}>{displayName}</Text>
          <View style={styles.badgeRow}>
            <ProfileTypeBadge type={profileType} />
          </View>
          {bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {bio}
            </Text>
          ) : (
            <Text style={[styles.bio, { color: Colors.gray }]}>Ajoute une bio depuis les paramètres.</Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.9 }]}>
            <Text style={styles.btnGhostTxt}>Modifier le profil</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.9 }]}>
            <Text style={styles.btnGhostTxt}>Partager le profil</Text>
          </Pressable>
        </View>

        <Text style={styles.momentsTitle}>Moments</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentsScroll}>
          {MOMENTS.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => {
                setMomentTitle(m.label);
                momentRef.current?.expand();
              }}
              style={styles.momentItem}
            >
              <LinearGradient colors={[Colors.primary, '#7C3AED']} style={styles.momentRing}>
                <View style={styles.momentInner}>
                  <Text style={styles.momentEmoji}>{m.icon}</Text>
                </View>
              </LinearGradient>
              <Text style={styles.momentLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.iconTabs}>
          <Pressable onPress={() => setTab('grid')} style={[styles.iconTab, tab === 'grid' && styles.iconTabOn]}>
            <Ionicons name="grid-outline" size={26} color={tab === 'grid' ? Colors.dark : Colors.gray} />
          </Pressable>
          <Pressable onPress={() => setTab('list')} style={[styles.iconTab, tab === 'list' && styles.iconTabOn]}>
            <Ionicons name="reorder-four-outline" size={28} color={tab === 'list' ? Colors.dark : Colors.gray} />
          </Pressable>
          <Pressable onPress={() => setTab('tagged')} style={[styles.iconTab, tab === 'tagged' && styles.iconTabOn]}>
            <Ionicons name="pricetag-outline" size={24} color={tab === 'tagged' ? Colors.dark : Colors.gray} />
          </Pressable>
        </View>

        {tab === 'grid' ? (
          <View style={styles.grid}>
            {GRID_MOCK.map((g) => (
              <Pressable key={g.id} onPress={() => setGridModal(g.id)} style={[styles.cell, { backgroundColor: g.c }]}>
                <Text style={styles.cellEmoji}>{g.e}</Text>
              </Pressable>
            ))}
          </View>
        ) : tab === 'list' ? (
          <View>
            {myPosts.length ? (
              myPosts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <View style={{ padding: 24 }}>
                <Text style={styles.emptyList}>
                  Aucun post mock lié à ton id — les posts réels arriveront depuis l’API.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.taggedPane}>
            <Text style={styles.taggedIntro}>Mentionné dans 3 posts</Text>
            <View style={styles.gridSmall}>
              {GRID_MOCK.slice(0, 3).map((g) => (
                <View key={g.id} style={[styles.cellSm, { backgroundColor: g.c }]}>
                  <Text style={styles.cellEmoji}>{g.e}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <LinearGradient colors={[Colors.dark, Colors.darkCard]} style={styles.miniPass}>
          <View style={styles.miniRow}>
            <Text style={styles.miniLeft}>
              Niveau {level} · {LEVEL_NAMES[level] ?? 'Acteur'}
            </Text>
            <Text style={styles.miniPts}>{points} PTS</Text>
          </View>
          <View style={styles.miniTrack}>
            <View style={[styles.miniFill, { width: `${progressPct}%` }]} />
          </View>
          <Pressable onPress={() => router.push('/(app)/pass')}>
            <Text style={styles.miniLink}>Voir mon passeport →</Text>
          </Pressable>
        </LinearGradient>

        <Pressable onPress={handleLogout} style={styles.logout}>
          <Text style={styles.logoutTxt}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={!!gridModal} transparent animationType="fade" onRequestClose={() => setGridModal(null)}>
        <Pressable style={styles.fullPh} onPress={() => setGridModal(null)}>
          <Text style={styles.fullPhTxt}>Moment</Text>
        </Pressable>
      </Modal>

      <AppBottomSheet ref={momentRef} snapPoints={['35%', '60%']}>
        <Text style={styles.sheetT}>{momentTitle}</Text>
        <Text style={styles.sheetM}>Contenu à venir.</Text>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  topSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  topName: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark },
  profileRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 28 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontFamily: Fonts.title.family, fontSize: 28, color: Colors.white },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 8 },
  statCol: { alignItems: 'center' },
  statNum: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark },
  statLab: { marginTop: 2, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  bioBlock: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  fullName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  emptyList: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, textAlign: 'center' },
  bio: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.textBody, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  btnGhost: {
    flex: 1,
    backgroundColor: Colors.grayLight,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnGhostTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  momentsTitle: {
    marginTop: 20,
    marginLeft: 16,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  momentsScroll: { paddingHorizontal: 12, paddingTop: 10, gap: 16 },
  momentItem: { alignItems: 'center', width: 76 },
  momentRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentEmoji: { fontSize: 26 },
  momentLabel: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 11, color: Colors.dark, textAlign: 'center' },
  iconTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
    paddingVertical: 10,
  },
  iconTab: { paddingVertical: 6, paddingHorizontal: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  iconTabOn: { borderBottomColor: Colors.dark },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PAD,
    gap: GRID_GAP,
    paddingTop: 4,
  },
  cell: {
    width: CELL,
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 28 },
  taggedPane: { paddingHorizontal: 16, paddingTop: 8 },
  taggedIntro: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, marginBottom: 10 },
  gridSmall: { flexDirection: 'row', gap: GRID_GAP },
  cellSm: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  miniPass: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: Radii.min,
    padding: 14,
  },
  miniRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniLeft: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  miniPts: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.white },
  miniTrack: {
    marginTop: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  miniFill: { height: '100%', backgroundColor: Colors.primary },
  miniLink: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  logout: { marginTop: 24, alignItems: 'center', paddingBottom: 8 },
  logoutTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: '#DC2626' },
  fullPh: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  fullPhTxt: { color: Colors.white, fontFamily: Fonts.title.family, fontSize: 18 },
  sheetT: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  sheetM: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
});
