import { forwardRef, useCallback, useMemo, useRef, useState, type ReactElement } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import {
  MOCK_ALUMNI,
  MOCK_ECOLE,
  MOCK_ECOLE_EVENTS,
  MOCK_FORMATIONS,
  MOCK_PARTNERS_ECOLE,
} from '@/constants/mockEcoleProfile';

type TabKey = 'etablissement' | 'formations' | 'events' | 'impact';

type FormationRow = {
  id: string;
  title: string;
  level: string;
  duration: string;
  capacity: number;
  enrolled: number;
  description: string;
  imageUrl: string;
  imageUri?: string | null;
  price: string;
  diploma: string;
  tags: readonly string[];
  openForInscription: boolean;
};

type EcoleEventRow = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  imageUri?: string | null;
  attendees: number;
  maxAttendees: number;
  price: string;
  description: string;
  type: 'portes_ouvertes' | 'exposition' | 'masterclass' | string;
  isJoined?: boolean;
};

type AlumniRow = {
  id: string;
  name: string;
  promo: string;
  job: string;
  company: string;
  imageUrl: string | null;
  initials: string;
  color: string;
};
type PartnerRow = { id: string; name: string; type: string; logo: string; color: string; since: string };

const HEADER_BG = '#0D0F2E';
const BRAND = '#DC2626';
const YUNI_BLUE = '#2A2FFF';

type SheetBackdrop = (p: BottomSheetBackdropProps) => ReactElement;

