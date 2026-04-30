import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Linking, Pressable, Share, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAP_ACTORS } from '@/constants/mockMapData';
import { Colors, Fonts, Radii, Shadows, tabBarFloatingLayout } from '@/constants/theme';

function openMaps(lat: number, lng: number, label: string) {
  const url = `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label)}`;
  Linking.openURL(url);
}

export default function ActorDetailScreen() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const params = useLocalSearchParams<{ id?: string }>();
  const actor = useMemo(() => MAP_ACTORS.find((a) => a.id === params.id), [params.id]);

  if (!actor) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: Colors.primary, fontFamily: Fonts.bodySemi.family }}>← Retour</Text>
        </Pressable>
        <Text style={{ fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark }}>
          Acteur introuvable
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.dark} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {actor.name}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom + 16 }}
      >
        <View style={styles.heroWrap}>
          <Image source={{ uri: actor.imageUrl }} style={styles.heroImg} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeTxt}>{actor.category}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{actor.name}</Text>
          <View style={styles.addrRow}>
            <Ionicons name="location-outline" size={16} color={Colors.gray} />
            <Text style={styles.addrTxt}>{actor.address}</Text>
            <View style={styles.distancePill}>
              <Text style={styles.distanceTxt}>≈ 1,2 km</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.rating}>
              ⭐ {actor.rating.toFixed(1)}{' '}
              <Text style={styles.reviews}>({actor.reviews} avis)</Text>
            </Text>
            <View style={styles.openRow}>
              <View style={[styles.dot, { backgroundColor: actor.isOpen ? '#16A34A' : '#9CA3AF' }]} />
              <Text style={styles.openTxt}>{actor.isOpen ? 'Ouvert' : 'Fermé'}</Text>
              <Text style={styles.hours}>· 9h–19h</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => openMaps(actor.lat, actor.lng, actor.name)}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="map-outline" size={18} color={Colors.white} />
              <Text style={styles.actionTxt}>Itinéraire</Text>
            </Pressable>
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [styles.actionBtnGhost, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionTxtGhost}>Contacter</Text>
            </Pressable>
            <Pressable
              onPress={() => Share.share({ message: `${actor.name} · ${actor.address}` })}
              style={({ pressed }) => [styles.actionBtnGhost, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionTxtGhost}>Partager</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Posts récents</Text>
          <View style={styles.miniRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={String(i)} style={styles.miniCard}>
                <View style={[styles.miniImg, { backgroundColor: 'rgba(42,47,255,0.12)' }]} />
                <Text style={styles.miniTxt} numberOfLines={2}>
                  Un post récent de {actor.name}…
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Événements à venir</Text>
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>🎉 Événement spécial</Text>
            <Text style={styles.eventSub}>Cette semaine · 18h</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },

  heroWrap: { height: 220, backgroundColor: Colors.grayLight },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)' },
  heroBadge: {
    position: 'absolute',
    left: 16,
    bottom: -14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    ...Shadows.card,
  },
  heroBadgeTxt: { color: Colors.white, fontFamily: Fonts.bodySemi.family, fontSize: 12 },

  content: { paddingTop: 24, paddingHorizontal: 16 },
  name: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.dark },
  addrRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  addrTxt: { color: Colors.gray, fontFamily: Fonts.body.family, fontSize: 14 },
  distancePill: {
    marginLeft: 6,
    backgroundColor: 'rgba(42,47,255,0.10)',
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  distanceTxt: { color: Colors.primary, fontFamily: Fonts.bodySemi.family, fontSize: 12 },

  metaRow: { marginTop: 12, gap: 8 },
  rating: { color: Colors.dark, fontFamily: Fonts.bodySemi.family, fontSize: 14 },
  reviews: { color: Colors.gray, fontFamily: Fonts.body.family, fontSize: 14 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  openTxt: { color: Colors.dark, fontFamily: Fonts.bodySemi.family, fontSize: 13 },
  hours: { color: Colors.gray, fontFamily: Fonts.body.family, fontSize: 13 },

  actionsRow: { marginTop: 16, flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionTxt: { color: Colors.white, fontFamily: Fonts.bodySemi.family, fontSize: 14 },
  actionBtnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionTxtGhost: { color: Colors.primary, fontFamily: Fonts.bodySemi.family, fontSize: 14 },

  sectionTitle: { marginTop: 22, marginBottom: 10, fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },
  miniRow: { flexDirection: 'row', gap: 10 },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    padding: 10,
    ...Shadows.card,
  },
  miniImg: { height: 60, borderRadius: 12, marginBottom: 8 },
  miniTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.dark },

  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    padding: 14,
    ...Shadows.card,
  },
  eventTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  eventSub: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
});

