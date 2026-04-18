import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Radii, Fonts } from '@/constants/theme';

type AvatarProps = {
  size?: number;
  name?: string | null;
  imageUrl?: string | null;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

export function Avatar({ size = 48, name, imageUrl }: AvatarProps) {
  const initials = name ? initialsFromName(name) : '';
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials || 'Y'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#1C1F4A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radii.card,
  },
  initials: {
    color: Colors.white,
    fontFamily: Fonts.title.family,
    letterSpacing: 0.4,
  },
});

