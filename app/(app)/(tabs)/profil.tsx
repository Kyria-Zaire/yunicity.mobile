import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CitizenProfile } from '@/components/profile/CitizenProfile';
import { ProProfile } from '@/components/profile/ProProfile';
import {
  isProProfileType,
  normalizeOwnerProfile,
  postsForProfile,
  profileByIdOrFallback,
  profileEventsFor,
  taggedPostsForProfile,
  topPostsForProfile,
  tribesForProfile,
} from '@/components/profile/profileUtils';
import { Colors, tabBarFloatingLayout } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTabSwipe } from '@/hooks/useTabSwipe';

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const swipe = useTabSwipe('/(app)/(tabs)/profil');
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const user = useAuthStore((state) => state.user);

  const meQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) throw new Error('Impossible de charger le profil');
    return (await res.json()) as {
      _id?: string;
      email?: string;
      profileType?: 'commercial' | 'association' | 'freelance' | 'ecole' | 'yunicitizen';
      verificationStatus?: { status?: string };
      profileData?: { displayName?: string; bio?: string };
    };
  }, [user?.id]);

  const passportQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/gamification/passport/${user.id}`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) throw new Error('Impossible de charger le passeport');
    return (await res.json()) as { points: number };
  }, [user?.id]);

  const fallbackProfile = useMemo(() => profileByIdOrFallback('u1'), []);
  const profile = useMemo(
    () =>
      normalizeOwnerProfile({
        user,
        apiProfile: meQuery.error ? null : meQuery.data,
        fallbackProfile,
        points: passportQuery.data?.points ?? fallbackProfile.points,
      }),
    [fallbackProfile, meQuery.data, meQuery.error, passportQuery.data?.points, user],
  );

  const posts = useMemo(() => postsForProfile(profile.id, fallbackProfile.id), [fallbackProfile.id, profile.id]);
  const taggedPosts = useMemo(() => taggedPostsForProfile(profile.id), [profile.id]);
  const topPosts = useMemo(() => topPostsForProfile(profile.id), [profile.id]);
  const events = useMemo(() => profileEventsFor(profile.id), [profile.id]);
  const tribes = useMemo(() => tribesForProfile(profile.id, true), [profile.id]);

  if (!user?.id && !meQuery.error) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <EmptyState title="Non connecté" description="Connecte-toi pour voir ton profil." />
      </View>
    );
  }

  if (meQuery.loading && !meQuery.error) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 48 }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const proProps = {
    profile,
    isOwner: true as const,
    topInset: insets.top,
    posts,
    subscribed: false,
    onToggleSubscribe: () => {},
    onEditProfile: () => router.push('/(app)/settings'),
    onShareProfile: () => Alert.alert('Profil', 'Partage du profil bientôt disponible.'),
    onContact: () => Alert.alert('Profil', 'Messagerie bientôt disponible.'),
    onOpenPass: () => router.push('/(app)/(tabs)/pass'),
    onOpenSettings: () => router.push('/(app)/settings'),
  } as const;

  return (
    <View style={styles.root} {...swipe.panHandlers}>
      {profile.type === 'commercial' ? (
        <ProProfile {...proProps} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        >
          {isProProfileType(profile.type) ? (
            <ProProfile {...proProps} />
          ) : (
            <CitizenProfile
              profile={profile}
              isOwner
              topInset={insets.top}
              posts={posts}
              taggedPosts={taggedPosts}
              tribes={tribes}
              topPosts={topPosts}
              events={events}
              subscribed={false}
              onToggleSubscribe={() => {}}
              onEditProfile={() => router.push('/(app)/settings')}
              onShareProfile={() => Alert.alert('Profil', 'Partage du profil bientôt disponible.')}
              onContact={() => Alert.alert('Profil', 'Messagerie bientôt disponible.')}
              onOpenPass={() => router.push('/(app)/(tabs)/pass')}
              onOpenPost={(postId) => router.push(`/(app)/feed/${postId}`)}
              onOpenSettings={() => router.push('/(app)/settings')}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
});

