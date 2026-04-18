import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { signIn } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSubmit() {
    setError('');
    try {
      const user = await signIn(email, password);
      setUser(user);
      router.replace('/(app)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <ScreenHeader title="Connexion" subtitle="Rejoins ta ville." />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={handleSubmit}>Se connecter</Button>
        <Link href="/(auth)/register" asChild>
          <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 24 },
  error: { color: '#DC2626', marginBottom: 12, fontSize: 14 },
  link: { marginTop: 20, textAlign: 'center', color: '#2A2FFF', fontSize: 15 },
});
