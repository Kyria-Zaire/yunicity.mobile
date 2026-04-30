import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { resendOtpApi, verifyOtpApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorMessages';

const DIGITS = 6;
const RESEND_SECONDS = 60;

function maskEmail(email: string) {
  const [u, d] = email.split('@');
  if (!u || !d) return email;
  const head = u.slice(0, 2);
  return `${head}***@${d}`;
}

export default function OtpScreen() {
  const params = useLocalSearchParams<{ userId?: string; email?: string }>();
  const userId = String(params.userId ?? '');
  const emailParam = (params.email as string) ?? '';
  const [email, setEmail] = useState(emailParam || '');

  const [values, setValues] = useState<string[]>(Array.from({ length: DIGITS }).map(() => ''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const shake = useRef(new Animated.Value(0)).current;
  const inputs = useRef<Array<TextInput | null>>([]);

  const code = useMemo(() => values.join(''), [values]);
  const canVerify = code.length === DIGITS && !busy;

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!emailParam) {
      AsyncStorage.getItem('yunicity_pending_email')
        .then((stored) => {
          if (stored) setEmail(stored);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  function triggerShake() {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  }

  function setAt(index: number, v: string) {
    setValues((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  }

  function onChange(index: number, text: string) {
    setError(null);
    const t = text.replace(/\D/g, '');

    // Paste full code
    if (t.length >= DIGITS) {
      const sliced = t.slice(0, DIGITS).split('');
      setValues(sliced);
      inputs.current[DIGITS - 1]?.focus();
      Keyboard.dismiss();
      return;
    }

    // iOS sometimes passes multiple chars
    if (t.length > 1) {
      const chars = t.split('');
      setValues((prev) => {
        const next = [...prev];
        for (let i = 0; i < chars.length && index + i < DIGITS; i++) {
          next[index + i] = chars[i] ?? '';
        }
        return next;
      });
      const nextIndex = Math.min(DIGITS - 1, index + t.length);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const digit = t.slice(-1);
    setAt(index, digit);
    if (digit && index < DIGITS - 1) inputs.current[index + 1]?.focus();
  }

  function onKeyPress(index: number, key: string) {
    if (key !== 'Backspace') return;
    if (values[index]) {
      setAt(index, '');
      return;
    }
    if (index > 0) {
      inputs.current[index - 1]?.focus();
      setAt(index - 1, '');
    }
  }

  async function verify() {
    if (!userId) {
      setError('Inscription incomplète. Recommence.');
      return;
    }
    if (!canVerify) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err, status, code: errorCode } = await verifyOtpApi(userId, code);
      if (err) {
        setError(getErrorMessage(status ?? 0, errorCode));
        triggerShake();
        return;
      }
      await AsyncStorage.removeItem('yunicity_pending_user_id');
      router.push('/(auth)/onboarding');
    } catch (e) {
      setError(getErrorMessage(0, 'NETWORK'));
      triggerShake();
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!userId || !email || seconds > 0) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err, status, code: errorCode } = await resendOtpApi(userId, email);
      if (err) {
        setError(getErrorMessage(status ?? 0, errorCode));
        return;
      }
      setSeconds(RESEND_SECONDS);
    } catch (e) {
      setError(getErrorMessage(0, 'NETWORK'));
    } finally {
      setBusy(false);
    }
  }

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });

  return (
    <View style={styles.root}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color={Colors.dark} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.mailCircle}>
          <Text style={styles.mailEmoji}>✉️</Text>
        </View>
        <Text style={styles.h1}>Vérifie ton email 📧</Text>
        <Text style={styles.sub}>On a envoyé un code à</Text>
        <Text style={styles.email}>{maskEmail(email)}</Text>
      </View>

      <Animated.View style={[styles.otpRow, { transform: [{ translateX }] }]}>
        {Array.from({ length: DIGITS }).map((_, i) => {
          const filled = !!values[i];
          return (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r;
              }}
              value={values[i]}
              onChangeText={(t) => onChange(i, t)}
              onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={DIGITS}
              style={[styles.otpCell, filled && styles.otpCellOn]}
              textAlign="center"
              placeholder=""
              selectionColor={Colors.primary}
            />
          );
        })}
      </Animated.View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <Text style={styles.timer}>
        {seconds > 0 ? `Renvoyer le code dans ${seconds}s` : 'Renvoyer le code'}
      </Text>
      {seconds === 0 ? (
        <Pressable onPress={resend} disabled={busy} style={({ pressed }) => [styles.resend, pressed && { opacity: 0.9 }]}>
          <Text style={styles.resendTxt}>Renvoyer le code</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={verify}
        disabled={!canVerify}
        style={({ pressed }) => [
          styles.verifyBtn,
          !canVerify && styles.verifyDisabled,
          pressed && canVerify && { opacity: 0.92 },
        ]}
      >
        {busy ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.verifyTxt}>Vérifier mon compte ✓</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 20, paddingTop: 18 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { marginTop: 22, alignItems: 'center' },
  mailCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  mailEmoji: { fontSize: 40 },
  h1: { marginTop: 18, fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark, textAlign: 'center' },
  sub: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, textAlign: 'center' },
  email: { marginTop: 6, fontFamily: Fonts.bodyBold.family, fontSize: 14, color: Colors.dark, textAlign: 'center' },
  otpRow: { marginTop: 26, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  otpCell: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.pageBg,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    fontFamily: Fonts.title.family,
    fontSize: 24,
    color: Colors.dark,
  },
  otpCellOn: { borderWidth: 2, borderColor: Colors.primary },
  err: { marginTop: 14, fontFamily: Fonts.body.family, fontSize: 13, color: '#DC2626', textAlign: 'center' },
  timer: { marginTop: 16, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, textAlign: 'center' },
  resend: { marginTop: 8, alignSelf: 'center' },
  resendTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  verifyBtn: {
    marginTop: 22,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  verifyDisabled: { opacity: 0.5 },
  verifyTxt: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
});

