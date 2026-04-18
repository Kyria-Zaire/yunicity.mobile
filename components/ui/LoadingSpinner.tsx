import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
});

