import { useCallback, useMemo, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '@/components/PostCard';
import type { ProfileViewModel } from '@/components/profile/profileUtils';
import {
  getCommercialBusinessMock,
  MOCK_COMMERCIAL_PROFILE,
  type CommercialBusinessMock,
  type CommercialEvent,
  type CommercialOffer,
  type CommercialReview,
} from '@/constants/mockCommercialProfile';
import type { FeedPost } from '@/constants/mockPosts';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';

type Props = {
  profile: ProfileViewModel;
  isOwner: boolean;
  topInset: number;
  posts: FeedPost[];
  subscribed: boolean;
  onToggleSubscribe: () => void;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onContact: () => void;
  onOpenPass: () => void;
  onOpenSettings: () => void;
  onBack?: () => void;
  onMore?: () => void;
};

type MiniTab = 'photos' | 'offers' | 'reviews' | 'events' | 'posts';

const MINI_TABS: { id: MiniTab; label: string }[] = [
  { id: 'photos', label: '📸 Photos' },
  { id: 'offers', label: '🏷️ Offres' },
  { id: 'reviews', label: '⭐ Avis' },
  { id: 'events', label: '📅 Événements' },
  { id: 'posts', label: '📝 Posts' },
];

const REVIEW_DIST_PCT = [78, 15, 5, 1, 1];

function parseHm(s: string): number {
  const m = /^(\d{1,2})h(?:(\d{2}))?$/i.exec(s.trim());
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  return h * 60 + min;
}

function isOpenForDay(hoursStr: string, minutesNow: number): boolean {
  if (hoursStr.includes('Fermé')) return false;
  const chunks = hoursStr.split('·').map((c) => c.trim());
  for (const ch of chunks) {
    const parts = ch.split('-').map((x) => x.trim());
    if (parts.length < 2) continue;
    const start = parseHm(parts[0] ?? '');
    const end = parseHm(parts[1] ?? '');
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (minutesNow >= start && minutesNow <= end) return true;
  }
  return false;
}

function eveningClose(hoursStr: string): string {
  const parts = hoursStr.split('·').map((s) => s.trim());
  const lastSlot = parts[parts.length - 1] ?? '';
  const seg = lastSlot.split('-').map((s) => s.trim());
  return seg[seg.length - 1] ?? '22h30';
}

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function todayFr() {
  return DAYS_FR[new Date().getDay()] ?? 'Lundi';
}

function openStatus(horaires: CommercialBusinessMock['horaires']): { open: boolean; label: string } {
  const todayName = todayFr();
  const row = horaires.find((h) => h.day === todayName);
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (!row || row.hours.includes('Fermé')) {
    return { open: false, label: 'Fermé · Ouvre lundi à 12h' };
  }

  const openNow = isOpenForDay(row.hours, minutes);
  const closeLabel = eveningClose(row.hours);
  if (openNow) {
    return { open: true, label: `Ouvert · Ferme à ${closeLabel}` };
  }
  return { open: false, label: `Fermé · Ouvre ${row.hours.split('·')[0]?.trim() ?? 'prochainement'}` };
}

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return `tel:${digits}`;
}

function GlassIconButton({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress?: () => void;
}) {
  const fill =
    Platform.OS === 'web' ? (
      <View style={[styles.glassFill, { backgroundColor: 'rgba(255,255,255,0.32)' }]}>{children}</View>
    ) : (
      <BlurView intensity={55} tint="light" style={styles.glassFill}>
        {children}
      </BlurView>
    );
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.glassOuter}
      delayPressIn={0}
    >
      {fill}
    </TouchableOpacity>
  );
}

