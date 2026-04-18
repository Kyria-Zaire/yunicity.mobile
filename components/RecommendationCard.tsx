import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radii, Shadows } from '@/constants/theme';
import type { ProfileType } from '@/components/ui/Badge';

export type RecommendedActor = {
  id: string;
  name: string;
  reason?: string;
  profileType: ProfileType;
  score?: number;
  kind?: 'actor' | 'tribe';
};

function profileColor(t: ProfileType) {
  switch (t) {
    case 'commercial':
      return Colors.commercial;
    case 'association':
      return Colors.association;
    case 'freelance':
      return Colors.freelance;
    case 'ecole':
      return Colors.ecole;
    default:
      return Colors.primary;
  }
}

function viewsFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 37;
  return 12 + h;
}

export function RecommendationCard({
  item,
  onPress,
}: {
  item: RecommendedActor;
  onPress?: () => void;
}) {
  const top = profileColor(item.profileType);
  const views = viewsFromId(item.id);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <LinearGradient colors={[top, Colors.dark]} style={styles.card}>
        <Text style={styles.emoji}>🏙️</Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.distPill}>
          <Text style={styles.distText}>0.3 km</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={styles.tagText}>{item.profileType}</Text>
        </View>
        <Text style={styles.fomo}>🔥 {views} vues aujourd&apos;hui</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 260,
    borderRadius: Radii.xl,
    padding: 16,
    justifyContent: 'flex-end',
    ...Shadows.fomo,
  },
  emoji: { position: 'absolute', top: 20, alignSelf: 'center', fontSize: 60 },
  name: {
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
  },
  distPill: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  distText: { fontFamily: Fonts.mono.family, fontSize: 11, color: Colors.white },
  tag: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  tagText: {
    fontFamily: Fonts.monoMedium.family,
    fontSize: 10,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  fomo: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
});
