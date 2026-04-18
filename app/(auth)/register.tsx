import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { signUp } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSubmit() {
    setError('');
    try {
      if (!email.trim()) {
        setError('Email requis');
        return;
      }
      if (password.length < 12) {
        setError('Le mot de passe doit contenir au moins 12 caractères.');
        return;
      }
      const user = await signUp(email, password, name || undefined);
      setUser(user);
      router.replace('/(app)');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'inscription");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <ScreenHeader title="Inscription" subtitle="Crée ton compte Yunicity." />
        <Input
          label="Nom"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />
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
        <Button onPress={handleSubmit}>S'inscrire</Button>
        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
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
