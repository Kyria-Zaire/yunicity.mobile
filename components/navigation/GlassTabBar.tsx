import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadows, TabBarGlass, tabBarFloatingLayout } from '@/constants/theme';

type Ion = keyof typeof Ionicons.glyphMap;

const ROUTE_ICONS: Record<string, { inactive: Ion; active: Ion }> = {
  feed: { inactive: 'home-outline', active: 'home' },
  map: { inactive: 'map-outline', active: 'map' },
  pass: { inactive: 'ticket-outline', active: 'ticket' },
  tribus: { inactive: 'people-outline', active: 'people' },
  profil: { inactive: 'person-outline', active: 'person' },
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { tabBarBottom } = tabBarFloatingLayout(insets.bottom);

  const visibleRoutes = state.routes.filter((route) => {
    const href = (descriptors[route.key].options as { href?: string | null }).href;
    return href !== null;
  });

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          {
            bottom: tabBarBottom,
            left: TabBarGlass.hMargin,
            right: TabBarGlass.hMargin,
          },
        ]}
      >
        <BlurView
          intensity={TabBarGlass.blurIntensity}
          tint="dark"
          style={[
            styles.blur,
            {
              borderRadius: TabBarGlass.radius,
              minHeight: TabBarGlass.height,
            },
            Shadows.tabBarGlass,
          ]}
        >
          <View style={styles.tint}>
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
                const color = focused ? Colors.primary : 'rgba(255,255,255,0.4)';

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

                      if (route.name === 'feed') {
                        navigation.dispatch({
                          ...CommonActions.navigate({
                            name: 'feed',
                            params: { screen: 'index' },
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
                    style={styles.item}
                  >
                    <Ionicons
                      name={(focused ? icons.active : icons.inactive) as Ion}
                      size={26}
                      color={color}
                    />
                    <Text style={[styles.label, { color }]} numberOfLines={1}>
                      {label}
                    </Text>
                    {focused ? <View style={styles.dot} /> : <View style={styles.dotPlaceholder} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
  blur: {
    overflow: 'hidden',
  },
  tint: {
    backgroundColor: 'rgba(13, 15, 46, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bodyMedium.family,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 2,
    opacity: 0,
  },
});
