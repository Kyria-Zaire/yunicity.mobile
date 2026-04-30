import { useCallback, useMemo, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
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
import { MOCK_ACTIONS, MOCK_ASSO_PUBLIC, MOCK_EVENTS, MOCK_MEMBERS } from '@/constants/mockAssociationProfile';

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

type MiniTab = 'photos' | 'actions' | 'events' | 'members' | 'posts';

const MINI_TABS: { id: MiniTab; label: string }[] = [
  { id: 'photos', label: '📸 Photos' },
  { id: 'actions', label: '🎯 Actions' },
  { id: 'events', label: '📅 Événements' },
  { id: 'members', label: '👥 Membres' },
  { id: 'posts', label: '📝 Posts' },
];

const BRAND = '#2A2FFF';

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

export function AssociationProfile({
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

  const asso = useMemo(() => MOCK_ASSO_PUBLIC, []);

  const [tab, setTab] = useState<MiniTab>('photos');
  const [photos, setPhotos] = useState<string[]>(() => [...(asso.photos ?? [])]);
  const [events, setEvents] = useState<(typeof MOCK_EVENTS)[number][]>(() => [...MOCK_EVENTS]);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const contactSheetRef = useRef<BottomSheetModal>(null);
  const horairesSheetRef = useRef<BottomSheetModal>(null);
  const joinSheetRef = useRef<BottomSheetModal>(null);
  const donSheetRef = useRef<BottomSheetModal>(null);
  const benevolSheetRef = useRef<BottomSheetModal>(null);
  const [contactMsg, setContactMsg] = useState('');

  const [joinFirst, setJoinFirst] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinWhy, setJoinWhy] = useState('');

  const [donMode, setDonMode] = useState<'5' | '10' | '20' | '50' | 'Autre'>('10');
  const [donAmount, setDonAmount] = useState('10');

  const [benevolWhy, setBenevolWhy] = useState('');

  const snap55 = useMemo(() => ['55%'], []);
  const snap60 = useMemo(() => ['60%'], []);
  const snap65 = useMemo(() => ['65%'], []);

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
      `Découvrez ${asso.name} sur Yunicity !\n` +
      `${asso.category} · ${asso.address}\n` +
      `👥 ${asso.memberCount} membres · 🎯 ${asso.stats.beneficiaries.toLocaleString('fr-FR')} bénéficiaires`;
    try {
      await Share.share({ message, title: asso.name });
    } catch {
      Alert.alert('Partager', message);
    }
  }, [asso.address, asso.category, asso.memberCount, asso.name, asso.stats.beneficiaries]);

  const handleMenu = useCallback(() => {
    const shareShort = () => {
      void (async () => {
        try {
          await Share.share({ message: `${asso.name} · ${asso.address}` });
        } catch {
          Alert.alert('Partager', `${asso.name} · ${asso.address}`);
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
  }, [asso.address, asso.name]);

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
            <Image source={{ uri: asso.coverUrl }} style={styles.heroImage} resizeMode="cover" />
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
                <Text style={styles.catPillTxt}>🎭 Culture & Musique</Text>
              </View>
              <Text style={styles.heroName}>{asso.name}</Text>
              <Text style={styles.heroStats}>
                👥 {asso.memberCount} membres · {asso.stats.events} événements ·{' '}
                {asso.stats.beneficiaries.toLocaleString('fr-FR')} bénéficiaires
              </Text>
              <Text style={styles.heroAddr}>📍 {asso.address}</Text>
            </View>
          </View>

          <View style={styles.quickBar}>
            <QuickAction icon="people-outline" label="Rejoindre" onPress={() => joinSheetRef.current?.present()} />
            <QuickAction icon="chatbubble-outline" label="Contacter" onPress={() => contactSheetRef.current?.present()} />
            <QuickAction icon="heart-outline" label="Soutenir" onPress={() => donSheetRef.current?.present()} />
            <QuickAction icon="map-outline" label="Carte" onPress={() => router.push('/(app)/(tabs)/map')} />
            <QuickAction icon="share-outline" label="Partager" onPress={() => void handleShareHero()} />
          </View>

          <Pressable onPress={() => horairesSheetRef.current?.present()} style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
            <Text style={styles.statusTxt} numberOfLines={2}>
              🟢 Association active · Fondée en {asso.founded}
            </Text>
            <Text style={styles.statusLink}>Voir nos activités ›</Text>
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
          {tab === 'actions' ? <ActionsTab actions={MOCK_ACTIONS as any} isOwner={isOwner} /> : null}
          {tab === 'events' ? <AssoEventsTab events={events as any} setEvents={setEvents} joined={joined} setJoined={setJoined} isOwner={isOwner} /> : null}
          {tab === 'members' ? (
            <MembersTab
              isOwner={isOwner}
              members={(MOCK_MEMBERS as any).slice(0, 5)}
              stats={{ members: asso.memberCount, volunteers: asso.stats.volunteers }}
              onBecome={() => benevolSheetRef.current?.present()}
            />
          ) : null}
          {tab === 'posts' ? <PostsTab posts={establishmentPosts} /> : null}
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
            placeholder="Votre message à l’association…"
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
          <Text style={styles.sheetTitle}>Nos activités</Text>
          <BottomSheetFlatList
            data={[
              { day: 'Répétitions', hours: 'Mercredi 19h-21h' },
              { day: 'Concerts', hours: 'Vendredi soir (variable)' },
              { day: 'Ateliers', hours: 'Samedi 14h-17h' },
              { day: 'Jam Sessions', hours: '1er dimanche du mois 17h' },
            ]}
            keyExtractor={(item) => item.day}
            renderItem={({ item }) => (
              <View style={styles.horaireRow}>
                <Text style={styles.horaireDay}>{item.day}</Text>
                <Text style={styles.horaireHours}>{item.hours}</Text>
              </View>
            )}
          />
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        ref={joinSheetRef}
        snapPoints={snap65}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Rejoindre {asso.name}</Text>
          <Text style={styles.sheetHint}>Cotisation annuelle : 15€/an</Text>
          <Text style={styles.fieldLbl}>Prénom</Text>
          <BottomSheetTextInput style={styles.fieldInput} value={joinFirst} onChangeText={setJoinFirst} />
          <Text style={styles.fieldLbl}>Email</Text>
          <BottomSheetTextInput style={styles.fieldInput} value={joinEmail} onChangeText={setJoinEmail} autoCapitalize="none" />
          <Text style={styles.fieldLbl}>Téléphone</Text>
          <BottomSheetTextInput style={styles.fieldInput} value={joinPhone} onChangeText={setJoinPhone} />
          <Text style={styles.fieldLbl}>Pourquoi souhaitez-vous rejoindre ?</Text>
          <BottomSheetTextInput style={styles.sheetInput} value={joinWhy} onChangeText={setJoinWhy} multiline />
          <Pressable
            style={styles.sheetPrimary}
            onPress={() => {
              joinSheetRef.current?.dismiss();
              Alert.alert('Demande envoyée ! ✓', 'Votre demande a bien été envoyée (mock).');
              setJoinFirst('');
              setJoinEmail('');
              setJoinPhone('');
              setJoinWhy('');
            }}
          >
            <Text style={styles.sheetPrimaryTxt}>Envoyer ma demande</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={donSheetRef}
        snapPoints={snap55}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Soutenir l'association</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['5', '10', '20', '50', 'Autre'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  setDonMode(p);
                  if (p !== 'Autre') setDonAmount(p);
                }}
                style={[styles.amountChip, donMode === p && styles.amountChipOn]}
              >
                <Text style={[styles.amountChipTxt, donMode === p && styles.amountChipTxtOn]}>{p === 'Autre' ? p : `${p}€`}</Text>
              </Pressable>
            ))}
          </View>
          {donMode === 'Autre' ? (
            <>
              <Text style={styles.fieldLbl}>Montant</Text>
              <BottomSheetTextInput style={styles.fieldInput} value={donAmount} onChangeText={setDonAmount} keyboardType="number-pad" />
            </>
          ) : null}
          <Pressable
            style={styles.sheetPrimary}
            onPress={() => {
              donSheetRef.current?.dismiss();
              Alert.alert('Merci pour votre soutien ! 🙏', `Don enregistré : ${donAmount}€ (mock).`);
            }}
          >
            <Text style={styles.sheetPrimaryTxt}>Faire un don ❤️</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={benevolSheetRef}
        snapPoints={snap60}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Bénévolat</Text>
          <Text style={styles.sheetHint}>Je souhaite rejoindre {asso.name} comme bénévole</Text>
          <BottomSheetTextInput
            style={styles.sheetInput}
            placeholder="Votre motivation…"
            placeholderTextColor={Colors.textMuted}
            multiline
            value={benevolWhy}
            onChangeText={setBenevolWhy}
          />
          <Pressable
            style={styles.sheetPrimary}
            onPress={() => {
              benevolSheetRef.current?.dismiss();
              Alert.alert('Reçu ! ✓', 'Votre candidature a été envoyée (mock).');
              setBenevolWhy('');
            }}
          >
            <Text style={styles.sheetPrimaryTxt}>Envoyer ma candidature</Text>
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
          {p0 ? (
            <Image source={{ uri: p0 }} style={[styles.photoBig, { borderRadius: 4 }]} resizeMode="cover" />
          ) : (
            <View style={[styles.photoPlaceholder, { width: bigW, height: bigH }]} />
          )}
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

