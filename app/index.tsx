import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function Index() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Redirect href="/(app)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
