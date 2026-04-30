import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useSegments } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { TabBarFloat, tabBarFloatingLayout, tabBarPillLayout } from '@/constants/floatingTabBar.config';
import { useUIStore } from '@/stores/ui.store';

type Ion = keyof typeof Ionicons.glyphMap;

const ROUTE_ICONS: Record<string, { inactive: Ion; active: Ion }> = {
  index: { inactive: 'home-outline', active: 'home' },
  map: { inactive: 'map-outline', active: 'map' },
  pass: { inactive: 'ticket-outline', active: 'ticket' },
  tribus: { inactive: 'people-outline', active: 'people' },
  profil: { inactive: 'person-outline', active: 'person' },
};

/** Uniquement les onglets visibles dans la pilule (exclut tribes/[id], notifications, etc.) */
const TAB_BAR_ROUTE_NAMES = new Set(['index', 'map', 'pass', 'tribus', 'profil']);

/** Expo / web peuvent préfixer les noms (`(tabs)/index`). On compare toujours le segment canonique. */
function canonicalTabRouteName(name: string): string {
  let n = name;
  while (/^\([^/]+\)\//.test(n)) {
    n = n.replace(/^\([^/]+\)\//, '');
  }
  return n.includes('/') ? (n.split('/').pop() ?? n) : n;
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const hideTabBarStore = useUIStore((s) => s.hideTabBar);
  const resetTabBar = useUIStore((s) => s.resetTabBar);
  /** Typage expo-router trop étroit pour les segments dynamiques (groupes). */
  const segments = [...useSegments()] as string[];
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { width, left } = tabBarPillLayout(windowWidth);
  const { tabBarBottom } = tabBarFloatingLayout(insets.bottom);

  const lastSegment = segments[segments.length - 1] ?? '';
  const isOnMainTab = TAB_BAR_ROUTE_NAMES.has(lastSegment);

  /**
   * Onglets principaux : afficher la barre (ignore le store « bloqué » sauf sur Feed).
   * Sur `index`, le store pilote encore le mode Shorts + écrans qui masquent depuis le feed.
   */
  const hideTabBar =
    lastSegment === 'index' ? hideTabBarStore : isOnMainTab ? false : hideTabBarStore;

  useEffect(() => {
    if (isOnMainTab && lastSegment !== 'index') {
      resetTabBar();
    }
  }, [isOnMainTab, lastSegment, resetTabBar]);

  const visibleRoutes = useMemo(() => {
    const primary = state.routes.filter((route) =>
      TAB_BAR_ROUTE_NAMES.has(canonicalTabRouteName(route.name)),
    );
    if (primary.length > 0) return primary;
    const secondary = state.routes.filter((route) =>
      ['index', 'map', 'pass', 'tribus', 'profil'].includes(canonicalTabRouteName(route.name)),
    );
    if (secondary.length > 0) return secondary;
    return state.routes;
  }, [state.routes]);

  // Masquage explicite piloté par les pages (/feed/[id], /profile/[id], Shorts sur le Feed).
  if (hideTabBar) return null;

  const barWrapperStyle = {
    position: Platform.OS === 'web' ? ('fixed' as const) : ('absolute' as const),
    bottom: tabBarBottom,
    left,
    width,
    height: TabBarFloat.height,
    zIndex: 9999,
  };

  return (
    <View pointerEvents="box-none" style={barWrapperStyle as any}>
      <View
        style={[
          styles.pill,
          styles.pillBlue,
          {
            borderRadius: TabBarFloat.pillBorderRadius,
            paddingTop: 6,
            paddingBottom: 6,
            flex: 1,
          },
          Shadows.tabBarFloat,
        ]}
      >
        <View style={styles.row}>
          {visibleRoutes.map((route) => {
            const routeIndex = state.routes.indexOf(route);
            const focused = state.index === routeIndex;
            const { options } = descriptors[route.key];
            const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
            const label = typeof rawLabel === 'string' ? rawLabel : route.name;
            const leafName = canonicalTabRouteName(route.name);
            const icons = ROUTE_ICONS[leafName] ?? {
              inactive: 'ellipse-outline' as Ion,
              active: 'ellipse' as Ion,
            };

            const iconColor = focused ? Colors.white : 'rgba(255,255,255,0.55)';
            const labelColor = focused ? Colors.white : 'rgba(255,255,255,0.55)';

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (event.defaultPrevented) return;

                  if (leafName === 'index') {
                    // Switch tab + reset to tab root (évite tout état résiduel /feed/[id]).
                    navigation.dispatch({
                      ...CommonActions.navigate({
                        name: route.name,
                      }),
                      target: state.key,
                    });
                    return;
                  }

                  if (!focused) {
                    navigation.dispatch({
                      ...CommonActions.navigate({ name: route.name, params: route.params }),
                      target: state.key,
                    });
                  }
                }}
                style={({ pressed }) => [styles.item, pressed && { opacity: 0.88 }]}
              >
                <View style={styles.itemInner}>
                  <Ionicons name={(focused ? icons.active : icons.inactive) as Ion} size={22} color={iconColor} />
                  <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  pillBlue: {
    backgroundColor: Colors.primary,
    borderTopWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 52,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bodySemi.family,
    marginTop: 2,
  },
});
