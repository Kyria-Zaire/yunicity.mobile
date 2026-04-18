import { View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" subtitle="Reste connecté" />
      <Text style={styles.body}>Aucune notification.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  body: { fontSize: 16, color: '#6B7280' },
});
