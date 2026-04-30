import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';

const YUNI_AI_LOGO = require('@/assets/images/yuni-ai.png');

export const MOCK_PROJECTS = [
  {
    id: 'p1',
    title: 'Identité visuelle Belga Queen',
    category: 'Branding',
    client: 'Belga Queen',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=800',
    description: "Refonte complète de l'identité visuelle du restaurant.",
    tags: ['Logo', 'Charte graphique', 'Print'],
    year: '2026',
    featured: true,
  },
  {
    id: 'p2',
    title: 'Campagne Jazz au Parvis',
    category: 'Communication',
    client: 'Jazz au Parvis',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800',
    description: 'Affiches et visuels pour la saison jazz 2026.',
    tags: ['Affiche', 'Réseaux sociaux', 'Motion'],
    year: '2026',
    featured: true,
  },
  {
    id: 'p3',
    title: 'Site web Cyclistes de Reims',
    category: 'Web Design',
    client: 'Association',
    imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?w=800',
    description: "Design et intégration du site de l'association.",
    tags: ['UI/UX', 'Figma', 'Web'],
    year: '2025',
    featured: false,
  },
  {
    id: 'p4',
    title: 'App mobile startup locale',
    category: 'UI/UX',
    client: 'Startup Reims',
    imageUrl: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=800',
    description: 'Conception UX et prototype interactif.',
    tags: ['Figma', 'Prototype', 'Mobile'],
    year: '2025',
    featured: false,
  },
];

export const MOCK_SERVICES = [
  {
    id: 's1',
    title: 'Identité visuelle complète',
    description: 'Logo + charte graphique + déclinaisons print et digital',
    price: 1200,
    unit: 'projet',
    duration: '2-3 semaines',
    category: 'Branding',
    popular: true,
  },
  {
    id: 's2',
    title: 'Design réseaux sociaux',
    description: 'Templates Canva/Figma + 10 visuels personnalisés',
    price: 350,
    unit: 'mois',
    duration: '1 semaine',
    category: 'Social Media',
    popular: false,
  },
  {
    id: 's3',
    title: 'Refonte identité',
    description: 'Audit + repositionnement + nouvelle charte',
    price: 800,
    unit: 'projet',
    duration: '3-4 semaines',
    category: 'Branding',
    popular: false,
  },
  {
    id: 's4',
    title: 'Consultation créative',
    description: 'Séance conseil 2h pour orienter votre communication',
    price: 150,
    unit: 'séance',
    duration: '2h',
    category: 'Conseil',
    popular: false,
  },
];

export const MOCK_REVIEWS = [
  {
    id: 'r1',
    client: 'Belga Queen',
    rating: 5,
    comment:
      "Marie a parfaitement capturé l'essence de notre restaurant. Un travail exceptionnel !",
    date: 'Mars 2026',
    replied: false,
  },
  {
    id: 'r2',
    client: 'Jazz au Parvis',
    rating: 5,
    comment: 'Créativité, réactivité et professionnalisme. On recommande vivement !',
    date: 'Février 2026',
    replied: true,
  },
  {
    id: 'r3',
    client: 'Cyclistes de Reims',
    rating: 4,
    comment: 'Très bon travail, à l’écoute de nos besoins associatifs.',
    date: 'Janvier 2026',
    replied: false,
  },
];

export const MOCK_SLOTS = [
  { id: 'sl1', date: 'Lundi 12 mai', time: '9h00', duration: 120, available: true },
  { id: 'sl2', date: 'Lundi 12 mai', time: '14h00', duration: 60, available: false },
  { id: 'sl3', date: 'Mercredi 14 mai', time: '10h00', duration: 90, available: true },
  { id: 'sl4', date: 'Vendredi 16 mai', time: '9h00', duration: 120, available: true },
  { id: 'sl5', date: 'Vendredi 16 mai', time: '15h00', duration: 60, available: true },
];

const FILTER_CHIPS = ['Tous', 'Branding', 'Web Design', 'UI/UX', 'Communication'] as const;

const SERVICE_UNITS = ['projet', 'mois', 'heure', 'jour', 'séance'] as const;

const SLOT_DURATIONS = [30, 60, 90, 120, 480] as const;

const MOCK_PEERS = [
  {
    id: 'peer1',
    name: 'Alex Photo',
    spec: 'Photographe',
    imageUrl: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?w=200',
  },
  {
    id: 'peer2',
    name: 'Claire Web',
    spec: 'Développeuse',
    imageUrl: 'https://images.pexels.com/photos/3783315/pexels-photo-3783315.jpeg?w=200',
  },
  {
    id: 'peer3',
    name: 'Sam Motion',
    spec: 'Vidéaste',
    imageUrl: 'https://images.pexels.com/photos/3783716/pexels-photo-3783716.jpeg?w=200',
  },
];

type ClientRow = {
  id: string;
  name: string;
  type: 'BtoB' | 'BtoC';
  status: 'En cours' | 'Terminé' | 'Prospect';
  project: string;
  value: number;
  since: string;
  imageUrl: string | null;
};

const MOCK_CLIENTS: ClientRow[] = [
  {
    id: 'cl1',
    name: 'Belga Queen',
    type: 'BtoB',
    status: 'En cours',
    project: 'Refonte identité',
    value: 1200,
    since: 'Jan 2026',
    imageUrl: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?w=200',
  },
  {
    id: 'cl2',
    name: 'Jazz au Parvis',
    type: 'BtoB',
    status: 'Terminé',
    project: 'Affiches saison',
    value: 800,
    since: 'Fév 2026',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=200',
  },
  {
    id: 'cl3',
    name: 'Sophie Martin',
    type: 'BtoC',
    status: 'En cours',
    project: 'Logo personnel',
    value: 350,
    since: 'Avr 2026',
    imageUrl: null,
  },
  {
    id: 'cl4',
    name: 'Startup Reims',
    type: 'BtoB',
    status: 'Prospect',
    project: 'App mobile UI',
    value: 2500,
    since: 'Avr 2026',
    imageUrl: null,
  },
] ;

type ProjectRow = (typeof MOCK_PROJECTS)[number];
type ServiceRow = (typeof MOCK_SERVICES)[number];
type ReviewRow = (typeof MOCK_REVIEWS)[number] & { replyText?: string };
type SlotRow = (typeof MOCK_SLOTS)[number];

type TabKey = 'business' | 'portfolio' | 'services' | 'agenda';

