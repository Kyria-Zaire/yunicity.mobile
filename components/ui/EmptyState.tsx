import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts, Radii } from '@/constants/theme';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.action, pressed && { opacity: 0.9 }]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  description: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
  },
  action: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radii.inner,
    backgroundColor: Colors.primary,
  },
  actionText: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
});