export function CommercialProfile({
  profile,
  isOwner,
  topInset,
  posts,
  subscribed: _subscribed,
  onToggleSubscribe: _onToggleSubscribe,
  onEditProfile: _onEditProfile,
  onShareProfile: _onShareProfile,
  onContact,
  onOpenPass: _onOpenPass,
  onOpenSettings,
  onBack,
  onMore: _onMore,
}: Props) {
  void _subscribed;
  void _onToggleSubscribe;
  void _onEditProfile;
  void _onOpenPass;
  void _onShareProfile;
  void _onMore;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const width = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const addressLine = profile.location.replace(/^📍\s*/, '');
  const biz = useMemo(
    () =>
      getCommercialBusinessMock({
        id: profile.id,
        displayName: profile.displayName,
        category: profile.headline,
        addressLine,
      }),
    [addressLine, profile.displayName, profile.headline, profile.id],
  );

  const [tab, setTab] = useState<MiniTab>('photos');
  const [photos, setPhotos] = useState<string[]>(() =>
    profile.id === MOCK_COMMERCIAL_PROFILE.id ? [...MOCK_COMMERCIAL_PROFILE.photos] : [...biz.photos],
  );
  const [offers] = useState<CommercialOffer[]>(biz.offers);
  const [reviews, setReviews] = useState<CommercialReview[]>(biz.reviews);
  const [events, setEvents] = useState<CommercialEvent[]>(biz.events);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [helpful, setHelpful] = useState<Record<string, number>>({});
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const contactSheetRef = useRef<BottomSheetModal>(null);
  const horairesSheetRef = useRef<BottomSheetModal>(null);
  const reviewSheetRef = useRef<BottomSheetModal>(null);
  const [contactMsg, setContactMsg] = useState('');

  const snap55 = useMemo(() => ['55%'], []);
  const snap60 = useMemo(() => ['60%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const status = useMemo(() => openStatus(biz.horaires), [biz.horaires]);

  const establishmentPosts = useMemo(
    () => posts.filter((p) => p.authorId === profile.id),
    [posts, profile.id],
  );

  const gridMetrics = useMemo(() => {
    const pad = 16;
    const gap = 2;
    const inner = width - pad * 2;
    const cell = (inner - gap * 2) / 3;
    const bigW = cell * 2 + gap;
    const bigH = cell * 2 + gap;
    const smallH = (bigH - gap) / 2;
    return { pad, gap, cell, bigW, bigH, smallH };
  }, [width]);

  const openGallery = useCallback((index: number) => {
    if (!photos.length) return;
    setGalleryIndex(index);
    setShowGallery(true);
  }, [photos.length]);

  const handleItineraire = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        'yunicity_map_target',
        JSON.stringify({
          name: biz.name,
          address: biz.address,
          lat: 49.2583,
          lng: 4.0317,
        }),
      );
    } catch {
      /* ignore */
    }
    router.push('/(app)/(tabs)/map');
  }, [biz.address, biz.name, router]);

  const handleShareHero = useCallback(async () => {
    const message =
      `Découvrez ${biz.name} sur Yunicity !\n` +
      `${biz.category} · ${biz.address}\n` +
      `⭐ ${biz.rating}/5 · ${biz.reviewCount} avis`;
    try {
      await Share.share({ message, title: biz.name });
    } catch {
      Alert.alert('Partager', message);
    }
  }, [biz.address, biz.category, biz.name, biz.rating, biz.reviewCount]);

  const handleMenu = useCallback(() => {
    const shareShort = () => {
      void (async () => {
        try {
          await Share.share({ message: `${biz.name} · ${biz.address}` });
        } catch {
          Alert.alert('Partager', `${biz.name} · ${biz.address}`);
        }
      })();
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Partager', 'Signaler', "Copier l'adresse"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (index) => {
          if (index === 1) shareShort();
          if (index === 2) {
            Alert.alert('Signalement', 'Merci, nous allons examiner ce profil.');
          }
          if (index === 3) {
            Alert.alert('Adresse copiée', biz.address);
          }
        },
      );
    } else {
      Alert.alert(
        'Options',
        'Que souhaitez-vous faire ?',
        [
          {
            text: 'Partager',
            onPress: shareShort,
          },
          {
            text: 'Signaler',
            onPress: () =>
              Alert.alert('Signalement', 'Merci, nous allons examiner ce profil.'),
          },
          {
            text: "Copier l'adresse",
            onPress: () => Alert.alert('Adresse copiée', biz.address),
          },
          { text: 'Annuler', style: 'cancel' },
        ],
      );
    }
  }, [biz.address, biz.name]);

  const pickPhotos = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Autorise l’accès à la photothèque pour ajouter des images.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (res.canceled || !res.assets?.length) return;
    const urls = res.assets.map((a) => a.uri).filter(Boolean) as string[];
    setPhotos((prev) => [...urls, ...prev]);
    Alert.alert('Photos', `${urls.length} photo(s) ajoutée(s) (aperçu local).`);
  }, []);

  const publishReview = useCallback(() => {
    const text = reviewText.trim();
    if (!text) {
      Alert.alert('Avis', 'Écris un court commentaire.');
      return;
    }
    const nr: CommercialReview = {
      id: `r-${Date.now()}`,
      author: 'Vous',
      rating: reviewStars,
      date: 'À l’instant',
      comment: text,
      avatar: 'VO',
      color: Colors.primary,
    };
    setReviews((prev) => [nr, ...prev]);
    setReviewText('');
    reviewSheetRef.current?.dismiss();
    Alert.alert('Merci !', 'Votre avis a été publié (mock).');
  }, [reviewStars, reviewText]);

  const heroBottomPad = 16;

  return (
    <View style={styles.root}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        <View>
          <View style={styles.heroWrap}>
            <Image source={{ uri: biz.coverUrl }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} pointerEvents="none" />

            <View style={[styles.heroTopRow, { top: topInset + 12 }]}>
              {isOwner ? (
                <GlassIconButton onPress={onOpenSettings}>
                  <Ionicons name="settings-outline" size={20} color={Colors.dark} />
                </GlassIconButton>
              ) : (
                <GlassIconButton onPress={onBack}>
                  <Ionicons name="chevron-back" size={22} color={Colors.dark} />
                </GlassIconButton>
              )}
              <View style={styles.heroTopRight}>
                <GlassIconButton onPress={handleMenu}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={Colors.dark} />
                </GlassIconButton>
                <GlassIconButton onPress={handleShareHero}>
                  <Ionicons name="share-outline" size={20} color={Colors.dark} />
                </GlassIconButton>
              </View>
            </View>

            <View style={[styles.heroBottom, { paddingBottom: heroBottomPad }]}>
              <View style={styles.catPill}>
                <Text style={styles.catPillTxt}>🍽️ {biz.category}</Text>
              </View>
              <Text style={styles.heroName}>{biz.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#FBBF24" />
                <Text style={styles.ratingVal}>{biz.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({biz.reviewCount} avis)</Text>
              </View>
              <Text style={styles.heroAddr}>
                📍 {biz.address} · {biz.distanceKm} km
              </Text>
            </View>
          </View>

          <View style={styles.quickBar}>
            <QuickAction
              icon="call-outline"
              label="Appeler"
              onPress={() => void Linking.openURL(telHref(biz.phone))}
            />
            <QuickAction icon="map-outline" label="Itinéraire" onPress={() => void handleItineraire()} />
            <QuickAction icon="chatbubble-outline" label="Contacter" onPress={() => contactSheetRef.current?.present()} />
            <QuickAction icon="star-outline" label="Donner avis" onPress={() => reviewSheetRef.current?.present()} />
          </View>

          <Pressable
            onPress={() => horairesSheetRef.current?.present()}
            style={styles.statusCard}
          >
            <View style={[styles.statusDot, { backgroundColor: status.open ? '#16A34A' : '#DC2626' }]} />
            <Text style={styles.statusTxt} numberOfLines={2}>
              {status.label}
            </Text>
            <Text style={styles.statusLink}>Voir les horaires ›</Text>
          </Pressable>
        </View>

        <View style={styles.tabsSticky}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {MINI_TABS.map((t) => (
              <Pressable key={t.id} onPress={() => setTab(t.id)} style={styles.tabBtn}>
                <Text style={[styles.tabLabel, tab === t.id ? styles.tabLabelOn : styles.tabLabelOff]}>{t.label}</Text>
                {tab === t.id ? <View style={styles.tabUnderline} /> : <View style={styles.tabUnderlineSpacer} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.tabBody}>
          {tab === 'photos' ? (
            <PhotosTab
              photos={photos}
              metrics={gridMetrics}
              isOwner={isOwner}
              onOpen={openGallery}
              onAdd={pickPhotos}
            />
          ) : null}
          {tab === 'offers' ? <OffersTab offers={offers} businessName={biz.name} /> : null}
          {tab === 'reviews' ? (
            <ReviewsTab
              biz={biz}
              reviews={reviews}
              helpful={helpful}
              onHelpful={(id) =>
                setHelpful((h) => ({ ...h, [id]: (h[id] ?? 0) + 1 }))
              }
              onWrite={() => reviewSheetRef.current?.present()}
            />
          ) : null}
          {tab === 'events' ? (
            <EventsTab events={events} joined={joined} setJoined={setJoined} />
          ) : null}
          {tab === 'posts' ? (
            <PostsTab posts={establishmentPosts} />
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={showGallery}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <SafeAreaView edges={['top']}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
              }}
            >
              <Pressable onPress={() => setShowGallery(false)} hitSlop={16}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <Text style={{ color: '#fff', fontFamily: Fonts.title.family, fontSize: 16 }}>
                {photos.length ? `${galleryIndex + 1} / ${photos.length}` : '0 / 0'}
              </Text>
              <View style={{ width: 28 }} />
            </View>
          </SafeAreaView>

          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={photos.length ? Math.min(galleryIndex, photos.length - 1) : 0}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setGalleryIndex(index);
            }}
            renderItem={({ item }) => (
              <View
                style={{
                  width,
                  height: windowHeight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width,
                    height: windowHeight * 0.8,
                  }}
                  resizeMode="contain"
                />
              </View>
            )}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>

      <BottomSheetModal
        ref={contactSheetRef}
        snapPoints={snap60}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Message</Text>
          <BottomSheetTextInput
            style={styles.sheetInput}
            placeholder="Votre message au commerce…"
            placeholderTextColor={Colors.textMuted}
            multiline
            value={contactMsg}
            onChangeText={setContactMsg}
          />
          <Pressable
            style={styles.sheetPrimary}
            onPress={() => {
              contactSheetRef.current?.dismiss();
              onContact();
              Alert.alert('Message envoyé (mock)', contactMsg.slice(0, 120) || '(vide)');
              setContactMsg('');
            }}
          >
            <Text style={styles.sheetPrimaryTxt}>Envoyer</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal ref={horairesSheetRef} snapPoints={snap55} enablePanDownToClose backdropComponent={renderBackdrop}>
        <View style={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Horaires d’ouverture</Text>
          <BottomSheetFlatList
            data={biz.horaires}
            keyExtractor={(item) => item.day}
            renderItem={({ item }) => {
              const isToday = item.day === todayFr();
              return (
                <View style={[styles.horaireRow, isToday && styles.horaireToday]}>
                  <Text style={[styles.horaireDay, isToday && styles.horaireDayToday]}>{item.day}</Text>
                  <Text style={[styles.horaireHours, isToday && styles.horaireHoursToday]}>{item.hours}</Text>
                </View>
              );
            }}
          />
        </View>
      </BottomSheetModal>

      <BottomSheetModal ref={reviewSheetRef} snapPoints={snap60} enablePanDownToClose backdropComponent={renderBackdrop}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Donner un avis</Text>
          <View style={styles.starsPick}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setReviewStars(n)}>
                <Ionicons name={n <= reviewStars ? 'star' : 'star-outline'} size={32} color="#F59E0B" />
              </Pressable>
            ))}
          </View>
          <BottomSheetTextInput
            style={styles.sheetInput}
            placeholder="Votre commentaire…"
            placeholderTextColor={Colors.textMuted}
            multiline
            value={reviewText}
            onChangeText={setReviewText}
          />
          <Pressable style={styles.sheetPrimary} onPress={publishReview}>
            <Text style={styles.sheetPrimaryTxt}>Publier</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.85} delayPressIn={0}>
      <Ionicons name={icon} size={22} color={Colors.primary} />
      <Text style={styles.quickLbl}>{label}</Text>
    </TouchableOpacity>
  );
}

