import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radii, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';

const YUNI_AI_LOGO = require('@/assets/images/yuni-ai.png');

/** Hauteurs relatives (maquette L → D : ~40% · 55% · 75% · 50% · 100% · 65% · 85%). */
const MOCK_CHART = [0.4, 0.55, 0.75, 0.5, 1, 0.65, 0.85];
const CHART_BAR_MAX = 100;
const CHART_PILL_W = 12;
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type OfferStatus = 'active' | 'planned' | 'expired';

type OfferItem = {
  id: string;
  title: string;
  desc: string;
  status: OfferStatus;
  views: number;
  expires: string;
  imageUrl: string;
};

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'o1',
    title: 'Happy Hour -30%',
    desc: 'Tous les vendredis 17h-19h',
    status: 'active',
    views: 234,
    expires: '15 mai 2026',
    imageUrl:
      'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=400',
  },
  {
    id: 'o2',
    title: 'Menu du jour 12€',
    desc: 'Entrée + plat + dessert',
    status: 'active',
    views: 567,
    expires: '31 déc 2026',
    imageUrl:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
  },
  {
    id: 'o3',
    title: 'Soirée Jazz vendredi',
    desc: 'Concert live + cocktail offert',
    status: 'planned',
    views: 89,
    expires: '10 mai 2026',
    imageUrl:
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=400',
  },
];

type MockClient = {
  id: string;
  name: string;
  stamps: number;
  lastVisit: string;
  avatarColor: string;
};

const MOCK_CLIENTS: MockClient[] = [
  { id: 'c1', name: 'Lucas Martin', stamps: 18, lastVisit: '3 j', avatarColor: '#2A2FFF' },
  { id: 'c2', name: 'Emma Bernard', stamps: 15, lastVisit: '1 j', avatarColor: '#16A34A' },
  { id: 'c3', name: 'Thomas Petit', stamps: 14, lastVisit: '5 j', avatarColor: '#D97706' },
  { id: 'c4', name: 'Léa Robert', stamps: 12, lastVisit: '2 j', avatarColor: '#7C3AED' },
  { id: 'c5', name: 'Hugo Dubois', stamps: 11, lastVisit: '7 j', avatarColor: '#0891B2' },
  { id: 'c6', name: 'Chloé Laurent', stamps: 10, lastVisit: '4 j', avatarColor: '#DC2626' },
  { id: 'c7', name: 'Nathan Simon', stamps: 9, lastVisit: '6 j', avatarColor: '#B45309' },
  { id: 'c8', name: 'Camille Michel', stamps: 8, lastVisit: '8 j', avatarColor: '#2563EB' },
  { id: 'c9', name: 'Julien Leroy', stamps: 7, lastVisit: '10 j', avatarColor: '#059669' },
  { id: 'c10', name: 'Manon Roux', stamps: 6, lastVisit: '12 j', avatarColor: '#9333EA' },
  { id: 'c11', name: 'Alexandre Girard', stamps: 5, lastVisit: '14 j', avatarColor: '#EA580C' },
  { id: 'c12', name: 'Sarah Blanc', stamps: 4, lastVisit: '20 j', avatarColor: '#4F46E5' },
].sort((a, b) => b.stamps - a.stamps);

type PartnerItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  initials: string;
  color: string;
};

const MOCK_PARTNERS: PartnerItem[] = [
  {
    id: 'c1',
    name: 'Boulangerie du Marché',
    category: 'Boulangerie',
    imageUrl:
      'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=200',
    initials: 'BM',
    color: '#B45309',
  },
  {
    id: 'a1',
    name: 'Jazz au Parvis',
    category: 'Association',
    imageUrl:
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=200',
    initials: 'JP',
    color: '#D97706',
  },
  {
    id: 'f3',
    name: 'Marie Design',
    category: 'Freelance',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=200',
    initials: 'MD',
    color: '#7C3AED',
  },
];

type EventRow = {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  attendees: number;
  imageUrl: string;
  isJoined: boolean;
};

/** Client affiché après scan (mock — en prod issu du QR / API). */
const MOCK_SCAN_CLIENT = {
  name: 'Léa Martin',
  id: 'u1',
  tampons: 8,
  memberSince: 'Mars 2026',
  visits: ['12 avr', '5 avr', '28 mars', '20 mars', '15 mars'],
};

type ScanClient = typeof MOCK_SCAN_CLIENT;

const YUNI_RECOMMENDATIONS = [
  { id: 'r1', kind: 'post' as const },
  { id: 'r2', kind: 'tribe' as const },
  { id: 'r3', kind: 'notify' as const },
];

const MOCK_EVENTS_INITIAL: EventRow[] = [
  {
    id: 'ev1',
    title: 'Tournée Jazz & Champagne',
    organizer: 'Tribu Event',
    date: 'Vendredi 9 mai · 19h',
    location: 'Bar Le Parvis',
    attendees: 34,
    imageUrl:
      'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=600',
    isJoined: false,
  },
  {
    id: 'ev2',
    title: 'Afterwork Entrepreneurs',
    organizer: 'Tribu Business',
    date: 'Mercredi 14 mai · 18h30',
    location: 'Cave des Sacres',
    attendees: 28,
    imageUrl:
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=600',
    isJoined: false,
  },
];

function initialsFromName(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'CO';
}

