import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PostCard } from '@/components/PostCard';
import type { ProfileViewModel } from '@/components/profile/profileUtils';
import type { FeedPost } from '@/constants/mockPosts';
import {
  MOCK_FREELANCE_PROFILE,
  MOCK_FREELANCE_PROJECTS,
  type FreelanceProject,
  type FreelanceReview,
  type FreelanceService,
} from '@/constants/mockFreelanceProfile';
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

type MiniTab = 'portfolio' | 'services' | 'reviews' | 'posts';

const MINI_TABS: { id: MiniTab; label: string }[] = [
  { id: 'portfolio', label: '🎨 Portfolio' },
  { id: 'services', label: '💼 Services' },
  { id: 'reviews', label: '⭐ Avis' },
  { id: 'posts', label: '📝 Posts' },
];

const REVIEW_DIST_PCT = [78, 15, 5, 1, 1];
const BRAND = '#2A2FFF';

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

export function FreelanceProfile({
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

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const width = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const free = useMemo(() => MOCK_FREELANCE_PROFILE, []);

  const [tab, setTab] = useState<MiniTab>('portfolio');
  const [photos] = useState<string[]>(() => [...free.photos]);
  const [projects] = useState<FreelanceProject[]>(() => [...MOCK_FREELANCE_PROJECTS]);
  const [selectedProject, setSelectedProject] = useState<FreelanceProject | null>(null);

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [helpful, setHelpful] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<FreelanceReview[]>(() => [...free.reviews]);

  const contactSheetRef = useRef<BottomSheetModal>(null);
  const slotsSheetRef = useRef<BottomSheetModal>(null);
  const reviewSheetRef = useRef<BottomSheetModal>(null);
  const devisSheetRef = useRef<BottomSheetModal>(null);
  const projectSheetRef = useRef<BottomSheetModal>(null);

  const [contactMsg, setContactMsg] = useState('');
  const [devisName, setDevisName] = useState('');
  const [devisEmail, setDevisEmail] = useState('');
  const [devisDesc, setDevisDesc] = useState('');
  const [devisBudget, setDevisBudget] = useState('');

  const snap55 = useMemo(() => ['55%'], []);
  const snap60 = useMemo(() => ['60%'], []);
  const snap75 = useMemo(() => ['75%'], []);
  const snap90 = useMemo(() => ['90%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const establishmentPosts = useMemo(() => posts.filter((p) => p.authorId === profile.id), [posts, profile.id]);

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
      `Découvrez ${free.name} sur Yunicity !\n` +
      `${free.specialty} · ${free.address}\n` +
      `⭐ ${free.rating}/5 · ${free.reviewCount} avis`;
    try {
      await Share.share({ message, title: free.name });
    } catch {
      Alert.alert('Partager', message);
    }
  }, [free.address, free.name, free.rating, free.reviewCount, free.specialty]);

  const handleMenu = useCallback(() => {
    const shareShort = () => {
      void (async () => {
        try {
          await Share.share({ message: `${free.name} · ${free.specialty}` });
        } catch {
          Alert.alert('Partager', `${free.name} · ${free.specialty}`);
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
  }, [free.name, free.specialty]);

  const publishReview = useCallback(() => {
    const text = reviewText.trim();
    if (!text) {
      Alert.alert('Avis', 'Écris un court commentaire.');
      return;
    }
    const nr: FreelanceReview = {
      id: `r-${Date.now()}`,
      author: 'Vous',
      rating: reviewStars,
      date: 'À l’instant',
      comment: text,
      avatar: 'VO',
      color: BRAND,
    };
    setReviews((prev) => [nr, ...prev]);
    setReviewText('');
    reviewSheetRef.current?.dismiss();
    Alert.alert('Merci !', 'Votre avis a été publié (mock).');
  }, [reviewStars, reviewText]);

  const heroBottomPad = 16;
  const available = free.available;
  const statusLabel = available ? 'Disponible pour nouveaux projets' : 'Indisponible pour le moment';

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
            <Image source={{ uri: free.coverUrl }} style={styles.heroImage} resizeMode="cover" />
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
                <Text style={styles.catPillTxt}>🎨 Design & Créa</Text>
              </View>
              <Text style={styles.heroName}>{free.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#FBBF24" />
                <Text style={styles.ratingVal}>{free.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>{free.reviewCount} avis</Text>
                <Text style={styles.ratingCount}>· 23 projets</Text>
              </View>
              <View style={styles.dispoRow}>
                <View style={[styles.dispoPill, available ? styles.dispoPillOn : styles.dispoPillOff]}>
                  <Text style={styles.dispoPillTxt}>{available ? '🟢 Disponible' : '🔴 Indisponible'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quickBar}>
            <QuickAction icon="chatbubble-outline" label="Contacter" onPress={() => contactSheetRef.current?.present()} />
            <QuickAction icon="calendar-outline" label="Réserver" onPress={() => slotsSheetRef.current?.present()} />
            <QuickAction icon="map-outline" label="Itinéraire" onPress={() => router.push('/(app)/(tabs)/map')} />
            <QuickAction icon="star-outline" label="Avis" onPress={() => reviewSheetRef.current?.present()} />
            <QuickAction icon="share-outline" label="Partager" onPress={handleShareHero} />
          </View>

          <Pressable onPress={() => slotsSheetRef.current?.present()} style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: available ? '#16A34A' : '#DC2626' }]} />
            <Text style={styles.statusTxt} numberOfLines={2}>
              {statusLabel}
            </Text>
            <Text style={[styles.statusLink, { color: BRAND }]}>Voir les créneaux ›</Text>
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
          {tab === 'portfolio' ? (
            <PortfolioTab
              projects={projects}
              width={width}
              onOpen={(p) => {
                setSelectedProject(p);
                projectSheetRef.current?.present();
              }}
            />
          ) : null}
          {tab === 'services' ? (
            <ServicesTab
              services={free.services}
              isOwner={isOwner}
              onDevis={() => {
                setDevisName('');
                setDevisEmail('');
                setDevisDesc('');
                setDevisBudget('');
                devisSheetRef.current?.present();
              }}
            />
          ) : null}
          {tab === 'reviews' ? (
            <ReviewsTab
              rating={free.rating}
              reviewCount={free.reviewCount}
              reviews={reviews}
              helpful={helpful}
              onHelpful={(id) => setHelpful((h) => ({ ...h, [id]: (h[id] ?? 0) + 1 }))}
              onWrite={() => reviewSheetRef.current?.present()}
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
            placeholder="Votre message au freelance…"
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

      <BottomSheetModal ref={slotsSheetRef} snapPoints={snap55} enablePanDownToClose backdropComponent={renderBackdrop}>
        <View style={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Créneaux disponibles</Text>
          <BottomSheetFlatList
            data={free.slots}
            keyExtractor={(item) => `${item.day}-${item.hours}`}
            renderItem={({ item }) => (
              <View style={[styles.horaireRow, !item.available && styles.horaireToday]}>
                <Text style={[styles.horaireDay, !item.available && styles.horaireDayToday]}>{item.day}</Text>
                <Text style={[styles.horaireHours, !item.available && styles.horaireHoursToday]}>
                  {item.hours} {item.available ? '' : '· Réservé'}
                </Text>
              </View>
            )}
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

      <BottomSheetModal
        ref={devisSheetRef}
        snapPoints={snap75}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Demande de devis</Text>
          <Text style={styles.fieldLbl}>Nom</Text>
          <BottomSheetTextInput style={styles.fieldInput} value={devisName} onChangeText={setDevisName} />
          <Text style={styles.fieldLbl}>Email</Text>
          <BottomSheetTextInput
            style={styles.fieldInput}
            value={devisEmail}
            onChangeText={setDevisEmail}
            autoCapitalize="none"
          />
          <Text style={styles.fieldLbl}>Description</Text>
          <BottomSheetTextInput
            style={[styles.sheetInput, { minHeight: 110 }]}
            placeholder="Décrivez votre besoin…"
            placeholderTextColor={Colors.textMuted}
            multiline
            value={devisDesc}
            onChangeText={setDevisDesc}
          />
          <Text style={styles.fieldLbl}>Budget</Text>
          <BottomSheetTextInput
            style={styles.fieldInput}
            value={devisBudget}
            onChangeText={setDevisBudget}
            placeholder="ex: 800€"
          />
          <Pressable
            style={styles.sheetPrimary}
            onPress={() => {
              if (!devisName.trim() || !devisEmail.trim() || !devisDesc.trim()) {
                Alert.alert('Devis', 'Nom, email et description sont requis.');
                return;
              }
              devisSheetRef.current?.dismiss();
              Alert.alert('Demande envoyée !', 'Marie vous répondra sous 48h ✓');
            }}
          >
            <Text style={styles.sheetPrimaryTxt}>Envoyer</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal ref={projectSheetRef} snapPoints={snap90} enablePanDownToClose backdropComponent={renderBackdrop}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          {selectedProject ? (
            <>
              <Image source={{ uri: selectedProject.imageUrl }} style={styles.projHero} resizeMode="cover" />
              <Text style={styles.projTitle}>{selectedProject.title}</Text>
              <Text style={styles.projMeta}>
                {selectedProject.category} · {selectedProject.client} · {selectedProject.year}
              </Text>
              <Text style={styles.projDesc}>{selectedProject.description}</Text>
              <View style={styles.projTags}>
                {selectedProject.tags.map((t) => (
                  <View key={t} style={styles.projTag}>
                    <Text style={styles.projTagTxt}>{t}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => openGallery(0)} style={styles.openGalleryBtn}>
                <Text style={styles.openGalleryTxt}>Voir la galerie →</Text>
              </Pressable>
            </>
          ) : null}
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

function PortfolioTab({
  projects,
  width,
  onOpen,
}: {
  projects: FreelanceProject[];
  width: number;
  onOpen: (p: FreelanceProject) => void;
}) {
  const cardW = width - 40;
  const gap = 12;
  const snapTo = cardW + gap;
  const [page, setPage] = useState(0);

  return (
    <View>
      <FlatList
        data={projects}
        horizontal
        pagingEnabled
        snapToInterval={snapTo}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / snapTo);
          setPage(Math.max(0, Math.min(projects.length - 1, idx)));
        }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onOpen(item)}
            style={[
              styles.portfolioCard,
              { width: cardW, marginRight: index === projects.length - 1 ? 0 : gap },
            ]}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.portfolioImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.portfolioGrad} />
            <View style={styles.portfolioOverlay}>
              <View style={[styles.portfolioPill, { backgroundColor: BRAND }]}>
                <Text style={styles.portfolioPillTxt}>{item.category}</Text>
              </View>
              <Text style={styles.portfolioTitle}>{item.title}</Text>
              <Text style={styles.portfolioMeta}>
                {item.client} · {item.year}
              </Text>
              <View style={styles.portfolioTags}>
                {item.tags.slice(0, 4).map((t) => (
                  <View key={t} style={styles.portfolioTag}>
                    <Text style={styles.portfolioTagTxt}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        )}
        style={{ height: 260 }}
      />
      <View style={styles.dotsRow}>
        {projects.map((p, i) => (
          <View key={p.id} style={[styles.dot, i === page ? styles.dotOn : styles.dotOff]} />
        ))}
      </View>
    </View>
  );
}

function ServicesTab({
  services,
  isOwner,
  onDevis,
}: {
  services: FreelanceService[];
  isOwner: boolean;
  onDevis: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {services.map((s) => (
        <View key={s.id} style={styles.serviceCard}>
          <Text style={styles.serviceTitle}>{s.title}</Text>
          <Text style={styles.serviceDesc} numberOfLines={2}>
            {s.desc}
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePrice}>
              {s.price}€ <Text style={styles.serviceUnit}>/{s.unit}</Text>
            </Text>
            {!isOwner ? (
              <Pressable style={styles.devisBtn} onPress={onDevis}>
                <Text style={styles.devisBtnTxt}>Demander un devis</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function ReviewsTab({
  rating,
  reviewCount,
  reviews,
  helpful,
  onHelpful,
  onWrite,
}: {
  rating: number;
  reviewCount: number;
  reviews: FreelanceReview[];
  helpful: Record<string, number>;
  onHelpful: (id: string) => void;
  onWrite: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.reviewSummary}>
        <Text style={styles.reviewBig}>{rating.toFixed(1)}</Text>
        <View style={styles.reviewSummaryCol}>
          <View style={styles.reviewStarsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={18} color="#F59E0B" />
            ))}
          </View>
          <Text style={styles.reviewExcellent}>Excellent</Text>
          <Text style={styles.reviewSubCount}>({reviewCount} avis)</Text>
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
            <Text style={styles.helpfulTxt}>Utile ? 👍 {helpful[r.id] ?? 0}</Text>
          </Pressable>
        </View>
      ))}
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
  heroTopRight: { flexDirection: 'row', gap: 10 },
  glassOuter: { borderRadius: 20, overflow: 'hidden' },
  glassFill: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  catPill: { alignSelf: 'flex-start', backgroundColor: BRAND, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 10 },
  catPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  heroName: { fontFamily: Fonts.title.family, fontSize: 28, color: Colors.white, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  ratingVal: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  ratingCount: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  dispoRow: { flexDirection: 'row' },
  dispoPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  dispoPillOn: { backgroundColor: 'rgba(22,163,74,0.8)' },
  dispoPillOff: { backgroundColor: 'rgba(220,38,38,0.8)' },
  dispoPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
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
  portfolioCard: { height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.grayLight },
  portfolioImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  portfolioGrad: { ...StyleSheet.absoluteFillObject },
  portfolioOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  portfolioPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 10 },
  portfolioPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  portfolioTitle: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  portfolioMeta: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  portfolioTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  portfolioTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  portfolioTagTxt: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.white },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: BRAND },
  dotOff: { backgroundColor: '#D1D5DB' },
  serviceCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.white, ...Shadows.card, padding: 14 },
  serviceTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },
  serviceDesc: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  serviceFooter: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  servicePrice: { fontFamily: Fonts.title.family, fontSize: 20, color: BRAND, fontWeight: '800' },
  serviceUnit: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, fontWeight: '400' },
  devisBtn: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  devisBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: BRAND },
  reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  reviewBig: { fontFamily: Fonts.title.family, fontSize: 56, color: Colors.dark, fontWeight: '800' },
  reviewSummaryCol: { gap: 4 },
  reviewStarsRow: { flexDirection: 'row', gap: 2 },
  reviewStarsRowSmall: { flexDirection: 'row', gap: 2, marginTop: 6 },
  reviewExcellent: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  reviewSubCount: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  distLbl: { width: 28, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  distTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F3F4F6', overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 3, backgroundColor: '#F59E0B' },
  distPct: { width: 36, textAlign: 'right', fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  writeReviewBtn: { marginTop: 16, backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  writeReviewTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  reviewCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, marginBottom: 12, ...Shadows.card },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 13, color: Colors.white },
  reviewAuthor: { flex: 1, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  reviewDate: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  reviewComment: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.textBody, lineHeight: 21 },
  helpfulRow: { marginTop: 10 },
  helpfulTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  emptyPosts: { paddingVertical: 40, alignItems: 'center' },
  emptyPostsTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  sheetPad: { padding: 20, paddingBottom: 32 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 14 },
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
  fieldLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.gray, marginBottom: 6 },
  fieldInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    padding: 12,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 12,
  },
  sheetPrimary: { backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  sheetPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  horaireRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.grayBorder },
  horaireToday: { backgroundColor: '#EEF2FF', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8, borderBottomWidth: 0 },
  horaireDay: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark },
  horaireDayToday: { fontFamily: Fonts.bodySemi.family, color: BRAND, fontWeight: '600' },
  horaireHours: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray },
  horaireHoursToday: { fontFamily: Fonts.bodySemi.family, color: BRAND, fontWeight: '600' },
  starsPick: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  projHero: { width: '100%', height: 220, borderRadius: 12, backgroundColor: Colors.grayLight, marginBottom: 12 },
  projTitle: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.dark },
  projMeta: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6 },
  projDesc: { fontFamily: Fonts.body.family, fontSize: 15, color: Colors.textBody, marginTop: 12, lineHeight: 22 },
  projTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  projTag: { backgroundColor: 'rgba(42,47,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  projTagTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: BRAND },
  openGalleryBtn: { marginTop: 16, alignItems: 'center' },
  openGalleryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: BRAND },
});

