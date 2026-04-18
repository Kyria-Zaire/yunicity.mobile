import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, logoutApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  profileType: string;
  verificationStatus: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('yunicity_session');
      const userJson = await AsyncStorage.getItem('yunicity_user');
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await loginApi(email, password);
    if (error || !data) {
      set({ isLoading: false });
      return { ok: false, error: error ?? 'Connexion impossible' };
    }
    await AsyncStorage.setItem('yunicity_session', data.token);
    await AsyncStorage.setItem('yunicity_user', JSON.stringify(data.user));
    set({ user: data.user as User, token: data.token, isLoading: false });
    return { ok: true };
  },

  logout: async () => {
    await logoutApi();
    set({ user: null, token: null });
  },
}));