function initialsFrom(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0]![0]}${p[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'FR';
}

function freelancerDisplayName(email?: string | null, profileName?: string | null) {
  const fromProfile = profileName?.trim();
  if (fromProfile) return fromProfile;
  const base = email?.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Marie Dupont';
  return base
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

export function FreelanceDashboard() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const fullName = freelancerDisplayName(user?.email, user?.profileData?.displayName ?? user?.name);
  const [firstName, ...restName] = fullName.split(/\s+/);
  const lastName = restName.join(' ');
  const specialty = 'Design & Identité visuelle';
  const verified = user?.verificationStatus === 'verified';

  const [disponible, setDisponible] = useState(true);
  const [acceptMissions, setAcceptMissions] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('business');
  const [portfolioFilter, setPortfolioFilter] = useState<string>('Tous');

  const [projects, setProjects] = useState<ProjectRow[]>(() => [...MOCK_PROJECTS]);
  const [services, setServices] = useState<ServiceRow[]>(() => [...MOCK_SERVICES]);
  const [reviews, setReviews] = useState<ReviewRow[]>(() => MOCK_REVIEWS.map((r) => ({ ...r })));
  const [slots, setSlots] = useState<SlotRow[]>(() => [...MOCK_SLOTS]);
  const [clients, setClients] = useState<ClientRow[]>(() => [...MOCK_CLIENTS]);

  const [emailContact, setEmailContact] = useState(true);
  const [msgYuni, setMsgYuni] = useState(true);
  const [callOk, setCallOk] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState('');

  const yuniSheetRef = useRef<BottomSheetModal>(null);
  const addProjectRef = useRef<BottomSheetModal>(null);
  const projectDetailRef = useRef<BottomSheetModal>(null);
  const editProjectRef = useRef<BottomSheetModal>(null);
  const addServiceRef = useRef<BottomSheetModal>(null);
  const editServiceRef = useRef<BottomSheetModal>(null);
  const replyRef = useRef<BottomSheetModal>(null);
  const addSlotRef = useRef<BottomSheetModal>(null);
  const addClientRef = useRef<BottomSheetModal>(null);
  const clientDetailRef = useRef<BottomSheetModal>(null);

  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const snap90 = useMemo(() => ['90%'], []);
  const snap80 = useMemo(() => ['80%'], []);
  const snap75 = useMemo(() => ['75%'], []);
  const snap60 = useMemo(() => ['60%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const toggleDispo = useCallback(() => {
    setDisponible((v) => {
      const n = !v;
      Alert.alert(
        n ? 'Disponible' : 'Indisponible',
        n
          ? 'Vous apparaissez comme disponible pour de nouvelles missions.'
          : 'Les clients verront que vous êtes indisponible.',
      );
      return n;
    });
  }, []);

  const filteredProjects = useMemo(() => {
    if (portfolioFilter === 'Tous') return projects;
    return projects.filter((p) => p.category === portfolioFilter);
  }, [portfolioFilter, projects]);

  const openClient = useCallback((c: ClientRow) => {
    setSelectedClient(c);
    clientDetailRef.current?.present();
  }, []);

  const slotsByDate = useMemo(() => {
    const m = new Map<string, SlotRow[]>();
    for (const s of slots) {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    }
    return [...m.entries()];
  }, [slots]);

  const avgRating = 4.9;
  const width = Dimensions.get('window').width;
  const colW = (width - 40 - 8) / 2;

  const openProject = useCallback((p: ProjectRow) => {
    setSelectedProject(p);
    projectDetailRef.current?.present();
  }, []);

  const openReply = useCallback((id: string) => {
    setReplyReviewId(id);
    setReplyText('');
    replyRef.current?.present();
  }, []);

  const publishReply = useCallback(() => {
    if (!replyReviewId || !replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyReviewId ? { ...r, replied: true, replyText: replyText.trim() } : r,
      ),
    );
    replyRef.current?.dismiss();
    Alert.alert('Réponse publiée ✓');
    setReplyReviewId(null);
    setReplyText('');
  }, [replyReviewId, replyText]);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        <SafeAreaView edges={['top']} style={styles.headerDark}>
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerName}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.headerSpec}>{specialty}</Text>
              <View style={styles.headerPills}>
                <Pressable
                  onPress={toggleDispo}
                  style={[styles.pillDispo, disponible ? styles.pillDispoOn : styles.pillDispoOff]}
                >
                  <Text style={[styles.pillDispoTxt, disponible ? styles.pillDispoTxtOn : styles.pillDispoTxtOff]}>
                    {disponible ? '🟢 Disponible' : '🔴 Indisponible'}
                  </Text>
                </Pressable>
                <View style={styles.pillLoc}>
                  <Text style={styles.pillLocTxt}>📍 Reims · Grand Est</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={styles.avatarFreelance}>
                <Text style={styles.avatarFreelanceTxt}>{initialsFrom(fullName)}</Text>
              </View>
              {verified ? (
                <View style={styles.verBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.statsBar}>
            <Text style={styles.statsMain}>
              4.9 ⭐ · 23 projets · 156 vues · 12 contacts
            </Text>
            <Text style={styles.statsSub}>Visibilité et confiance sur Yunicity</Text>
          </View>
        </SafeAreaView>

        <View style={[styles.yuniCard, { backgroundColor: '#2A2FFF' }]}>
          <View style={styles.yuniRow}>
            <Image source={YUNI_AI_LOGO} style={styles.yuniLogo} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.yuniTitle}>Yuni AI</Text>
              <Text style={styles.yuniSub}>3 clients potentiels près de chez vous</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.yuniCta} onPress={() => yuniSheetRef.current?.present()} activeOpacity={0.9}>
            <Text style={styles.yuniCtaTxt}>Voir les suggestions →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.miniTabsOuter}>
          <View style={styles.miniTabs}>
            {(
              [
                ['business', '🤝 Business'],
                ['portfolio', '🎨 Portfolio'],
                ['services', '💼 Services'],
                ['agenda', '📅 Agenda'],
              ] as const
            ).map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key)}
                style={[styles.miniTab, activeTab === key && styles.miniTabAct]}
              >
                <Text style={[styles.miniTabTxt, activeTab === key && styles.miniTabTxtAct]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {activeTab === 'business' ? (
          <BusinessTab
            clients={clients}
            setClients={setClients}
            onAddClient={() => addClientRef.current?.present()}
            onOpenClient={openClient}
            reviews={reviews}
            avgRating={avgRating}
            onReply={openReply}
          />
        ) : null}

        {activeTab === 'portfolio' ? (
          <PortfolioTab
            projects={filteredProjects}
            portfolioFilter={portfolioFilter}
            setPortfolioFilter={setPortfolioFilter}
            cardW={width - 40}
            onOpenProject={openProject}
            onAddProject={() => addProjectRef.current?.present()}
          />
        ) : null}

        {activeTab === 'services' ? (
          <ServicesTab
            services={services}
            setServices={setServices}
            onAddService={() => addServiceRef.current?.present()}
            onEditService={(s) => {
              setEditingService(s);
              editServiceRef.current?.present();
            }}
          />
        ) : null}

        {activeTab === 'agenda' ? (
          <AgendaTab
            slots={slots}
            setSlots={setSlots}
            acceptMissions={acceptMissions}
            setAcceptMissions={setAcceptMissions}
            slotsByDate={slotsByDate}
            onAddSlot={() => addSlotRef.current?.present()}
            emailContact={emailContact}
            setEmailContact={setEmailContact}
            msgYuni={msgYuni}
            setMsgYuni={setMsgYuni}
            callOk={callOk}
            setCallOk={setCallOk}
            calendlyUrl={calendlyUrl}
            setCalendlyUrl={setCalendlyUrl}
          />
        ) : null}
      </ScrollView>

      <FreelanceYuniSheet
        ref={yuniSheetRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        onClose={() => yuniSheetRef.current?.dismiss()}
        onTribe={() => {
          yuniSheetRef.current?.dismiss();
          router.push('/(app)/(tabs)/tribus');
        }}
        onAddProject={() => {
          yuniSheetRef.current?.dismiss();
          addProjectRef.current?.present();
        }}
      />

      <AddProjectSheet
        ref={addProjectRef}
        snap={snap90}
        renderBackdrop={renderBackdrop}
        onPublish={(p) => {
          setProjects((prev) => [{ ...p, id: `p-${Date.now()}`, featured: p.featured ?? false }, ...prev]);
          addProjectRef.current?.dismiss();
        }}
      />

      <ProjectDetailSheet
        ref={projectDetailRef}
        snap={snap90}
        renderBackdrop={renderBackdrop}
        project={selectedProject}
        onClose={() => projectDetailRef.current?.dismiss()}
        onEdit={() => {
          projectDetailRef.current?.dismiss();
          editProjectRef.current?.present();
        }}
        onDelete={() => {
          if (!selectedProject) return;
          Alert.alert('Supprimer', 'Retirer ce projet du portfolio ?', [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Supprimer',
              style: 'destructive',
              onPress: () => {
                setProjects((prev) => prev.filter((x) => x.id !== selectedProject.id));
                projectDetailRef.current?.dismiss();
                setSelectedProject(null);
              },
            },
          ]);
        }}
        onShare={async () => {
          if (!selectedProject) return;
          try {
            await Share.share({
              message: `${selectedProject.title} — ${selectedProject.client}`,
              title: selectedProject.title,
            });
          } catch {
            Alert.alert('Partage', selectedProject.title);
          }
        }}
      />

      <EditProjectSheet
        ref={editProjectRef}
        snap={snap90}
        renderBackdrop={renderBackdrop}
        project={selectedProject}
        onSave={(p) => {
          setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
          setSelectedProject(p);
          editProjectRef.current?.dismiss();
        }}
      />

      <AddServiceSheet
        ref={addServiceRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        onSave={(s) => {
          setServices((prev) => [{ ...s, id: `s-${Date.now()}` }, ...prev]);
          addServiceRef.current?.dismiss();
        }}
      />

      <EditServiceSheet
        ref={editServiceRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        service={editingService}
        onSave={(s) => {
          setServices((prev) => prev.map((x) => (x.id === s.id ? s : x)));
          editServiceRef.current?.dismiss();
          setEditingService(null);
        }}
      />

      <BottomSheetModal
        ref={replyRef}
        snapPoints={snap60}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
          <Text style={styles.sheetTitle}>Répondre à l’avis</Text>
          <BottomSheetTextInput
            style={styles.sheetInput}
            placeholder="Votre réponse…"
            placeholderTextColor={Colors.textMuted}
            multiline
            value={replyText}
            onChangeText={setReplyText}
          />
          <Pressable style={styles.sheetPrimary} onPress={publishReply}>
            <Text style={styles.sheetPrimaryTxt}>Publier la réponse</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <AddClientSheet
        ref={addClientRef}
        snap={snap75}
        renderBackdrop={renderBackdrop}
        onAdd={(c) => {
          setClients((prev) => [{ ...c, id: `cl-${Date.now()}` }, ...prev]);
          addClientRef.current?.dismiss();
        }}
      />

      <ClientDetailSheet
        ref={clientDetailRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        client={selectedClient}
        onClose={() => clientDetailRef.current?.dismiss()}
        onContact={() => {
          if (!selectedClient) return;
          Alert.alert('Contacter', `Message envoyé à ${selectedClient.name} (mock).`);
        }}
        onEdit={() => Alert.alert('Modifier', 'Edition client (mock).')}
        onArchive={() => {
          if (!selectedClient) return;
          Alert.alert('Archiver', `Archiver ${selectedClient.name} ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Archiver',
              style: 'destructive',
              onPress: () => {
                setClients((prev) => prev.filter((x) => x.id !== selectedClient.id));
                clientDetailRef.current?.dismiss();
                setSelectedClient(null);
              },
            },
          ]);
        }}
      />

      <AddSlotSheet
        ref={addSlotRef}
        snap={snap60}
        renderBackdrop={renderBackdrop}
        onAdd={(slot) => {
          setSlots((prev) => [...prev, { ...slot, id: `sl-${Date.now()}` }]);
          addSlotRef.current?.dismiss();
        }}
      />
    </View>
  );
}

function PortfolioTab({
  projects,
  portfolioFilter,
  setPortfolioFilter,
  cardW,
  onOpenProject,
  onAddProject,
}: {
  projects: ProjectRow[];
  portfolioFilter: string;
  setPortfolioFilter: (s: string) => void;
  cardW: number;
  onOpenProject: (p: ProjectRow) => void;
  onAddProject: () => void;
}) {
  const gap = 12;
  const snapTo = cardW + gap;
  const [page, setPage] = useState(0);
  return (
    <View style={styles.tabSection}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Mes projets</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {FILTER_CHIPS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setPortfolioFilter(c)}
            style={[styles.filterChip, portfolioFilter === c && styles.filterChipOn]}
          >
            <Text style={[styles.filterChipTxt, portfolioFilter === c && styles.filterChipTxtOn]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        horizontal
        data={projects}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={snapTo}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / snapTo);
          setPage(Math.max(0, Math.min(projects.length - 1, idx)));
        }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onOpenProject(item)}
            style={[
              styles.portfolioSlide,
              {
                width: cardW,
                marginRight: index === projects.length - 1 ? 0 : gap,
              },
            ]}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.portfolioSlideImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.portfolioSlideGrad} />
            <View style={styles.portfolioSlideOverlay}>
              <View style={styles.portfolioCatPill}>
                <Text style={styles.portfolioCatPillTxt}>{item.category}</Text>
              </View>
              <Text style={styles.portfolioTitle}>{item.title}</Text>
              <Text style={styles.portfolioMeta}>
                {item.client} · {item.year}
              </Text>
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 4).map((t) => (
                  <View key={t} style={styles.tagChip}>
                    <Text style={styles.tagChipTxt}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.dotsRow}>
        {projects.map((p, i) => (
          <View key={p.id} style={[styles.dot, i === page ? styles.dotOn : styles.dotOff]} />
        ))}
      </View>

      <Pressable style={styles.addProjectWide} onPress={onAddProject}>
        <Text style={styles.addProjectWideTxt}>+ Ajouter un projet</Text>
      </Pressable>
    </View>
  );
}

function ServicesTab({
  services,
  setServices,
  onAddService,
  onEditService,
}: {
  services: ServiceRow[];
  setServices: React.Dispatch<React.SetStateAction<ServiceRow[]>>;
  onAddService: () => void;
  onEditService: (s: ServiceRow) => void;
}) {
  return (
    <View style={styles.tabSection}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Mes services</Text>
        <Pressable style={styles.btnPurpleSm} onPress={onAddService}>
          <Text style={styles.btnPurpleSmTxt}>+ Service</Text>
        </Pressable>
      </View>

      {services.map((s) => (
        <View key={s.id} style={styles.serviceCard}>
          <View style={styles.serviceTop}>
            <Text style={styles.serviceTitle}>{s.title}</Text>
            {s.popular ? (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeTxt}>POPULAIRE 🔥</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.serviceDesc} numberOfLines={2}>
            {s.description}
          </Text>
          <Text style={styles.serviceMeta}>
            ⏱️ {s.duration} · 📂 {s.category}
          </Text>
          <View style={styles.serviceBottom}>
            <View>
              <Text style={styles.servicePrice}>
                {s.price}€{' '}
                <Text style={styles.serviceUnit}>/{s.unit}</Text>
              </Text>
            </View>
            <View style={styles.serviceActions}>
              <Pressable style={styles.btnGray} onPress={() => onEditService(s)}>
                <Text style={styles.btnGrayTxt}>Modifier</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert('Supprimer', 'Retirer ce service ?', [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => setServices((prev) => prev.filter((x) => x.id !== s.id)),
                    },
                  ])
                }
              >
                <Text style={styles.trash}>🗑️</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function BusinessTab({
  clients,
  setClients,
  onAddClient,
  onOpenClient,
  reviews,
  avgRating,
  onReply,
}: {
  clients: ClientRow[];
  setClients: React.Dispatch<React.SetStateAction<ClientRow[]>>;
  onAddClient: () => void;
  onOpenClient: (c: ClientRow) => void;
  reviews: ReviewRow[];
  avgRating: number;
  onReply: (id: string) => void;
}) {
  return (
    <View style={styles.tabSection}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Mes clients 👥</Text>
        <Pressable style={styles.btnPurpleSm} onPress={onAddClient}>
          <Text style={styles.btnPurpleSmTxt}>+ Nouveau client</Text>
        </Pressable>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(c) => c.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenClient(item)} style={styles.clientCard}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.clientAvatar} />
            ) : (
              <View style={[styles.clientAvatar, styles.clientAvatarFallback]}>
                <Text style={styles.clientAvatarTxt}>{initialsFrom(item.name)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientProject} numberOfLines={1}>
                {item.project}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View
                style={[
                  styles.clientStatusPill,
                  item.status === 'En cours'
                    ? styles.clientStatusOn
                    : item.status === 'Terminé'
                      ? styles.clientStatusDone
                      : styles.clientStatusProspect,
                ]}
              >
                <Text
                  style={[
                    styles.clientStatusTxt,
                    item.status === 'En cours'
                      ? styles.clientStatusTxtOn
                      : item.status === 'Terminé'
                        ? styles.clientStatusTxtDone
                        : styles.clientStatusTxtProspect,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <Text style={styles.clientType}>{item.type}</Text>
              <Text style={styles.clientValue}>{item.value}€</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.revenueCard}>
        <Text style={styles.revenueKicker}>REVENUS CE MOIS</Text>
        <Text style={styles.revenueValue}>2 350 €</Text>
        <Text style={styles.revenueDelta}>↑ +12% vs mois dernier</Text>
        <View style={styles.revenueStatsRow}>
          {[
            ['3', 'projets actifs'],
            ['4', 'factures'],
            ['1', 'prospect'],
          ].map(([v, l]) => (
            <View key={l} style={styles.revenueStat}>
              <Text style={styles.revenueStatV}>{v}</Text>
              <Text style={styles.revenueStatL}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Proposer un partenariat</Text>
      <PeersPartnershipSection />

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Mes avis clients ⭐</Text>
      <ClientReviewsSection reviews={reviews} avgRating={avgRating} onReply={onReply} />
    </View>
  );
}

function ClientReviewsSection({
  reviews,
  avgRating,
  onReply,
}: {
  reviews: ReviewRow[];
  avgRating: number;
  onReply: (id: string) => void;
}) {
  return (
    <>
      <Text style={styles.avgBig}>{avgRating.toFixed(1)}</Text>
      <Text style={styles.avgSub}>(3 avis)</Text>
      <View style={styles.starsCenter}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons key={i} name="star" size={22} color="#F59E0B" />
        ))}
      </View>

      {reviews.map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewHead}>
            <View style={styles.reviewAv}>
              <Text style={styles.reviewAvTxt}>{initialsFrom(r.client)}</Text>
            </View>
            <Text style={styles.reviewClient}>{r.client}</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
          <View style={styles.reviewStars}>
            {Array.from({ length: r.rating }).map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#F59E0B" />
            ))}
          </View>
          <Text style={styles.reviewComment}>{r.comment}</Text>
          {!r.replied ? (
            <Pressable style={styles.btnGray} onPress={() => onReply(r.id)}>
              <Text style={styles.btnGrayTxt}>Répondre</Text>
            </Pressable>
          ) : (
            <Text style={styles.repliedOk}>✓ Vous avez répondu</Text>
          )}
        </View>
      ))}
    </>
  );
}

function PeersPartnershipSection() {
  return (
    <>
      <Text style={styles.peersSub}>Collaborez avec d’autres indépendants locaux</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peersScroll}>
        {MOCK_PEERS.map((p) => (
          <View key={p.id} style={styles.peerCard}>
            <Image source={{ uri: p.imageUrl }} style={styles.peerImg} />
            <Text style={styles.peerName}>{p.name}</Text>
            <Text style={styles.peerSpec}>{p.spec}</Text>
            <Pressable
              style={styles.peerBtn}
              onPress={() => Alert.alert('Message envoyé ✓', `Demande envoyée à ${p.name} (mock).`)}
            >
              <Text style={styles.peerBtnTxt}>Contacter</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

function AgendaTab({
  slots,
  setSlots,
  acceptMissions,
  setAcceptMissions,
  slotsByDate,
  onAddSlot,
  emailContact,
  setEmailContact,
  msgYuni,
  setMsgYuni,
  callOk,
  setCallOk,
  calendlyUrl,
  setCalendlyUrl,
}: {
  slots: SlotRow[];
  setSlots: React.Dispatch<React.SetStateAction<SlotRow[]>>;
  acceptMissions: boolean;
  setAcceptMissions: (v: boolean) => void;
  slotsByDate: [string, SlotRow[]][];
  onAddSlot: () => void;
  emailContact: boolean;
  setEmailContact: (v: boolean) => void;
  msgYuni: boolean;
  setMsgYuni: (v: boolean) => void;
  callOk: boolean;
  setCallOk: (v: boolean) => void;
  calendlyUrl: string;
  setCalendlyUrl: (s: string) => void;
}) {
  return (
    <View style={styles.tabSection}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Mon agenda</Text>
        <Pressable style={styles.btnPurpleSm} onPress={onAddSlot}>
          <Text style={styles.btnPurpleSmTxt}>+ Créneau</Text>
        </Pressable>
      </View>

      <View style={styles.switchCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>Accepter de nouvelles missions</Text>
          <Text style={styles.switchSub}>Activé : vous apparaissez dans les recherches</Text>
        </View>
        <Switch
          value={acceptMissions}
          onValueChange={setAcceptMissions}
          trackColor={{ true: Colors.freelance }}
          thumbColor={Colors.white}
        />
      </View>

      <Text style={styles.subSectionTitle}>Cette semaine</Text>
      <Text style={styles.slotSectionLbl}>Créneaux disponibles</Text>

      {slotsByDate.map(([date, list]) => (
        <View key={date}>
          <Text style={styles.dateHeader}>{date}</Text>
          {list.map((sl) => (
            <View key={sl.id} style={styles.slotCard}>
              <View style={[styles.slotCircle, sl.available ? styles.slotCircleFree : styles.slotCircleBusy]}>
                <Text>{sl.available ? '🟢' : '🔴'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotTime}>{sl.time}</Text>
                <Text style={styles.slotDur}>{sl.duration} min</Text>
              </View>
              <View style={[styles.slotPill, sl.available ? styles.slotPillFree : styles.slotPillBusy]}>
                <Text style={[styles.slotPillTxt, sl.available ? styles.slotPillTxtFree : styles.slotPillTxtBusy]}>
                  {sl.available ? 'Libre' : 'Réservé'}
                </Text>
              </View>
              {sl.available ? (
                <Pressable
                  onPress={() =>
                    Alert.alert('Supprimer', 'Retirer ce créneau ?', [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: () => setSlots((prev) => prev.filter((x) => x.id !== sl.id)),
                      },
                    ])
                  }
                >
                  <Text style={styles.slotIconBtn}>🗑️</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Rendez-vous',
                      'Client : Studio Nord — projet charte graphique. Mock.',
                    )
                  }
                >
                  <Text style={styles.slotIconBtn}>👁️</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Paramètres de contact</Text>
      <View style={styles.contactSettings}>
        <RowSwitch label="📧 Contact par email" value={emailContact} onValueChange={setEmailContact} />
        <RowSwitch label="💬 Messages via Yunicity" value={msgYuni} onValueChange={setMsgYuni} />
        <RowSwitch label="📞 Appel téléphonique" value={callOk} onValueChange={setCallOk} />
        <Text style={styles.inputLbl}>📅 Lien Calendly</Text>
        <TextInput
          style={styles.inputField}
          placeholder="https://..."
          placeholderTextColor={Colors.textMuted}
          value={calendlyUrl}
          onChangeText={setCalendlyUrl}
        />
      </View>
    </View>
  );
}

function RowSwitch({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.rowSwitch}>
      <Text style={styles.switchTitle}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: Colors.freelance }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const FreelanceYuniSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: (props: BottomSheetBackdropProps) => ReactElement;
    onClose: () => void;
    onTribe: () => void;
    onAddProject: () => void;
  }
>(function FreelanceYuniSheetImpl({ snap, renderBackdrop, onClose, onTribe, onAddProject }, ref) {
  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snap}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.white }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Yuni AI — Freelance</Text>
        <Pressable
          style={styles.yuniRecCard}
          onPress={() => {
            onTribe();
          }}
        >
          <Text style={styles.yuniRecTitle}>La Tribu Business cherche un graphiste</Text>
          <Text style={styles.yuniRecDesc}>Rejoignez la tribu pour répondre aux besoins locaux.</Text>
          <Text style={styles.yuniRecLink}>Voir les tribus →</Text>
        </Pressable>
        <Pressable style={styles.yuniRecCard} onPress={onAddProject}>
          <Text style={styles.yuniRecTitle}>Publiez un projet ce mercredi pour +40% de vues</Text>
          <Text style={styles.yuniRecDesc}>Ajoutez une réalisation à votre portfolio.</Text>
          <Text style={styles.yuniRecLink}>Ajouter un projet →</Text>
        </Pressable>
        <Pressable
          style={styles.yuniRecCard}
          onPress={() =>
            Alert.alert(
              'Vues profil',
              'Belga Queen\nEat Night\nStudio Photo Rémois\n… ont consulté votre profil (mock).',
            )
          }
        >
          <Text style={styles.yuniRecTitle}>2 commerçants ont consulté votre profil</Text>
          <Text style={styles.yuniRecDesc}>Voir la liste des derniers visiteurs.</Text>
          <Pressable
            hitSlop={8}
            onPress={() =>
              Alert.alert(
                'Vues profil',
                'Belga Queen\nEat Night\nStudio Photo Rémois\n… ont consulté votre profil (mock).',
              )
            }
          >
            <Text style={styles.yuniRecLink}>Détails →</Text>
          </Pressable>
        </Pressable>
        <Pressable onPress={onClose} style={styles.sheetDismiss}>
          <Text style={styles.sheetDismissTxt}>Fermer</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

type SheetBackdrop = (p: BottomSheetBackdropProps) => ReactElement;

const AddProjectSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onPublish: (p: ProjectRow) => void }
>(function AddProjectSheet({ snap, renderBackdrop, onPublish }, ref) {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Branding');
  const [year, setYear] = useState('2026');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!r.canceled && r.assets[0]?.uri) setImageUri(r.assets[0].uri);
  };

  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Nouveau projet</Text>
        <Pressable style={styles.uploadZone} onPress={() => void pick()}>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.uploadPreview} />
              <Pressable style={styles.uploadRm} onPress={() => setImageUri(null)}>
                <Text style={{ color: Colors.white }}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Ionicons name="image-outline" size={40} color={Colors.gray} />
              <Text style={styles.uploadHint}>Ajouter une photo du projet</Text>
            </>
          )}
        </Pressable>
        <Field label="Titre" value={title} onChangeText={setTitle} />
        <Field label="Client" value={client} onChangeText={setClient} />
        <Text style={styles.inputLbl}>Catégorie</Text>
        <ScrollView horizontal style={{ marginBottom: 10 }}>
          {(['Branding', 'Web Design', 'UI/UX', 'Communication'] as const).map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.miniChip, category === c && styles.miniChipOn]}
            >
              <Text style={[styles.miniChipTxt, category === c && styles.miniChipTxtOn]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Field label="Année" value={year} onChangeText={setYear} keyboardType="number-pad" />
        <Text style={styles.inputLbl}>Description</Text>
        <BottomSheetTextInput
          style={[styles.sheetInput, { minHeight: 100 }]}
          multiline
          value={desc}
          onChangeText={setDesc}
          placeholder="Décrivez le projet…"
        />
        <Field label="Tags (virgule)" value={tags} onChangeText={setTags} />
        <View style={styles.rowSwitch}>
          <Text style={styles.switchTitle}>Mettre à la une</Text>
          <Switch value={featured} onValueChange={setFeatured} trackColor={{ true: Colors.freelance }} />
        </View>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            const tagList = tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
            onPublish({
              id: '',
              title: title || 'Nouveau projet',
              client: client || 'Client',
              category,
              year,
              description: desc || '—',
              tags: tagList.length ? tagList : ['Portfolio'],
              imageUrl: imageUri ?? MOCK_PROJECTS[0]!.imageUrl,
              featured,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Publier le projet</Text>
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
      <BottomSheetTextInput
        style={styles.sheetField}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </>
  );
}

const ProjectDetailSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: SheetBackdrop;
    project: ProjectRow | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onShare: () => void;
  }
>(function ProjectDetailSheet({ snap, renderBackdrop, project, onClose, onEdit, onDelete, onShare }, ref) {
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        {project ? (
          <>
            <Image source={{ uri: project.imageUrl }} style={styles.detailHero} resizeMode="cover" />
            <Text style={styles.detailTitle}>{project.title}</Text>
            <View style={styles.detailMeta}>
              <View style={styles.catPill}>
                <Text style={styles.catPillTxt}>{project.category}</Text>
              </View>
              <Text style={styles.detailYear}>{project.year}</Text>
              <Text style={styles.detailClient}>{project.client}</Text>
            </View>
            <Text style={styles.detailDesc}>{project.description}</Text>
            <View style={styles.tagsRow}>
              {project.tags.map((t) => (
                <View key={t} style={styles.tagPurple}>
                  <Text style={styles.tagPurpleTxt}>{t}</Text>
                </View>
              ))}
            </View>
            <View style={styles.detailBtns}>
              <Pressable style={styles.btnGray} onPress={onEdit}>
                <Text style={styles.btnGrayTxt}>✏️ Modifier</Text>
              </Pressable>
              <Pressable style={styles.btnGray} onPress={onDelete}>
                <Text style={styles.btnGrayTxt}>🗑️ Supprimer</Text>
              </Pressable>
              <Pressable style={styles.sheetPrimary} onPress={onShare}>
                <Text style={styles.sheetPrimaryTxt}>📤 Partager</Text>
              </Pressable>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.sheetDismissTxt}>Fermer</Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const EditProjectSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; project: ProjectRow | null; onSave: (p: ProjectRow) => void }
>(function EditProjectSheet({ snap, renderBackdrop, project, onSave }, ref) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [desc, setDesc] = useState(project?.description ?? '');
  useEffect(() => {
    setTitle(project?.title ?? '');
    setDesc(project?.description ?? '');
  }, [project]);
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        {project ? (
          <>
            <Text style={styles.sheetTitle}>Modifier le projet</Text>
            <Field label="Titre" value={title} onChangeText={setTitle} />
            <Text style={styles.inputLbl}>Description</Text>
            <BottomSheetTextInput
              style={[styles.sheetInput, { minHeight: 100 }]}
              multiline
              value={desc}
              onChangeText={setDesc}
            />
            <Pressable
              style={styles.sheetPrimary}
              onPress={() => onSave({ ...project, title: title || project.title, description: desc })}
            >
              <Text style={styles.sheetPrimaryTxt}>Enregistrer</Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const AddServiceSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onSave: (s: Omit<ServiceRow, 'id'>) => void }
>(function AddServiceSheet({ snap, renderBackdrop, onSave }, ref) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<(typeof SERVICE_UNITS)[number]>('projet');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Branding');
  const [popular, setPopular] = useState(false);
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Nouveau service</Text>
        <Field label="Nom du service" value={title} onChangeText={setTitle} />
        <Text style={styles.inputLbl}>Description</Text>
        <BottomSheetTextInput
          style={[styles.sheetInput, { minHeight: 80 }]}
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <Field label="Prix (€)" value={price} onChangeText={setPrice} keyboardType="number-pad" />
        <Text style={styles.inputLbl}>Unité</Text>
        <ScrollView horizontal>
          {SERVICE_UNITS.map((u) => (
            <Pressable key={u} onPress={() => setUnit(u)} style={[styles.miniChip, unit === u && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, unit === u && styles.miniChipTxtOn]}>{u}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Field label="Durée (ex: 2-3 semaines)" value={duration} onChangeText={setDuration} />
        <Text style={styles.inputLbl}>Catégorie</Text>
        <ScrollView horizontal>
          {['Branding', 'Social Media', 'Conseil', 'Web'].map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.miniChip, category === c && styles.miniChipOn]}
            >
              <Text style={[styles.miniChipTxt, category === c && styles.miniChipTxtOn]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.rowSwitch}>
          <Text style={styles.switchTitle}>Marquer comme populaire</Text>
          <Switch value={popular} onValueChange={setPopular} trackColor={{ true: Colors.freelance }} />
        </View>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() =>
            onSave({
              title: title || 'Service',
              description: description || '—',
              price: Number(price) || 0,
              unit,
              duration: duration || '—',
              category,
              popular,
            })
          }
        >
          <Text style={styles.sheetPrimaryTxt}>Enregistrer</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const EditServiceSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; service: ServiceRow | null; onSave: (s: ServiceRow) => void }
>(function EditServiceSheet({ snap, renderBackdrop, service, onSave }, ref) {
  const [title, setTitle] = useState(service?.title ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [price, setPrice] = useState(service ? String(service.price) : '');
  const [unit, setUnit] = useState(service?.unit ?? 'projet');
  const [duration, setDuration] = useState(service?.duration ?? '');
  const [category, setCategory] = useState(service?.category ?? 'Branding');
  const [popular, setPopular] = useState(service?.popular ?? false);
  useEffect(() => {
    if (!service) return;
    setTitle(service.title);
    setDescription(service.description);
    setPrice(String(service.price));
    setUnit(service.unit);
    setDuration(service.duration);
    setCategory(service.category);
    setPopular(service.popular);
  }, [service]);
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        {service ? (
          <>
            <Text style={styles.sheetTitle}>Modifier le service</Text>
            <Field label="Nom" value={title} onChangeText={setTitle} />
            <Text style={styles.inputLbl}>Description</Text>
            <BottomSheetTextInput
              style={[styles.sheetInput, { minHeight: 80 }]}
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <Field label="Prix" value={price} onChangeText={setPrice} keyboardType="number-pad" />
            <Text style={styles.inputLbl}>Unité</Text>
            <ScrollView horizontal>
              {SERVICE_UNITS.map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[styles.miniChip, unit === u && styles.miniChipOn]}
                >
                  <Text style={[styles.miniChipTxt, unit === u && styles.miniChipTxtOn]}>{u}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Field label="Durée" value={duration} onChangeText={setDuration} />
            <View style={styles.rowSwitch}>
              <Text style={styles.switchTitle}>Populaire</Text>
              <Switch value={popular} onValueChange={setPopular} trackColor={{ true: Colors.freelance }} />
            </View>
            <Pressable
              style={styles.sheetPrimary}
              onPress={() =>
                onSave({
                  ...service,
                  title,
                  description,
                  price: Number(price) || 0,
                  unit,
                  duration,
                  category,
                  popular,
                })
              }
            >
              <Text style={styles.sheetPrimaryTxt}>Enregistrer</Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const AddClientSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onAdd: (c: Omit<ClientRow, 'id'>) => void }
>(function AddClientSheet({ snap, renderBackdrop, onAdd }, ref) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'BtoB' | 'BtoC'>('BtoB');
  const [project, setProject] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'En cours' | 'Terminé' | 'Prospect'>('En cours');

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snap}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
    >
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Nouveau client</Text>
        <Field label="Nom" value={name} onChangeText={setName} />
        <Text style={styles.inputLbl}>Type</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['BtoB', 'BtoC'] as const).map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[styles.miniChip, type === t && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, type === t && styles.miniChipTxtOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Projet" value={project} onChangeText={setProject} />
        <Field label="Valeur (€)" value={value} onChangeText={setValue} keyboardType="number-pad" />
        <Text style={styles.inputLbl}>Statut</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(['En cours', 'Terminé', 'Prospect'] as const).map((s) => (
            <Pressable key={s} onPress={() => setStatus(s)} style={[styles.miniChip, status === s && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, status === s && styles.miniChipTxtOn]}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!name.trim() || !project.trim()) {
              Alert.alert('Champs requis', 'Nom et projet sont requis.');
              return;
            }
            onAdd({
              name: name.trim(),
              type,
              status,
              project: project.trim(),
              value: Number(value) || 0,
              since: 'Aujourd’hui',
              imageUrl: null,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Ajouter</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const ClientDetailSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: SheetBackdrop;
    client: ClientRow | null;
    onClose: () => void;
    onContact: () => void;
    onEdit: () => void;
    onArchive: () => void;
  }
>(function ClientDetailSheet({ snap, renderBackdrop, client, onClose, onContact, onEdit, onArchive }, ref) {
  const steps = ['Contact', 'Devis', 'Livraison'] as const;
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        {client ? (
          <>
            <Text style={styles.sheetTitle}>{client.name}</Text>
            <Text style={styles.clientDetailMeta}>
              {client.type} · {client.status} · {client.since}
            </Text>
            <View style={styles.clientDetailCard}>
              <Text style={styles.clientDetailLbl}>Projet</Text>
              <Text style={styles.clientDetailVal}>{client.project}</Text>
              <Text style={styles.clientDetailLbl}>Valeur</Text>
              <Text style={styles.clientDetailVal}>{client.value}€</Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Timeline</Text>
            <View style={styles.timeline}>
              {steps.map((s, i) => (
                <View key={s} style={styles.timelineRow}>
                  <View style={[styles.timelineDot, i === 0 ? styles.timelineDotOn : styles.timelineDotOff]} />
                  <Text style={styles.timelineTxt}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.clientDetailBtns}>
              <Pressable style={styles.btnGray} onPress={onContact}>
                <Text style={styles.btnGrayTxt}>💬 Contacter</Text>
              </Pressable>
              <Pressable style={styles.btnGray} onPress={onEdit}>
                <Text style={styles.btnGrayTxt}>✏️ Modifier</Text>
              </Pressable>
              <Pressable style={styles.btnGray} onPress={onArchive}>
                <Text style={styles.btnGrayTxt}>🗄️ Archiver</Text>
              </Pressable>
            </View>
            <Pressable onPress={onClose} style={styles.sheetDismiss}>
              <Text style={styles.sheetDismissTxt}>Fermer</Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const AddSlotSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onAdd: (s: Omit<SlotRow, 'id'>) => void }
>(function AddSlotSheet({ snap, renderBackdrop, onAdd }, ref) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [dur, setDur] = useState<number>(60);
  const [type, setType] = useState('Consultation');
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Nouveau créneau</Text>
        <Field label="Date (ex: Lundi 12 mai)" value={date} onChangeText={setDate} />
        <Field label="Heure début (ex: 9h00)" value={time} onChangeText={setTime} />
        <Text style={styles.inputLbl}>Durée</Text>
        <ScrollView horizontal>
          {SLOT_DURATIONS.map((m) => (
            <Pressable key={m} onPress={() => setDur(m)} style={[styles.miniChip, dur === m && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, dur === m && styles.miniChipTxtOn]}>
                {m >= 120 && m < 480 ? `${m / 60}h` : m === 480 ? 'Journée' : `${m} min`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.inputLbl}>Type</Text>
        <ScrollView horizontal>
          {['Consultation', 'Projet', 'Réunion', 'Autre'].map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.miniChip, type === t && styles.miniChipOn]}
            >
              <Text style={[styles.miniChipTxt, type === t && styles.miniChipTxtOn]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!date.trim() || !time.trim()) {
              Alert.alert('Champs requis', 'Indiquez au moins la date et l’heure.');
              return;
            }
            onAdd({
              date: date.trim(),
              time: time.trim(),
              duration: dur,
              available: true,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Ajouter le créneau</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  headerDark: {
    backgroundColor: '#0D0F2E',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerInner: { flexDirection: 'row', gap: 14 },
  headerLeft: { flex: 1 },
  headerName: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  headerSpec: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pillDispo: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillDispoOn: { backgroundColor: 'rgba(22,163,74,0.2)' },
  pillDispoOff: { backgroundColor: 'rgba(220,38,38,0.2)' },
  pillDispoTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12 },
  pillDispoTxtOn: { color: '#16A34A' },
  pillDispoTxtOff: { color: '#DC2626' },
  pillLoc: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  pillLocTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  avatarFreelance: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2A2FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFreelanceTxt: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  verBadge: { position: 'absolute', bottom: -4, right: -4 },
  statsBar: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  statsMain: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  statsSub: { fontFamily: Fonts.body.family, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  yuniCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    ...Shadows.card,
  },
  yuniRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yuniLogo: { width: 48, height: 48, borderRadius: 24 },
  yuniTitle: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  yuniSub: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  yuniCta: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  yuniCtaTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },
  miniTabsOuter: { paddingHorizontal: 20, marginTop: 18 },
  miniTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 4,
    ...Shadows.card,
  },
  miniTab: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  miniTabAct: {
    backgroundColor: '#2A2FFF',
    shadowColor: '#2A2FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  miniTabTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 12, color: Colors.gray },
  miniTabTxtAct: { color: Colors.white },
  tabSection: { paddingHorizontal: 20, paddingTop: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  btnPurpleSm: {
    backgroundColor: '#2A2FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  btnPurpleSmTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  chipsRow: { gap: 8, paddingVertical: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  filterChipOn: { backgroundColor: '#2A2FFF', borderColor: '#2A2FFF' },
  filterChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.gray },
  filterChipTxtOn: { color: Colors.white },
  featuredCard: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: Colors.grayLight,
  },
  featuredImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  featuredGrad: { ...StyleSheet.absoluteFillObject },
  featuredOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  featuredBadgeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: Colors.white },
  featuredTitle: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  featuredMeta: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tagChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagChipTxt: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.white },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'space-between' },
  gridCell: {
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: Colors.grayLight,
  },
  gridImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  gridGrad: { ...StyleSheet.absoluteFillObject },
  gridOverlay: { position: 'absolute', left: 8, right: 8, bottom: 8 },
  gridTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  gridCat: { fontFamily: Fonts.body.family, fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  portfolioSlide: {
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.grayLight,
  },
  portfolioSlideImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  portfolioSlideGrad: { ...StyleSheet.absoluteFillObject },
  portfolioSlideOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  portfolioCatPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  portfolioCatPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  portfolioTitle: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.white },
  portfolioMeta: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: '#2A2FFF' },
  dotOff: { backgroundColor: '#D1D5DB' },
  addProjectWide: {
    marginTop: 14,
    backgroundColor: '#2A2FFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addProjectWideTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },

  clientCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  clientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.grayLight },
  clientAvatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF' },
  clientAvatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: '#2A2FFF' },
  clientName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  clientProject: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 4 },
  clientStatusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  clientStatusOn: { backgroundColor: '#EEF2FF' },
  clientStatusDone: { backgroundColor: '#DCFCE7' },
  clientStatusProspect: { backgroundColor: '#FEF3C7' },
  clientStatusTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11 },
  clientStatusTxtOn: { color: '#2A2FFF' },
  clientStatusTxtDone: { color: '#16A34A' },
  clientStatusTxtProspect: { color: '#D97706' },
  clientType: { fontFamily: Fonts.body.family, fontSize: 10, color: Colors.gray },
  clientValue: { fontFamily: Fonts.title.family, fontSize: 14, color: '#2A2FFF' },

  revenueCard: {
    marginTop: 16,
    backgroundColor: '#0D0F2E',
    borderRadius: 20,
    padding: 20,
  },
  revenueKicker: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  revenueValue: { fontFamily: Fonts.title.family, fontSize: 36, color: Colors.white, fontWeight: '900', marginTop: 8 },
  revenueDelta: { fontFamily: Fonts.body.family, fontSize: 13, color: '#16A34A', marginTop: 6 },
  revenueStatsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  revenueStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  revenueStatV: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  revenueStatL: { fontFamily: Fonts.body.family, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  clientDetailMeta: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginBottom: 10 },
  clientDetailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  clientDetailLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.gray, marginTop: 8 },
  clientDetailVal: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, marginTop: 4 },
  timeline: { marginTop: 10, backgroundColor: Colors.white, borderRadius: 16, padding: 14, ...Shadows.card },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineDotOn: { backgroundColor: '#2A2FFF' },
  timelineDotOff: { backgroundColor: '#D1D5DB' },
  timelineTxt: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.dark },
  clientDetailBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    ...Shadows.card,
  },
  serviceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  serviceTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark, flex: 1 },
  popularBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  popularBadgeTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 10, color: '#D97706' },
  serviceDesc: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 8 },
  serviceMeta: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray, marginTop: 8 },
  serviceBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  servicePrice: { fontFamily: Fonts.title.family, fontSize: 24, color: '#2A2FFF', fontWeight: '800' },
  serviceUnit: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, fontWeight: '400' },
  serviceActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnGray: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnGrayTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark },
  trash: { fontSize: 18 },
  avgBig: {
    fontFamily: Fonts.title.family,
    fontSize: 48,
    color: '#2A2FFF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '800',
  },
  avgSub: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, textAlign: 'center' },
  starsCenter: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginVertical: 8 },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    ...Shadows.card,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAv: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 13, color: Colors.primary },
  reviewClient: { flex: 1, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  reviewDate: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 6 },
  reviewComment: { fontFamily: Fonts.body.family, fontSize: 14, color: Colors.textBody, marginTop: 8, lineHeight: 20 },
  repliedOk: { fontFamily: Fonts.body.family, fontSize: 12, color: '#16A34A', marginTop: 8 },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    ...Shadows.card,
  },
  switchTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  switchSub: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray, marginTop: 4 },
  subSectionTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark, marginTop: 16 },
  slotSectionLbl: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.dark, marginTop: 8 },
  dateHeader: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.gray, marginTop: 12, marginBottom: 6 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    ...Shadows.card,
  },
  slotCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCircleFree: { backgroundColor: 'rgba(124,58,237,0.1)' },
  slotCircleBusy: { backgroundColor: '#F3F4F6' },
  slotTime: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.dark },
  slotDur: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  slotPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  slotPillFree: { backgroundColor: '#DCFCE7' },
  slotPillBusy: { backgroundColor: '#FEE2E2' },
  slotPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11 },
  slotPillTxtFree: { color: '#16A34A' },
  slotPillTxtBusy: { color: '#DC2626' },
  slotIconBtn: { fontSize: 18, padding: 4 },
  contactSettings: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    ...Shadows.card,
  },
  rowSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grayBorder,
  },
  inputLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark, marginTop: 10, marginBottom: 6 },
  inputField: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    padding: 12,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  peersSub: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginBottom: 10 },
  peersScroll: { gap: 12, paddingBottom: 8 },
  peerCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    ...Shadows.card,
  },
  peerImg: { width: 60, height: 60, borderRadius: 30 },
  peerName: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark, marginTop: 8 },
  peerSpec: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  peerBtn: {
    marginTop: 10,
    backgroundColor: '#2A2FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  peerBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  sheetPad: { padding: 20, paddingBottom: 40 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark, marginBottom: 12 },
  sheetInput: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    padding: 12,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
    textAlignVertical: 'top',
  },
  sheetField: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    padding: 12,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 8,
  },
  sheetPrimary: {
    backgroundColor: '#2A2FFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  sheetPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  sheetDismiss: { alignItems: 'center', marginTop: 16 },
  sheetDismissTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  uploadZone: {
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  uploadPreview: { width: '100%', height: 160, resizeMode: 'cover' },
  uploadRm: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadHint: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 8 },
  miniChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  miniChipOn: { backgroundColor: '#2A2FFF' },
  miniChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.dark },
  miniChipTxtOn: { color: Colors.white },
  detailHero: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12, backgroundColor: Colors.grayLight },
  detailTitle: { fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark },
  detailMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 },
  catPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  catPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.primary },
  detailYear: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  detailClient: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  detailDesc: { fontFamily: Fonts.body.family, fontSize: 15, color: Colors.textBody, marginTop: 12, lineHeight: 22 },
  tagPurple: { backgroundColor: 'rgba(124,58,237,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagPurpleTxt: { fontFamily: Fonts.body.family, fontSize: 12, color: '#2A2FFF' },
  detailBtns: { gap: 10, marginTop: 16 },
  yuniRecCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  yuniRecTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  yuniRecDesc: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6 },
  yuniRecLink: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.primary, marginTop: 8 },
});
