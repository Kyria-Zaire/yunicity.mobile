import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { patchUserOnboardingApi } from '@/lib/api';

const { width: SCREEN_W } = Dimensions.get('window');
const STEPS = 3;

const QUARTIERS = [
  { id: 'centre', name: 'Centre-ville', people: '12 400' },
  { id: 'croix', name: 'Croix-Rouge', people: '18 200' },
  { id: 'clair', name: 'Clairmarais', people: '9 800' },
  { id: 'jean', name: 'Jean-Jaurès', people: '8 900' },
  { id: 'wilson', name: 'Wilson', people: '7 100' },
  { id: 'chat', name: 'Châtillons', people: '6 700' },
  { id: 'mur', name: 'Murigny', people: '15 900' },
  { id: 'autre', name: 'Autre', people: '' },
] as const;

const INTERESTS = [
  '🎷 Jazz',
  '🚴 Vélo',
  '🍽️ Gastronomie',
  '🌱 Écologie',
  '💼 Business',
  '🎭 Culture',
  '📸 Photo',
  '💻 Tech',
  '🍾 Champagne',
  '🏃 Sport',
  '🎨 Art',
  '👨‍👩‍👧 Famille',
  '🎵 Musique',
  '🌍 Voyages',
  '📚 Lecture',
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [quartier, setQuartier] = useState<string>('');
  const [quartierOther, setQuartierOther] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  async function done() {
    const pendingId = await AsyncStorage.getItem('yunicity_pending_user_id');
    const selectedQuartier = quartier === 'autre' ? quartierOther.trim() : quartier;

    await AsyncStorage.setItem(
      'yunicity_onboarding',
      JSON.stringify({ quartier: selectedQuartier, interests }),
    );

    if (pendingId && selectedQuartier && interests.length >= 2) {
      await patchUserOnboardingApi(pendingId, { quartier: selectedQuartier, interests });
    }

    router.replace('/(app)/(tabs)');
  }

  const minOk = interests.length >= 2;
  const minLabel = `${Math.min(interests.length, 2)}/2 minimum`;
  const minColor = minOk ? Colors.commercial : '#DC2626';

  const currentQuartierLabel = useMemo(() => {
    if (!quartier) return '';
    if (quartier === 'autre') return quartierOther.trim() ? quartierOther.trim() : 'Autre';
    return QUARTIERS.find((q) => q.id === quartier)?.name ?? quartier;
  }, [quartier, quartierOther]);

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= index ? styles.dotOn : styles.dotOff]} />
          ))}
        </View>
        <Pressable onPress={done} hitSlop={10} style={styles.skip}>
          <Text style={styles.skipTxt}>Passer</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setIndex(Math.min(STEPS - 1, Math.max(0, i)));
        }}
      >
        <LinearGradient colors={[Colors.dark, Colors.darkCard]} style={[styles.pageDark, { width: SCREEN_W }]}>
          <View style={styles.heroCircle}>
            <Text style={styles.heroEmoji}>🎉</Text>
          </View>
          <Text style={styles.stepTitle}>Bienvenue sur Yunicity !</Text>
          <Text style={styles.stepSub}>Tu fais maintenant partie de la communauté rémoise</Text>
          <View style={styles.featurePills}>
            <View style={styles.featurePill}>
              <Text style={styles.featureTxt}>🗺️ Explore ta ville</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featureTxt}>🤝 Rejoins des tribus</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featureTxt}>🏅 Gagne des points</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.pageLight, { width: SCREEN_W }]}>
          <Text style={styles.stepTitleLight}>📍 Où habitues-tu ?</Text>
          <Text style={styles.stepSubLight}>Pour personnaliser ton expérience locale</Text>

          <View style={styles.qList}>
            {QUARTIERS.map((q) => {
              const selected = quartier === q.id;
              return (
                <Pressable
                  key={q.id}
                  onPress={() => setQuartier(q.id)}
                  style={[styles.qCard, selected ? styles.qCardOn : styles.qCardOff]}
                >
                  <Text style={styles.qName}>📍 {q.name}</Text>
                  {q.people ? <Text style={styles.qMeta}>{q.people} habitants</Text> : null}
                </Pressable>
              );
            })}
          </View>

          {quartier === 'autre' ? (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>Ton quartier</Text>
              <TextInput
                value={quartierOther}
                onChangeText={setQuartierOther}
                placeholder="Saisis ton quartier"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
              />
            </View>
          ) : null}
        </View>

        <View style={[styles.pageLight, { width: SCREEN_W }]}>
          <View style={styles.interestsHeader}>
            <View>
              <Text style={styles.stepTitleLight}>🎯 Qu'est-ce qui t'intéresse ?</Text>
              <Text style={styles.stepSubLight}>Choisis au moins 2 centres d'intérêt</Text>
            </View>
            <Text style={[styles.minCounter, { color: minColor }]}>{minLabel}</Text>
          </View>

          <View style={styles.tagsGrid}>
            {INTERESTS.map((t) => {
              const selected = interests.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() => {
                    setInterests((prev) => (selected ? prev.filter((x) => x !== t) : [...prev, t]));
                  }}
                  style={[styles.tag, selected ? styles.tagOn : styles.tagOff]}
                >
                  <Text style={[styles.tagTxt, selected ? styles.tagTxtOn : styles.tagTxtOff]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {index < STEPS - 1 ? (
          <Pressable
            onPress={() => {
              const next = index + 1;
              scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
              setIndex(next);
            }}
            style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.nextTxt}>{index === 0 ? 'Commencer →' : 'Suivant →'}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={done}
            disabled={!minOk || !currentQuartierLabel}
            style={({ pressed }) => [
              styles.nextBtn,
              (!minOk || !currentQuartierLabel) && { opacity: 0.5 },
              pressed && minOk && currentQuartierLabel && { opacity: 0.92 },
            ]}
          >
            <Text style={styles.nextTxt}>Terminer et découvrir Yunicity 🚀</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: Colors.primary },
  dotOff: { backgroundColor: Colors.grayBorder },
  skip: { padding: 8 },
  skipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.primary },
  pageDark: { flex: 1, paddingHorizontal: 20, paddingTop: 40, justifyContent: 'center' },
  pageLight: { flex: 1, paddingHorizontal: 20, paddingTop: 28 },
  heroCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 44 },
  stepTitle: { marginTop: 18, fontFamily: Fonts.title.family, fontSize: 28, color: Colors.white, textAlign: 'center' },
  stepSub: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  featurePills: { marginTop: 22, gap: 10, alignItems: 'center' },
  featurePill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  featureTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  stepTitleLight: { fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark },
  stepSubLight: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  qList: { marginTop: 16, gap: 10 },
  qCard: { borderRadius: 12, padding: 14, borderWidth: 1, backgroundColor: Colors.white, ...Shadows.card },
  qCardOn: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  qCardOff: { borderWidth: 1, borderColor: Colors.grayBorder },
  qName: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  qMeta: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  inputLabel: { fontFamily: Fonts.bodyMedium.family, fontSize: 13, color: Colors.dark, marginBottom: 8 },
  input: {
    backgroundColor: Colors.pageBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    padding: 14,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
  },
  interestsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  minCounter: { fontFamily: Fonts.bodySemi.family, fontSize: 13, marginTop: 6 },
  tagsGrid: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  tagOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tagOff: { backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },
  tagTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13 },
  tagTxtOn: { color: Colors.white },
  tagTxtOff: { color: Colors.textBody },
  footer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, gap: 8 },
  nextBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  nextTxt: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
});
