import { useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';
import { router } from 'expo-router';

const TAB_ORDER = [
  '/(app)/(tabs)',
  '/(app)/(tabs)/map',
  '/(app)/(tabs)/pass',
  '/(app)/(tabs)/tribus',
  '/(app)/(tabs)/profil',
] as const;
const SWIPE_THRESHOLD = 50;

type TabPath = (typeof TAB_ORDER)[number];

export function useTabSwipe(currentTab: TabPath) {
  const currentIndex = useMemo(() => TAB_ORDER.indexOf(currentTab), [currentTab]);

  return useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > SWIPE_THRESHOLD && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (currentIndex < 0) return;
        if (g.dx < -SWIPE_THRESHOLD) {
          const next = TAB_ORDER[currentIndex + 1];
          if (next) router.replace(next as any);
        } else if (g.dx > SWIPE_THRESHOLD) {
          const prev = TAB_ORDER[currentIndex - 1];
          if (prev) router.replace(prev as any);
        }
      },
    }),
  ).current;
}

