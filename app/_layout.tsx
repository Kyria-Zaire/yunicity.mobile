import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, DefaultTheme, type Theme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.pageBg,
    card: Colors.white,
    text: Colors.dark,
    border: Colors.grayBorder,
    notification: Colors.primary,
  },
};

/**
 * Layout racine uniquement : providers + Stack (index, auth, app, modal).
 * Les écrans du groupe (app) (feed, profile, etc.) sont déclarés dans `app/(app)/_layout.tsx`.
 * BottomSheetModalProvider doit envelopper la navigation pour @gorhom/bottom-sheet.
 */
export default function RootLayout() {
  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.pageBg },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
