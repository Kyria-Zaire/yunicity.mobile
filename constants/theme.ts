import type { ViewStyle } from 'react-native';
import { tabBarFloatShadow } from './floatingTabBar.config';

/** Design system Yunicity Mobile — Sprint 2 FOMO */
export const Colors = {
  primary: '#2A2FFF',
  primaryDark: '#1A1ECC',
  primaryLight: '#9395FF',
  dark: '#0D0F2E',
  darkCard: '#1C1F4A',
  white: '#FFFFFF',
  commercial: '#16A34A',
  association: '#D97706',
  freelance: '#7C3AED',
  ecole: '#DC2626',
  gray: '#6B7280',
  textGray: '#6B7280',
  grayLight: '#F3F4F6',
  grayBorder: '#E5E7EB',
  textBody: '#374151',
  textMuted: '#9CA3AF',
  mapCardInner: '#1C1F4A',
  pageBg: '#F9FAFB',
  fomoPillBg: '#FEF3C7',
  fomoPillText: '#D97706',
} as const;

/** Alias rétrocompat */
export const Tokens = {
  pageBg: Colors.pageBg,
  surface: Colors.white,
  border: Colors.grayLight,
  accentMono: Colors.primaryLight,
} as const;

export const Radii = {
  min: 16,
  card: 20,
  xl: 24,
  inner: 16,
  pill: 9999,
  tabBar: 32,
} as const;

/** Ombre globale spec FOMO */
export const Shadows = {
  fomo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  } satisfies ViewStyle,
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  } satisfies ViewStyle,
  fab: {
    shadowColor: '#2A2FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  } satisfies ViewStyle,
  tabBarGlass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 20,
  } satisfies ViewStyle,
  tabBarFloat: tabBarFloatShadow,
} as const;

/** Tab bar flottante glass (spec Sprint 2) */
export const TabBarGlass = {
  bottomOffset: 20,
  hMargin: 20,
  height: 72,
  radius: 32,
  blurIntensity: 55,
} as const;

export { TabBarFloat, tabBarFloatingLayout, tabBarPillLayout } from './floatingTabBar.config';

export const Spacing = {
  screen: 16,
  sectionGap: 24,
} as const;

export const Fonts = {
  title: { family: 'Syne_700Bold' },
  titleSemi: { family: 'Syne_600SemiBold' },
  body: { family: 'DMSans_400Regular' },
  bodyMedium: { family: 'DMSans_500Medium' },
  bodySemi: { family: 'DMSans_600SemiBold' },
  bodyBold: { family: 'DMSans_700Bold' },
  mono: { family: 'JetBrainsMono_400Regular' },
  monoMedium: { family: 'JetBrainsMono_500Medium' },
} as const;
