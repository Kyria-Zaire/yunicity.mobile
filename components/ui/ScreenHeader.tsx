import { View, Text, StyleSheet } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D0F2E',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
});