function formatVisitLabelNow() {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function alertTamponOk() {
  const msg = 'Tampon ajouté ✓';
  if (Platform.OS === 'web') {
    window.alert(msg);
  } else {
    Alert.alert(msg);
  }
}

/** Format attendu : `YUN-2026-[NOM]-[ID]` (nom sans espaces possible). */
function parsePassportQr(raw: string): Partial<Pick<ScanClient, 'name' | 'id'>> | null {
  const m = /^YUN-2026-(.+)-([^-\s]+)\s*$/i.exec(raw.trim());
  if (!m) return null;
  const name = m[1].replace(/_/g, ' ').trim();
  return { name: name || undefined, id: m[2] };
}

export function CommercialDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const user = useAuthStore((s) => s.user);

  const establishment =
    user?.profileData?.displayName ?? user?.name ?? user?.email?.split('@')[0] ?? 'Mon commerce';
  const initials = initialsFromName(establishment);

  const [loyaltyOn, setLoyaltyOn] = useState(true);
  const [eventMember] = useState(false);
  const [packActive] = useState(false);
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [events, setEvents] = useState<EventRow[]>(MOCK_EVENTS_INITIAL);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [partnershipPartner, setPartnershipPartner] = useState<PartnerItem | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanClient, setScanClient] = useState<ScanClient>(MOCK_SCAN_CLIENT);

  const offerSheetRef = useRef<BottomSheetModal>(null);
  const editOfferSheetRef = useRef<BottomSheetModal>(null);
  const clientsSheetRef = useRef<BottomSheetModal>(null);
  const editFideliteSheetRef = useRef<BottomSheetModal>(null);
  const packSheetRef = useRef<BottomSheetModal>(null);
  const partnershipSheetRef = useRef<BottomSheetModal>(null);
  const scanResultSheetRef = useRef<BottomSheetModal>(null);
  const yuniSheetRef = useRef<BottomSheetModal>(null);
  const scanHandledRef = useRef(false);
  const mainScrollRef = useRef<ScrollView>(null);
  const offersSectionY = useRef(0);

  const snapOffer = useMemo(() => ['85%'], []);
  const snap60 = useMemo(() => ['60%'], []);
  const snap75 = useMemo(() => ['75%'], []);
  /** Feuille résultat scan : assez haute pour les actions (tampon / historique). */
  const snapScanResult = useMemo(() => ['72%'], []);
  const snap50 = useMemo(() => ['50%'], []);

  const openNow = useMemo(() => {
    const h = new Date().getHours();
    return h >= 9 && h < 22;
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  const scrollOffersIntoView = useCallback(() => {
    const y = Math.max(0, offersSectionY.current - 24);
    mainScrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  const handlePublishOffer = useCallback(
    (newOffer: OfferItem) => {
      setOffers((prev) => [newOffer, ...prev]);
      offerSheetRef.current?.dismiss();
      requestAnimationFrame(() => scrollOffersIntoView());
    },
    [scrollOffersIntoView],
  );

  const handleUpdateOffer = useCallback((updated: OfferItem) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    editOfferSheetRef.current?.dismiss();
    setEditingOffer(null);
  }, []);

  const handleDeleteOffer = useCallback((id: string) => {
    Alert.alert('Supprimer cette offre ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => setOffers((prev) => prev.filter((o) => o.id !== id)),
      },
    ]);
  }, []);

  const handleShareOffer = useCallback(async (o: OfferItem) => {
    try {
      await Share.share({ message: `${o.title}\n\n${o.desc}`, title: o.title });
    } catch {
      /* ignore */
    }
  }, []);

  const finishScanSession = useCallback((payload: ScanClient) => {
    setScanClient(payload);
    setShowScanner(false);
    requestAnimationFrame(() => scanResultSheetRef.current?.present());
  }, []);

  const handleScanPress = useCallback(async () => {
    if (Platform.OS === 'web') {
      scanHandledRef.current = false;
      setShowScanner(true);
      return;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la caméra pour scanner les QR codes clients.",
      );
      return;
    }
    scanHandledRef.current = false;
    setShowScanner(true);
  }, []);

  const onBarcodeScanned = useCallback(
    (result: { data: string }) => {
      if (scanHandledRef.current) return;
      scanHandledRef.current = true;
      const parsed = parsePassportQr(result.data);
      finishScanSession({
        ...MOCK_SCAN_CLIENT,
        ...(parsed
          ? {
              name: parsed.name ?? MOCK_SCAN_CLIENT.name,
              id: parsed.id ?? MOCK_SCAN_CLIENT.id,
            }
          : {}),
      });
    },
    [finishScanSession],
  );

  const simulateScan = useCallback(() => {
    finishScanSession(MOCK_SCAN_CLIENT);
  }, [finishScanSession]);

  const openYuniThenCreateOffer = useCallback(() => {
    yuniSheetRef.current?.dismiss();
    requestAnimationFrame(() => offerSheetRef.current?.present());
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={mainScrollRef}
        style={styles.root}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#0D0F2E', '#0D0F2E']} style={styles.headerGrad}>
          <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <View style={styles.headerRow}>
              <View style={styles.headerCol}>
                <Text style={styles.hello}>Bonjour,</Text>
                <Text style={styles.bizName} numberOfLines={2}>
                  {establishment}
                </Text>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>Commerce de proximité</Text>
                </View>
                <Text style={styles.address}>📍 Place d&apos;Erlon, Reims</Text>
              </View>
              <View>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{initials}</Text>
                  <View style={styles.verifiedDot}>
                    <Text style={styles.verifiedCheck}>✓</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {openNow ? '🟢 Ouvert maintenant' : '🔴 Fermé'}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.sectionPad}>
          <Text style={styles.blockTitle}>Votre visibilité cette semaine</Text>
          <Text style={styles.trendUp}>↑ +23% vs semaine dernière</Text>

          <View style={styles.statGrid}>
            <StatCard label="👁️ Vues profil" value="1 247" trend="+18%" />
            <StatCard label="🖱️ Clics" value="89" trend="+34%" />
            <StatCard label="💬 Messages" value="12" trend="+5%" />
            <StatCard label="⭐ Note moyenne" value="4.8" sub="(67 avis)" />
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartRow}>
              {MOCK_CHART.map((ratio, i) => {
                const h = Math.max(6, Math.round(ratio * CHART_BAR_MAX));
                return (
                  <View key={i} style={styles.chartBarWrap}>
                    <View style={styles.chartBarTrack}>
                      <View style={[styles.chartBar, { height: h, width: CHART_PILL_W }]} />
                    </View>
                    <Text style={styles.chartLbl}>{DAY_LABELS[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.yuniAiCard}>
          <View style={styles.yuniAiRow}>
            <View style={styles.yuniAiIconCircle}>
              <Image source={YUNI_AI_LOGO} style={styles.yuniAiLogo} resizeMode="cover" />
            </View>
            <View style={styles.yuniAiTextCol}>
              <Text style={styles.yuniAiTitle}>Yuni AI</Text>
              <Text style={styles.yuniAiSub}>3 recommandations pour booster votre activité</Text>
            </View>
          </View>
          <Pressable style={styles.yuniAiCta} onPress={() => yuniSheetRef.current?.present()}>
            <Text style={styles.yuniAiCtaTxt}>Voir mes recommandations →</Text>
          </Pressable>
        </View>

        <View style={styles.sectionPad}>
          <View style={styles.rowBetween}>
            <Text style={styles.blockTitle}>Programme fidélité 🎁</Text>
            <Switch value={loyaltyOn} onValueChange={setLoyaltyOn} trackColor={{ true: Colors.primary }} />
          </View>

          <LinearGradient colors={['#0D0F2E', '#1C1F4A']} style={styles.loyaltyCard}>
            <Text style={styles.loyaltyMono}>CARTE DE FIDÉLITÉ YUNICITY</Text>
            <Text style={styles.loyaltyBiz}>{establishment}</Text>
            <View style={styles.stampGrid}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={i < 6 ? styles.stampOn : styles.stampOff}>
                  {i < 6 ? <Text style={styles.stampCheck}>✓</Text> : null}
                </View>
              ))}
            </View>
            <Text style={styles.rewardLbl}>Récompense au 10ème tampon :</Text>
            <Text style={styles.rewardVal}>1 verre offert 🍺</Text>
            <View style={styles.loyaltyBtnsWrap}>
              <View style={styles.loyaltyBtns}>
                <Pressable style={styles.btnGhost} onPress={() => clientsSheetRef.current?.present()}>
                  <Text style={styles.btnGhostTxt}>📊 Voir les clients</Text>
                </Pressable>
                <Pressable style={styles.btnPrimarySm} onPress={() => editFideliteSheetRef.current?.present()}>
                  <Text style={styles.btnPrimarySmTxt}>✏️ Modifier</Text>
                </Pressable>
              </View>
              <Pressable style={styles.btnScanner} onPress={() => void handleScanPress()}>
                <Text style={styles.btnScannerTxt}>📷 Scanner</Text>
              </Pressable>
            </View>
            <View style={styles.loyaltyStats}>
              <Text style={styles.loyaltyStatsTxt}>342 clients actifs · 89 tampons ce mois · 23 récompenses</Text>
            </View>
          </LinearGradient>
        </View>

        <View
          style={styles.sectionPad}
          onLayout={(e) => {
            offersSectionY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.blockTitle}>Mes offres 🏷️</Text>
            <Pressable style={styles.createOfferBtn} onPress={() => offerSheetRef.current?.present()}>
              <Text style={styles.createOfferTxt}>+ Créer</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScroll}>
            {offers.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                onEdit={() => {
                  setEditingOffer(o);
                  editOfferSheetRef.current?.present();
                }}
                onShare={() => void handleShareOffer(o)}
                onDelete={() => handleDeleteOffer(o.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.blockTitle}>Réseau Yunicity 🤝</Text>
          <Text style={styles.subMuted}>Connectez-vous avec d&apos;autres acteurs locaux</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnerScroll}>
            {MOCK_PARTNERS.map((p) => (
              <PartnerCard
                key={p.id}
                partner={p}
                onPropose={() => {
                  setPartnershipPartner(p);
                  partnershipSheetRef.current?.present();
                }}
              />
            ))}
          </ScrollView>
          <Pressable style={styles.exploreNetBtn} onPress={() => router.push('/(app)/(tabs)/tribus')}>
            <Text style={styles.exploreNetTxt}>Explorer le réseau →</Text>
          </Pressable>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.blockTitle}>Événements à venir 📅</Text>
          {!eventMember ? (
            <LinearGradient colors={['#D97706', '#92400E']} style={styles.eventCta}>
              <Text style={styles.eventCtaEmoji}>🥂</Text>
              <Text style={styles.eventCtaTitle}>Tribu Event — Tournées & Partenariats</Text>
              <Text style={styles.eventCtaSub}>Participez aux prochaines tournées Yunicity</Text>
              <Pressable style={styles.eventJoinBtn}>
                <Text style={styles.eventJoinTxt}>Rejoindre →</Text>
              </Pressable>
            </LinearGradient>
          ) : null}

          <View style={styles.eventsStack}>
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onToggle={() => {
                  setEvents((prev) =>
                    prev.map((e) => {
                      if (e.id !== ev.id) return e;
                      const next = !e.isJoined;
                      if (next) {
                        Alert.alert('', 'Vous êtes inscrit ! 🎉');
                      }
                      return { ...e, isJoined: next };
                    }),
                  );
                }}
              />
            ))}
          </View>
        </View>

        <View style={[styles.sectionPad, { paddingBottom: 8 }]}>
          {!packActive ? (
            <View style={styles.packCardSolid}>
              <Text style={styles.packMono}>⭐ PACK COMMERÇANTS</Text>
              <Text style={styles.packTitle}>Boostez votre visibilité locale</Text>
              {[
                'Mise en avant dans le feed',
                'Badge "Partenaire Yunicity"',
                'Accès Tribu Event',
                'Stats avancées',
                'Programme fidélité illimité',
              ].map((line) => (
                <Text key={line} style={styles.packFeat}>
                  ✓ {line}
                </Text>
              ))}
              <Text style={styles.packPrice}>20€/mois</Text>
              <Pressable style={styles.packCta} onPress={() => packSheetRef.current?.present()}>
                <Text style={styles.packCtaTxt}>Activer le Pack →</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.packActiveCard}>
              <Text style={styles.packActiveBadge}>✓ PACK ACTIF</Text>
              <Text style={styles.packActiveSub}>Renouvellement le 12 mai 2026</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
        onShow={() => {
          scanHandledRef.current = false;
        }}
        onRequestClose={() => setShowScanner(false)}
      >
        <ScannerModalBody
          onClose={() => setShowScanner(false)}
          onBarcodeScanned={onBarcodeScanned}
          onSimulate={simulateScan}
        />
      </Modal>

      <BottomSheetModal
        ref={scanResultSheetRef}
        snapPoints={snapScanResult}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <ScanResultSheet
          client={scanClient}
          onChangeClient={setScanClient}
          onClose={() => scanResultSheetRef.current?.dismiss()}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={yuniSheetRef}
        snapPoints={snap75}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <YuniAISheet
          onClose={() => yuniSheetRef.current?.dismiss()}
          onCreateOffer={openYuniThenCreateOffer}
          onJoinTribe={() => {
            yuniSheetRef.current?.dismiss();
            router.push('/(app)/(tabs)/tribus');
          }}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={offerSheetRef}
        snapPoints={snapOffer}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <CreateOfferForm
          onClose={() => offerSheetRef.current?.dismiss()}
          onPublish={handlePublishOffer}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={editOfferSheetRef}
        snapPoints={snapOffer}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        {editingOffer ? (
          <EditOfferForm
            offer={editingOffer}
            onClose={() => {
              editOfferSheetRef.current?.dismiss();
              setEditingOffer(null);
            }}
            onSave={handleUpdateOffer}
          />
        ) : null}
      </BottomSheetModal>

      <BottomSheetModal
        ref={clientsSheetRef}
        snapPoints={snap75}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <ClientsSheet clients={MOCK_CLIENTS} onClose={() => clientsSheetRef.current?.dismiss()} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={editFideliteSheetRef}
        snapPoints={snap60}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <EditFideliteSheet onClose={() => editFideliteSheetRef.current?.dismiss()} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={packSheetRef}
        snapPoints={snap60}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <PackSheet onClose={() => packSheetRef.current?.dismiss()} />
      </BottomSheetModal>

      <BottomSheetModal
        ref={partnershipSheetRef}
        snapPoints={snap75}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        {partnershipPartner ? (
          <PartnershipSheet
            partner={partnershipPartner}
            onClose={() => {
              partnershipSheetRef.current?.dismiss();
              setPartnershipPartner(null);
            }}
          />
        ) : null}
      </BottomSheetModal>
    </View>
  );
}