export function EcoleDashboard() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.profileType === 'ecole';

  const ecole = MOCK_ECOLE;

  const [tab, setTab] = useState<TabKey>('etablissement');
  const [formations, setFormations] = useState<FormationRow[]>(() =>
    MOCK_FORMATIONS.map((f) => ({ ...f, tags: [...f.tags] } as unknown as FormationRow)),
  );
  const [events, setEvents] = useState<EcoleEventRow[]>(() => MOCK_ECOLE_EVENTS.map((e) => ({ ...e, isJoined: false } as EcoleEventRow)));
  const [partners, setPartners] = useState<PartnerRow[]>(() => MOCK_PARTNERS_ECOLE.map((p) => ({ ...p } as PartnerRow)));

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const photos = useMemo(
    () => [
      'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?w=400',
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
      'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=400',
      'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?w=400',
      'https://images.pexels.com/photos/1458457/pexels-photo-1458457.jpeg?w=400',
      'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?w=400',
    ],
    [],
  );

  const openGallery = useCallback(
    (idx: number) => {
      if (!photos.length) return;
      setGalleryIndex(idx);
      setShowGallery(true);
    },
    [photos.length],
  );

  const yuniRef = useRef<BottomSheetModal>(null);
  const addFormationRef = useRef<BottomSheetModal>(null);
  const inscriptionRef = useRef<BottomSheetModal>(null);
  const createEventRef = useRef<BottomSheetModal>(null);
  const addPartnerRef = useRef<BottomSheetModal>(null);

  const [selectedFormation, setSelectedFormation] = useState<FormationRow | null>(null);
  const [inscriptionLevel, setInscriptionLevel] = useState<'Bac' | 'Bac+1' | 'Bac+2' | 'Autre'>('Bac');
  const [inscFirst, setInscFirst] = useState('');
  const [inscLast, setInscLast] = useState('');
  const [inscEmail, setInscEmail] = useState('');
  const [inscPhone, setInscPhone] = useState('');
  const [inscMotiv, setInscMotiv] = useState('');

  const snap55 = useMemo(() => ['55%'], []);
  const snap75 = useMemo(() => ['75%'], []);
  const snap90 = useMemo(() => ['90%'], []);
  const snap60 = useMemo(() => ['60%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
    ),
    [],
  );

  const shareSchool = useCallback(async () => {
    const message =
      `Découvrez ${ecole.name} sur Yunicity !\n` +
      `${ecole.type} · ${ecole.address}\n` +
      `🎓 ${ecole.studentCount} étudiants · 👨‍🏫 ${ecole.teacherCount} enseignants · 📜 ${ecole.accreditation}`;
    try {
      await Share.share({ message, title: ecole.name });
    } catch {
      Alert.alert('Partager', message);
    }
  }, [ecole.accreditation, ecole.address, ecole.name, ecole.studentCount, ecole.teacherCount, ecole.type]);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName}>{ecole.name}</Text>
              <Text style={styles.headerType}>{ecole.type}</Text>
              <Text style={styles.headerLoc}>📍 Rue des Arts · Reims</Text>
            </View>
            <View>
              <View style={[styles.avatar, { backgroundColor: ecole.avatarColor }]}>
                <Text style={styles.avatarTxt}>{ecole.initials}</Text>
              </View>
              {ecole.verified ? (
                <View style={styles.verBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={styles.hPill}>
              <Text style={styles.hPillTxt}>🎓 {ecole.studentCount} étudiants</Text>
            </View>
            <View style={styles.hPill}>
              <Text style={styles.hPillTxt}>👨‍🏫 {ecole.teacherCount} enseignants</Text>
            </View>
            <View style={styles.rncpPill}>
              <Text style={styles.rncpPillTxt}>📜 RNCP Niv.6</Text>
            </View>
          </View>

          <View style={styles.statsBar}>
            <Text style={styles.statsMain}>
              {ecole.insertionRate}% d'insertion · {ecole.diplomaCount} diplômés · Depuis {ecole.founded}
            </Text>
            <Text style={styles.statsSub}>Résultats & accréditation</Text>
          </View>
        </SafeAreaView>

        <View style={[styles.yuniCard, { backgroundColor: YUNI_BLUE }]}>
          <Text style={styles.yuniTitle}>✨ Yuni AI</Text>
          <Text style={styles.yuniSub}>2 opportunités de partenariat local</Text>
          <TouchableOpacity style={styles.yuniCta} onPress={() => yuniRef.current?.present()} activeOpacity={0.9}>
            <Text style={styles.yuniCtaTxt}>Voir les suggestions →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            {(
              [
                ['etablissement', '🏫 Établissement'],
                ['formations', '📚 Formations'],
                ['events', '📅 Événements'],
                ['impact', '🌍 Impact'],
              ] as const
            ).map(([id, label]) => (
              <Pressable key={id} onPress={() => setTab(id)} style={[styles.tabBtn, tab === id && styles.tabBtnOn]}>
                <Text style={[styles.tabTxt, tab === id && styles.tabTxtOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {tab === 'etablissement' ? (
          <EtablissementTab ecole={ecole} photos={photos} onOpenGallery={openGallery} onShare={shareSchool} onGoMap={() => router.push('/(app)/(tabs)/map')} />
        ) : null}

        {tab === 'formations' ? (
          <FormationsTab
            formations={formations}
            isOwner={isOwner}
            onAdd={() => addFormationRef.current?.present()}
            onApply={(f) => {
              setSelectedFormation(f);
              inscriptionRef.current?.present();
            }}
            onWaitlist={() => Alert.alert('Liste d’attente', 'Vous avez été ajouté à la liste d’attente (mock).')}
          />
        ) : null}

        {tab === 'events' ? (
          <EventsTab
            events={events}
            setEvents={setEvents}
            isOwner={isOwner}
            onCreate={() => createEventRef.current?.present()}
          />
        ) : null}

        {tab === 'impact' ? (
          <ImpactTab
            ecole={ecole}
            alumni={MOCK_ALUMNI.map((a) => ({ ...a } as AlumniRow))}
            partners={partners}
            setPartners={setPartners}
            isOwner={isOwner}
            onAddPartner={() => addPartnerRef.current?.present()}
          />
        ) : null}
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
            getItemLayout={(_, index) => ({ length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index })}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width))}
            renderItem={({ item }) => (
              <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }} resizeMode="contain" />
              </View>
            )}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>

      <YuniEcoleSheet ref={yuniRef} snap={snap60} renderBackdrop={renderBackdrop} onClose={() => yuniRef.current?.dismiss()} onOpenAddEvent={() => createEventRef.current?.present()} />

      <AddFormationSheet
        ref={addFormationRef}
        snap={snap90}
        renderBackdrop={renderBackdrop}
        onAdd={(f) => {
          setFormations((prev) => [{ ...f, id: `f-${Date.now()}` }, ...prev]);
          addFormationRef.current?.dismiss();
        }}
      />

      <InscriptionSheet
        ref={inscriptionRef}
        snap={snap75}
        renderBackdrop={renderBackdrop}
        formation={selectedFormation}
        level={inscriptionLevel}
        setLevel={setInscriptionLevel}
        first={inscFirst}
        setFirst={setInscFirst}
        last={inscLast}
        setLast={setInscLast}
        email={inscEmail}
        setEmail={setInscEmail}
        phone={inscPhone}
        setPhone={setInscPhone}
        motiv={inscMotiv}
        setMotiv={setInscMotiv}
        onSubmit={() => {
          inscriptionRef.current?.dismiss();
          Alert.alert('Candidature envoyée !', 'Réponse sous 5 jours ouvrés ✓');
          setInscFirst('');
          setInscLast('');
          setInscEmail('');
          setInscPhone('');
          setInscMotiv('');
          setInscriptionLevel('Bac');
        }}
      />

      <CreateEcoleEventSheet
        ref={createEventRef}
        snap={snap90}
        renderBackdrop={renderBackdrop}
        onPublish={(ev) => {
          setEvents((prev) => [{ ...ev, id: `ev-${Date.now()}` }, ...prev]);
          createEventRef.current?.dismiss();
        }}
      />

      <AddPartnerSheet
        ref={addPartnerRef}
        snap={snap55}
        renderBackdrop={renderBackdrop}
        onAdd={(p) => {
          setPartners((prev) => [{ ...p, id: `p-${Date.now()}` }, ...prev]);
          addPartnerRef.current?.dismiss();
        }}
      />
    </View>
  );
}

function EtablissementTab({
  ecole,
  photos,
  onOpenGallery,
  onShare,
  onGoMap,
}: {
  ecole: typeof MOCK_ECOLE;
  photos: string[];
  onOpenGallery: (i: number) => void;
  onShare: () => void;
  onGoMap: () => void;
}) {
  const openSite = () => void Linking.openURL(`https://${ecole.website.replace(/^https?:\/\//, '')}`);
  const openTel = () => void Linking.openURL(`tel:${ecole.phone.replace(/\s+/g, '')}`);

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        {[
          ['📜 Accréditation', ecole.accreditation],
          ['🏛️ UAI', ecole.uai],
          ['📅 Fondée en', ecole.founded],
        ].map(([k, v]) => (
          <View key={k} style={styles.idRow}>
            <Text style={styles.idKey}>{k}</Text>
            <Text style={styles.idVal}>{v}</Text>
          </View>
        ))}

        <Pressable style={styles.idRow} onPress={openSite}>
          <Text style={styles.idKey}>🌐 Site web</Text>
          <Text style={[styles.idVal, styles.link]}>{ecole.website}</Text>
        </Pressable>
        <Pressable style={styles.idRow} onPress={openTel}>
          <Text style={styles.idKey}>📞 Téléphone</Text>
          <Text style={[styles.idVal, styles.link]}>{ecole.phone}</Text>
        </Pressable>
        <Pressable style={styles.idRow} onPress={onGoMap}>
          <Text style={styles.idKey}>📍 Adresse</Text>
          <Text style={[styles.idVal, styles.link]}>{ecole.address}</Text>
        </Pressable>

        <View style={{ height: 12 }} />
        <TouchableOpacity activeOpacity={0.9} style={styles.smallPrimary} onPress={onShare} delayPressIn={0}>
          <Text style={styles.smallPrimaryTxt}>📤 Partager</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Présentation</Text>
      <Text style={styles.bodyText}>{ecole.description}</Text>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Chiffres clés</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRail}>
        {[
          [`${ecole.studentCount}`, 'étudiants'],
          [`${ecole.teacherCount}`, 'enseignants'],
          [`${ecole.insertionRate}%`, "d'insertion"],
          [`${ecole.diplomaCount}`, 'diplômés'],
        ].map(([v, l]) => (
          <View key={l} style={styles.kpiCardSquare}>
            <Text style={styles.kpiVal}>{v}</Text>
            <Text style={styles.kpiLbl}>{l}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Galerie photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 10 }}>
        {photos.slice(0, 3).map((p, i) => (
          <Pressable key={p} onPress={() => onOpenGallery(i)} style={styles.photoThumb}>
            <Image source={{ uri: p }} style={styles.photoThumbImg} resizeMode="cover" />
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => onOpenGallery(0)} style={{ alignSelf: 'flex-start' }}>
        <Text style={styles.link}>Voir toutes les photos →</Text>
      </Pressable>
    </View>
  );
}

function FormationsTab({
  formations,
  isOwner,
  onAdd,
  onApply,
  onWaitlist,
}: {
  formations: FormationRow[];
  isOwner: boolean;
  onAdd: () => void;
  onApply: (f: FormationRow) => void;
  onWaitlist: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Nos formations 📚</Text>
        {isOwner ? (
          <Pressable style={styles.btnBrandSm} onPress={onAdd}>
            <Text style={styles.btnBrandSmTxt}>+ Ajouter</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ height: 12 }} />
      {formations.map((f) => {
        const isOpen = !!f.openForInscription;
        const ratio = Math.min(1, f.enrolled / Math.max(1, f.capacity));
        return (
          <View key={f.id} style={styles.formationCard}>
            <View style={styles.formationImgWrap}>
              <Image source={{ uri: f.imageUri ?? f.imageUrl }} style={styles.formationImg} resizeMode="cover" />
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
                {f.tags.map((t) => (
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

              <Pressable
                style={[styles.formationCta, isOpen ? styles.formationCtaOn : styles.formationCtaOff]}
                onPress={() => (isOpen ? onApply(f) : onWaitlist())}
              >
                <Text style={styles.formationCtaTxt}>{isOpen ? "S'inscrire →" : "Liste d'attente"}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function EventsTab({
  events,
  setEvents,
  isOwner,
  onCreate,
}: {
  events: EcoleEventRow[];
  setEvents: React.Dispatch<React.SetStateAction<EcoleEventRow[]>>;
  isOwner: boolean;
  onCreate: () => void;
}) {
  const [filter, setFilter] = useState<'Tous' | 'Portes ouvertes' | 'Expositions' | 'Masterclasses'>('Tous');
  const filtered = useMemo(() => {
    if (filter === 'Tous') return events;
    if (filter === 'Portes ouvertes') return events.filter((e) => e.type === 'portes_ouvertes');
    if (filter === 'Expositions') return events.filter((e) => e.type === 'exposition');
    return events.filter((e) => e.type === 'masterclass');
  }, [events, filter]);

  const typePill = (t: string) => {
    if (t === 'portes_ouvertes') return { label: '🏫 Portes ouvertes', bg: '#2A2FFF' };
    if (t === 'exposition') return { label: '🎨 Exposition', bg: '#7C3AED' };
    return { label: '⭐ Masterclass', bg: '#D97706' };
  };

  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Agenda 📅</Text>
        {isOwner ? (
          <Pressable style={styles.btnBrandSm} onPress={onCreate}>
            <Text style={styles.btnBrandSmTxt}>+ Créer</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8 }}>
        {(['Tous', 'Portes ouvertes', 'Expositions', 'Masterclasses'] as const).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillOn]}>
            <Text style={[styles.filterPillTxt, filter === f && styles.filterPillTxtOn]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.map((ev) => {
        const isFree = ev.price.toLowerCase().includes('gratuit');
        const ratio = Math.min(1, ev.attendees / ev.maxAttendees);
        const pill = typePill(ev.type);
        return (
          <View key={ev.id} style={styles.eventCard}>
            <Image source={{ uri: ev.imageUri ?? ev.imageUrl }} style={styles.eventImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.eventGrad} />

            <View style={[styles.eventTypePill, { backgroundColor: pill.bg }]}>
              <Text style={styles.eventTypeTxt}>{pill.label}</Text>
            </View>

            <View style={[styles.eventPricePill, { backgroundColor: isFree ? '#16A34A' : BRAND }]}>
              <Text style={styles.eventPriceTxt}>{isFree ? 'Gratuit' : ev.price}</Text>
            </View>

            {isOwner ? (
              <View style={styles.eventOwnerBtns}>
                {['✏️', '🗑️'].map((t) => (
                  <Pressable
                    key={t}
                    style={styles.eventOwnerBtn}
                    onPress={() => {
                      if (t === '🗑️') {
                        Alert.alert('Supprimer', 'Retirer cet événement ?', [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Supprimer', style: 'destructive', onPress: () => setEvents((p) => p.filter((x) => x.id !== ev.id)) },
                        ]);
                        return;
                      }
                      Alert.alert('Éditer', 'Édition événement (mock).');
                    }}
                  >
                    <Text style={{ color: Colors.white }}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

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
                  style={[styles.joinBtn, ev.isJoined ? styles.joinBtnOn : styles.joinBtnOff]}
                  onPress={() => {
                    setEvents((prev) => prev.map((x) => (x.id === ev.id ? { ...x, isJoined: !x.isJoined } : x)));
                    if (!ev.isJoined) Alert.alert('Inscription', 'Vous participez à cet événement ✓ (mock).');
                  }}
                >
                  <Text style={styles.joinBtnTxt}>{ev.isJoined ? '✓ Inscrit' : 'Je participe →'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ImpactTab({
  ecole,
  alumni,
  partners,
  setPartners,
  isOwner,
  onAddPartner,
}: {
  ecole: typeof MOCK_ECOLE;
  alumni: AlumniRow[];
  partners: PartnerRow[];
  setPartners: React.Dispatch<React.SetStateAction<PartnerRow[]>>;
  isOwner: boolean;
  onAddPartner: () => void;
}) {
  const pct = Math.max(0, Math.min(1, ecole.insertionRate / 100));
  return (
    <View style={styles.section}>
      <View style={styles.insertCard}>
        <Text style={styles.insertKicker}>TAUX D'INSERTION</Text>
        <Text style={styles.insertVal}>{ecole.insertionRate}%</Text>
        <Text style={styles.insertSub}>des diplômés en emploi dans les 6 mois</Text>
        <View style={styles.insertTrack}>
          <View style={[styles.insertFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      </View>

      <View style={[styles.rowBetween, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Nos anciens élèves 🎓</Text>
      </View>
      <View style={{ height: 12 }} />
      {alumni.map((a) => (
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
          <View style={styles.alumniBadge}>
            <Text style={styles.alumniBadgeTxt}>Alumni {ecole.initials}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.rowBetween, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Partenaires & débouchés 🤝</Text>
        {isOwner ? (
          <Pressable style={styles.btnBrandSm} onPress={onAddPartner}>
            <Text style={styles.btnBrandSmTxt}>+ Partenaire</Text>
          </Pressable>
        ) : null}
      </View>

      {partners.map((p) => (
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
          {isOwner ? (
            <Pressable
              onPress={() =>
                Alert.alert('Supprimer', 'Retirer ce partenaire ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => setPartners((prev) => prev.filter((x) => x.id !== p.id)) },
                ])
              }
            >
              <Ionicons name="trash-outline" size={18} color={Colors.gray} />
            </Pressable>
          ) : null}
        </View>
      ))}

      {isOwner ? (
        <View style={[styles.calloutRed, { marginTop: 16 }]}>
          <Text style={styles.calloutTitle}>Vous cherchez des talents ?</Text>
          <Text style={styles.calloutSub}>Collaborez avec nos étudiants pour des stages et projets</Text>
          <Pressable onPress={() => Alert.alert('Partenariat', 'Message envoyé ✓ (mock).')} style={styles.calloutBtn}>
            <Text style={styles.calloutBtnTxt}>Nous contacter</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const YuniEcoleSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onClose: () => void; onOpenAddEvent: () => void }
>(function YuniEcoleSheet({ snap, renderBackdrop, onClose, onOpenAddEvent }, ref) {
  const router = useRouter();
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Yuni AI — École</Text>
        <Pressable
          style={styles.yuniRecCard}
          onPress={() => Alert.alert('Partenariat', 'Belga Queen cherche un photographe étudiant (mock).')}
        >
          <Text style={styles.yuniRecTitle}>Belga Queen cherche un photographe étudiant</Text>
          <Text style={styles.yuniRecDesc}>Proposez des profils et un book étudiant.</Text>
          <Text style={styles.yuniRecLink}>Détails →</Text>
        </Pressable>
        <Pressable style={styles.yuniRecCard} onPress={onOpenAddEvent}>
          <Text style={styles.yuniRecTitle}>Publiez vos portes ouvertes pour +200 vues</Text>
          <Text style={styles.yuniRecDesc}>Les événements “Portes ouvertes” sont très consultés.</Text>
          <Text style={styles.yuniRecLink}>Créer un événement →</Text>
        </Pressable>
        <Pressable style={styles.yuniRecCard} onPress={() => router.push('/(app)/(tabs)/tribus')}>
          <Text style={styles.yuniRecTitle}>La Tribu Business cherche des collaborations école</Text>
          <Text style={styles.yuniRecDesc}>Visibilité locale et mises en relation.</Text>
          <Text style={styles.yuniRecLink}>Voir les tribus →</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.sheetDismiss}>
          <Text style={styles.sheetDismissTxt}>Fermer</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const InscriptionSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: SheetBackdrop;
    formation: FormationRow | null;
    level: 'Bac' | 'Bac+1' | 'Bac+2' | 'Autre';
    setLevel: (v: 'Bac' | 'Bac+1' | 'Bac+2' | 'Autre') => void;
    first: string;
    setFirst: (v: string) => void;
    last: string;
    setLast: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    phone: string;
    setPhone: (v: string) => void;
    motiv: string;
    setMotiv: (v: string) => void;
    onSubmit: () => void;
  }
>(function InscriptionSheet(
  { snap, renderBackdrop, formation, level, setLevel, first, setFirst, last, setLast, email, setEmail, phone, setPhone, motiv, setMotiv, onSubmit },
  ref,
) {
  const levels = ['Bac', 'Bac+1', 'Bac+2', 'Autre'] as const;
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>{formation ? formation.title : 'Inscription'}</Text>
        <Text style={styles.sheetHint}>Candidature — réponse sous 5 jours ouvrés.</Text>
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

const AddFormationSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onAdd: (f: Omit<FormationRow, 'id'>) => void }
>(function AddFormationSheet({ snap, renderBackdrop, onAdd }, ref) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Bac+3');
  const [duration, setDuration] = useState('3 ans');
  const [capacity, setCapacity] = useState('25');
  const [price, setPrice] = useState('6500€/an');
  const [diploma, setDiploma] = useState('Bachelor');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('Design, Digital');
  const [open, setOpen] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Image', 'Autorise l’accès à la photothèque.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!r.canceled && r.assets[0]?.uri) setImageUri(r.assets[0].uri);
  };

  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Ajouter une formation</Text>
        <Pressable style={styles.uploadZone} onPress={() => void pick()}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.uploadPreview} /> : (
            <>
              <Ionicons name="image-outline" size={40} color={Colors.gray} />
              <Text style={styles.uploadHint}>Image upload</Text>
            </>
          )}
        </Pressable>
        <Field label="Titre" value={title} onChangeText={setTitle} />
        <Field label="Niveau" value={level} onChangeText={setLevel} />
        <Field label="Durée" value={duration} onChangeText={setDuration} />
        <Field label="Capacité" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />
        <Field label="Prix" value={price} onChangeText={setPrice} />
        <Field label="Diplôme" value={diploma} onChangeText={setDiploma} />
        <Text style={styles.inputLbl}>Description</Text>
        <BottomSheetTextInput style={[styles.sheetInput, { minHeight: 100 }]} value={desc} onChangeText={setDesc} multiline />
        <Field label="Tags (séparés par ,)" value={tags} onChangeText={setTags} />
        <Pressable style={[styles.miniChip, open && styles.miniChipOn]} onPress={() => setOpen((v) => !v)}>
          <Text style={[styles.miniChipTxt, open && styles.miniChipTxtOn]}>{open ? '🟢 Inscriptions ouvertes' : '🔴 Complet'}</Text>
        </Pressable>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!title.trim()) {
              Alert.alert('Formation', 'Titre requis.');
              return;
            }
            onAdd({
              title: title.trim(),
              level: level.trim() || 'Bac+3',
              duration: duration.trim() || '—',
              capacity: Number(capacity) || 0,
              enrolled: 0,
              description: desc.trim() || '—',
              imageUrl: MOCK_FORMATIONS[0]!.imageUrl,
              imageUri,
              price: price.trim() || '—',
              diploma: diploma.trim() || '—',
              tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
              openForInscription: open,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Publier la formation</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const CreateEcoleEventSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onPublish: (e: Omit<EcoleEventRow, 'id'>) => void }
>(function CreateEcoleEventSheet({ snap, renderBackdrop, onPublish }, ref) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('Gratuit');
  const [max, setMax] = useState('100');
  const [type, setType] = useState<'portes_ouvertes' | 'exposition' | 'masterclass'>('portes_ouvertes');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Image', 'Autorise l’accès à la photothèque.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!r.canceled && r.assets[0]?.uri) setImageUri(r.assets[0].uri);
  };

  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Créer un événement</Text>
        <Pressable style={styles.uploadZone} onPress={() => void pick()}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.uploadPreview} /> : (
            <>
              <Ionicons name="image-outline" size={40} color={Colors.gray} />
              <Text style={styles.uploadHint}>Upload image couverture</Text>
            </>
          )}
        </Pressable>
        <Field label="Titre" value={title} onChangeText={setTitle} />
        <Field label="Date & heure" value={date} onChangeText={setDate} />
        <Field label="Lieu" value={location} onChangeText={setLocation} />
        <Text style={styles.inputLbl}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(
            [
              ['portes_ouvertes', '🏫 Portes ouvertes'],
              ['exposition', '🎨 Exposition'],
              ['masterclass', '⭐ Masterclass'],
            ] as const
          ).map(([k, lbl]) => (
            <Pressable key={k} onPress={() => setType(k)} style={[styles.miniChip, type === k && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, type === k && styles.miniChipTxtOn]}>{lbl}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Prix" value={price} onChangeText={setPrice} />
        <Field label="Capacité max" value={max} onChangeText={setMax} keyboardType="number-pad" />
        <Text style={styles.inputLbl}>Description</Text>
        <BottomSheetTextInput style={[styles.sheetInput, { minHeight: 90 }]} value={desc} onChangeText={setDesc} multiline />
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!title.trim()) {
              Alert.alert('Événement', 'Titre requis.');
              return;
            }
            onPublish({
              title: title.trim(),
              date: date.trim() || '—',
              location: location.trim() || 'École des Arts',
              imageUrl: MOCK_ECOLE_EVENTS[0]!.imageUrl,
              imageUri,
              attendees: 0,
              maxAttendees: Number(max) || 100,
              price: price.trim() || 'Gratuit',
              description: desc.trim() || '—',
              type,
              isJoined: false,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Publier l’événement 🚀</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const AddPartnerSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onAdd: (p: Omit<PartnerRow, 'id'>) => void }
>(function AddPartnerSheet({ snap, renderBackdrop, onAdd }, ref) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Stage & Emploi');
  const [since, setSince] = useState('2026');
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Ajouter un partenaire</Text>
        <Field label="Nom" value={name} onChangeText={setName} />
        <Field label="Type" value={type} onChangeText={setType} />
        <Field label="Depuis" value={since} onChangeText={setSince} keyboardType="number-pad" />
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!name.trim()) {
              Alert.alert('Partenaire', 'Nom requis.');
              return;
            }
            onAdd({ name: name.trim(), type: type.trim() || 'Partenaire', since: since.trim() || '2026', logo: '🤝', color: BRAND });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Ajouter</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <>
      <Text style={styles.inputLbl}>{label}</Text>
      <BottomSheetTextInput style={styles.sheetField} value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: HEADER_BG, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  headerName: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  headerType: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  headerLoc: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
  avatar: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  verBadge: { position: 'absolute', bottom: -4, right: -4 },
  pillsRow: { marginTop: 14, flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  hPill: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  hPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  rncpPill: { backgroundColor: 'rgba(220,38,38,0.30)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  rncpPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#FCA5A5' },
  statsBar: { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 },
  statsMain: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  statsSub: { fontFamily: Fonts.body.family, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  yuniCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20, ...Shadows.card },
  yuniTitle: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  yuniSub: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  yuniCta: { marginTop: 14, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  yuniCtaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },

  tabsWrap: { paddingHorizontal: 20, marginTop: 18 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 20, padding: 4, ...Shadows.card },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  tabBtnOn: { backgroundColor: BRAND, shadowColor: BRAND, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 6 },
  tabTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 12, color: Colors.gray },
  tabTxtOn: { color: Colors.white },

  section: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  bodyText: { fontFamily: Fonts.body.family, fontSize: 15, color: Colors.textBody, lineHeight: 24, marginTop: 10 },
  link: { fontFamily: Fonts.bodySemi.family, color: BRAND, fontSize: 13 },

  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Shadows.card },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.grayBorder },
  idKey: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  idVal: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark, maxWidth: '62%', textAlign: 'right' },
  smallPrimary: { marginTop: 4, backgroundColor: BRAND, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  smallPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },

  kpiRail: { paddingVertical: 10, gap: 10 },
  kpiCardSquare: {
    width: 112,
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  kpiVal: { fontFamily: Fonts.title.family, fontSize: 26, color: BRAND, fontWeight: '900' },
  kpiLbl: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 11, color: Colors.gray, textAlign: 'center' },

  photoThumb: { width: 130, height: 86, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.grayLight },
  photoThumbImg: { width: '100%', height: '100%' },

  btnBrandSm: { backgroundColor: BRAND, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  btnBrandSmTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },

  formationCard: { backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', ...Shadows.card, marginBottom: 14 },
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
  formationCta: { marginTop: 14, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  formationCtaOn: { backgroundColor: BRAND },
  formationCtaOff: { backgroundColor: '#6B7280' },
  formationCtaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },

  filterPill: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.grayBorder, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  filterPillOn: { backgroundColor: BRAND, borderColor: BRAND },
  filterPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.gray },
  filterPillTxtOn: { color: Colors.white },
  eventCard: { marginTop: 12, borderRadius: 20, overflow: 'hidden', height: 260, backgroundColor: Colors.grayLight, ...Shadows.card },
  eventImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  eventGrad: { ...StyleSheet.absoluteFillObject },
  eventTypePill: { position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  eventTypeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  eventPricePill: { position: 'absolute', top: 12, right: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  eventPriceTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  eventOwnerBtns: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  eventOwnerBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8 },
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

  insertCard: { backgroundColor: HEADER_BG, borderRadius: 20, padding: 20 },
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
  alumniBadge: { backgroundColor: '#EEF2FF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  alumniBadgeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: '#2A2FFF' },

  partnerCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', ...Shadows.card },
  partnerLogo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  partnerLogoTxt: { fontSize: 18 },
  partnerName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  partnerType: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  calloutRed: { backgroundColor: BRAND, borderRadius: 16, padding: 16 },
  calloutTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.white },
  calloutSub: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  calloutBtn: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  calloutBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: BRAND },

  sheetPad: { padding: 20, paddingBottom: 40 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark, marginBottom: 12 },
  sheetHint: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginBottom: 12 },
  sheetInput: { borderWidth: 1, borderColor: Colors.grayBorder, borderRadius: 12, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, textAlignVertical: 'top' },
  sheetField: { borderWidth: 1, borderColor: Colors.grayBorder, borderRadius: 12, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, marginBottom: 8 },
  sheetPrimary: { backgroundColor: BRAND, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  sheetPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  sheetDismiss: { alignItems: 'center', marginTop: 16 },
  sheetDismissTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  inputLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark, marginTop: 10, marginBottom: 6 },
  uploadZone: { height: 160, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  uploadPreview: { width: '100%', height: 160, resizeMode: 'cover' },
  uploadHint: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 8 },
  miniChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6', marginTop: 8 },
  miniChipOn: { backgroundColor: BRAND },
  miniChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.dark },
  miniChipTxtOn: { color: Colors.white },
  yuniRecCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.grayBorder },
  yuniRecTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  yuniRecDesc: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6 },
  yuniRecLink: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: YUNI_BLUE, marginTop: 8 },
});

