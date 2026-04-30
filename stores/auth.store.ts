/**
 * État d’auth : `user` + `token` synchronisés avec AsyncStorage (`yunicity_user`, `yunicity_session`).
 * Après `login()` et dans `hydrate()` si `profileType` manquait en cache, enrichissement via GET `/users/me`.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyProfile, loginApi, logoutApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  profileType?: string | undefined;
  verificationStatus?: string | undefined;
  name?: string | undefined;
  image?: string | undefined;
  profileData?: { displayName?: string | undefined } | undefined;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; status?: number; code?: string; error?: string | undefined }>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  setUser: (user) => set({ user }),

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('yunicity_session');
      const userStr = await AsyncStorage.getItem('yunicity_user');
      if (token && userStr) {
        let user = JSON.parse(userStr) as User;

        const meRes = await getMyProfile();
        if (!meRes.error && meRes.data?.profileType != null && meRes.data.profileType !== '') {
          user = { ...user, profileType: meRes.data.profileType };
          await AsyncStorage.setItem('yunicity_user', JSON.stringify(user));
        }

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
    const { data, error, status, code } = await loginApi(email, password);
    if (error || !data) {
      set({ isLoading: false });
      return { ok: false, status, code, error: error ?? 'Connexion impossible' };
    }
    await AsyncStorage.setItem('yunicity_session', data.token);

    let user = data.user as User;
    await AsyncStorage.setItem('yunicity_user', JSON.stringify(user));

    const meRes = await getMyProfile();
    if (!meRes.error && meRes.data?.profileType != null && meRes.data.profileType !== '') {
      user = { ...user, profileType: meRes.data.profileType };
    }

    await AsyncStorage.setItem('yunicity_user', JSON.stringify(user));
    set({
      user,
      token: data.token,
      isLoading: false,
    });
    return { ok: true };
  },

  logout: async () => {
    await logoutApi();
    set({ user: null, token: null });
  },
}));
