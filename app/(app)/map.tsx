import { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radii, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

type SheetPartner = {
  id: string;
  name: string;
  address: string;
  category: string;
  image: string | null;
  coordinates: [number, number];
};

const REIMS = { lat: 49.2583, lng: 4.0317 };

type MapActor = {
  id: string;
  profileType: string;
  displayName: string;
  coordinates: [number, number];
  city?: string;
  description?: string;
};

const MOCK_ACTORS: MapActor[] = [
  { id: 'm1', profileType: 'commercial', displayName: 'Belga Queen', coordinates: [49.255, 4.034], description: "Place d'Erlon, 51100 Reims" },
  { id: 'm2', profileType: 'commercial', displayName: 'Eat Night', coordinates: [49.262, 4.028], description: 'Rue Colbert, 51100 Reims' },
  { id: 'm3', profileType: 'commercial', displayName: 'Ao Barber', coordinates: [49.26, 4.038], description: 'Centre-ville, 51100 Reims' },
  { id: 'm4', profileType: 'commercial', displayName: 'Brunch & Co', coordinates: [49.257, 4.025], description: 'Halles, 51100 Reims' },
  { id: 'm5', profileType: 'commercial', displayName: 'Café Théâtre', coordinates: [49.259, 4.032], description: 'Place Forum, Reims' },
  { id: 'm6', profileType: 'commercial', displayName: 'Sport Plus', coordinates: [49.261, 4.035], description: 'Avenue Jean Jaurès' },
  { id: 'm7', profileType: 'commercial', displayName: 'Musée Live', coordinates: [49.256, 4.03], description: 'Rue de Tambour' },
  { id: 'm8', profileType: 'commercial', displayName: 'Zen Spa', coordinates: [49.258, 4.027], description: 'Boulevard Foch' },
];

function actorToSheetRow(a: MapActor): SheetPartner {
  const cat =
    a.profileType === 'commercial'
      ? 'Restaurant'
      : a.profileType === 'association'
        ? 'Culture'
        : 'Services';
  return {
    id: a.id,
    name: a.displayName,
    address: a.description?.trim() || 'Reims',
    category: cat,
    image: null,
    coordinates: a.coordinates,
  };
}

const CHIPS = ['Tous', 'Restaurant', 'Café', 'Bien-être', 'Sport', 'Culture'] as const;
type Chip = (typeof CHIPS)[number];

function matchesChip(row: SheetPartner, chip: Chip): boolean {
  if (chip === 'Tous') return true;
  const t = `${row.name} ${row.category}`.toLowerCase();
  if (chip === 'Restaurant') return t.includes('restaurant') || t.includes('belga') || t.includes('brunch');
  if (chip === 'Café') return t.includes('café') || t.includes('cafe');
  if (chip === 'Bien-être') return t.includes('bien') || t.includes('barber') || t.includes('spa') || t.includes('zen');
  if (chip === 'Sport') return t.includes('sport');
  if (chip === 'Culture') return t.includes('musée') || t.includes('culture') || t.includes('théâtre');
  return true;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { fabBottom } = tabBarFloatingLayout(insets.bottom);
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState<Chip>('Tous');
  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const region: Region = useMemo(
    () => ({
      latitude: REIMS.lat,
      longitude: REIMS.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    }),
    [],
  );

  const actorsQuery = useApi(async () => {
    const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}/map/actors`);
    url.searchParams.set('city', 'reims');
    url.searchParams.set('lat', String(REIMS.lat));
    url.searchParams.set('lng', String(REIMS.lng));
    url.searchParams.set('radius', '6000');
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('map');
    return (await res.json()) as { items: MapActor[] };
  }, []);

  const rawItems = useMemo(() => {
    if (actorsQuery.loading) return [];
    if (actorsQuery.error) return MOCK_ACTORS;
    const list = actorsQuery.data?.items ?? [];
    return list.length ? list : MOCK_ACTORS;
  }, [actorsQuery.data, actorsQuery.loading, actorsQuery.error]);

  const rows = useMemo(() => {
    const mapped = rawItems.map(actorToSheetRow);
    const byChip = mapped.filter((r) => matchesChip(r, chip));
    const q = search.trim().toLowerCase();
    if (!q) return byChip;
    return byChip.filter((r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q));
  }, [rawItems, chip, search]);

  async function handleGps() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion(
      {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      450,
    );
  }

  const renderSheetRow: ListRenderItem<SheetPartner> = useCallback(
    ({ item }) => (
      <View>
        <View style={styles.sheetRow}>
          <View style={styles.sheetImgPh}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.sheetImg} />
            ) : (
              <View style={[styles.sheetImg, { backgroundColor: 'rgba(42,47,255,0.12)', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="business-outline" size={28} color={Colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.sheetCol}>
            <Text style={styles.sheetName}>{item.name}</Text>
            <View style={styles.sheetAddr}>
              <Ionicons name="location-outline" size={13} color={Colors.gray} />
              <Text style={styles.sheetAddrTxt} numberOfLines={2}>
                {item.address}
              </Text>
            </View>
            <View style={styles.sheetPill}>
              <Text style={styles.sheetPillTxt}>{item.category}</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.sheetVoir, pressed && { opacity: 0.9 }]}>
            <Text style={styles.sheetVoirTxt}>Voir</Text>
          </Pressable>
        </View>
        <View style={styles.sep} />
      </View>
    ),
    [],
  );

  return (
    <View style={styles.root}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} mapType="standard">
        {rows.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.coordinates[0], longitude: r.coordinates[1] }}
            tracksViewChanges={false}
          >
            <View style={styles.markerOuter}>
              <View style={styles.markerInner}>
                <Ionicons name="location" size={20} color={Colors.white} />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.searchWrap, { top: insets.top + 8 }]}>
        <View style={styles.searchInner}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un lieu..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipsScroll, { top: insets.top + 8 + 52 + 10 }]}
        contentContainerStyle={styles.chipsContent}
      >
        {CHIPS.map((c) => {
          const active = chip === c;
          return (
            <Pressable
              key={c}
              onPress={() => setChip(c)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                active && Shadows.fab,
                active && { shadowOpacity: 0.3, shadowColor: Colors.primary },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={handleGps}
        style={({ pressed }) => [styles.gps, { bottom: fabBottom }, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="navigate" size={20} color={Colors.primary} />
        <Text style={styles.gpsTxt}> Reims</Text>
      </Pressable>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={['35%', '65%']}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>À proximité</Text>
          <Text style={styles.sheetSub}>
            {rows.length} partenaire{rows.length > 1 ? 's' : ''}
          </Text>
        </View>
        <BottomSheetFlatList
          data={rows}
          keyExtractor={(r) => r.id}
          renderItem={renderSheetRow}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  map: { ...StyleSheet.absoluteFillObject },
  searchWrap: { position: 'absolute', left: 16, right: 16, zIndex: 4 },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 28,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body.family, fontSize: 15, color: Colors.dark, paddingVertical: 0 },
  chipsScroll: { position: 'absolute', left: 0, right: 0, zIndex: 3 },
  chipsContent: { paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  chip: {
    marginRight: 10,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark },
  chipTxtActive: { color: Colors.white },
  markerOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.card,
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gps: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  gpsTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.primary },
  sheetBg: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: { backgroundColor: Colors.grayBorder, width: 40 },
  sheetHeader: { paddingHorizontal: 20, paddingBottom: 8 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark },
  sheetSub: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, gap: 12 },
  sheetImgPh: {},
  sheetImg: { width: 72, height: 72, borderRadius: 12 },
  sheetCol: { flex: 1, minWidth: 0 },
  sheetName: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },
  sheetAddr: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
  sheetAddrTxt: { flex: 1, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  sheetPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  sheetPillTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.primary },
  sheetVoir: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sheetVoirTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  sep: { height: 1, backgroundColor: Colors.grayLight, marginLeft: 20 },
});
