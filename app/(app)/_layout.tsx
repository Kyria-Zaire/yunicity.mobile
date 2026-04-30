import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.pageBg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="feed/[id]" />
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="profile/followers" />
      <Stack.Screen name="tribes/[id]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="map/actor/[id]" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