function ActionsTab({ actions, isOwner }: { actions: any[]; isOwner: boolean }) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {actions.map((a) => (
        <View key={a.id} style={styles.actionCard}>
          <View style={styles.actionImgWrap}>
            <Image source={{ uri: a.imageUrl }} style={styles.actionImg} resizeMode="cover" />
            <View style={styles.actionGrad} />
            <View style={styles.actionOverlay}>
              <View style={styles.actionCat}>
                <Text style={styles.actionCatTxt}>{a.category}</Text>
              </View>
              <Text style={styles.actionTitle}>{a.title}</Text>
            </View>
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionMeta}>📅 {a.date} · 👥 {a.participants} participants</Text>
            <Text style={styles.actionImpact}>🎯 {a.impact}</Text>
            {!isOwner ? null : (
              <Text style={styles.actionOwnerHint}>Lecture seule (mock).</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function AssoEventsTab({
  events,
  setEvents,
  joined,
  setJoined,
  isOwner,
}: {
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  joined: Record<string, boolean>;
  setJoined: Dispatch<SetStateAction<Record<string, boolean>>>;
  isOwner: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 16 }}>
      {events.map((ev) => {
        const isIn = !!joined[ev.id] || !!ev.isJoined;
        const isFree = String(ev.price).toLowerCase().includes('gratuit');
        const ratio = Math.min(1, (ev.attendees ?? 0) / (ev.maxAttendees ?? 1));
        return (
          <View key={ev.id} style={styles.assoEventCard}>
            <Image source={{ uri: ev.imageUrl }} style={styles.assoEventImg} resizeMode="cover" />
            <View style={styles.assoEventGrad} />
            <View style={[styles.assoEventPrice, { backgroundColor: isFree ? '#16A34A' : BRAND }]}>
              <Text style={styles.assoEventPriceTxt}>{isFree ? 'Gratuit' : ev.price}</Text>
            </View>
            {isOwner ? (
              <View style={styles.assoEventOwnerBtns}>
                <Pressable style={styles.assoEventOwnerBtn} onPress={() => Alert.alert('Éditer', 'Édition événement (mock).')}>
                  <Text style={{ color: Colors.white }}>✏️</Text>
                </Pressable>
                <Pressable
                  style={styles.assoEventOwnerBtn}
                  onPress={() =>
                    Alert.alert('Supprimer', 'Retirer cet événement ?', [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Supprimer', style: 'destructive', onPress: () => setEvents((p) => p.filter((x: any) => x.id !== ev.id)) },
                    ])
                  }
                >
                  <Text style={{ color: Colors.white }}>🗑️</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.assoEventOverlay}>
              <Text style={styles.assoEventTitle}>{ev.title}</Text>
              <Text style={styles.assoEventMeta}>
                📅 {ev.date} · 📍 {ev.location}
              </Text>
              <View style={styles.assoEventBottomRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assoEventCap}>
                    {ev.attendees}/{ev.maxAttendees}
                  </Text>
                  <View style={styles.assoCapTrack}>
                    <View style={[styles.assoCapFill, { width: `${Math.round(ratio * 100)}%` }]} />
                  </View>
                </View>
                {!isOwner ? (
                  <Pressable
                    style={[styles.assoJoinBtn, isIn && styles.assoJoinBtnOn]}
                    onPress={() => {
                      setJoined((j) => ({ ...j, [ev.id]: !isIn }));
                      if (!isIn) Alert.alert('Inscription', 'Vous participez à cet événement ✓ (mock).');
                    }}
                  >
                    <Text style={styles.assoJoinTxt}>{isIn ? '✓ Inscrit' : 'Je participe →'}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function MembersTab({
  isOwner,
  members,
  stats,
  onBecome,
}: {
  isOwner: boolean;
  members: any[];
  stats: { members: number; volunteers: number };
  onBecome: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.memberStats}>
        <Text style={styles.memberStatsTxt}>
          {stats.members} membres · {stats.volunteers} bénévoles actifs
        </Text>
      </View>
      <View style={{ height: 12 }} />
      {members.map((m) => (
        <View key={m.id} style={styles.memberCard}>
          <View style={[styles.memberAvatar, { backgroundColor: m.color }]}>
            <Text style={styles.memberAvatarTxt}>{m.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{m.name}</Text>
            <View style={[styles.memberRolePill, m.role === 'Fondatrice' ? styles.roleFounder : m.role === 'Administrateur' ? styles.roleAdmin : m.role === 'Bénévole' ? styles.roleVolunteer : styles.roleMember]}>
              <Text style={[styles.memberRoleTxt, m.role === 'Fondatrice' ? styles.roleFounderTxt : m.role === 'Administrateur' ? styles.roleAdminTxt : m.role === 'Bénévole' ? styles.roleVolunteerTxt : styles.roleMemberTxt]}>
                {m.role}
              </Text>
            </View>
          </View>
          <Text style={styles.memberEvents}>{m.events} événements</Text>
        </View>
      ))}
      {!isOwner ? (
        <Pressable style={styles.becomeBtn} onPress={onBecome}>
          <Text style={styles.becomeTxt}>Devenir bénévole</Text>
        </Pressable>
      ) : null}
    </View>
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

  sheetPad: { padding: 20, paddingBottom: 32 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 14 },
  sheetHint: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginBottom: 12 },
  fieldLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark, marginBottom: 8 },
  fieldInput: { borderRadius: 12, borderWidth: 1, borderColor: Colors.grayBorder, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, marginBottom: 14 },
  sheetInput: { minHeight: 120, borderRadius: 12, borderWidth: 1, borderColor: Colors.grayBorder, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, textAlignVertical: 'top', marginBottom: 16 },
  sheetPrimary: { backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  sheetPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },

  horaireRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.grayBorder },
  horaireDay: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark },
  horaireHours: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },

  amountChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: Colors.grayBorder, backgroundColor: Colors.white },
  amountChipOn: { backgroundColor: BRAND, borderColor: BRAND },
  amountChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark },
  amountChipTxtOn: { color: Colors.white },

  actionCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.white, ...Shadows.card },
  actionImgWrap: { height: 180, backgroundColor: Colors.grayLight },
  actionImg: { width: '100%', height: '100%' },
  actionGrad: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  actionOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14 },
  actionCat: { alignSelf: 'flex-start', backgroundColor: 'rgba(217,119,6,0.85)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 10 },
  actionCatTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: Colors.white },
  actionTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.white },
  actionBody: { padding: 14 },
  actionMeta: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  actionImpact: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.textBody, lineHeight: 20 },
  actionOwnerHint: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  assoEventCard: { borderRadius: 20, overflow: 'hidden', height: 260, backgroundColor: Colors.grayLight },
  assoEventImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  assoEventGrad: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  assoEventPrice: { position: 'absolute', top: 12, right: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  assoEventPriceTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  assoEventOwnerBtns: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  assoEventOwnerBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  assoEventOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  assoEventTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  assoEventMeta: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  assoEventBottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  assoEventCap: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  assoCapTrack: { marginTop: 6, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' },
  assoCapFill: { height: 4, backgroundColor: Colors.white, borderRadius: 999 },
  assoJoinBtn: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: BRAND },
  assoJoinBtnOn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  assoJoinTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },

  memberStats: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 12 },
  memberStatsTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  memberCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, ...Shadows.card },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  memberAvatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  memberName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  memberRolePill: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  memberRoleTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11 },
  memberEvents: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  roleFounder: { backgroundColor: 'rgba(220,38,38,0.1)' },
  roleFounderTxt: { color: '#DC2626' },
  roleAdmin: { backgroundColor: 'rgba(217,119,6,0.1)' },
  roleAdminTxt: { color: '#D97706' },
  roleVolunteer: { backgroundColor: 'rgba(42,47,255,0.1)' },
  roleVolunteerTxt: { color: BRAND },
  roleMember: { backgroundColor: '#F3F4F6' },
  roleMemberTxt: { color: '#6B7280' },
  becomeBtn: { marginTop: 6, backgroundColor: BRAND, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  becomeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },

  emptyPosts: { paddingVertical: 40, alignItems: 'center' },
  emptyPostsTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
});

