import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { TabBarFloat, tabBarFloatingLayout, tabBarPillLayout } from '@/constants/floatingTabBar.config';

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

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { width, left } = tabBarPillLayout(windowWidth);
  const { tabBarBottom } = tabBarFloatingLayout(insets.bottom);

  const activeRoute = state.routes[state.index];
  const mapBlue = activeRoute?.name === 'map';

  const visibleRoutes = state.routes.filter((route) => TAB_BAR_ROUTE_NAMES.has(route.name));

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          {
            bottom: tabBarBottom,
            left,
            width,
            height: TabBarFloat.height,
          },
        ]}
      >
        <View
          style={[
            styles.pill,
            mapBlue ? styles.pillBlue : styles.pillWhite,
            {
              borderRadius: TabBarFloat.pillBorderRadius,
              paddingTop: 6,
              paddingBottom: 6,
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
              const icons = ROUTE_ICONS[route.name] ?? {
                inactive: 'ellipse-outline' as Ion,
                active: 'ellipse' as Ion,
              };

              let iconColor: string;
              let labelColor: string;
              if (mapBlue) {
                iconColor = focused ? Colors.white : 'rgba(255,255,255,0.55)';
                labelColor = focused ? Colors.white : 'rgba(255,255,255,0.55)';
              } else {
                iconColor = focused ? Colors.primary : Colors.textMuted;
                labelColor = focused ? Colors.primary : Colors.textMuted;
              }

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
                    if (!focused && !event.defaultPrevented) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
  pill: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  pillWhite: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
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
