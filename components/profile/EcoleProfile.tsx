import { forwardRef, useCallback, useMemo, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '@/components/PostCard';
import type { ProfileViewModel } from '@/components/profile/profileUtils';
import type { FeedPost } from '@/constants/mockPosts';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import {
  MOCK_ALUMNI,
  MOCK_ECOLE_PUBLIC,
  MOCK_ECOLE_EVENTS,
  MOCK_FORMATIONS,
  MOCK_PARTNERS_ECOLE,
} from '@/constants/mockEcoleProfile';
import { LinearGradient } from 'expo-linear-gradient';

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

type MiniTab = 'photos' | 'formations' | 'events' | 'impact' | 'posts';

const MINI_TABS: { id: MiniTab; label: string }[] = [
  { id: 'photos', label: '📸 Photos' },
  { id: 'formations', label: '📚 Formations' },
  { id: 'events', label: '📅 Événements' },
  { id: 'impact', label: '🌍 Impact' },
  { id: 'posts', label: '📝 Posts' },
];

const BRAND = '#DC2626';

function GlassIconButton({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
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

export function EcoleProfile({
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

  const ecole = useMemo(() => MOCK_ECOLE_PUBLIC, []);

  const [tab, setTab] = useState<MiniTab>('photos');
  const [photos, setPhotos] = useState<string[]>(() => [...(ecole.photos ?? [])]);
  const [events, setEvents] = useState<(typeof MOCK_ECOLE_EVENTS)[number][]>(() =>
    MOCK_ECOLE_EVENTS.map((e) => ({ ...e, isJoined: false } as any)),
  );
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const contactSheetRef = useRef<BottomSheetModal>(null);
  const calendrierSheetRef = useRef<BottomSheetModal>(null);
  const candidatureSheetRef = useRef<BottomSheetModal>(null);
  const [contactMsg, setContactMsg] = useState('');

  const [candFormationId, setCandFormationId] = useState<string>(MOCK_FORMATIONS[0]?.id ?? 'f1');
  const [candFirst, setCandFirst] = useState('');
  const [candLast, setCandLast] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candLevel, setCandLevel] = useState<'Bac' | 'Bac+1' | 'Bac+2' | 'Autre'>('Bac');
  const [candMotiv, setCandMotiv] = useState('');

  const snap55 = useMemo(() => ['55%'], []);
  const snap60 = useMemo(() => ['60%'], []);
  const snap80 = useMemo(() => ['80%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const establishmentPosts = useMemo(() => posts.filter((p) => p.authorId === profile.id), [posts, profile.id]);

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

  const openGallery = useCallback(
    (index: number) => {
      if (!photos.length) return;
      setGalleryIndex(index);
      setShowGallery(true);
    },
    [photos.length],
  );

  const handleShareHero = useCallback(async () => {
    const message =
      `Découvrez ${ecole.name} sur Yunicity !\n` +
      `${ecole.type} · ${ecole.address}\n` +
      `${ecole.studentCount} étudiants · ${ecole.insertionRate}% d'insertion · Depuis ${ecole.founded}`;
    try {
      await Share.share({ message, title: ecole.name });
    } catch {
      Alert.alert('Partager', message);
    }
  }, [ecole.address, ecole.founded, ecole.insertionRate, ecole.name, ecole.studentCount, ecole.type]);

  const handleMenu = useCallback(() => {
    const shareShort = () => {
      void (async () => {
        try {
          await Share.share({ message: `${ecole.name} · ${ecole.address}` });
        } catch {
          Alert.alert('Partager', `${ecole.name} · ${ecole.address}`);
        }
      })();
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Partager', 'Signaler'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (index) => {
          if (index === 1) shareShort();
          if (index === 2) Alert.alert('Signalement', 'Merci, nous allons examiner ce profil.');
        },
      );
    } else {
      Alert.alert('Options', 'Que souhaitez-vous faire ?', [
        { text: 'Partager', onPress: shareShort },
        { text: 'Signaler', onPress: () => Alert.alert('Signalement', 'Merci, nous allons examiner ce profil.') },
        { text: 'Annuler', style: 'cancel' },
      ]);
    }
  }, [ecole.address, ecole.name]);

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
            <Image source={{ uri: ecole.coverUrl }} style={styles.heroImage} resizeMode="cover" />
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
              <View style={[styles.catPill, { backgroundColor: BRAND }]}>
                <Text style={styles.catPillTxt}>🎓 École supérieure</Text>
              </View>
              <Text style={styles.heroName}>{ecole.name}</Text>
              <Text style={styles.heroStats}>
                {ecole.studentCount} étudiants · {ecole.insertionRate}% d'insertion · Depuis {ecole.founded}
              </Text>
              <Text style={styles.heroAddr}>📍 {ecole.address}</Text>
            </View>
          </View>

          <View style={styles.quickBar}>
            <QuickAction icon="document-text-outline" label="Candidater" onPress={() => candidatureSheetRef.current?.present()} />
            <QuickAction icon="chatbubble-outline" label="Contacter" onPress={() => contactSheetRef.current?.present()} />
            <QuickAction icon="map-outline" label="Nous trouver" onPress={() => router.push('/(app)/(tabs)/map')} />
            <QuickAction icon="share-outline" label="Partager" onPress={() => void handleShareHero()} />
          </View>

          <Pressable onPress={() => calendrierSheetRef.current?.present()} style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
            <Text style={styles.statusTxt} numberOfLines={2}>
              🟢 Inscriptions ouvertes · Rentrée septembre 2026
            </Text>
            <Text style={styles.statusLink}>Voir le calendrier ›</Text>
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
            <PhotosTab photos={photos} metrics={gridMetrics} isOwner={isOwner} onOpen={openGallery} onAdd={pickPhotos} />
          ) : null}
          {tab === 'formations' ? <FormationsTab formations={MOCK_FORMATIONS as any} isOwner={isOwner} onApply={(id) => { setCandFormationId(id); candidatureSheetRef.current?.present(); }} /> : null}
          {tab === 'events' ? <EventsTab events={events as any} joined={joined} setJoined={setJoined} setEvents={setEvents} /> : null}
          {tab === 'impact' ? <ImpactTab insertionRate={ecole.insertionRate} alumni={MOCK_ALUMNI as any} partners={MOCK_PARTNERS_ECOLE as any} /> : null}
          {tab === 'posts' ? <PostsTab posts={establishmentPosts} /> : null}
        </View>
      </ScrollView>

      <Modal visible={showGallery} animationType="fade" transparent={false} statusBarTranslucent onRequestClose={() => setShowGallery(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <SafeAreaView edges={['top']}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
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
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={{ width, height: windowHeight, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={{ width, height: windowHeight * 0.8 }} resizeMode="contain" />
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
            placeholder="Votre message à l’école…"
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

      <BottomSheetModal ref={calendrierSheetRef} snapPoints={snap55} enablePanDownToClose backdropComponent={renderBackdrop}>
        <View style={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Calendrier</Text>
          <BottomSheetFlatList
            data={[
              { periode: 'Candidatures', dates: '15 mars - 30 juin 2026' },
              { periode: 'Entretiens', dates: 'Juillet 2026' },
              { periode: 'Résultats', dates: '15 août 2026' },
              { periode: 'Rentrée', dates: '15 septembre 2026' },
            ]}
            keyExtractor={(item) => item.periode}
            renderItem={({ item }) => (
              <View style={styles.horaireRow}>
                <Text style={styles.horaireDay}>{item.periode}</Text>
                <Text style={styles.horaireHours}>{item.dates}</Text>
              </View>
            )}
          />
        </View>
      </BottomSheetModal>

      <CandidatureSheet
        ref={candidatureSheetRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        formationId={candFormationId}
        setFormationId={setCandFormationId}
        first={candFirst}
        setFirst={setCandFirst}
        last={candLast}
        setLast={setCandLast}
        email={candEmail}
        setEmail={setCandEmail}
        phone={candPhone}
        setPhone={setCandPhone}
        level={candLevel}
        setLevel={setCandLevel}
        motiv={candMotiv}
        setMotiv={setCandMotiv}
        onSubmit={() => {
          candidatureSheetRef.current?.dismiss();
          Alert.alert('Candidature envoyée !', 'Réponse sous 5 jours ✓');
          setCandFirst('');
          setCandLast('');
          setCandEmail('');
          setCandPhone('');
          setCandMotiv('');
          setCandLevel('Bac');
        }}
      />
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.85} delayPressIn={0}>
      <Ionicons name={icon} size={22} color={BRAND} />
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
          {p0 ? <Image source={{ uri: p0 }} style={[styles.photoBig, { borderRadius: 4 }]} resizeMode="cover" /> : <View style={[styles.photoPlaceholder, { width: bigW, height: bigH }]} />}
        </Pressable>
        <View style={{ width: cell, gap }}>
          <Pressable onPress={() => onOpen(1)} style={{ height: smallH }}>
            {p1 ? <Image source={{ uri: p1 }} style={[styles.photoSmall, { height: smallH }]} resizeMode="cover" /> : <View style={[styles.photoPlaceholder, { height: smallH }]} />}
          </Pressable>
          <Pressable onPress={() => onOpen(2)} style={{ height: smallH }}>
            {p2 ? <Image source={{ uri: p2 }} style={[styles.photoSmall, { height: smallH }]} resizeMode="cover" /> : <View style={[styles.photoPlaceholder, { height: smallH }]} />}
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

function FormationsTab({ formations, isOwner, onApply }: { formations: any[]; isOwner: boolean; onApply: (id: string) => void }) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {formations.map((f) => {
        const ratio = Math.min(1, f.enrolled / Math.max(1, f.capacity));
        const isOpen = !!f.openForInscription;
        return (
          <View key={f.id} style={styles.formationCard}>
            <View style={styles.formationImgWrap}>
              <Image source={{ uri: f.imageUrl }} style={styles.formationImg} resizeMode="cover" />
              <View style={styles.formationLevelPill}>
                <Text style={styles.formationLevelTxt}>{f.level}</Text>
              </View>
              {isOpen ? (
                <View style={styles.openPill}>
                  <Text style={styles.openPillTxt}>🟢 Inscriptions ouvertes</Text>
                </View>
              ) : (
                <View style={styles.closedPill}>
                  <Text style={styles.closedPillTxt}>🔴 Complet</Text>
                </View>
              )}
            </View>
            <View style={{ padding: 16 }}>
              <Text style={styles.formationTitle}>{f.title}</Text>
              <Text style={styles.formationDiploma}>{f.diploma}</Text>
              <Text style={styles.formationDesc} numberOfLines={2}>
                {f.description}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaTxt}>⏱️ {f.duration}</Text>
                <Text style={styles.metaTxt}>💶 {f.price}</Text>
              </View>
              <View style={styles.tagsRow}>
                {f.tags.map((t: string) => (
                  <View key={t} style={styles.tagChip}>
                    <Text style={styles.tagChipTxt}>{t}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={styles.placesTxt}>
                  {f.enrolled}/{f.capacity} places
                </Text>
                <View style={styles.placesTrack}>
                  <View style={[styles.placesFill, { width: `${Math.round(ratio * 100)}%` }]} />
                </View>
              </View>
              <Pressable style={[styles.formationCta, styles.formationCtaOn]} onPress={() => onApply(f.id)}>
                <Text style={styles.formationCtaTxt}>Candidater</Text>
              </Pressable>
              {!isOwner ? null : <Text style={styles.readOnlyHint}>Lecture seule (mock).</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function EventsTab({
  events,
  joined,
  setJoined,
  setEvents,
}: {
  events: any[];
  joined: Record<string, boolean>;
  setJoined: Dispatch<SetStateAction<Record<string, boolean>>>;
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const typePill = (t: string) => {
    if (t === 'portes_ouvertes') return { label: '🏫 Portes ouvertes', bg: '#2A2FFF' };
    if (t === 'exposition') return { label: '🎨 Exposition', bg: '#7C3AED' };
    return { label: '⭐ Masterclass', bg: '#D97706' };
  };
  return (
    <View style={{ paddingHorizontal: 16, gap: 16 }}>
      {events.map((ev) => {
        const isIn = !!joined[ev.id] || !!ev.isJoined;
        const ratio = Math.min(1, (ev.attendees ?? 0) / (ev.maxAttendees ?? 1));
        const pill = typePill(ev.type);
        const isFree = String(ev.price).toLowerCase().includes('gratuit');
        return (
          <View key={ev.id} style={styles.eventCard}>
            <Image source={{ uri: ev.imageUrl }} style={styles.eventImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.eventGrad} />
            <View style={[styles.eventTypePill, { backgroundColor: pill.bg }]}>
              <Text style={styles.eventTypeTxt}>{pill.label}</Text>
            </View>
            <View style={[styles.eventPricePill, { backgroundColor: isFree ? '#16A34A' : BRAND }]}>
              <Text style={styles.eventPriceTxt}>{isFree ? 'Gratuit' : ev.price}</Text>
            </View>
            <View style={styles.eventOverlay}>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventMeta}>
                📅 {ev.date} · 📍 {ev.location}
              </Text>
              <View style={styles.eventBottomRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventCap}>
                    {ev.attendees}/{ev.maxAttendees}
                  </Text>
                  <View style={styles.capTrack}>
                    <View style={[styles.capFill, { width: `${Math.round(ratio * 100)}%` }]} />
                  </View>
                </View>
                <Pressable
                  style={[styles.joinBtn, isIn ? styles.joinBtnOn : styles.joinBtnOff]}
                  onPress={() => {
                    setJoined((j) => ({ ...j, [ev.id]: !isIn }));
                    setEvents((prev) => prev.map((x: any) => (x.id === ev.id ? { ...x, isJoined: !isIn } : x)));
                    if (!isIn) Alert.alert('Inscription', 'Vous participez à cet événement ✓ (mock).');
                  }}
                >
                  <Text style={styles.joinBtnTxt}>{isIn ? '✓ Inscrit' : 'Je participe →'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ImpactTab({ insertionRate, alumni, partners }: { insertionRate: number; alumni: any[]; partners: any[] }) {
  const pct = Math.max(0, Math.min(1, insertionRate / 100));
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.insertCard}>
        <Text style={styles.insertKicker}>TAUX D'INSERTION</Text>
        <Text style={styles.insertVal}>{insertionRate}%</Text>
        <Text style={styles.insertSub}>des diplômés en emploi dans les 6 mois</Text>
        <View style={styles.insertTrack}>
          <View style={[styles.insertFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      </View>
      <View style={{ height: 16 }} />
      <Text style={styles.sectionTitle}>Nos anciens élèves 🎓</Text>
      <View style={{ height: 12 }} />
      {alumni.map((a: any) => (
        <View key={a.id} style={styles.alumniCard}>
          <View style={[styles.alumniAvatar, { backgroundColor: a.color }]}>
            <Text style={styles.alumniAvatarTxt}>{a.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alumniName}>{a.name}</Text>
            <Text style={styles.alumniJob}>
              {a.job} · {a.company}
            </Text>
            <View style={styles.promoPill}>
              <Text style={styles.promoPillTxt}>Promo {a.promo}</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: 16 }} />
      <Text style={styles.sectionTitle}>Partenaires & débouchés 🤝</Text>
      {partners.map((p: any) => (
        <View key={p.id} style={styles.partnerCard}>
          <View style={[styles.partnerLogo, { backgroundColor: p.color }]}>
            <Text style={styles.partnerLogoTxt}>{p.logo}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.partnerName}>{p.name}</Text>
            <Text style={styles.partnerType}>
              {p.type} · Depuis {p.since}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const CandidatureSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: (p: BottomSheetBackdropProps) => ReactNode;
    formationId: string;
    setFormationId: (v: string) => void;
    first: string;
    setFirst: (v: string) => void;
    last: string;
    setLast: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    phone: string;
    setPhone: (v: string) => void;
    level: 'Bac' | 'Bac+1' | 'Bac+2' | 'Autre';
    setLevel: (v: 'Bac' | 'Bac+1' | 'Bac+2' | 'Autre') => void;
    motiv: string;
    setMotiv: (v: string) => void;
    onSubmit: () => void;
  }
>(function CandidatureSheet(
  { snap, renderBackdrop, formationId, setFormationId, first, setFirst, last, setLast, email, setEmail, phone, setPhone, level, setLevel, motiv, setMotiv, onSubmit },
  ref,
) {
  const levels = ['Bac', 'Bac+1', 'Bac+2', 'Autre'] as const;
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Déposer une candidature</Text>
        <Text style={styles.inputLbl}>Formation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {MOCK_FORMATIONS.map((f) => (
            <Pressable key={f.id} onPress={() => setFormationId(f.id)} style={[styles.miniChip, formationId === f.id && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, formationId === f.id && styles.miniChipTxtOn]}>{f.level}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.sheetHint}>{MOCK_FORMATIONS.find((f) => f.id === formationId)?.title ?? ''}</Text>
        <Field label="Prénom" value={first} onChangeText={setFirst} />
        <Field label="Nom" value={last} onChangeText={setLast} />
        <Field label="Email" value={email} onChangeText={setEmail} />
        <Field label="Téléphone" value={phone} onChangeText={setPhone} />
        <Text style={styles.inputLbl}>Niveau actuel</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {levels.map((l) => (
            <Pressable key={l} onPress={() => setLevel(l)} style={[styles.miniChip, level === l && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, level === l && styles.miniChipTxtOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.inputLbl}>Lettre de motivation</Text>
        <BottomSheetTextInput style={[styles.sheetInput, { minHeight: 110 }]} value={motiv} onChangeText={setMotiv} multiline />
        <Pressable style={styles.sheetPrimary} onPress={onSubmit}>
          <Text style={styles.sheetPrimaryTxt}>Envoyer ma candidature 🎓</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <>
      <Text style={styles.inputLbl}>{label}</Text>
      <BottomSheetTextInput style={styles.sheetField} value={value} onChangeText={onChangeText} />
    </>
  );
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
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  sectionTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  heroWrap: { height: 260, overflow: 'hidden', backgroundColor: Colors.grayLight },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', pointerEvents: 'none' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', pointerEvents: 'none' },
  heroTopRow: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, elevation: 20 },
  heroTopRight: { flexDirection: 'row', gap: 10 },
  glassOuter: { borderRadius: 20, overflow: 'hidden' },
  glassFill: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  catPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 10 },
  catPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  heroName: { fontFamily: Fonts.title.family, fontSize: 28, color: Colors.white, marginBottom: 6 },
  heroStats: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  heroAddr: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  quickBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 16,
    justifyContent: 'space-between',
    ...Shadows.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  quickBtn: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 6 },
  quickLbl: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.dark, textAlign: 'center', lineHeight: 14 },
  statusCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: Colors.white, gap: 10, ...Shadows.card },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTxt: { flex: 1, fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  statusLink: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: BRAND },
  tabsSticky: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginTop: 12 },
  tabsRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 16, alignItems: 'flex-end' },
  tabBtn: { marginRight: 8, paddingBottom: 8, minWidth: 72, alignItems: 'center' },
  tabLabel: { fontFamily: Fonts.titleSemi.family, fontSize: 13 },
  tabLabelOn: { color: BRAND },
  tabLabelOff: { color: Colors.gray },
  tabUnderline: { marginTop: 8, height: 3, width: '100%', backgroundColor: BRAND, borderRadius: 2 },
  tabUnderlineSpacer: { marginTop: 8, height: 3, width: '100%' },
  tabBody: { paddingTop: 16, paddingBottom: 8 },
  photoTopRow: { flexDirection: 'row' },
  photoBig: { width: '100%', height: '100%', borderRadius: 4 },
  photoSmall: { width: '100%', borderRadius: 4 },
  photoGridRest: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  photoCell: { width: '100%', height: '100%', borderRadius: 4 },
  photoPlaceholder: { backgroundColor: Colors.grayLight, borderRadius: 4 },
  addPhotosBtn: { marginTop: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.grayBorder, alignItems: 'center' },
  addPhotosTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: BRAND },

  formationCard: { borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.white, ...Shadows.card },
  formationImgWrap: { height: 140, backgroundColor: Colors.grayLight },
  formationImg: { width: '100%', height: '100%' },
  formationLevelPill: { position: 'absolute', top: 12, right: 12, backgroundColor: BRAND, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  formationLevelTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  openPill: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(22,163,74,0.9)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  openPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  closedPill: { position: 'absolute', top: 12, left: 12, backgroundColor: '#6B7280', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  closedPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  formationTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  formationDiploma: { marginTop: 6, fontFamily: Fonts.bodySemi.family, fontSize: 13, color: BRAND },
  formationDesc: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, lineHeight: 18 },
  metaRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  metaTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagChip: { backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tagChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: BRAND },
  placesTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.gray },
  placesTrack: { marginTop: 6, height: 8, backgroundColor: '#F3F4F6', borderRadius: 999, overflow: 'hidden' },
  placesFill: { height: 8, backgroundColor: BRAND, borderRadius: 999 },
  formationCta: { marginTop: 14, borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: BRAND },
  formationCtaOn: { backgroundColor: BRAND },
  formationCtaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  readOnlyHint: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  eventCard: { borderRadius: 20, overflow: 'hidden', height: 260, backgroundColor: Colors.grayLight },
  eventImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  eventGrad: { ...StyleSheet.absoluteFillObject },
  eventTypePill: { position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  eventTypeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  eventPricePill: { position: 'absolute', top: 12, right: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  eventPriceTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  eventOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  eventTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  eventMeta: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  eventBottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventCap: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  capTrack: { marginTop: 6, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' },
  capFill: { height: 4, backgroundColor: Colors.white, borderRadius: 999 },
  joinBtn: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  joinBtnOff: { backgroundColor: BRAND },
  joinBtnOn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  joinBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },

  insertCard: { backgroundColor: '#0D0F2E', borderRadius: 20, padding: 20, ...Shadows.card },
  insertKicker: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  insertVal: { marginTop: 8, fontFamily: Fonts.title.family, fontSize: 56, color: Colors.white, textAlign: 'center', fontWeight: '900' },
  insertSub: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  insertTrack: { marginTop: 14, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' },
  insertFill: { height: 8, backgroundColor: BRAND, borderRadius: 999 },

  alumniCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', ...Shadows.card, marginBottom: 12 },
  alumniAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  alumniAvatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  alumniName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  alumniJob: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  promoPill: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  promoPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: BRAND },

  partnerCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', ...Shadows.card },
  partnerLogo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  partnerLogoTxt: { fontSize: 18 },
  partnerName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  partnerType: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  sheetPad: { padding: 20, paddingBottom: 32 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 14 },
  sheetHint: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginBottom: 12 },
  sheetInput: { minHeight: 120, borderRadius: 12, borderWidth: 1, borderColor: Colors.grayBorder, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, textAlignVertical: 'top', marginBottom: 16 },
  sheetField: { borderWidth: 1, borderColor: Colors.grayBorder, borderRadius: 12, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, marginBottom: 8 },
  sheetPrimary: { backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  sheetPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  inputLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark, marginTop: 10, marginBottom: 6 },
  miniChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6', marginRight: 8, marginTop: 8 },
  miniChipOn: { backgroundColor: BRAND },
  miniChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.dark },
  miniChipTxtOn: { color: Colors.white },
  horaireRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.grayBorder },
  horaireDay: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark },
  horaireHours: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  emptyPosts: { paddingVertical: 40, alignItems: 'center' },
  emptyPostsTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
});

