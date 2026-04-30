import { useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { MOCK_ACTIONS } from '@/constants/mockAssociationProfile';

type ActionData = {
  id: string;
  title: string;
  date: string;
  participants: number;
  impact: string;
  imageUrl: string;
  imageUri?: string | null;
  category?: string;
};

export default function AssociationActionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const actionId = String(id ?? '');

  const action = useMemo<ActionData | null>(() => {
    const fromMock = MOCK_ACTIONS.find((a) => a.id === actionId);
    if (fromMock) return { ...fromMock };
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(String(data))) as ActionData;
        if (parsed?.id) return parsed;
      } catch {
        // ignore
      }
    }
    return null;
  }, [actionId, data]);

  if (!actionId) return null;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}>
        <SafeAreaView edges={['top']} style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <Pressable style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            Détail action
          </Text>
          <Pressable
            style={styles.topBtn}
            onPress={() => Alert.alert('Partager', 'Partage bientôt disponible (mock).')}
          >
            <Ionicons name="share-outline" size={18} color={Colors.white} />
          </Pressable>
        </SafeAreaView>

        {action ? (
          <>
            <View style={styles.hero}>
              <Image source={{ uri: action.imageUri ?? action.imageUrl }} style={styles.heroImg} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGrad} />
              <View style={styles.heroOverlay}>
                {action.category ? (
                  <View style={styles.catPill}>
                    <Text style={styles.catPillTxt}>{action.category}</Text>
                  </View>
                ) : null}
                <Text style={styles.title}>{action.title}</Text>
                <Text style={styles.sub}>
                  📅 {action.date} · 👥 {action.participants} participants
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Impact</Text>
              <Text style={styles.cardBody}>🎯 {action.impact}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>À propos</Text>
              <Text style={styles.cardBody}>
                Cette page est une vue détail (mock) pour illustrer un flow “HelloAsso/Meetup” depuis le dashboard.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Action introuvable</Text>
            <Text style={styles.emptySub}>L’action “{actionId}” n’existe pas (ou n’est plus disponible).</Text>
            <Pressable style={styles.primary} onPress={() => router.back()}>
              <Text style={styles.primaryTxt}>Retour</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { flex: 1, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white, textAlign: 'center' },
  hero: { height: 320, backgroundColor: Colors.grayLight },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroGrad: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  catPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(217,119,6,0.35)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  catPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#FCD34D' },
  title: { fontFamily: Fonts.title.family, fontSize: 24, color: Colors.white },
  sub: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  card: { marginHorizontal: 16, marginTop: 14, backgroundColor: Colors.white, borderRadius: 18, padding: 16, ...Shadows.card },
  cardTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },
  cardBody: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, lineHeight: 20 },
  empty: { marginTop: 120, marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 18, padding: 18, ...Shadows.card },
  emptyTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  emptySub: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, lineHeight: 19 },
  primary: { marginTop: 14, backgroundColor: '#2A2FFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
});