function StatCard({
  label,
  value,
  trend,
  sub,
}: {
  label: string;
  value: string;
  trend?: string;
  sub?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {trend ? <Text style={styles.statTrend}>↑ {trend}</Text> : null}
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function OfferCard({
  offer,
  onEdit,
  onShare,
  onDelete,
}: {
  offer: OfferItem;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const badge =
    offer.status === 'active' ? '🟢 Active' : offer.status === 'planned' ? '🟡 Planifiée' : '🔴 Expirée';
  const pct = Math.min(100, Math.round((offer.views / 600) * 100));
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerImageWrap}>
        <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} resizeMode="cover" />
        <View style={styles.offerBadgeOverlay}>
          <Text style={styles.offerBadgeOnImage}>{badge}</Text>
        </View>
      </View>
      <Text style={styles.offerTitle}>{offer.title}</Text>
      <Text style={styles.offerDesc} numberOfLines={2}>
        {offer.desc}
      </Text>
      <Text style={styles.offerMeta}>
        📅 Expire le {offer.expires} · 👁️ {offer.views} vues
      </Text>
      <View style={styles.offerProgTrack}>
        <View style={[styles.offerProgFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.offerActions}>
        <Pressable hitSlop={6} onPress={onEdit}>
          <Text style={styles.offerAct}>✏️ Modifier</Text>
        </Pressable>
        <Pressable hitSlop={6} onPress={onShare}>
          <Text style={styles.offerAct}>📤 Partager</Text>
        </Pressable>
        <Pressable hitSlop={6} onPress={onDelete}>
          <Text style={[styles.offerAct, { color: '#DC2626' }]}>🗑️ Supprimer</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CreateOfferForm({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (offer: OfferItem) => void;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [exp, setExp] = useState('');
  const [type, setType] = useState<'pct' | 'fix' | 'spec' | 'event'>('pct');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Accès photos nécessaire pour ajouter une image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
    }
  };

  return (
    <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
      <Text style={styles.sheetTitle}>Nouvelle offre</Text>
      <Text style={styles.sheetLbl}>Titre</Text>
      <TextInput style={styles.sheetInput} value={title} onChangeText={setTitle} placeholder="Ex. Happy Hour" />
      <Text style={styles.sheetLbl}>Description</Text>
      <TextInput
        style={[styles.sheetInput, styles.sheetArea]}
        value={desc}
        onChangeText={setDesc}
        placeholder="Détails de l'offre"
        multiline
      />
      <Text style={styles.sheetLbl}>Photo</Text>
      <Pressable style={styles.addPhotoBtn} onPress={() => void pickImage()}>
        <Text style={styles.addPhotoBtnTxt}>📸 Ajouter une photo</Text>
      </Pressable>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.offerPreview} resizeMode="cover" /> : null}
      <Text style={styles.sheetLbl}>Type</Text>
      <View style={styles.typeRow}>
        {(
          [
            ['pct', 'Réduction %'],
            ['fix', 'Prix fixe'],
            ['spec', 'Offre spéciale'],
            ['event', 'Événement'],
          ] as const
        ).map(([k, lab]) => (
          <Pressable
            key={k}
            style={[styles.typeChip, type === k && styles.typeChipOn]}
            onPress={() => setType(k)}
          >
            <Text style={[styles.typeChipTxt, type === k && styles.typeChipTxtOn]}>{lab}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sheetLbl}>Date d&apos;expiration</Text>
      <TextInput style={styles.sheetInput} value={exp} onChangeText={setExp} placeholder="JJ/MM/AAAA" />
      <Text style={styles.sheetLbl}>Visibilité</Text>
      <View style={styles.visRow}>
        {['Tous', 'Pass Premium', 'Tribu Event'].map((v) => (
          <Pressable key={v} style={styles.visChip}>
            <Text style={styles.visChipTxt}>{v}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={styles.publishBtn}
        onPress={() => {
          const id = Date.now().toString();
          const imageUrl =
            imageUri ??
            'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400';
          onPublish({
            id,
            title: title.trim() || 'Nouvelle offre',
            desc: desc.trim() || '—',
            status: 'active',
            views: 0,
            expires: exp.trim() || '—',
            imageUrl,
          });
        }}
      >
        <Text style={styles.publishBtnTxt}>Publier l&apos;offre 🚀</Text>
      </Pressable>
    </BottomSheetScrollView>
  );
}

function EditOfferForm({
  offer,
  onClose,
  onSave,
}: {
  offer: OfferItem;
  onClose: () => void;
  onSave: (o: OfferItem) => void;
}) {
  const [title, setTitle] = useState(offer.title);
  const [desc, setDesc] = useState(offer.desc);
  const [exp, setExp] = useState(offer.expires);
  const [type, setType] = useState<'pct' | 'fix' | 'spec' | 'event'>('pct');
  const [imageUri, setImageUri] = useState<string | null>(offer.imageUrl);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
    }
  };

  return (
    <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
      <Text style={styles.sheetTitle}>Modifier l&apos;offre</Text>
      <Text style={styles.sheetLbl}>Titre</Text>
      <TextInput style={styles.sheetInput} value={title} onChangeText={setTitle} />
      <Text style={styles.sheetLbl}>Description</Text>
      <TextInput
        style={[styles.sheetInput, styles.sheetArea]}
        value={desc}
        onChangeText={setDesc}
        multiline
      />
      <Text style={styles.sheetLbl}>Photo</Text>
      <Pressable style={styles.addPhotoBtn} onPress={() => void pickImage()}>
        <Text style={styles.addPhotoBtnTxt}>📸 Changer la photo</Text>
      </Pressable>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.offerPreview} resizeMode="cover" /> : null}
      <Text style={styles.sheetLbl}>Type</Text>
      <View style={styles.typeRow}>
        {(
          [
            ['pct', 'Réduction %'],
            ['fix', 'Prix fixe'],
            ['spec', 'Offre spéciale'],
            ['event', 'Événement'],
          ] as const
        ).map(([k, lab]) => (
          <Pressable
            key={k}
            style={[styles.typeChip, type === k && styles.typeChipOn]}
            onPress={() => setType(k)}
          >
            <Text style={[styles.typeChipTxt, type === k && styles.typeChipTxtOn]}>{lab}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sheetLbl}>Date d&apos;expiration</Text>
      <TextInput style={styles.sheetInput} value={exp} onChangeText={setExp} />
      <Text style={styles.sheetLbl}>Visibilité</Text>
      <View style={styles.visRow}>
        {['Tous', 'Pass Premium', 'Tribu Event'].map((v) => (
          <Pressable key={v} style={styles.visChip}>
            <Text style={styles.visChipTxt}>{v}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={styles.publishBtn}
        onPress={() =>
          onSave({
            ...offer,
            title: title.trim(),
            desc: desc.trim(),
            expires: exp.trim(),
            imageUrl: imageUri ?? offer.imageUrl,
          })
        }
      >
        <Text style={styles.publishBtnTxt}>Enregistrer</Text>
      </Pressable>
      <Pressable style={styles.sheetCloseGhost} onPress={onClose}>
        <Text style={styles.sheetCloseGhostTxt}>Annuler</Text>
      </Pressable>
    </BottomSheetScrollView>
  );
}

function ClientsSheet({ clients, onClose }: { clients: MockClient[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(t));
  }, [clients, q]);

  return (
    <View style={styles.clientsSheetRoot}>
      <Text style={styles.clientsHeader}>Mes clients fidèles</Text>
      <TextInput
        style={styles.clientsSearch}
        value={q}
        onChangeText={setQ}
        placeholder="Rechercher un client"
        placeholderTextColor={Colors.textMuted}
      />
      <BottomSheetFlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.clientsList}
        contentContainerStyle={styles.clientsListContent}
        renderItem={({ item }) => (
          <View style={styles.clientRow}>
            <View style={[styles.clientAvatar, { backgroundColor: item.avatarColor }]}>
              <Text style={styles.clientAvatarTxt}>{initialsFromName(item.name)}</Text>
            </View>
            <View style={styles.clientBody}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientMeta}>
                {item.stamps} tampons · Dernière visite il y a {item.lastVisit}
              </Text>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.sheetCloseGhost} onPress={onClose}>
        <Text style={styles.sheetCloseGhostTxt}>Fermer</Text>
      </Pressable>
    </View>
  );
}

function EditFideliteSheet({ onClose }: { onClose: () => void }) {
  const [stampsReward, setStampsReward] = useState(10);
  const [reward, setReward] = useState('1 verre offert 🍺');
  const [cardDesc, setCardDesc] = useState('Carte fidélité commerce de proximité');

  return (
    <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
      <Text style={styles.sheetTitle}>Modifier la fidélité</Text>
      <Text style={styles.sheetLbl}>Tampons pour récompense ({stampsReward})</Text>
      <View style={styles.stepperRow}>
        <Pressable
          style={styles.stepperBtn}
          onPress={() => setStampsReward((n) => Math.max(5, n - 1))}
        >
          <Text style={styles.stepperBtnTxt}>−</Text>
        </Pressable>
        <Text style={styles.stepperVal}>{stampsReward}</Text>
        <Pressable
          style={styles.stepperBtn}
          onPress={() => setStampsReward((n) => Math.min(20, n + 1))}
        >
          <Text style={styles.stepperBtnTxt}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.sheetLbl}>Récompense</Text>
      <TextInput style={styles.sheetInput} value={reward} onChangeText={setReward} />
      <Text style={styles.sheetLbl}>Description carte</Text>
      <TextInput
        style={[styles.sheetInput, styles.sheetArea]}
        value={cardDesc}
        onChangeText={setCardDesc}
        multiline
      />
      <Pressable
        style={styles.publishBtn}
        onPress={() => {
          Alert.alert('Modifié ✓');
          onClose();
        }}
      >
        <Text style={styles.publishBtnTxt}>Enregistrer</Text>
      </Pressable>
    </BottomSheetScrollView>
  );
}

function PartnerCard({
  partner,
  onPropose,
}: {
  partner: PartnerItem;
  onPropose: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={styles.partnerCard}>
      <View style={styles.partnerPhotoWrap}>
        {!failed ? (
          <Image
            source={{ uri: partner.imageUrl }}
            style={styles.partnerImg}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={[styles.partnerImgFallback, { backgroundColor: partner.color }]}>
            <Text style={styles.partnerImgFallbackTxt}>{partner.initials}</Text>
          </View>
        )}
      </View>
      <Text style={styles.partnerName}>{partner.name}</Text>
      <Text style={styles.partnerCat}>{partner.category}</Text>
      <Pressable onPress={onPropose}>
        <Text style={styles.partnerCta}>Proposer un partenariat →</Text>
      </Pressable>
    </View>
  );
}

function PartnershipSheet({
  partner,
  onClose,
}: {
  partner: PartnerItem;
  onClose: () => void;
}) {
  const [msg, setMsg] = useState('');
  return (
    <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
      <Text style={styles.partnershipHeader}>Proposer un partenariat</Text>
      <View style={styles.partnershipHero}>
        <View style={[styles.partnershipAvatar, { backgroundColor: partner.color }]}>
          <Text style={styles.partnershipAvatarTxt}>{partner.initials}</Text>
        </View>
        <Text style={styles.partnershipName}>{partner.name}</Text>
      </View>
      <Text style={styles.sheetLbl}>Votre message</Text>
      <TextInput
        style={[styles.sheetInput, styles.sheetArea]}
        value={msg}
        onChangeText={setMsg}
        placeholder="Bonjour, je souhaite explorer une collaboration..."
        placeholderTextColor={Colors.textMuted}
        multiline
      />
      <Pressable
        style={styles.partnershipSend}
        onPress={() => {
          Alert.alert('Proposition envoyée ! Vous recevrez une réponse sous 48h 🤝');
          onClose();
        }}
      >
        <Text style={styles.partnershipSendTxt}>Envoyer la proposition</Text>
      </Pressable>
    </BottomSheetScrollView>
  );
}

function EventCard({ event, onToggle }: { event: EventRow; onToggle: () => void }) {
  return (
    <View style={styles.eventCardFull}>
      <Image source={{ uri: event.imageUrl }} style={styles.eventFullImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.eventGradient}
        pointerEvents="none"
      />
      <View style={styles.eventOverlayContent}>
        <Text style={styles.eventFullTitle}>{event.title}</Text>
        <Text style={styles.eventFullRow}>
          📅 {event.date} · 📍 {event.location}
        </Text>
        <Text style={styles.eventFullAtt}>👥 {event.attendees} participants</Text>
        <Pressable
          style={[styles.eventCtaBtn, event.isJoined ? styles.eventCtaJoined : styles.eventCtaJoin]}
          onPress={onToggle}
        >
          <Text style={[styles.eventCtaBtnTxt, event.isJoined && styles.eventCtaBtnTxtJoined]}>
            {event.isJoined ? '✓ Inscrit' : 'Je participe →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PackSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheetScrollView contentContainerStyle={styles.packSheetContent}>
      <Text style={styles.packSheetTitle}>Pack Commerçants</Text>
      <Text style={styles.packSheetPrice}>20€ / mois</Text>
      <Text style={styles.packSheetSub}>Sans engagement · Résiliable à tout moment</Text>
      {[
        'Mise en avant dans le Feed Yunicity',
        'Badge "Partenaire Officiel"',
        'Accès Tribu Event (tournées exclusives)',
        'Statistiques avancées',
        'Programme fidélité illimité',
        'Support prioritaire',
      ].map((line) => (
        <Text key={line} style={styles.packSheetFeat}>
          ✓ {line}
        </Text>
      ))}
      <Pressable
        style={styles.packActivateBtn}
        onPress={() => {
          Alert.alert('Activation du Pack', 'Vous serez redirigé vers notre page de paiement sécurisé', [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Continuer',
              onPress: () =>
                Alert.alert('Bientôt disponible ! Nous vous contacterons.'),
            },
          ]);
        }}
      >
        <Text style={styles.packActivateBtnTxt}>Activer maintenant</Text>
      </Pressable>
      <Pressable onPress={onClose} style={styles.packDismiss}>
        <Text style={styles.packDismissTxt}>Fermer</Text>
      </Pressable>
    </BottomSheetScrollView>
  );
}

function PulseScanCorners() {
  const pulse = useRef(new Animated.Value(0.75)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.65, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const L = 28;
  const T = 3;
  const C = Colors.primary;
  return (
    <Animated.View style={[styles.scanFrameBox, { opacity: pulse }]} pointerEvents="none">
      <View style={[styles.scanCorner, { width: L, height: L, borderLeftWidth: T, borderTopWidth: T, borderColor: C, top: 0, left: 0 }]} />
      <View style={[styles.scanCorner, { width: L, height: L, borderRightWidth: T, borderTopWidth: T, borderColor: C, top: 0, right: 0 }]} />
      <View style={[styles.scanCorner, { width: L, height: L, borderLeftWidth: T, borderBottomWidth: T, borderColor: C, bottom: 0, left: 0 }]} />
      <View style={[styles.scanCorner, { width: L, height: L, borderRightWidth: T, borderBottomWidth: T, borderColor: C, bottom: 0, right: 0 }]} />
    </Animated.View>
  );
}

function ScannerModalBody({
  onClose,
  onBarcodeScanned,
  onSimulate,
}: {
  onClose: () => void;
  onBarcodeScanned: (result: { data: string }) => void;
  onSimulate: () => void;
}) {
  const isWeb = Platform.OS === 'web';
  return (
    <View style={styles.scannerRoot}>
      <SafeAreaView edges={['top']} style={styles.scannerTop}>
        <View style={styles.scannerTitleRow}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.scannerCloseBtn}>
            <Text style={styles.scannerCloseTxt}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.scannerTitle}>Scanner le QR Code client</Text>
        <Text style={styles.scannerSubtitle}>Pointez la caméra vers le QR du passeport client</Text>
      </SafeAreaView>
      <View style={styles.scannerCameraWrap}>
        {!isWeb ? (
          <CameraView
            style={styles.scannerCamera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcodeScanned}
          />
        ) : (
          <View style={styles.scannerWebFallback}>
            <Text style={styles.scannerWebHint}>Aperçu caméra non disponible sur le web</Text>
            <Pressable style={styles.scannerSimulateBtn} onPress={onSimulate}>
              <Text style={styles.scannerSimulateTxt}>Simuler un scan</Text>
            </Pressable>
          </View>
        )}
        {!isWeb ? (
          <View style={styles.scanOverlay} pointerEvents="none">
            <PulseScanCorners />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ScanResultSheet({
  client,
  onChangeClient,
  onClose,
}: {
  client: ScanClient;
  onChangeClient: (c: ScanClient) => void;
  onClose: () => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const rewardEligible = client.tampons > 0 && client.tampons % 10 === 0;
  return (
    <>
    <BottomSheetScrollView
      contentContainerStyle={styles.sheetContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.scanResultHeader}>Client identifié ✓</Text>
      <View style={styles.scanResultRow}>
        <View style={styles.scanResultAvatar}>
          <Text style={styles.scanResultAvatarTxt}>{initialsFromName(client.name)}</Text>
        </View>
        <View style={styles.scanResultBody}>
          <Text style={styles.scanResultName}>{client.name}</Text>
          <Text style={styles.scanResultMeta}>
            {client.tampons} tampons · Membre depuis {client.memberSince}
          </Text>
        </View>
      </View>
      <View style={styles.scanMiniStamps}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.scanMiniDot,
              i < Math.min(client.tampons, 5) ? styles.scanMiniDotOn : styles.scanMiniDotOff,
            ]}
          />
        ))}
      </View>
      {rewardEligible ? (
        <View style={styles.scanRewardCard}>
          <Text style={styles.scanRewardTxt}>🎁 Ce client a droit à sa récompense !</Text>
          <Pressable style={styles.scanRewardBtn}>
            <Text style={styles.scanRewardBtnTxt}>Valider la récompense</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.scanActionsRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.scanActionPrimary}
          onPress={() => {
            const visitLabel = formatVisitLabelNow();
            onChangeClient({
              ...client,
              tampons: client.tampons + 1,
              visits: [visitLabel, ...client.visits],
            });
            alertTamponOk();
          }}
        >
          <Text style={styles.scanActionPrimaryTxt}>+ Ajouter tampon</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.scanActionGhost}
          onPress={() => setHistoryOpen(true)}
        >
          <Text style={styles.scanActionGhostTxt}>Voir historique</Text>
        </TouchableOpacity>
      </View>
      <Pressable style={styles.sheetCloseGhost} onPress={onClose}>
        <Text style={styles.sheetCloseGhostTxt}>Fermer</Text>
      </Pressable>
    </BottomSheetScrollView>

    <Modal
      visible={historyOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setHistoryOpen(false)}
    >
      <View style={styles.historyModalRoot}>
        <Pressable
          style={styles.historyModalBackdrop}
          accessibilityRole="button"
          onPress={() => setHistoryOpen(false)}
        />
        <View style={styles.historyModalCard}>
          <Text style={styles.historyModalTitle}>Historique des visites</Text>
          <ScrollView
            style={styles.historyModalScroll}
            contentContainerStyle={styles.historyModalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {client.visits.length === 0 ? (
              <Text style={styles.historyEmpty}>Aucune visite enregistrée.</Text>
            ) : (
              client.visits.map((v, i) => (
                <View key={`${i}-${v}`} style={styles.historyVisitRow}>
                  <Text style={styles.historyVisitBullet}>•</Text>
                  <Text style={styles.historyVisitTxt}>{v}</Text>
                </View>
              ))
            )}
          </ScrollView>
          <Pressable style={styles.historyModalBtn} onPress={() => setHistoryOpen(false)}>
            <Text style={styles.historyModalBtnTxt}>Fermer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

function YuniAISheet({
  onClose,
  onCreateOffer,
  onJoinTribe,
}: {
  onClose: () => void;
  onCreateOffer: () => void;
  onJoinTribe: () => void;
}) {
  return (
    <View style={styles.yuniSheetRoot}>
      <FlatList
        data={YUNI_RECOMMENDATIONS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.yuniSheetHeader}>
            <View style={styles.yuniSheetIconBig}>
              <Image source={YUNI_AI_LOGO} style={styles.yuniSheetLogo} resizeMode="cover" />
            </View>
            <Text style={styles.yuniSheetHeadTitle}>Yuni AI</Text>
            <Text style={styles.yuniSheetHeadSub}>Recommandations personnalisées</Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === 'post') {
            return (
              <View style={styles.yuniRecCard}>
                <View style={[styles.yuniRecIconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={styles.yuniRecIcon}>📅</Text>
                </View>
                <Text style={styles.yuniRecTitle}>Publiez entre 17h et 19h</Text>
                <Text style={styles.yuniRecDesc}>
                  Vos clients sont les plus actifs le vendredi soir. Programmez votre prochaine offre
                  maintenant.
                </Text>
                <Pressable style={styles.yuniRecBtnPrimary} onPress={onCreateOffer}>
                  <Text style={styles.yuniRecBtnPrimaryTxt}>Créer une offre →</Text>
                </Pressable>
              </View>
            );
          }
          if (item.kind === 'tribe') {
            return (
              <View style={styles.yuniRecCard}>
                <View style={[styles.yuniRecIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={styles.yuniRecIcon}>🤝</Text>
                </View>
                <Text style={styles.yuniRecTitle}>Rejoignez la Tribu Foodies</Text>
                <Text style={styles.yuniRecDesc}>
                  156 membres potentiels dans votre secteur. Les commerçants actifs dans les tribus ont
                  +67% de vues.
                </Text>
                <Pressable style={styles.yuniRecBtnGreen} onPress={onJoinTribe}>
                  <Text style={styles.yuniRecBtnGreenTxt}>Rejoindre →</Text>
                </Pressable>
              </View>
            );
          }
          return (
            <View style={styles.yuniRecCard}>
              <View style={[styles.yuniRecIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.yuniRecIcon}>⭐</Text>
              </View>
              <Text style={styles.yuniRecTitle}>8 clients proches d&apos;une récompense</Text>
              <Text style={styles.yuniRecDesc}>
                Envoyez une notification push pour les inciter à revenir cette semaine.
              </Text>
              <Pressable
                style={styles.yuniRecBtnOrange}
                onPress={() =>
                  Alert.alert('Notifications push disponibles avec le Pack Commerçants')
                }
              >
                <Text style={styles.yuniRecBtnOrangeTxt}>Notifier →</Text>
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <Text style={styles.yuniFooter}>✨ Yuni AI analyse votre activité en temps réel</Text>
        }
        contentContainerStyle={styles.yuniListContent}
      />
      <Pressable style={styles.yuniDismiss} onPress={onClose}>
        <Text style={styles.sheetCloseGhostTxt}>Fermer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  headerGrad: { paddingBottom: 20 },
  headerSafe: { paddingHorizontal: 20, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerCol: { flex: 1 },
  hello: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  bizName: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white, marginTop: 4 },
  catPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(42,47,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catPillText: { fontFamily: Fonts.bodyMedium.family, fontSize: 12, color: '#7B9FFF' },
  address: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  verifiedDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D0F2E',
  },
  verifiedCheck: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillText: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.95)' },
  sectionPad: { paddingHorizontal: 20, marginTop: 22 },
  blockTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  trendUp: { fontFamily: Fonts.body.family, fontSize: 13, color: '#16A34A', marginTop: 6 },
  subMuted: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    ...Shadows.card,
  },
  statLabel: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  statValue: { fontFamily: Fonts.title.family, fontSize: 32, color: '#0D0F2E', marginTop: 6 },
  statTrend: { fontFamily: Fonts.body.family, fontSize: 12, color: '#16A34A', marginTop: 4 },
  statSub: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray, marginTop: 4 },
  chartCard: {
    marginTop: 18,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    ...Shadows.card,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
    minHeight: CHART_BAR_MAX + 28,
  },
  chartBarWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarTrack: {
    height: CHART_BAR_MAX,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: CHART_PILL_W + 4,
  },
  chartBar: {
    backgroundColor: '#2A2FFF',
    borderRadius: CHART_PILL_W / 2,
    minHeight: 6,
  },
  chartLbl: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.dark,
    marginTop: 10,
    fontWeight: '500',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  yuniAiCard: {
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 20,
    padding: 20,
    backgroundColor: Colors.primary,
  },
  yuniAiRow: { flexDirection: 'row', alignItems: 'center' },
  yuniAiIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  yuniAiLogo: { width: 48, height: 48, borderRadius: 24 },
  yuniAiTextCol: { flex: 1, marginLeft: 12 },
  yuniAiTitle: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  yuniAiSub: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  yuniAiCta: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  yuniAiCtaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  loyaltyCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 20,
  },
  loyaltyMono: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  loyaltyBiz: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.white, marginTop: 8 },
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  stampOn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCheck: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  stampOff: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  rewardLbl: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 16 },
  rewardVal: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white, marginTop: 4 },
  loyaltyBtnsWrap: { marginTop: 16, gap: 10 },
  loyaltyBtns: { flexDirection: 'row', gap: 10 },
  btnScanner: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnScannerTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  btnGhost: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnGhostTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  btnPrimarySm: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimarySmTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  loyaltyStats: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  loyaltyStatsTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  createOfferBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createOfferTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  offersScroll: { gap: 12, paddingVertical: 12, paddingRight: 20 },
  offerCard: {
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    ...Shadows.card,
  },
  offerImageWrap: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
  },
  offerImage: { width: '100%', height: 120 },
  offerBadgeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  offerBadgeOnImage: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.dark },
  offerTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },
  offerDesc: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6 },
  offerMeta: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.textMuted, marginTop: 8 },
  offerProgTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3F4F6',
    marginTop: 10,
    overflow: 'hidden',
  },
  offerProgFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  offerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  offerAct: { fontFamily: Fonts.bodyMedium.family, fontSize: 12, color: Colors.primary },
  offerPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#F3F4F6',
  },
  addPhotoBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },
  addPhotoBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  partnerScroll: { gap: 12, paddingVertical: 12 },
  partnerCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    ...Shadows.card,
  },
  partnerPhotoWrap: { alignItems: 'center' },
  partnerImg: { width: 60, height: 60, borderRadius: 30 },
  partnerImgFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerImgFallbackTxt: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  partnerName: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark, marginTop: 8 },
  partnerCat: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray, marginTop: 4 },
  partnerCta: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.primary, marginTop: 10 },
  exploreNetBtn: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  exploreNetTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  eventCta: { borderRadius: 16, padding: 18, marginTop: 12 },
  eventCtaEmoji: { fontSize: 28 },
  eventCtaTitle: { fontFamily: Fonts.title.family, fontSize: 17, color: Colors.white, marginTop: 8 },
  eventCtaSub: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  eventJoinBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  eventJoinTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: '#92400E' },
  eventsStack: { gap: 14, marginTop: 14 },
  eventCardFull: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  eventFullImage: { ...StyleSheet.absoluteFillObject },
  eventGradient: { ...StyleSheet.absoluteFillObject },
  eventOverlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
  },
  eventFullTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.white },
  eventFullRow: { fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  eventFullAtt: { fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  eventCtaBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  eventCtaJoin: { backgroundColor: Colors.primary },
  eventCtaJoined: { backgroundColor: 'rgba(255,255,255,0.2)' },
  eventCtaBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  eventCtaBtnTxtJoined: { color: Colors.white },
  packCardSolid: {
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
    backgroundColor: '#2A2FFF',
  },
  packMono: { fontFamily: Fonts.mono.family, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  packTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white, marginTop: 8 },
  packFeat: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.95)', marginTop: 8 },
  packPrice: { fontFamily: Fonts.title.family, fontSize: 28, color: Colors.white, marginTop: 16 },
  packCta: {
    marginTop: 16,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  packCtaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.primary },
  packActiveCard: {
    backgroundColor: '#0D0F2E',
    borderRadius: 20,
    padding: 20,
  },
  packActiveBadge: { fontFamily: Fonts.title.family, fontSize: 16, color: '#16A34A' },
  packActiveSub: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  sheetBg: { backgroundColor: Colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetHandle: { backgroundColor: 'rgba(13,15,46,0.2)', width: 40 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 32 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark, marginBottom: 16 },
  sheetLbl: { fontFamily: Fonts.bodyMedium.family, fontSize: 13, color: Colors.gray, marginTop: 12 },
  sheetInput: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
  },
  sheetArea: { minHeight: 88, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  typeChipOn: { backgroundColor: '#EEF2FF', borderColor: Colors.primary },
  typeChipTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  typeChipTxtOn: { color: Colors.primary, fontFamily: Fonts.bodySemi.family },
  visRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  visChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  visChipTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.dark },
  publishBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  publishBtnTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
  clientsSheetRoot: { flex: 1, paddingHorizontal: 20, paddingBottom: 16 },
  clientsHeader: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 12 },
  clientsSearch: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    padding: 12,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 12,
  },
  clientsList: { flexGrow: 0 },
  clientsListContent: { paddingBottom: 12, gap: 0 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  clientBody: { flex: 1 },
  clientName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  clientMeta: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray, marginTop: 4 },
  sheetCloseGhost: { paddingVertical: 12, alignItems: 'center' },
  sheetCloseGhostTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.primary },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnTxt: { fontSize: 22, color: Colors.dark, fontFamily: Fonts.title.family },
  stepperVal: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.dark, minWidth: 36, textAlign: 'center' },
  partnershipHeader: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 16 },
  partnershipHero: { alignItems: 'center', marginBottom: 16 },
  partnershipAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnershipAvatarTxt: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.white },
  partnershipName: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark, marginTop: 8 },
  partnershipSend: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  partnershipSendTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 16, color: Colors.white },
  packSheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  packSheetTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark, textAlign: 'center' },
  packSheetPrice: {
    fontFamily: Fonts.title.family,
    fontSize: 36,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  packSheetSub: {
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  packSheetFeat: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, marginTop: 10 },
  packActivateBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packActivateBtnTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
  packDismiss: { marginTop: 16, alignItems: 'center', padding: 8 },
  packDismissTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  scannerRoot: { flex: 1, backgroundColor: '#000' },
  scannerTop: { paddingHorizontal: 16, paddingBottom: 12 },
  scannerTitleRow: { alignItems: 'flex-end' },
  scannerCloseBtn: { alignSelf: 'flex-end', padding: 8 },
  scannerCloseTxt: { fontSize: 22, color: Colors.white },
  scannerTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 4,
  },
  scannerSubtitle: {
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  scannerCameraWrap: { flex: 1, backgroundColor: '#000' },
  scannerCamera: { flex: 1 },
  scannerWebFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scannerWebHint: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  scannerSimulateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  scannerSimulateTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrameBox: {
    width: 220,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorner: { position: 'absolute' },
  scanResultHeader: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 16 },
  scanResultRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scanResultAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanResultAvatarTxt: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.white },
  scanResultBody: { flex: 1 },
  scanResultName: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  scanResultMeta: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 4 },
  scanMiniStamps: { flexDirection: 'row', gap: 8, marginTop: 16 },
  scanMiniDot: { width: 22, height: 22, borderRadius: 11 },
  scanMiniDotOn: { backgroundColor: Colors.primary },
  scanMiniDotOff: { backgroundColor: '#F3F4F6' },
  scanRewardCard: {
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
  },
  scanRewardTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  scanRewardBtn: {
    marginTop: 10,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanRewardBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  scanActionsRow: { flexDirection: 'row', gap: 10, marginTop: 18, flexWrap: 'wrap' },
  scanActionPrimary: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanActionPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  scanActionGhost: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanActionGhostTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  historyModalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  historyModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  historyModalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: 20,
    maxHeight: '72%',
    zIndex: 1,
    ...Shadows.card,
  },
  historyModalTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
    marginBottom: 14,
  },
  historyModalScroll: { maxHeight: 320 },
  historyModalScrollContent: { paddingBottom: 8 },
  historyEmpty: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  historyVisitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  historyVisitBullet: { fontFamily: Fonts.body.family, fontSize: 16, color: Colors.primary, lineHeight: 22 },
  historyVisitTxt: { flex: 1, fontFamily: Fonts.body.family, fontSize: 15, color: Colors.textBody, lineHeight: 22 },
  historyModalBtn: {
    marginTop: 16,
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  historyModalBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  yuniSheetRoot: { flex: 1, paddingBottom: 8 },
  yuniListContent: { paddingHorizontal: 20, paddingBottom: 24 },
  yuniSheetHeader: { alignItems: 'center', marginBottom: 20 },
  yuniSheetIconBig: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: Colors.grayLight,
  },
  yuniSheetLogo: { width: 52, height: 52, borderRadius: 26 },
  yuniSheetHeadTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark, marginTop: 10 },
  yuniSheetHeadSub: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 4 },
  yuniRecCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  yuniRecIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  yuniRecIcon: { fontSize: 22 },
  yuniRecTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  yuniRecDesc: {
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    marginTop: 8,
    lineHeight: 18,
  },
  yuniRecBtnPrimary: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  yuniRecBtnPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  yuniRecBtnGreen: {
    marginTop: 12,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  yuniRecBtnGreenTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  yuniRecBtnOrange: {
    marginTop: 12,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  yuniRecBtnOrangeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  yuniFooter: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  yuniDismiss: { alignItems: 'center', paddingVertical: 8 },
});
