import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Fonts, Radii, Shadows } from '@/constants/theme';
import { useTabSwipe } from '@/hooks/useTabSwipe';
import { MAP_ACTORS, MAP_EVENTS, MAP_POSTS, type MapActor, type MapEvent, type MapPost } from '@/constants/mockMapData';

type RNMaps = typeof import('react-native-maps');
type Camera = import('react-native-maps').Camera;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const swipe = useTabSwipe('/(app)/(tabs)/map');
  const mapRef = useRef<any>(null);
  const listRef = useRef<FlatList<string>>(null);

  const hasGoogleMapsApiKey = useMemo(() => {
    // On évite de monter react-native-maps sur Android sans clé API.
    if (Platform.OS !== 'android') return true;

    const expoConfig: any = (Constants as any).expoConfig ?? (Constants as any).manifest;
    const key =
      expoConfig?.android?.config?.googleMaps?.apiKey ??
      expoConfig?.ios?.config?.googleMapsApiKey ??
      expoConfig?.extra?.googleMapsApiKey ??
      '';

    return typeof key === 'string' && key.trim().length > 0;
  }, []);

  const { height: H } = Dimensions.get('window');
  const collapsedTop = Math.round(H * 0.6);
  const expandedTop = Math.round(H * 0.2);

  const [mode, setMode] = useState<'actors' | 'events' | 'posts'>('actors');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pitch3D, setPitch3D] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 49.2583,
    longitude: 4.0317,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const panelTop = useRef(new Animated.Value(collapsedTop)).current;
  const panelTopValue = useRef(collapsedTop);
  useEffect(() => {
    const id = panelTop.addListener(({ value }) => {
      panelTopValue.current = value;
    });
    return () => panelTop.removeListener(id);
  }, [panelTop]);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const snapPanel = useCallback(
    (to: 'collapsed' | 'expanded') => {
      Animated.spring(panelTop, {
        toValue: to === 'expanded' ? expandedTop : collapsedTop,
        useNativeDriver: false,
        speed: 22,
        bounciness: 0,
      }).start();
    },
    [collapsedTop, expandedTop, panelTop],
  );

  const handlePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        const next = Math.min(
          collapsedTop,
          Math.max(expandedTop, panelTopValue.current + g.dy),
        );
        panelTop.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const mid = (collapsedTop + expandedTop) / 2;
        const target =
          g.vy < 0 || panelTopValue.current < mid ? 'expanded' : 'collapsed';
        snapPanel(target);
      },
    }),
  ).current;

  const isExpanded = useMemo(
    () => panelTopValue.current < (collapsedTop + expandedTop) / 2,
    [collapsedTop, expandedTop],
  );

  const items = useMemo(() => {
    if (mode === 'actors') return MAP_ACTORS.map((a) => a.id);
    if (mode === 'events') return MAP_EVENTS.map((e) => e.id);
    return MAP_POSTS.map((p) => p.id);
  }, [mode]);

  const title = useMemo(() => {
    if (mode === 'actors') return `${MAP_ACTORS.length} acteurs près de toi`;
    if (mode === 'events') return `${MAP_EVENTS.length} événements cette semaine`;
    return `${MAP_POSTS.length} posts près de toi`;
  }, [mode]);

  const centerOn = useCallback(
    (lat: number, lng: number) => {
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
        380,
      );
    },
    [region.latitudeDelta, region.longitudeDelta],
  );

  const onSelect = useCallback(
    (id: string, lat: number, lng: number) => {
      setSelectedId(id);
      centerOn(lat, lng);
      const idx = items.indexOf(id);
      if (idx >= 0) {
        requestAnimationFrame(() =>
          listRef.current?.scrollToIndex({
            index: idx,
            animated: true,
            viewPosition: 0.5,
          }),
        );
      }
    },
    [centerOn, items],
  );

  const handleGps = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({});
    centerOn(pos.coords.latitude, pos.coords.longitude);
  }, [centerOn]);

  const zoomBy = useCallback((factor: number) => {
    setRegion((r) => {
      const next = {
        ...r,
        latitudeDelta: Math.max(0.002, Math.min(0.2, r.latitudeDelta * factor)),
        longitudeDelta: Math.max(
          0.002,
          Math.min(0.2, r.longitudeDelta * factor),
        ),
      };
      mapRef.current?.animateToRegion(next, 260);
      return next;
    });
  }, []);

  const togglePitch = useCallback(() => {
    setPitch3D((v) => {
      const next = !v;
      mapRef.current?.animateCamera(
        {
          center: { latitude: region.latitude, longitude: region.longitude },
          pitch: next ? 45 : 0,
          heading: 0,
          zoom: 14,
        } as Camera,
        { duration: 380 },
      );
      return next;
    });
  }, [region.latitude, region.longitude]);

  const markerForActor = useCallback(
    (a: MapActor) => {
      const bg =
        a.type === 'commercial'
          ? '#16A34A'
          : a.type === 'association'
            ? '#D97706'
            : a.type === 'freelance'
              ? '#7C3AED'
              : a.type === 'ecole'
                ? '#DC2626'
                : '#2A2FFF';
      const emoji =
        a.type === 'commercial'
          ? '🏪'
          : a.type === 'association'
            ? '🤝'
            : a.type === 'freelance'
              ? '💼'
              : a.type === 'ecole'
                ? '📚'
                : '📍';
      const active = selectedId === a.id;
      return (
        <Pressable onPress={() => onSelect(a.id, a.lat, a.lng)}>
          <View style={styles.markerWrap}>
            {a.activeToday ? (
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [
                      {
                        scale: pulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.3],
                        }),
                      },
                    ],
                    opacity: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.1],
                    }),
                  },
                ]}
              />
            ) : null}
            <View
              style={[
                styles.actorMarker,
                { backgroundColor: bg },
                active && styles.markerActive,
              ]}
            >
              <Text style={styles.actorEmoji}>{emoji}</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [onSelect, pulse, selectedId],
  );

  const markerForEvent = useCallback(
    (e: MapEvent) => {
      const active = selectedId === e.id;
      return (
        <Pressable onPress={() => onSelect(e.id, e.lat, e.lng)}>
          <View style={[styles.pin, { backgroundColor: e.color }, active && styles.markerActive]}>
            <Text style={styles.pinEmoji}>🎫</Text>
            <View style={styles.attendeesBadge}>
              <Text style={styles.attendeesTxt}>{e.attendees}</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [onSelect, selectedId],
  );

  const markerForPost = useCallback(
    (p: MapPost) => {
      const active = selectedId === p.id;
      return (
        <Pressable onPress={() => onSelect(p.id, p.lat, p.lng)}>
          <View style={[styles.postMarker, active && styles.markerActive]}>
            <View style={[styles.postAvatar, { backgroundColor: p.authorColor }]}>
              <Text style={styles.postAvatarTxt}>{p.authorInitials}</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [onSelect, selectedId],
  );

  const renderCard = useCallback(
    ({ item }: { item: string }) => {
      if (mode === 'actors') {
        const a = MAP_ACTORS.find((x) => x.id === item)!;
        return (
          <ActorCard
            actor={a}
            selected={selectedId === a.id}
            onPress={() => onSelect(a.id, a.lat, a.lng)}
            onView={() =>
              router.push({
                pathname: '/(app)/map/actor/[id]' as any,
                params: { id: a.id },
              })
            }
          />
        );
      }
      if (mode === 'events') {
        const e = MAP_EVENTS.find((x) => x.id === item)!;
        return (
          <EventCard
            ev={e}
            selected={selectedId === e.id}
            onPress={() => onSelect(e.id, e.lat, e.lng)}
          />
        );
      }
      const p = MAP_POSTS.find((x) => x.id === item)!;
      return (
        <PostRow
          post={p}
          selected={selectedId === p.id}
          onPress={() => onSelect(p.id, p.lat, p.lng)}
        />
      );
    },
    [mode, onSelect, selectedId],
  );

  // react-native-maps n'est pas supporté sur Web (modules natifs). On évite l'import côté Web.
  const RNMapsMod = useMemo<RNMaps | null>(() => {
    if (Platform.OS === 'web') return null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-maps') as RNMaps;
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webRoot, styles.webCard]} {...swipe.panHandlers}>
        <View style={styles.webIcon}>
          <Ionicons name="map-outline" size={22} color="#0D0F2E" />
        </View>
        <Text style={styles.webTitle}>Carte disponible sur mobile</Text>
        <Text style={styles.webSub}>
          La vue carte utilise des modules natifs et n’est pas supportée sur Expo Web.
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'android' && !hasGoogleMapsApiKey) {
    return (
      <View style={[styles.webRoot, styles.webCard]} {...swipe.panHandlers}>
        <View style={styles.webIcon}>
          <Ionicons name="alert-circle-outline" size={22} color="#0D0F2E" />
        </View>
        <Text style={styles.webTitle}>Carte temporairement désactivée</Text>
        <Text style={styles.webSub}>
          La carte actuelle (react-native-maps) nécessite une clé API Google Maps sur Android. On passera à Mapbox au dernier sprint.
        </Text>
        <Text style={[styles.webSub, { marginTop: 10 }]}>
          Pour activer Google Maps : ajoute `GOOGLE_MAPS_API_KEY=...` dans `apps/mobile/android/local.properties`, puis relance `npx expo run:android`.
        </Text>
      </View>
    );
  }

  if (!RNMapsMod) return null;
  const { default: MapView, Marker } = RNMapsMod;

  return (
    <View style={styles.root} {...swipe.panHandlers}>
      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          mapType="hybrid"
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsBuildings
          showsUserLocation
          showsCompass={false}
          camera={{
            center: { latitude: 49.2583, longitude: 4.0317 },
            pitch: pitch3D ? 45 : 0,
            heading: 0,
            altitude: 1000,
            zoom: 14,
          }}
        >
          {mode === 'actors'
            ? MAP_ACTORS.map((a) => (
                <Marker
                  key={a.id}
                  coordinate={{ latitude: a.lat, longitude: a.lng }}
                  tracksViewChanges={false}
                >
                  {markerForActor(a)}
                </Marker>
              ))
            : null}
          {mode === 'events'
            ? MAP_EVENTS.map((e) => (
                <Marker
                  key={e.id}
                  coordinate={{ latitude: e.lat, longitude: e.lng }}
                  tracksViewChanges={false}
                >
                  {markerForEvent(e)}
                </Marker>
              ))
            : null}
          {mode === 'posts'
            ? MAP_POSTS.map((p) => (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.lat, longitude: p.lng }}
                  tracksViewChanges={false}
                >
                  {markerForPost(p)}
                </Marker>
              ))
            : null}
        </MapView>

        <Pressable
          onPress={handleGps}
          style={[styles.cityPill, { top: insets.top + 12 }]}
          hitSlop={10}
        >
          <Ionicons name="navigate" size={16} color="#0D0F2E" />
          <Text style={styles.cityTxt}>Reims</Text>
        </Pressable>

        <View style={[styles.mapTools, { top: insets.top + 12 }]}>
          <Pressable
            onPress={() => zoomBy(0.75)}
            style={({ pressed }) => [styles.toolBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="add" size={18} color="#0D0F2E" />
          </Pressable>
          <Pressable
            onPress={() => zoomBy(1.25)}
            style={({ pressed }) => [styles.toolBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="remove" size={18} color="#0D0F2E" />
          </Pressable>
          <Pressable
            onPress={togglePitch}
            style={({ pressed }) => [styles.toolBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="cube-outline" size={18} color="#0D0F2E" />
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.panel, { top: panelTop }]}>
        <View style={styles.panelInner}>
          <View style={styles.handleZone} {...handlePan.panHandlers}>
            <View style={styles.handleBar} />
          </View>

          <View style={styles.panelRow}>
            <ModePills value={mode} onChange={setMode} />
            <Pressable onPress={() => {}} hitSlop={10} style={styles.filterBtn}>
              <Ionicons name="options-outline" size={20} color="#0D0F2E" />
            </Pressable>
          </View>

          <Text style={styles.panelTitle}>{title}</Text>

          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(id) => id}
            renderItem={renderCard as any}
            horizontal={!isExpanded && items.length < 5}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={!isExpanded && items.length < 5 ? styles.hCards : styles.vList}
            ItemSeparatorComponent={() => (
              <View style={!isExpanded && items.length < 5 ? { width: 12 } : { height: 12 }} />
            )}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function ModePills({
  value,
  onChange,
}: {
  value: 'actors' | 'events' | 'posts';
  onChange: (v: 'actors' | 'events' | 'posts') => void;
}) {
  const items: Array<{ id: 'actors' | 'events' | 'posts'; label: string }> = [
    { id: 'actors', label: '🏪 Acteurs' },
    { id: 'events', label: '📅 Événements' },
    { id: 'posts', label: '📍 Posts' },
  ];
  return (
    <View style={styles.pillsRow}>
      {items.map((it) => {
        const active = it.id === value;
        return (
          <Pressable
            key={it.id}
            onPress={() => onChange(it.id)}
            style={({ pressed }) => [
              styles.pill,
              active && styles.pillActive,
              pressed && { opacity: 0.92 },
            ]}
          >
            <Text style={[styles.pillTxt, active && styles.pillTxtActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActorCard({
  actor,
  selected,
  onPress,
  onView,
}: {
  actor: MapActor;
  selected: boolean;
  onPress: () => void;
  onView: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.95 },
      ]}
    >
      <Image source={{ uri: actor.imageUrl }} style={styles.cardImg} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.openRow}>
          <View style={[styles.openDot, { backgroundColor: actor.isOpen ? '#16A34A' : '#9CA3AF' }]} />
          <Text style={styles.openLbl}>{actor.isOpen ? 'Ouvert' : 'Fermé'}</Text>
        </View>
        <Text style={styles.cardName} numberOfLines={1}>
          {actor.name}
        </Text>
        <View style={styles.catPill}>
          <Text style={styles.catTxt}>{actor.category}</Text>
        </View>
        <Text style={styles.metaTxt}>
          ⭐ {actor.rating.toFixed(1)} · {actor.reviews} avis
        </Text>
        <Pressable onPress={onView} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaTxt}>Voir →</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function EventCard({ ev, selected, onPress }: { ev: MapEvent; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && { opacity: 0.95 }]}
    >
      <Image source={{ uri: ev.imageUrl }} style={styles.cardImg} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={[styles.dateBadge, { backgroundColor: ev.color }]}>
          <Text style={styles.dateTxt}>{ev.date}</Text>
        </View>
        <Text style={styles.cardName} numberOfLines={1}>
          {ev.title}
        </Text>
        <Text style={styles.subTxt} numberOfLines={1}>
          {ev.organizer}
        </Text>
        <Text style={styles.metaTxt}>👥 {ev.attendees} participants</Text>
        <Pressable onPress={() => {}} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaTxt}>J'y vais</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function PostRow({ post, selected, onPress }: { post: MapPost; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.rowCard, selected && styles.cardSelectedRow, pressed && { opacity: 0.95 }]}
    >
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.rowImg} resizeMode="cover" />
      ) : (
        <View
          style={[
            styles.rowImg,
            {
              backgroundColor: 'rgba(42,47,255,0.10)',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Text style={{ fontFamily: Fonts.titleSemi.family, color: Colors.primary }}>{post.authorInitials}</Text>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {post.authorName}
        </Text>
        <Text style={styles.rowBody} numberOfLines={2}>
          {post.content}
        </Text>
        <Text style={styles.rowMeta}>
          ❤️ {post.likes} likes · il y a {post.time}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  mapArea: { flex: 1, backgroundColor: '#000' },
  webRoot: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 20, justifyContent: 'center' },
  webCard: { alignItems: 'center' },
  webIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  webTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: '#0D0F2E', marginBottom: 6 },
  webSub: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, textAlign: 'center', lineHeight: 18 },

  cityPill: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999,
    ...Shadows.card,
  },
  cityTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: '#0D0F2E' },

  mapTools: { position: 'absolute', right: 12, gap: 10 },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },

  markerWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },
  actorMarker: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  actorEmoji: { fontSize: 18 },
  pin: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF', ...Shadows.card },
  pinEmoji: { fontSize: 18 },
  attendeesBadge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, ...Shadows.card },
  attendeesTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: '#0D0F2E' },
  postMarker: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', ...Shadows.card },
  postAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  postAvatarTxt: { color: '#FFFFFF', fontFamily: Fonts.bodySemi.family, fontSize: 12 },
  markerActive: { shadowColor: '#2A2FFF', shadowOpacity: 0.35, shadowRadius: 12 },

  panel: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  panelInner: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 12, ...Shadows.card },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  handleBar: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },

  panelRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  panelTitle: { paddingHorizontal: 16, marginTop: 10, marginBottom: 10, fontFamily: Fonts.titleSemi.family, fontSize: 16, color: '#0D0F2E' },

  pillsRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 4, borderRadius: 999, flex: 1 },
  pill: { flex: 1, borderRadius: 999, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: '#2A2FFF' },
  pillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#6B7280' },
  pillTxtActive: { color: '#FFFFFF' },

  hCards: { paddingHorizontal: 16, paddingBottom: 24 },
  vList: { paddingHorizontal: 16, paddingBottom: 24 },

  card: { width: 180, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEF2FF', ...Shadows.card, overflow: 'hidden' },
  cardSelected: { borderColor: '#2A2FFF', borderWidth: 2, shadowColor: '#2A2FFF', shadowOpacity: 0.25 },
  cardImg: { width: '100%', height: 100, backgroundColor: '#F3F4F6' },
  cardBody: { padding: 12 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  openDot: { width: 8, height: 8, borderRadius: 4 },
  openLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#0D0F2E' },
  cardName: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: '#0D0F2E' },
  catPill: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#EEF2FF', borderRadius: Radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  catTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#2A2FFF' },
  metaTxt: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 12, color: '#6B7280' },
  cta: { marginTop: 10, backgroundColor: '#2A2FFF', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  ctaTxt: { color: '#FFFFFF', fontFamily: Fonts.bodySemi.family, fontSize: 13 },

  dateBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  dateTxt: { color: '#FFFFFF', fontFamily: Fonts.bodySemi.family, fontSize: 12 },
  subTxt: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: '#6B7280' },

  rowCard: { flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EEF2FF', padding: 12, ...Shadows.card },
  cardSelectedRow: { borderColor: '#2A2FFF', borderWidth: 2, shadowColor: '#2A2FFF', shadowOpacity: 0.2 },
  rowImg: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F3F4F6' },
  rowTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: '#0D0F2E' },
  rowBody: { marginTop: 3, fontFamily: Fonts.body.family, fontSize: 13, color: '#111827' },
  rowMeta: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 12, color: '#6B7280' },
});

