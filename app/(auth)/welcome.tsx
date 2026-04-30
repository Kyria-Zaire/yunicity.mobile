import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts, Shadows } from '@/constants/theme';

const BG =
  'https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg';

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: BG }} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(13,15,46,0.05)', 'rgba(13,15,46,0.35)', 'rgba(13,15,46,0.82)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.bottom}>
          <Text style={styles.logo}>Yunicity</Text>
          <Text style={styles.tagline}>La ville vivante</Text>

          <View style={styles.proofs}>
            <View style={styles.proofPill}>
              <Text style={styles.proofTxt}>🏙️ Reims · 1800 habitants</Text>
            </View>
            <View style={styles.proofPill}>
              <Text style={styles.proofTxt}>🤝 47 tribus actives</Text>
            </View>
            <View style={styles.proofPill}>
              <Text style={styles.proofTxt}>⭐ Lancement bêta</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaTxt}>Rejoindre Yunicity</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryTxt}>J'ai déjà un compte</Text>
          </Pressable>

          <Text style={styles.legal}>
            En continuant, tu acceptes nos CGU et politique de confidentialité
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark },
  safe: { flex: 1, justifyContent: 'flex-end' },
  bottom: { paddingHorizontal: 20, paddingBottom: 18, alignItems: 'center' },
  logo: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 42,
    color: Colors.white,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  proofs: { marginTop: 18, alignItems: 'center', gap: 10 },
  proofPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  proofTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  cta: {
    marginTop: 20,
    height: 56,
    alignSelf: 'stretch',
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  ctaTxt: { fontFamily: Fonts.title.family, fontSize: 17, color: Colors.white },
  secondary: {
    marginTop: 10,
    height: 56,
    alignSelf: 'stretch',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  legal: {
    marginTop: 14,
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});

