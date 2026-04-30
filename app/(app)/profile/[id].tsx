import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CitizenProfile } from '@/components/profile/CitizenProfile';
import { ProProfile } from '@/components/profile/ProProfile';
import {
  isProProfileType,
  normalizeMockProfile,
  postsForProfile,
  profileByIdOrFallback,
  profileEventsFor,
  taggedPostsForProfile,
  topPostsForProfile,
  tribesForProfile,
} from '@/components/profile/profileUtils';
import { Colors, tabBarFloatingLayout } from '@/constants/theme';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const { id } = useLocalSearchParams<{ id: string }>();
  const setHideTabBar = useUIStore((state) => state.setHideTabBar);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const profileId = String(id ?? '');

  const [subscribed, setSubscribed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setHideTabBar(true);
      return () => setHideTabBar(false);
    }, [setHideTabBar]),
  );

  useEffect(() => {
    if (profileId && currentUserId && profileId === currentUserId) {
      router.replace('/(app)/(tabs)/profil');
    }
  }, [currentUserId, profileId]);

  const rawProfile = useMemo(() => profileByIdOrFallback(profileId), [profileId]);
  const profile = useMemo(() => normalizeMockProfile(rawProfile, false), [rawProfile]);
  const posts = useMemo(() => postsForProfile(profile.id), [profile.id]);
  const taggedPosts = useMemo(() => taggedPostsForProfile(profile.id), [profile.id]);
  const topPosts = useMemo(() => topPostsForProfile(profile.id), [profile.id]);
  const events = useMemo(() => profileEventsFor(profile.id), [profile.id]);
  const tribes = useMemo(() => tribesForProfile(profile.id, false), [profile.id]);

  if (profileId && currentUserId && profileId === currentUserId) {
    return null;
  }

  const proPublicProps = {
    profile,
    isOwner: false as const,
    topInset: insets.top,
    posts,
    subscribed,
    onToggleSubscribe: () => setSubscribed((value) => !value),
    onEditProfile: () => {},
    onShareProfile: () => Alert.alert('Profil', 'Partage du profil bientôt disponible.'),
    onContact: () => Alert.alert('Contact', `Prendre contact avec ${profile.displayName} bientôt disponible.`),
    onOpenPass: () => Alert.alert('Passeport', 'Version publique du passeport bientôt disponible.'),
    onOpenSettings: () => {},
    onBack: () => router.back(),
    onMore: () =>
      Alert.alert('Profil public', 'Options disponibles', [
        { text: 'Partager', onPress: () => Alert.alert('Partager', 'Partage bientôt disponible.') },
        { text: 'Signaler', onPress: () => Alert.alert('Signaler', 'Signalement bientôt disponible.') },
        { text: 'Fermer', style: 'cancel' },
      ]),
  };

  return (
    <View style={styles.root}>
      {profile.type === 'commercial' ? (
        <ProProfile {...proPublicProps} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        >
          {isProProfileType(profile.type) ? (
            <ProProfile {...proPublicProps} />
          ) : (
            <CitizenProfile
              profile={profile}
              isOwner={false}
              topInset={insets.top}
              posts={posts}
              taggedPosts={taggedPosts}
              tribes={tribes}
              topPosts={topPosts}
              events={events}
              subscribed={subscribed}
              onToggleSubscribe={() => setSubscribed((value) => !value)}
              onEditProfile={() => {}}
              onShareProfile={() => Alert.alert('Profil', 'Partage du profil bientôt disponible.')}
              onContact={() => Alert.alert('Contact', `Prendre contact avec ${profile.displayName} bientôt disponible.`)}
              onOpenPass={() => Alert.alert('Passeport', 'Version publique du passeport bientôt disponible.')}
              onOpenPost={(postId) => router.push(`/(app)/feed/${postId}`)}
              onOpenSettings={() => {}}
              onBack={() => router.back()}
              onMore={() =>
                Alert.alert('Profil public', 'Options disponibles', [
                  { text: 'Partager', onPress: () => Alert.alert('Partager', 'Partage bientôt disponible.') },
                  { text: 'Signaler', onPress: () => Alert.alert('Signaler', 'Signalement bientôt disponible.') },
                  { text: 'Fermer', style: 'cancel' },
                ])
              }
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
