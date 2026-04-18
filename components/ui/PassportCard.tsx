import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radii, Shadows } from '@/constants/theme';

type Props = {
  displayName: string;
  level: number;
  levelName: string;
  points: number;
  progress: number;
  nextLabel?: string;
  badges?: string[];
};

export function PassportCard({
  displayName,
  level,
  levelName,
  points,
  progress,
  nextLabel = '360 pts pour devenir Acteur',
  badges = ['🌟', '🏙️', '🤝'],
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  return (
    <LinearGradient colors={[Colors.darkCard, Colors.primary]} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>YUNICITY</Text>
        <Text style={styles.levelTag}>NIVEAU {level}</Text>
      </View>
      <View style={styles.rfid} />
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.level}>{levelName.toUpperCase()}</Text>
      <Text style={styles.points}>{points} PTS</Text>
      <View style={styles.track}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={styles.hint}>{nextLabel}</Text>
      <View style={styles.badges}>
        {badges.slice(0, 3).map((b, i) => (
          <View key={i} style={styles.badgeCircle}>
            <Text style={styles.badgeEmoji}>{b}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginTop: -32,
    borderRadius: Radii.card,
    padding: 20,
    ...Shadows.fab,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  levelTag: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  rfid: {
    marginTop: 10,
    alignSelf: 'flex-end',
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,215,120,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,120,0.6)',
  },
  name: { marginTop: 12, fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  level: { marginTop: 4, fontFamily: Fonts.mono.family, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  points: { marginTop: 8, fontFamily: Fonts.title.family, fontSize: 28, color: Colors.white },
  track: {
    marginTop: 12,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  hint: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  badges: { marginTop: 14, flexDirection: 'row', gap: 10 },
  badgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 18 },
});
