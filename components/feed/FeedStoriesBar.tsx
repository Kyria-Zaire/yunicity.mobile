import { useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import type { StoryRing } from '@/constants/mockStories';
import { useAuthStore } from '@/stores/auth.store';

type Props = {
  rings: StoryRing[];
  meUserId: string;
  onPressMine: () => void;
  onPressMineWithStories: () => void;
  onPressRing: (index: number) => void;
};

function mineInitialsFromUser(user: { profileData?: { displayName?: string }; email?: string; name?: string } | null | undefined) {
  const dn = user?.profileData?.displayName?.trim();
  if (dn) {
    const parts = dn.split(/\s+/).filter(Boolean);
    const letters = parts.map((w) => w[0]).join('');
    if (letters) return letters.toUpperCase().slice(0, 2);
  }
  const mail = user?.email?.trim();
  if (mail && mail.length >= 2) return mail.slice(0, 2).toUpperCase();
  return 'KY';
}

function RingAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <View style={[styles.innerAv, { backgroundColor: color }]}>
      <Text style={styles.innerAvTxt}>{initials}</Text>
    </View>
  );
}

/** Bordure gradient statique (non vue), sans animation */
function UnseenRingBorder({ children }: { children: ReactNode }) {
  return (
    <View style={styles.unseenWrap}>
      <LinearGradient
        colors={['#2A2FFF', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradOuter}
      >
        <View style={styles.gradInner}>{children}</View>
      </LinearGradient>
    </View>
  );
}

export function FeedStoriesBar({ rings, meUserId, onPressMine, onPressMineWithStories, onPressRing }: Props) {
  const user = useAuthStore((s) => s.user);
  const mineInitials = useMemo(() => mineInitialsFromUser(user), [user]);

  const myRing = rings[0];
  const hasMyStories = !!myRing && myRing.userId === meUserId && myRing.stories.length > 0;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Pressable
          style={styles.cell}
          onPress={() => {
            if (hasMyStories) onPressMineWithStories();
            else onPressMine();
          }}
        >
          <View style={styles.mineOuter}>
            <View style={[styles.mineInner, { backgroundColor: Colors.primary }]}>
              {hasMyStories ? (
                <Text style={styles.mineInitialsTxt}>{mineInitials}</Text>
              ) : (
                <Ionicons name="add" size={28} color={Colors.white} />
              )}
            </View>
          </View>
          <Text style={styles.label} numberOfLines={1}>
            Votre story
          </Text>
        </Pressable>

        {rings.slice(1).map((r, i) => {
          const index = i + 1;
          return (
            <Pressable key={r.userId} style={styles.cell} onPress={() => onPressRing(index)}>
              {r.seen ? (
                <View style={styles.seenOuter}>
                  <View style={styles.seenInner}>
                    <RingAvatar initials={r.initials} color={r.avatarColor} />
                  </View>
                </View>
              ) : (
                <UnseenRingBorder>
                  <RingAvatar initials={r.initials} color={r.avatarColor} />
                </UnseenRingBorder>
              )}
              <Text style={styles.label} numberOfLines={1}>
                {r.userName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 100, marginBottom: 4 },
  scroll: { paddingHorizontal: 12, alignItems: 'flex-start', gap: 10, columnGap: 10 },
  cell: { width: 72, alignItems: 'center' },
  unseenWrap: { width: 60, height: 60 },
  mineOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineInner: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  mineInitialsTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
  gradOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
  },
  gradInner: {
    flex: 1,
    borderRadius: 27,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seenOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seenInner: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  innerAv: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerAvTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  label: {
    marginTop: 6,
    width: 72,
    textAlign: 'center',
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: Colors.dark,
  },
});
