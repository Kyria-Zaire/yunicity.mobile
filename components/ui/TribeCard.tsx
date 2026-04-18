import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts, Radii, Shadows } from '@/constants/theme';

/** Item tribu (mock ou API) */
export type TribeListItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  postsToday?: number;
  emoji?: string;
  isVerified?: boolean;
  isMember?: boolean;
};

function bandColor(category: string) {
  switch (category) {
    case 'culture':
      return '#D97706';
    case 'sport':
      return '#16A34A';
    case 'business':
      return '#2A2FFF';
    case 'ecology':
      return '#059669';
    case 'food':
      return '#EA580C';
    case 'art':
      return '#7C3AED';
    case 'tech':
      return '#0891B2';
    default:
      return Colors.primary;
  }
}

function categoryEmoji(category: string, fallback?: string) {
  if (fallback) return fallback;
  switch (category) {
    case 'culture':
      return '🎭';
    case 'sport':
      return '🚴';
    case 'business':
      return '💼';
    case 'ecology':
      return '🌱';
    case 'food':
      return '🍽️';
    case 'art':
      return '📸';
    case 'tech':
      return '💻';
    default:
      return '👥';
  }
}

export function TribeCard({
  tribe,
  onPress,
}: {
  tribe: TribeListItem;
  onPress: () => void;
}) {
  const band = bandColor(tribe.category);
  const emoji = categoryEmoji(tribe.category, tribe.emoji);
  const fomo = tribe.postsToday ?? Math.max(1, (tribe.members % 7) + 1);
  const cta = tribe.isMember ? 'Voir →' : 'Rejoindre';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.95 }]}>
      <View style={styles.card}>
        <View style={[styles.band, { backgroundColor: band }]} />
        <View style={styles.body}>
          <View style={styles.row}>
            <View style={[styles.emojiCircle, { backgroundColor: `${band}22` }]}>
              <Text style={styles.emojiBig}>{emoji}</Text>
            </View>
            <View style={styles.col}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {tribe.name}
                </Text>
                {tribe.isVerified ? <Text style={styles.verified}>✓</Text> : null}
              </View>
              <Text style={styles.desc} numberOfLines={1}>
                {tribe.description}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>👥 {tribe.members} membres</Text>
                <Text style={styles.meta}> · </Text>
                <Text style={styles.meta}>📍 Reims</Text>
                <View style={styles.catPill}>
                  <Text style={styles.catPillTxt}>{tribe.category}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.cta, cta === 'Rejoindre' ? styles.ctaPrimary : styles.ctaGhost]}>
              <Text style={[styles.ctaTxt, cta === 'Rejoindre' && styles.ctaTxtOn]}>{cta}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.fomoPill}>
        <Text style={styles.fomoTxt}>
          🔥 {fomo} nouveaux posts aujourd&apos;hui
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    overflow: 'hidden',
    ...Shadows.card,
  },
  band: { width: 4, borderRadius: 2 },
  body: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBig: { fontSize: 24 },
  col: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark, flex: 1 },
  verified: { color: Colors.commercial, fontFamily: Fonts.bodyBold.family },
  desc: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  metaRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  meta: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  catPill: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    marginLeft: 4,
  },
  catPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 10, color: Colors.dark, textTransform: 'capitalize' },
  cta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaPrimary: { backgroundColor: Colors.primary },
  ctaGhost: { backgroundColor: Colors.grayLight },
  ctaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark },
  ctaTxtOn: { color: Colors.white },
  fomoPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: Colors.fomoPillBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  fomoTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.fomoPillText },
});
