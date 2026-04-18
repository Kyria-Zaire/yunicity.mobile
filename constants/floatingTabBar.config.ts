import type { ViewStyle } from 'react-native';

/** Navbar flottante — référence maquettes Kyria */
export const TabBarFloat = {
  height: 62,
  pillWidthRatio: 0.92,
  liftFromBottom: 20,
  pillBorderRadius: 31,
  fabGapAboveBar: 16,
  extraScrollClearance: 56,
} as const;

export const tabBarFloatShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 12,
} satisfies ViewStyle;

/** Alias export maquette (objet Shadows minimal côté config) */
export const Shadows = { tabBarFloat: tabBarFloatShadow };

export function tabBarPillLayout(windowWidth: number) {
  const width = Math.max(260, Math.round(windowWidth * TabBarFloat.pillWidthRatio));
  const left = Math.round((windowWidth - width) / 2);
  return { width, left };
}

export function tabBarFloatingLayout(insetsBottom: number) {
  const barBottom = TabBarFloat.liftFromBottom + Math.max(insetsBottom, 8);
  const fabBottom = barBottom + TabBarFloat.height + TabBarFloat.fabGapAboveBar;
  const scrollPaddingBottom = fabBottom + TabBarFloat.extraScrollClearance;
  return {
    tabBarBottom: barBottom,
    scenePaddingBottom: scrollPaddingBottom,
    fabBottom,
    scrollPaddingBottom,
  };
}
