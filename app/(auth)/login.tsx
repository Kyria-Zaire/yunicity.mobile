import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errorMessages';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);

  const canSubmit = useMemo(
    () => isValidEmail(email) && password.length >= 1 && !isLoading,
    [email, password.length, isLoading],
  );

  async function handleSubmit() {
    try {
      setError(null);
      const { ok, status, code, error: err } = await login(email.trim().toLowerCase(), password);
      if (!ok) {
        setError(getErrorMessage(status ?? 0, code) || err || null);
        return;
      }
      router.replace('/(app)/(tabs)');
    } catch (e) {
      setError(getErrorMessage(0, 'NETWORK'));
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.dark} />
        </Pressable>

        <Text style={styles.logo}>Yunicity</Text>
        <Text style={styles.h1}>Content de te revoir 👋</Text>
        <Text style={styles.sub}>Connecte-toi pour retrouver ta ville</Text>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={10} style={styles.eyeBtn}>
              <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.gray} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => Alert.alert('Bientôt', 'Mot de passe oublié : bientôt disponible')}
            style={styles.forgot}
          >
            <Text style={styles.forgotTxt}>Mot de passe oublié ?</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.err}>{error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submit,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && { opacity: 0.92 },
          ]}
        >
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitTxt}>Se connecter</Text>}
        </Pressable>

        <View style={styles.securityRow}>
          <Text style={styles.securityTxt}>🔒 Connexion sécurisée · Données chiffrées</Text>
        </View>

        <View style={styles.reassure}>
          <Text style={styles.reassureTxt}>🔒 Données sécurisées · 🇫🇷 Projet local · ✉️ Pas de spam</Text>
        </View>

        <Link href="/(auth)/register" asChild>
          <Text style={styles.bottomLink}>Pas encore de compte ? Rejoindre Yunicity →</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  logo: { marginTop: 6, fontFamily: Fonts.title.family, fontSize: 28, color: Colors.primary, textAlign: 'center' },
  h1: { marginTop: 18, fontFamily: Fonts.title.family, fontSize: 22, color: Colors.dark, textAlign: 'center' },
  sub: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, textAlign: 'center' },
  label: { fontFamily: Fonts.bodyMedium.family, fontSize: 14, color: Colors.dark, marginBottom: 8 },
  inputRow: {
    backgroundColor: Colors.pageBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontFamily: Fonts.body.family, fontSize: 16, color: Colors.dark },
  eyeBtn: { paddingLeft: 10, paddingVertical: 10 },
  forgot: { alignSelf: 'flex-end', marginTop: 10 },
  forgotTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.primary },
  err: { marginTop: 12, fontFamily: Fonts.body.family, fontSize: 13, color: '#DC2626' },
  submit: {
    marginTop: 18,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  submitDisabled: { opacity: 0.5 },
  submitTxt: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  securityRow: { marginTop: 14, alignItems: 'center' },
  securityTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  reassure: { marginTop: 12, alignItems: 'center' },
  reassureTxt: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  bottomLink: { marginTop: 16, textAlign: 'center', fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
});
