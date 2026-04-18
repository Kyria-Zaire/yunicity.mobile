import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/Button';

const { width: SCREEN_W } = Dimensions.get('window');
const STEPS = 3;

export default function OnboardingScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [quartier, setQuartier] = useState('');

  async function done() {
    await AsyncStorage.setItem('onboarding_done', '1');
    router.replace('/(app)');
  }

  const pages = [
    <View key="0" style={[styles.page, { width: SCREEN_W }]}>
      <Text style={styles.logo}>Y</Text>
      <Text style={styles.h1}>Bienvenue ! 🏙️</Text>
      <Text style={styles.sub}>
        Tu rejoins la première ville connectée de France.
      </Text>
    </View>,
    <View key="1" style={[styles.page, { width: SCREEN_W }]}>
      <Text style={styles.h2}>Personnalise</Text>
      <Text style={styles.label}>Quartier à Reims</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex. Croix-Rouge"
        placeholderTextColor="#6B7280"
        value={quartier}
        onChangeText={setQuartier}
      />
    </View>,
    <View key="2" style={[styles.page, { width: SCREEN_W }]}>
      <Text style={styles.h2}>Tribus</Text>
      <Text style={styles.sub}>
        Rejoins des communautés qui te ressemblent (à venir).
      </Text>
    </View>,
  ];

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => item}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setIndex(Math.min(STEPS - 1, Math.max(0, i)));
        }}
      />
      <View style={styles.dots}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        {index < STEPS - 1 ? (
          <Button
            onPress={() => {
              const next = index + 1;
              listRef.current?.scrollToOffset({
                offset: next * SCREEN_W,
                animated: true,
              });
              setIndex(next);
            }}
          >
            Suivant
          </Button>
        ) : (
          <Button onPress={done}>Commencer</Button>
        )}
        <Pressable onPress={done} style={styles.skip}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0F2E' },
  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    color: '#2A2FFF',
    textAlign: 'center',
  },
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  sub: { fontSize: 16, color: '#9395FF', textAlign: 'center', marginTop: 12 },
  label: { fontSize: 14, color: '#9395FF', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: '#2A2FFF' },
  dotInactive: { backgroundColor: '#D1D5DB' },
  footer: { padding: 24, paddingBottom: 40, gap: 12 },
  skip: { alignItems: 'center', padding: 8 },
  skipText: { color: '#9395FF', fontSize: 14 },
});
