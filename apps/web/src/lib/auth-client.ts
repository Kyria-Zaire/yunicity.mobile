import { createAuthClient } from 'better-auth/react';
import { API_URL } from '@/lib/config';

const authClient = createAuthClient({
  baseURL: API_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
