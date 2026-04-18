import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radii, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LEVEL_NAMES, rankingProfiles, PROFILE_COLORS, type MockProfile } from '@/constants/mockProfiles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MOCK_ADVANTAGES = [
  { partner: 'Belga Queen', offer: "20% sur l'addition", reduction: '-20%', color: '#16A34A' },
  { partner: 'Ao Barber', offer: 'Coupe offerte au 5ème passage', reduction: 'x5→🎁', color: '#0891B2' },
  { partner: 'Cave des Sacres', offer: 'Bouteille offerte dès 60€', reduction: '🍾', color: '#7C3AED' },
  { partner: 'Yoga Reims', offer: '1ère séance gratuite', reduction: '1🆓', color: '#D97706' },
  { partner: 'Bio Market', offer: '10% sur fruits & légumes', reduction: '-10%', color: '#16A34A' },
];

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

export default function PassScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'adv' | 'rank'>('adv');

  const meQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) return null;
    return (await res.json()) as { profileData?: { displayName?: string } };
  }, [user?.id]);

  const passportQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/gamification/passport/${user.id}`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) return null;
    return (await res.json()) as { points: number; level: number; progress: number };
  }, [user?.id]);

  const firstName =
    meQuery.data?.profileData?.displayName?.split(/\s+/)[0] ?? user?.email?.split('@')[0] ?? 'Citoyen';
  const points = passportQuery.data?.points ?? 340;
  const level = passportQuery.data?.level ?? 3;
  const progressPct = Math.round(passportQuery.data?.progress ?? 68);
  const levelLabel = (LEVEL_NAMES[level] ?? 'Citoyen').toUpperCase();
  const nextLabel = `68% → ${LEVEL_NAMES[Math.min(5, level + 1)] ?? 'Acteur'}`;

  const ranked = useMemo(() => rankingProfiles().slice(0, 25), []);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3, 20);
  const myId = user?.id ? 'u1' : 'u1';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: scrollPaddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      {meQuery.loading && user?.id ? (
        <LoadingSpinner />
      ) : (
        <>
          <LinearGradient
            colors={[Colors.dark, Colors.darkCard]}
            style={styles.passport}
          >
            <View style={styles.passRow}>
              <Text style={styles.passBrand}>PASSEPORT YUNICITY</Text>
              <Text style={styles.passBrand}>NIVEAU {level}</Text>
            </View>
            <LinearGradient colors={['#F59E0B', '#D97706', '#B45309']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rfid} />
            <Text style={styles.passName}>{firstName}</Text>
            <Text style={styles.levelMono}>{levelLabel}</Text>
            <View style={styles.bottomRow}>
              <Text style={styles.pts}>{points} PTS</Text>
              <View style={styles.trackWrap}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${progressPct}%` }]} />
                </View>
              </View>
            </View>
            <Text style={styles.progressHint}>{nextLabel}</Text>
          </LinearGradient>

          <View style={styles.tabRail}>
            <Pressable
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTab('adv');
              }}
              style={[styles.tabBtn, tab === 'adv' && styles.tabBtnOn]}
            >
              <Text style={[styles.tabTxt, tab === 'adv' && styles.tabTxtOn]}>Avantages</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTab('rank');
              }}
              style={[styles.tabBtn, tab === 'rank' && styles.tabBtnOn]}
            >
              <Text style={[styles.tabTxt, tab === 'rank' && styles.tabTxtOn]}>Classement</Text>
            </Pressable>
          </View>

          {tab === 'adv' ? (
            <View style={styles.tabPane}>
              <Text style={styles.secTitle}>Mes avantages</Text>
              <Text style={styles.secSub}>Chez nos partenaires</Text>
              {MOCK_ADVANTAGES.map((a) => (
                <View key={a.partner} style={styles.advCard}>
                  <View style={[styles.advCircle, { backgroundColor: `${a.color}33` }]}>
                    <Text style={[styles.advIni, { color: a.color }]}>{initials(a.partner)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.advName}>{a.partner}</Text>
                    <Text style={styles.advOffer}>{a.offer}</Text>
                  </View>
                  <View style={styles.redPill}>
                    <Text style={styles.redPillTxt}>{a.reduction}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.tabPane}>
              <Text style={styles.secTitle}>Top Rémois</Text>
              <Text style={styles.secSub}>Ce mois-ci</Text>
              <Podium top3={top3} />
              <FlatList
                data={rest}
                scrollEnabled={false}
                keyExtractor={(p) => p.id}
                renderItem={({ item, index }) => (
                  <RankRow rank={index + 4} profile={item} highlight={item.id === myId} />
                )}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Podium({ top3 }: { top3: MockProfile[] }) {
  const second = top3[1];
  const first = top3[0];
  const third = top3[2];
  if (!first) return null;
  const c1 = PROFILE_COLORS[first.type];
  const c2 = second ? PROFILE_COLORS[second.type] : Colors.gray;
  const c3 = third ? PROFILE_COLORS[third.type] : Colors.gray;

  return (
    <View style={styles.podium}>
      {second ? (
        <View style={[styles.pCol, styles.pSide]}>
          <Text style={styles.pMedal}>🥈</Text>
          <View style={[styles.pAva, { backgroundColor: c2 }]}>
            <Text style={styles.pIni}>{initials(second.name)}</Text>
          </View>
          <Text style={styles.pName} numberOfLines={1}>
            {second.name.split(' ')[0]}
          </Text>
          <Text style={styles.pPts}>{second.points} pts</Text>
        </View>
      ) : null}
      <View style={[styles.pCol, styles.pCenter]}>
        <Text style={styles.crown}>👑</Text>
        <View style={[styles.pAvaLg, { backgroundColor: c1 }]}>
          <Text style={styles.pIniLg}>{initials(first.name)}</Text>
        </View>
        <Text style={styles.pNameLg} numberOfLines={1}>
          {first.name.split(' ')[0]}
        </Text>
        <Text style={styles.pPtsLg}>{first.points} pts</Text>
      </View>
      {third ? (
        <View style={[styles.pCol, styles.pSide]}>
          <Text style={styles.pMedal}>🥉</Text>
          <View style={[styles.pAva, { backgroundColor: c3 }]}>
            <Text style={styles.pIni}>{initials(third.name)}</Text>
          </View>
          <Text style={styles.pName} numberOfLines={1}>
            {third.name.split(' ')[0]}
          </Text>
          <Text style={styles.pPts}>{third.points} pts</Text>
        </View>
      ) : null}
    </View>
  );
}

function RankRow({ rank, profile, highlight }: { rank: number; profile: MockProfile; highlight: boolean }) {
  const c = PROFILE_COLORS[profile.type];
  const medal = rank <= 10 ? '🏅' : '';
  return (
    <View style={[styles.rankRow, highlight && styles.rankHi]}>
      <Text style={styles.rankNum}>{rank}</Text>
      <View style={[styles.rankAva, { backgroundColor: c }]}>
        <Text style={styles.rankIni}>{initials(profile.name)}</Text>
      </View>
      <Text style={styles.rankName} numberOfLines={1}>
        {profile.name}
      </Text>
      <Text style={styles.rankPts}>
        {medal} {profile.points} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBg },
  content: { paddingHorizontal: 20 },
  passport: {
    height: 200,
    borderRadius: Radii.card,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  passRow: { flexDirection: 'row', justifyContent: 'space-between' },
  passBrand: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  rfid: {
    marginTop: 10,
    alignSelf: 'flex-end',
    width: 40,
    height: 28,
    borderRadius: 8,
  },
  passName: { marginTop: 8, fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  levelMono: { marginTop: 4, fontFamily: Fonts.mono.family, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  bottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pts: { fontFamily: Fonts.title.family, fontSize: 32, color: Colors.white },
  trackWrap: { flex: 1, justifyContent: 'center' },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2, backgroundColor: Colors.primary },
  progressHint: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  tabRail: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radii.min,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tabBtn: { flex: 1, height: 40, borderRadius: Radii.inner, alignItems: 'center', justifyContent: 'center' },
  tabBtnOn: { backgroundColor: Colors.primary, ...Shadows.card, shadowColor: Colors.primary, shadowOpacity: 0.25 },
  tabTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.gray },
  tabTxtOn: { color: Colors.white },
  tabPane: { paddingBottom: 8 },
  secTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  secSub: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginBottom: 14 },
  advCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: Radii.min,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  advCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advIni: { fontFamily: Fonts.titleSemi.family, fontSize: 14 },
  advName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  advOffer: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  redPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  redPillTxt: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.primary },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10, marginBottom: 20 },
  pCol: { alignItems: 'center' },
  pSide: { width: 88, paddingBottom: 8 },
  pCenter: { width: 110, paddingBottom: 4 },
  pMedal: { fontSize: 20, marginBottom: 4 },
  crown: { fontSize: 22, marginBottom: 4 },
  pAva: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pAvaLg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pIni: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
  pIniLg: { fontFamily: Fonts.titleSemi.family, fontSize: 22, color: Colors.white },
  pName: { marginTop: 6, fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.dark, maxWidth: 84 },
  pNameLg: { marginTop: 8, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark, maxWidth: 100 },
  pPts: { marginTop: 2, fontFamily: Fonts.body.family, fontSize: 11, color: Colors.gray },
  pPtsLg: { marginTop: 2, fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.primary },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radii.inner,
    gap: 10,
    marginBottom: 6,
  },
  rankHi: { backgroundColor: '#EEF2FF' },
  rankNum: { width: 28, fontFamily: Fonts.monoMedium.family, fontSize: 14, color: Colors.gray },
  rankAva: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rankIni: { fontFamily: Fonts.bodyBold.family, fontSize: 12, color: Colors.white },
  rankName: { flex: 1, fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  rankPts: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
});