function PhotosTab({
  photos,
  metrics,
  isOwner,
  onOpen,
  onAdd,
}: {
  photos: string[];
  metrics: { pad: number; gap: number; cell: number; bigW: number; bigH: number; smallH: number };
  isOwner: boolean;
  onOpen: (i: number) => void;
  onAdd: () => void;
}) {
  const { pad, gap, cell, bigW, bigH, smallH } = metrics;

  if (!photos.length) {
    return (
      <View style={{ paddingHorizontal: pad, paddingVertical: 24, alignItems: 'center' }}>
        <Text style={{ fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray }}>Aucune photo</Text>
      </View>
    );
  }

  const [p0, p1, p2, ...rest] = photos;

  return (
    <View style={{ paddingHorizontal: pad }}>
      <View style={[styles.photoTopRow, { gap }]}>
        <Pressable onPress={() => onOpen(0)} style={{ width: bigW, height: bigH }}>
          {p0 ? (
            <Image source={{ uri: p0 }} style={[styles.photoBig, { borderRadius: 4 }]} resizeMode="cover" />
          ) : (
            <View style={[styles.photoPlaceholder, { width: bigW, height: bigH }]} />
          )}
        </Pressable>
        <View style={{ width: cell, gap }}>
          <Pressable onPress={() => onOpen(1)} style={{ height: smallH }}>
            {p1 ? (
              <Image source={{ uri: p1 }} style={[styles.photoSmall, { height: smallH }]} resizeMode="cover" />
            ) : (
              <View style={[styles.photoPlaceholder, { height: smallH }]} />
            )}
          </Pressable>
          <Pressable onPress={() => onOpen(2)} style={{ height: smallH }}>
            {p2 ? (
              <Image source={{ uri: p2 }} style={[styles.photoSmall, { height: smallH }]} resizeMode="cover" />
            ) : (
              <View style={[styles.photoPlaceholder, { height: smallH }]} />
            )}
          </Pressable>
        </View>
      </View>
      <View style={[styles.photoGridRest, { gap }]}>
        {rest.map((uri, i) => (
          <Pressable key={`${uri}-${i}`} onPress={() => onOpen(i + 3)} style={{ width: cell, aspectRatio: 1 }}>
            <Image source={{ uri }} style={styles.photoCell} resizeMode="cover" />
          </Pressable>
        ))}
      </View>
      {isOwner ? (
        <Pressable style={styles.addPhotosBtn} onPress={() => void onAdd()}>
          <Text style={styles.addPhotosTxt}>+ Ajouter des photos</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

async function shareOfferToApps(o: CommercialOffer, businessName: string) {
  try {
    await Share.share({
      message: `J'ai trouvé cette offre sur Yunicity : ${o.title}\nChez ${businessName}`,
      title: o.title,
    });
  } catch {
    Alert.alert(
      'Partager l’offre',
      `J'ai trouvé cette offre sur Yunicity : ${o.title}\nChez ${businessName}`,
    );
  }
}

function openProfiterOfferAlert(o: CommercialOffer, businessName: string) {
  const body =
    `Montrez ce message au comptoir pour profiter de votre offre.\n\n` +
    `"Je suis membre Yunicity et je souhaite profiter de l'offre : ${o.title}"`;
  Alert.alert(`🎁 ${o.title}`, body, [
    { text: 'Fermer', style: 'cancel' },
    {
      text: "📤 Partager l'offre",
      onPress: () => void shareOfferToApps(o, businessName),
    },
  ]);
}

function OffersTab({ offers, businessName }: { offers: CommercialOffer[]; businessName: string }) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {offers.map((o) => (
        <View key={o.id} style={styles.offerCard}>
          <View style={styles.offerImgWrap}>
            <Image source={{ uri: o.imageUrl }} style={styles.offerImg} resizeMode="cover" />
            {o.badge ? (
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeTxt}>{o.badge}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.offerBody}>
            <Text style={styles.offerTitle}>{o.title}</Text>
            <Text style={styles.offerDesc} numberOfLines={2}>
              {o.desc}
            </Text>
            <Text style={styles.offerExp}>📅 Expire : {o.expires}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.offerCta}
              delayPressIn={0}
              onPress={() => openProfiterOfferAlert(o, businessName)}
            >
              <Text style={styles.offerCtaTxt}>Profiter de l’offre →</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function ReviewsTab({
  biz,
  reviews,
  helpful,
  onHelpful,
  onWrite,
}: {
  biz: CommercialBusinessMock;
  reviews: CommercialReview[];
  helpful: Record<string, number>;
  onHelpful: (id: string) => void;
  onWrite: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.reviewSummary}>
        <Text style={styles.reviewBig}>{biz.rating.toFixed(1)}</Text>
        <View style={styles.reviewSummaryCol}>
          <View style={styles.reviewStarsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={18} color="#F59E0B" />
            ))}
          </View>
          <Text style={styles.reviewExcellent}>Excellent</Text>
          <Text style={styles.reviewSubCount}>({biz.reviewCount} avis)</Text>
        </View>
      </View>
      {[5, 4, 3, 2, 1].map((star, idx) => (
        <View key={star} style={styles.distRow}>
          <Text style={styles.distLbl}>{star}★</Text>
          <View style={styles.distTrack}>
            <View style={[styles.distFill, { width: `${REVIEW_DIST_PCT[idx]}%` }]} />
          </View>
          <Text style={styles.distPct}>{REVIEW_DIST_PCT[idx]}%</Text>
        </View>
      ))}
      <Pressable style={styles.writeReviewBtn} onPress={onWrite}>
        <Text style={styles.writeReviewTxt}>Écrire un avis</Text>
      </Pressable>
      <View style={{ height: 14 }} />
      {reviews.map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewHead}>
            <View style={[styles.reviewAvatar, { backgroundColor: r.color }]}>
              <Text style={styles.reviewAvatarTxt}>{r.avatar}</Text>
            </View>
            <Text style={styles.reviewAuthor}>{r.author}</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
          <View style={styles.reviewStarsRowSmall}>
            {Array.from({ length: r.rating }).map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#F59E0B" />
            ))}
          </View>
          <Text style={styles.reviewComment}>{r.comment}</Text>
          <Pressable onPress={() => onHelpful(r.id)} style={styles.helpfulRow}>
            <Text style={styles.helpfulTxt}>
              Utile ? 👍 {helpful[r.id] ?? 0}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function EventsTab({
  events,
  joined,
  setJoined,
}: {
  events: CommercialEvent[];
  joined: Record<string, boolean>;
  setJoined: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 16 }}>
      {events.map((ev) => {
        const isIn = !!joined[ev.id];
        return (
          <View key={ev.id} style={styles.eventCard}>
            <Image source={{ uri: ev.imageUrl }} style={styles.eventImg} resizeMode="cover" />
            <LinearGradientOverlay />
            <View style={styles.eventOverlay}>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventMeta}>
                📅 {ev.date} · 💰 {ev.price}
              </Text>
              <View style={styles.eventFooter}>
                <Text style={styles.eventAtt}>👥 {ev.attendees} participants</Text>
                <Pressable
                  style={[styles.eventCta, isIn && styles.eventCtaJoined]}
                  onPress={() => {
                    setJoined((j) => ({ ...j, [ev.id]: !isIn }));
                    if (!isIn) Alert.alert('Inscrit ! 🎉', 'Vous êtes inscrit à cet événement (mock).');
                  }}
                >
                  <Text style={[styles.eventCtaTxt, isIn && styles.eventCtaTxtJoined]}>
                    {isIn ? '✓ Inscrit' : 'Je participe →'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LinearGradientOverlay() {
  return <View style={styles.eventGrad} />;
}

function PostsTab({ posts }: { posts: FeedPost[] }) {
  if (!posts.length) {
    return (
      <View style={styles.emptyPosts}>
        <Text style={styles.emptyPostsTxt}>Aucune publication</Text>
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 0 }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} disableAuthorNav />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  heroWrap: {
    height: 260,
    overflow: 'hidden',
    backgroundColor: Colors.grayLight,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    pointerEvents: 'none',
  },
  heroTopRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: 10,
  },
  glassOuter: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassFill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  catPillTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.white,
  },
  heroName: {
    fontFamily: Fonts.title.family,
    fontSize: 28,
    color: Colors.white,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  ratingVal: {
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.white,
  },
  ratingCount: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  heroAddr: {
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  quickBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 4,
    ...Shadows.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickLbl: {
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: Colors.dark,
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.white,
    gap: 10,
    ...Shadows.card,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTxt: {
    flex: 1,
    fontFamily: Fonts.titleSemi.family,
    fontSize: 15,
    color: Colors.dark,
  },
  statusLink: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.primary,
  },
  tabsSticky: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginTop: 12,
  },
  tabsRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 16,
    alignItems: 'flex-end',
  },
  tabBtn: {
    marginRight: 8,
    paddingBottom: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  tabLabel: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 13,
  },
  tabLabelOn: {
    color: Colors.primary,
  },
  tabLabelOff: {
    color: Colors.gray,
  },
  tabUnderline: {
    marginTop: 8,
    height: 3,
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  tabUnderlineSpacer: {
    marginTop: 8,
    height: 3,
    width: '100%',
  },
  tabBody: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  photoTopRow: {
    flexDirection: 'row',
  },
  photoBig: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  photoSmall: {
    width: '100%',
    borderRadius: 4,
  },
  photoGridRest: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  photoCell: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  photoPlaceholder: {
    backgroundColor: Colors.grayLight,
    borderRadius: 4,
  },
  addPhotosBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
  },
  addPhotosTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.primary,
  },
  offerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  offerImgWrap: {
    height: 140,
    backgroundColor: Colors.grayLight,
  },
  offerImg: {
    width: '100%',
    height: '100%',
  },
  offerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  offerBadgeTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 11,
    color: Colors.white,
  },
  offerBody: {
    padding: 14,
  },
  offerTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  offerDesc: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
  },
  offerExp: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  offerCta: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  offerCtaTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.white,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  reviewBig: {
    fontFamily: Fonts.title.family,
    fontSize: 56,
    color: Colors.dark,
    fontWeight: '800',
  },
  reviewSummaryCol: {
    gap: 4,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStarsRowSmall: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 6,
  },
  reviewExcellent: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
  },
  reviewSubCount: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  distLbl: {
    width: 28,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  distTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  distPct: {
    width: 36,
    textAlign: 'right',
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  writeReviewBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  writeReviewTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 15,
    color: Colors.white,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    ...Shadows.card,
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarTxt: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 13,
    color: Colors.white,
  },
  reviewAuthor: {
    flex: 1,
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  reviewDate: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  reviewComment: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.textBody,
    lineHeight: 21,
  },
  helpfulRow: {
    marginTop: 10,
  },
  helpfulTxt: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  eventCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    backgroundColor: Colors.grayLight,
  },
  eventImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  eventGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  eventOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  eventTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.white,
  },
  eventMeta: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  eventFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventAtt: {
    flex: 1,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  eventCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  eventCtaJoined: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  eventCtaTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.white,
  },
  eventCtaTxtJoined: {
    color: Colors.white,
  },
  emptyPosts: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyPostsTxt: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
  },
  sheetPad: {
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
    marginBottom: 14,
  },
  sheetInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    padding: 12,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sheetPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetPrimaryTxt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 15,
    color: Colors.white,
  },
  horaireRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grayBorder,
  },
  horaireToday: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  horaireDay: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  horaireDayToday: {
    fontFamily: Fonts.bodySemi.family,
    color: Colors.primary,
    fontWeight: '600',
  },
  horaireHours: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
  },
  horaireHoursToday: {
    fontFamily: Fonts.bodySemi.family,
    color: Colors.primary,
    fontWeight: '600',
  },
  starsPick: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
});
