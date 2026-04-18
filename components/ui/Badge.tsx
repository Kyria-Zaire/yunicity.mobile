import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

type BadgeProps = {
  children: string | number;
  variant?: 'default' | 'primary' | 'success' | 'error';
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>
        {children}
      </Text>
    </View>
  );
}

export type ProfileType = 'commercial' | 'association' | 'freelance' | 'ecole' | 'yunicitizen';

export function ProfileTypeBadge({ type }: { type: ProfileType }) {
  const label = type.toUpperCase();
  const bg =
    type === 'commercial'
      ? Colors.commercial
      : type === 'association'
        ? Colors.association
        : type === 'freelance'
          ? Colors.freelance
          : type === 'ecole'
            ? Colors.ecole
            : Colors.primary;

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: Colors.white }]}>{label}</Text>
    </View>
  );
}

export function VerifiedBadge() {
  return (
    <View style={[styles.base, { backgroundColor: '#DCFCE7' }]}>
      <Text style={[styles.text, { color: Colors.commercial }]}>VÉRIFIÉ ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  default: { backgroundColor: '#F3F4F6' },
  primary: { backgroundColor: '#E8E9FF' },
  success: { backgroundColor: '#DCFCE7' },
  error: { backgroundColor: '#FEE2E2' },
  text: { fontSize: 12, fontFamily: Fonts.bodySemi.family, letterSpacing: 0.2 },
  defaultText: { color: '#374151' },
  primaryText: { color: Colors.primary },
  successText: { color: Colors.commercial },
  errorText: { color: '#DC2626' },
});
