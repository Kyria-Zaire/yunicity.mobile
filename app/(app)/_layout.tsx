import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
        }}
      />
      <Tabs.Screen
        name="pass"
        options={{
          title: 'Pass',
        }}
      />
      <Tabs.Screen
        name="tribus"
        options={{
          title: 'Tribus',
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}
