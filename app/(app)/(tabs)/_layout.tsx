import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { tabBarPillLayout } from '@/constants/floatingTabBar.config';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  void tabBarPillLayout(width);

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="pass" options={{ title: 'Pass' }} />
      <Tabs.Screen name="tribus" options={{ title: 'Tribus' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

