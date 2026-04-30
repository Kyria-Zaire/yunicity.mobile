import { ExpoRoot } from 'expo-router';

export default function App() {
  // Charge les routes Expo Router depuis `apps/mobile/app/`
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

