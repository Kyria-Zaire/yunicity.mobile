import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { registerApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorMessages';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<
    'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole' | ''
  >('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const [errFirstName, setErrFirstName] = useState<string | null>(null);
  const [errEmail, setErrEmail] = useState<string | null>(null);
  const [errPassword, setErrPassword] = useState<string | null>(null);
  const [errProfileType, setErrProfileType] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const canSubmit = !!firstName.trim() && isValidEmail(email) && password.length >= 12 && !!profileType && !busy;

  async function handleSubmit() {
    try {
      setFormError(null);
      setErrFirstName(null);
      setErrEmail(null);
      setErrPassword(null);
      setErrProfileType(null);

      const fn = firstName.trim();
      const em = email.trim().toLowerCase();

      let ok = true;
      if (!fn) {
        setErrFirstName('Prénom requis');
        ok = false;
      }
      if (!isValidEmail(em)) {
        setErrEmail('Email invalide');
        ok = false;
      }
      if (password.length < 12) {
        setErrPassword('12 caractères minimum');
        ok = false;
      }
      if (!profileType) {
        setErrProfileType('Choisis un type de profil');
        ok = false;
      }
      if (!ok) return;

      setBusy(true);
      const { data, error, status, code, profileIncomplete } = await registerApi({
        email: em,
        password,
        name: fn,
        profileType,
      });
      if (error || !data?.id) {
        setFormError(getErrorMessage(status ?? 0, code));
        return;
      }

      if (profileIncomplete) {
        console.warn('[REGISTER] profile PATCH incomplete — will retry during onboarding');
      }

      await AsyncStorage.setItem('yunicity_pending_user_id', data.id);
      await AsyncStorage.setItem('yunicity_pending_email', em);

      // TODO: Réactiver OTP avant le lancement beta
      // router.push({ pathname: '/(auth)/otp', params: { userId, email } })

      // Connexion auto : auth.store enregistre token + user puis enrichit profileType via GET /users/me
      const loginResult = await useAuthStore.getState().login(em, password);
      if (loginResult.ok) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (e) {
      setFormError(getErrorMessage(0, 'NETWORK'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.dark} />
        </Pressable>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.h1}>Créer ton compte</Text>
        <Text style={styles.sub}>Rejoins la communauté rémoise 🏙️</Text>

        <View style={styles.fomoCard}>
          <Text style={styles.fomoTxt}>✨ 47 Rémois ont rejoint Yunicity cette semaine</Text>
        </View>

        <Field
          label="Prénom"
          placeholder="Ton prénom"
          value={firstName}
          onChangeText={setFirstName}
          error={errFirstName}
          autoComplete="given-name"
        />

        <Field
          label="Email"
          placeholder="ton@email.com"
          value={email}
          onChangeText={setEmail}
          error={errEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <View style={{ marginTop: 4 }}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={[styles.inputRow, errPassword && styles.inputRowErr]}>
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
          <Text style={styles.helper}>12 caractères minimum</Text>
          <View style={styles.strengthTrack}>
            <View style={[styles.strengthFill, { width: `${strength.pct}%`, backgroundColor: strength.color }]} />
          </View>
          {errPassword ? <Text style={styles.err}>{errPassword}</Text> : null}
        </View>

        <Text style={[styles.label, { marginTop: 18 }]}>Je suis...</Text>
        <View style={styles.typeGrid}>
          <TypeCard
            emoji="👤"
            label="Habitant"
            selected={profileType === 'yunicitizen'}
            onPress={() => setProfileType('yunicitizen')}
          />
          <TypeCard
            emoji="🏪"
            label="Commerçant"
            selected={profileType === 'commercial'}
            onPress={() => setProfileType('commercial')}
          />
          <TypeCard
            emoji="🤝"
            label="Association"
            selected={profileType === 'association'}
            onPress={() => setProfileType('association')}
          />
          <TypeCard
            emoji="💼"
            label="Freelance"
            selected={profileType === 'freelance'}
            onPress={() => setProfileType('freelance')}
          />
          <TypeCard
            emoji="📚"
            label="École"
            selected={profileType === 'ecole'}
            onPress={() => setProfileType('ecole')}
            full
          />
        </View>
        {errProfileType ? <Text style={styles.err}>{errProfileType}</Text> : null}

        {formError ? <Text style={styles.formErr}>{formError}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submit,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && { opacity: 0.92 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitTxt}>Créer mon compte 🚀</Text>
          )}
        </Pressable>

        <View style={styles.reassure}>
          <Text style={styles.reassureTxt}>🔒 Données sécurisées · 🇫🇷 Projet local · ✉️ Pas de spam</Text>
          <Text style={styles.reassureTxt}>Gratuit, toujours · Pas de carte bancaire</Text>
        </View>

        <Link href="/(auth)/login" asChild>
          <Text style={styles.bottomLink}>Déjà un compte ? Se connecter</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function passwordStrength(p: string): { pct: number; color: string } {
  const len = p.length;
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasNum = /\d/.test(p);
  const hasSym = /[^a-zA-Z0-9]/.test(p);
  let score = 0;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNum) score += 1;
  if (hasSym) score += 1;
  const pct = Math.min(100, Math.round((score / 5) * 100));
  const color = pct < 40 ? '#DC2626' : pct < 75 ? '#D97706' : '#16A34A';
  return { pct, color };
}

function Field(props: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string | null;
  keyboardType?: any;
  autoCapitalize?: any;
  autoComplete?: any;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={[styles.inputRow, props.error && styles.inputRowErr]}>
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={props.keyboardType}
          autoCapitalize={props.autoCapitalize}
          autoComplete={props.autoComplete}
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      {props.error ? <Text style={styles.err}>{props.error}</Text> : null}
    </View>
  );
}

function TypeCard(props: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  full?: boolean;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.typeCard,
        props.full && styles.typeCardFull,
        props.selected ? styles.typeCardOn : styles.typeCardOff,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Text style={styles.typeEmoji}>{props.emoji}</Text>
      <Text style={styles.typeLabel}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.grayLight,
    overflow: 'hidden',
  },
  progressFill: { width: '50%', height: '100%', backgroundColor: Colors.primary },
  h1: { marginTop: 18, fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark },
  sub: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  fomoCard: {
    marginTop: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
  },
  fomoTxt: { fontFamily: Fonts.bodyMedium.family, fontSize: 13, color: Colors.primary },
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
  inputRowErr: { borderColor: '#DC2626' },
  input: { flex: 1, paddingVertical: 14, fontFamily: Fonts.body.family, fontSize: 16, color: Colors.dark },
  eyeBtn: { paddingLeft: 10, paddingVertical: 10 },
  helper: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.textMuted },
  strengthTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.grayLight,
    overflow: 'hidden',
  },
  strengthFill: { height: '100%', borderRadius: 999 },
  err: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: '#DC2626' },
  typeGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typeCardFull: { width: '100%' },
  typeCardOn: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  typeCardOff: { borderWidth: 1, borderColor: Colors.grayBorder, backgroundColor: Colors.white },
  typeEmoji: { fontSize: 24 },
  typeLabel: { fontFamily: Fonts.titleSemi.family, fontSize: 13, color: Colors.dark },
  formErr: { marginTop: 12, fontFamily: Fonts.body.family, fontSize: 13, color: '#DC2626' },
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
  reassure: { marginTop: 16, alignItems: 'center', gap: 4 },
  reassureTxt: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  bottomLink: { marginTop: 14, textAlign: 'center', fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
});
