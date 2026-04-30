import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
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
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import {
  MOCK_ACTIONS,
  MOCK_ASSO,
  MOCK_EVENTS,
  MOCK_MEMBERS,
  MOCK_SUPPORTERS,
} from '@/constants/mockAssociationProfile';

type TabKey = 'impact' | 'agenda' | 'community' | 'support';

type AssoAction = {
  id: string;
  title: string;
  date: string;
  participants: number;
  impact: string;
  imageUrl: string;
  category: 'Culture' | 'Formation' | 'Événement' | string;
  imageUri?: string | null;
};

type AssoEvent = {
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
  isJoined: boolean;
  status: 'upcoming' | 'past' | string;
};

type AssoMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  joined: string;
  active: boolean;
  events: number;
};

type AssoSupporter = {
  id: string;
  name: string;
  type: string;
  amount: number;
  logo: string;
  color: string;
  since: string;
  inkind?: string;
};

const ACCENT = '#2A2FFF';
const HEADER_BG = '#0D0F2E';
// Garder l’orange uniquement pour la catégorie principale / contenus “culture”
const CATEGORY_ORANGE = '#D97706';

function initialsFrom(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0]![0]}${p[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'AS';
}

export function AssociationDashboard() {
  const insets = useSafeAreaInsets();
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const isOwner = user?.profileType === 'association';
  const asso = MOCK_ASSO;

  const [tab, setTab] = useState<TabKey>('impact');
  const [actions, setActions] = useState<AssoAction[]>(() => MOCK_ACTIONS.map((a) => ({ ...a } as AssoAction)));
  const [events, setEvents] = useState<AssoEvent[]>(() => MOCK_EVENTS.map((e) => ({ ...e } as AssoEvent)));
  const [members, setMembers] = useState<AssoMember[]>(() => MOCK_MEMBERS.map((m) => ({ ...m } as AssoMember)));
  const [supporters, setSupporters] = useState<AssoSupporter[]>(() => MOCK_SUPPORTERS.map((s) => ({ ...s } as AssoSupporter)));

  const [eventFilter, setEventFilter] = useState<'Tous' | 'À venir' | 'Gratuits' | 'Payants'>('Tous');
  const filteredEvents = useMemo(() => {
    if (eventFilter === 'Tous') return events;
    if (eventFilter === 'À venir') return events.filter((e) => e.status === 'upcoming');
    if (eventFilter === 'Gratuits') return events.filter((e) => e.price.toLowerCase().includes('gratuit'));
    return events.filter((e) => !e.price.toLowerCase().includes('gratuit'));
  }, [eventFilter, events]);

  const [memberQuery, setMemberQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Tous' | 'Fondateurs' | 'Admins' | 'Bénévoles' | 'Membres'>('Tous');
  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    let list = members;
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q));
    if (roleFilter === 'Tous') return list;
    if (roleFilter === 'Fondateurs') return list.filter((m) => m.role.toLowerCase().includes('fondat'));
    if (roleFilter === 'Admins') return list.filter((m) => m.role.toLowerCase().includes('admin'));
    if (roleFilter === 'Bénévoles') return list.filter((m) => m.role === 'Bénévole');
    return list.filter((m) => m.role === 'Membre');
  }, [memberQuery, members, roleFilter]);

  const yuniSheetRef = useRef<BottomSheetModal>(null);
  const addActionRef = useRef<BottomSheetModal>(null);
  const editActionRef = useRef<BottomSheetModal>(null);
  const createEventRef = useRef<BottomSheetModal>(null);
  const inviteRef = useRef<BottomSheetModal>(null);
  const donRef = useRef<BottomSheetModal>(null);
  const addSupporterRef = useRef<BottomSheetModal>(null);

  const [editingAction, setEditingAction] = useState<AssoAction | null>(null);

  const snap50 = useMemo(() => ['50%'], []);
  const snap60 = useMemo(() => ['60%'], []);
  const snap80 = useMemo(() => ['80%'], []);
  const snap90 = useMemo(() => ['90%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
    ),
    [],
  );

  const monthBars = useMemo(() => {
    // 7 derniers mois (mock) — hauteur proportionnelle
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
    const values = [2, 3, 4, 3, 5, 6, 8];
    const max = Math.max(...values);
    return months.map((m, i) => ({ m, v: values[i]!, pct: (values[i]! / max) * 100 }));
  }, []);

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
              <Text style={styles.headerName}>{asso.name}</Text>
              <View style={styles.catPill}>
                <Text style={styles.catPillTxt}>{asso.category}</Text>
              </View>
              <Text style={styles.headerLoc}>📍 Parvis Cathédrale · Reims</Text>
            </View>
            <View>
              <View style={[styles.avatar, { backgroundColor: asso.avatarColor }]}>
                <Text style={styles.avatarTxt}>{asso.initials}</Text>
              </View>
              {asso.verified ? (
                <View style={styles.verBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.statsBar}>
            <Text style={styles.statsMain}>89 membres · 18 événements · 2 340 bénéficiaires</Text>
            <Text style={styles.statsSub}>Impact local et engagement</Text>
          </View>
        </SafeAreaView>

        <View style={[styles.yuniCard, { backgroundColor: ACCENT }]}>
          <Text style={styles.yuniTitle}>✨ Yuni AI</Text>
          <Text style={styles.yuniSub}>3 opportunités pour votre association</Text>
          <TouchableOpacity style={styles.yuniCta} onPress={() => yuniSheetRef.current?.present()} activeOpacity={0.9}>
            <Text style={styles.yuniCtaTxt}>Voir les suggestions →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            {(
              [
                ['impact', '🏆 Impact'],
                ['agenda', '📅 Agenda'],
                ['community', '👥 Communauté'],
                ['support', '💡 Soutiens'],
              ] as const
            ).map(([id, label]) => (
              <Pressable key={id} onPress={() => setTab(id)} style={[styles.tabBtn, tab === id && styles.tabBtnOn]}>
                <Text style={[styles.tabTxt, tab === id && styles.tabTxtOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {tab === 'impact' ? (
          <ImpactTab
            isOwner={isOwner}
            actions={actions}
            setActions={setActions}
            monthBars={monthBars}
            onAddAction={() => addActionRef.current?.present()}
            onOpenAction={(a) => {
              router.push({
                pathname: '/(app)/actions/[id]',
                params: { id: a.id, data: encodeURIComponent(JSON.stringify(a)) },
              });
            }}
            onEditAction={(a) => {
              setEditingAction(a);
              editActionRef.current?.present();
            }}
          />
        ) : null}

        {tab === 'agenda' ? (
          <AgendaTab
            isOwner={isOwner}
            events={filteredEvents}
            setEvents={setEvents}
            filter={eventFilter}
            setFilter={setEventFilter}
            onCreate={() => createEventRef.current?.present()}
          />
        ) : null}

        {tab === 'community' ? (
          <CommunityTab
            isOwner={isOwner}
            query={memberQuery}
            setQuery={setMemberQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            members={filteredMembers}
            onInvite={() => inviteRef.current?.present()}
          />
        ) : null}

        {tab === 'support' ? (
          <SupportTab
            isOwner={isOwner}
            supporters={supporters}
            setSupporters={setSupporters}
            onDonate={() => donRef.current?.present()}
            onAddSupporter={() => addSupporterRef.current?.present()}
          />
        ) : null}
      </ScrollView>

      <YuniAssoSheet
        ref={yuniSheetRef}
        snap={snap60}
        renderBackdrop={renderBackdrop}
        onClose={() => yuniSheetRef.current?.dismiss()}
        onTribe={() => {
          yuniSheetRef.current?.dismiss();
          router.push('/(app)/(tabs)/tribus');
        }}
        onCreateEvent={() => {
          yuniSheetRef.current?.dismiss();
          createEventRef.current?.present();
        }}
      />

      <AddActionSheet
        ref={addActionRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        onSave={(a) => {
          setActions((prev) => [{ ...a, id: `ac-${Date.now()}` }, ...prev]);
          addActionRef.current?.dismiss();
        }}
      />

      <EditActionSheet
        ref={editActionRef}
        snap={snap80}
        renderBackdrop={renderBackdrop}
        action={editingAction}
        onSave={(a) => {
          setActions((prev) => prev.map((x) => (x.id === a.id ? a : x)));
          editActionRef.current?.dismiss();
          setEditingAction(null);
        }}
        onDelete={(id) => {
          setActions((prev) => prev.filter((x) => x.id !== id));
          editActionRef.current?.dismiss();
          setEditingAction(null);
        }}
        onCancel={() => {
          editActionRef.current?.dismiss();
          setEditingAction(null);
        }}
      />

      <CreateEventSheet
        ref={createEventRef}
        snap={snap90}
        renderBackdrop={renderBackdrop}
        onPublish={(ev) => {
          setEvents((prev) => [{ ...ev, id: `ev-${Date.now()}` }, ...prev]);
          createEventRef.current?.dismiss();
        }}
      />

      <InviteSheet
        ref={inviteRef}
        snap={snap50}
        renderBackdrop={renderBackdrop}
        onSend={(email) => {
          inviteRef.current?.dismiss();
          Alert.alert('Invitation envoyée ✓', `Invitation envoyée à ${email} (mock).`);
        }}
      />

      <DonSheet
        ref={donRef}
        snap={snap60}
        renderBackdrop={renderBackdrop}
        onDonate={() => {
          donRef.current?.dismiss();
          Alert.alert('Merci pour votre soutien !', 'Votre don a bien été enregistré (mock).');
        }}
      />

      <AddSupporterSheet
        ref={addSupporterRef}
        snap={snap60}
        renderBackdrop={renderBackdrop}
        onAdd={(s) => {
          setSupporters((prev) => [{ ...s, id: `s-${Date.now()}` }, ...prev]);
          addSupporterRef.current?.dismiss();
        }}
      />
    </View>
  );
}

function ImpactTab({
  isOwner,
  actions,
  setActions,
  monthBars,
  onAddAction,
  onOpenAction,
  onEditAction,
}: {
  isOwner: boolean;
  actions: AssoAction[];
  setActions: React.Dispatch<React.SetStateAction<AssoAction[]>>;
  monthBars: { m: string; v: number; pct: number }[];
  onAddAction: () => void;
  onOpenAction: (a: AssoAction) => void;
  onEditAction: (a: AssoAction) => void;
}) {
  const keyCards = [
    ['🎭', '45', 'actions'],
    ['🙋', '2 340', 'bénéficiaires'],
    ['⏰', '456h', 'bénévolat'],
    ['👥', '89', 'membres'],
    ['📅', '18', 'événements'],
    ['🤝', '12', 'bénévoles actifs'],
  ] as const;

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiRail}
      >
        {keyCards.map(([icon, val, label]) => (
          <View key={label} style={styles.kpiCardH}>
            <View style={styles.kpiIconWrap}>
              <Text style={styles.kpiIconH}>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.kpiValH}>{val}</Text>
              <Text style={styles.kpiLblH}>{label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Activité cette année</Text>
      <View style={styles.chartCard}>
        <View style={styles.chartBars}>
          {monthBars.map((b) => (
            <View key={b.m} style={{ alignItems: 'center', width: 34 }}>
              <View style={[styles.chartBar, { height: Math.max(8, (b.pct / 100) * 120) }]} />
              <Text style={styles.chartLbl}>{b.m}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.chartHint}>Pic d’activité en Juillet 🔥</Text>
      </View>

      <View style={[styles.rowBetween, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Dernières actions 🏆</Text>
        <Pressable style={styles.btnAccentSm} onPress={onAddAction}>
          <Text style={styles.btnAccentSmTxt}>+ Nouvelle action</Text>
        </Pressable>
      </View>

      {actions.map((a) => (
        <Pressable key={a.id} style={styles.actionCard} onPress={() => onOpenAction(a)}>
          <View style={{ height: 120 }}>
            <Image source={{ uri: a.imageUri ?? a.imageUrl }} style={styles.actionImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.actionGrad} />
            <View style={styles.actionOverlay}>
              <View style={[styles.actionCat, { backgroundColor: CATEGORY_ORANGE }]}>
                <Text style={styles.actionCatTxt}>{a.category}</Text>
              </View>
              <Text style={styles.actionTitle}>{a.title}</Text>
            </View>
          </View>
          <View style={{ padding: 12 }}>
            <Text style={styles.actionMeta}>
              📅 {a.date} · 👥 {a.participants} participants · 🎯 {a.impact}
            </Text>
            {isOwner ? (
              <View style={styles.actionBtns}>
                <Pressable
                  style={styles.iconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onEditAction(a);
                  }}
                >
                  <Text style={styles.iconBtnTxt}>✏️</Text>
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert('Supprimer', 'Retirer cette action ?', [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: () => setActions((prev) => prev.filter((x) => x.id !== a.id)),
                      },
                    ])
                  }}
                >
                  <Text style={styles.iconBtnTxt}>🗑️</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function AgendaTab({
  isOwner,
  events,
  setEvents,
  filter,
  setFilter,
  onCreate,
}: {
  isOwner: boolean;
  events: AssoEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AssoEvent[]>>;
  filter: 'Tous' | 'À venir' | 'Gratuits' | 'Payants';
  setFilter: (v: 'Tous' | 'À venir' | 'Gratuits' | 'Payants') => void;
  onCreate: () => void;
}) {
  const filters = ['Tous', 'À venir', 'Gratuits', 'Payants'] as const;
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Prochains événements 📅</Text>
        <Pressable style={styles.btnAccentSm} onPress={onCreate}>
          <Text style={styles.btnAccentSmTxt}>+ Créer</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8 }}>
        {filters.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillOn]}>
            <Text style={[styles.filterPillTxt, filter === f && styles.filterPillTxtOn]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {events.map((ev) => {
        const ratio = Math.min(1, ev.attendees / ev.maxAttendees);
        const isFree = ev.price.toLowerCase().includes('gratuit');
        return (
          <View key={ev.id} style={styles.eventCard}>
            <Image source={{ uri: ev.imageUri ?? ev.imageUrl }} style={styles.eventImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.eventGrad} />

            <View style={[styles.eventPricePill, { backgroundColor: isFree ? '#16A34A' : ACCENT }]}>
              <Text style={styles.eventPriceTxt}>{isFree ? 'Gratuit' : ev.price}</Text>
            </View>

            {isOwner ? (
              <View style={styles.eventOwnerBtns}>
                {['✏️', '🗑️', '📊'].map((t) => (
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
                      Alert.alert('Action', `${t} (mock)`);
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
                  <Text style={styles.eventCap}>{ev.attendees}/{ev.maxAttendees}</Text>
                  <View style={styles.capTrack}>
                    <View style={[styles.capFill, { width: `${Math.round(ratio * 100)}%` }]} />
                  </View>
                </View>
                <Pressable
                  style={[styles.joinBtn, ev.isJoined ? styles.joinBtnOn : styles.joinBtnOff]}
                  onPress={() => {
                    setEvents((prev) =>
                      prev.map((x) => (x.id === ev.id ? { ...x, isJoined: !x.isJoined } : x)),
                    );
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

function CommunityTab({
  isOwner,
  query,
  setQuery,
  roleFilter,
  setRoleFilter,
  members,
  onInvite,
}: {
  isOwner: boolean;
  query: string;
  setQuery: (s: string) => void;
  roleFilter: 'Tous' | 'Fondateurs' | 'Admins' | 'Bénévoles' | 'Membres';
  setRoleFilter: (v: 'Tous' | 'Fondateurs' | 'Admins' | 'Bénévoles' | 'Membres') => void;
  members: AssoMember[];
  onInvite: () => void;
}) {
  const rolePills = ['Tous', 'Fondateurs', 'Admins', 'Bénévoles', 'Membres'] as const;
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Nos membres 👥</Text>
        <Pressable style={styles.btnAccentSm} onPress={onInvite}>
          <Text style={styles.btnAccentSmTxt}>Inviter +</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un membre…"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8 }}>
        {rolePills.map((r) => (
          <Pressable key={r} onPress={() => setRoleFilter(r)} style={[styles.filterPill, roleFilter === r && styles.filterPillOn]}>
            <Text style={[styles.filterPillTxt, roleFilter === r && styles.filterPillTxtOn]}>{r}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.engageRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.engageMain}>12 bénévoles actifs ce mois</Text>
          <Text style={styles.engageSub}>89 membres au total</Text>
        </View>
        <Text style={styles.engageUp}>↑ +3 nouveaux ce mois</Text>
      </View>

      {members.map((m) => {
        const r = m.role.toLowerCase();
        const isFounder = r.includes('fondat');
        const isAdmin = r.includes('admin');
        const isVolunteer = r.includes('bénév');
        const roleStyle = isFounder ? styles.roleFounder : isAdmin ? styles.roleAdmin : isVolunteer ? styles.roleVolunteer : styles.roleMember;
        const roleTxt = isFounder ? styles.roleFounderTxt : isAdmin ? styles.roleAdminTxt : isVolunteer ? styles.roleVolunteerTxt : styles.roleMemberTxt;
        return (
          <View key={m.id} style={styles.memberCard}>
            <View style={[styles.memberAvatar, { backgroundColor: m.color }]}>
              <Text style={styles.memberAvatarTxt}>{m.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{m.name}</Text>
              <View style={[styles.rolePill, roleStyle]}>
                <Text style={[styles.rolePillTxt, roleTxt]}>{m.role}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.memberEvents}>{m.events} événements</Text>
              <View style={[styles.activeDot, { backgroundColor: m.active ? '#16A34A' : '#9CA3AF' }]} />
            </View>
          </View>
        );
      })}

      <Text style={[styles.subTitle, { marginTop: 18 }]}>Rejoindre comme bénévole</Text>
      <Text style={styles.bodyText}>
        Participez aux événements et à l’organisation. Votre aide est précieuse.
      </Text>
      <Pressable style={styles.primaryWide} onPress={() => Alert.alert('Bénévolat', 'Votre candidature a été envoyée ! (mock)')}>
        <Text style={styles.primaryWideTxt}>Je veux aider</Text>
      </Pressable>

      {isOwner ? (
        <Text style={styles.ownerHint}>Gestion avancée (swipe / rôles) à venir.</Text>
      ) : null}
    </View>
  );
}

function SupportTab({
  isOwner,
  supporters,
  setSupporters,
  onDonate,
  onAddSupporter,
}: {
  isOwner: boolean;
  supporters: AssoSupporter[];
  setSupporters: React.Dispatch<React.SetStateAction<AssoSupporter[]>>;
  onDonate: () => void;
  onAddSupporter: () => void;
}) {
  const total = supporters.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const goal = 5000;
  const pct = Math.max(0, Math.min(1, total / goal));
  return (
    <View style={styles.section}>
      <View style={styles.budgetCard}>
        <Text style={styles.budgetKicker}>BUDGET ANNUEL</Text>
        <Text style={styles.budgetValue}>{total.toLocaleString('fr-FR')} €</Text>
        <View style={styles.progTrack}>
          <View style={[styles.progFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
        <Text style={styles.budgetSub}>{Math.round(pct * 100)}% de l’objectif (5 000€)</Text>

        <View style={styles.budgetStatsRow}>
          {[
            ['4', 'soutiens'],
            [`${total.toLocaleString('fr-FR')}€`, 'collectés'],
            [`${Math.max(0, goal - total).toLocaleString('fr-FR')}€`, 'restants'],
          ].map(([v, l]) => (
            <View key={l} style={styles.budgetStat}>
              <Text style={styles.budgetStatV}>{v}</Text>
              <Text style={styles.budgetStatL}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.primaryWide} onPress={onDonate}>
        <Text style={styles.primaryWideTxt}>Soutenir l’association</Text>
      </Pressable>

      <View style={[styles.rowBetween, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>Nos partenaires & soutiens</Text>
        {isOwner ? (
          <Pressable style={styles.btnAccentSm} onPress={onAddSupporter}>
            <Text style={styles.btnAccentSmTxt}>+ Ajouter</Text>
          </Pressable>
        ) : null}
      </View>

      {supporters.map((s) => (
        <View key={s.id} style={styles.supporterCard}>
          <View style={[styles.supporterLogo, { backgroundColor: s.color }]}>
            <Text style={styles.supporterLogoTxt}>{s.logo}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supporterName}>{s.name}</Text>
            <Text style={styles.supporterType}>
              {s.type} · Depuis {s.since}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            {s.amount > 0 ? (
              <Text style={styles.supporterAmt}>{s.amount} €</Text>
            ) : s.inkind ? (
              <View style={styles.inkindPill}>
                <Text style={styles.inkindTxt}>En nature</Text>
              </View>
            ) : (
              <Text style={styles.supporterAmt}>—</Text>
            )}
          </View>
        </View>
      ))}

      {supporters.length < 5 ? (
        <LinearGradient colors={[ACCENT, '#1E1B4B']} style={styles.calloutCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.calloutTitle}>🤝 Vous souhaitez soutenir Jazz au Parvis ?</Text>
          <Text style={styles.calloutSub}>Rejoignez nos partenaires et participez à la vie culturelle rémoise</Text>
          <Pressable
            style={styles.calloutBtn}
            onPress={() => Alert.alert('Contact', 'Message envoyé à l’association (mock).')}
          >
            <Text style={styles.calloutBtnTxt}>Nous contacter</Text>
          </Pressable>
        </LinearGradient>
      ) : null}

      <Text style={[styles.subTitle, { marginTop: 18 }]}>Trouver des soutiens locaux 🌍</Text>
      <View style={{ gap: 10, marginTop: 10 }}>
        {[
          { name: 'Maison des associations', desc: 'Aide logistique & visibilité locale' },
          { name: 'Commerce du centre', desc: 'Soutien en nature pour vos événements' },
          { name: 'Institution culturelle', desc: 'Appel à projets 2026' },
        ].map((c) => (
          <View key={c.name} style={styles.suggestCard}>
            <Text style={styles.suggestName}>{c.name}</Text>
            <Text style={styles.suggestDesc}>{c.desc}</Text>
            <Pressable onPress={() => Alert.alert('Partenariat', 'Proposition envoyée ✓ (mock).')}>
              <Text style={styles.suggestLink}>Proposer un partenariat →</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

type SheetBackdrop = (p: BottomSheetBackdropProps) => ReactElement;

const YuniAssoSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: SheetBackdrop;
    onClose: () => void;
    onTribe: () => void;
    onCreateEvent: () => void;
  }
>(function YuniAssoSheet({ snap, renderBackdrop, onClose, onTribe, onCreateEvent }, ref) {
  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snap}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.white }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Yuni AI — Association</Text>
        <Pressable style={styles.yuniRecCard} onPress={onTribe}>
          <Text style={styles.yuniRecTitle}>Rejoignez la Tribu Culture pour +45% de visibilité</Text>
          <Text style={styles.yuniRecDesc}>Connectez-vous à des acteurs culturels locaux.</Text>
          <Text style={styles.yuniRecLink}>Voir les tribus →</Text>
        </Pressable>
        <Pressable style={styles.yuniRecCard} onPress={onCreateEvent}>
          <Text style={styles.yuniRecTitle}>Publiez votre prochain événement maintenant</Text>
          <Text style={styles.yuniRecDesc}>Les événements récents performent mieux.</Text>
          <Text style={styles.yuniRecLink}>Créer un événement →</Text>
        </Pressable>
        <Pressable
          style={styles.yuniRecCard}
          onPress={() => Alert.alert('Opportunités', '2 commerces cherchent des assos culturelles à soutenir (mock).')}
        >
          <Text style={styles.yuniRecTitle}>2 commerces cherchent des assos culturelles à soutenir</Text>
          <Text style={styles.yuniRecDesc}>Proposez un partenariat en 1 clic.</Text>
          <Text style={styles.yuniRecLink}>Détails →</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.sheetDismiss}>
          <Text style={styles.sheetDismissTxt}>Fermer</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const AddActionSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onSave: (a: Omit<AssoAction, 'id'>) => void }
>(function AddActionSheet({ snap, renderBackdrop, onSave }, ref) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<'Culture' | 'Formation' | 'Événement'>('Culture');
  const [participants, setParticipants] = useState('');
  const [impact, setImpact] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo', 'Autorise l’accès à la photothèque.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!r.canceled && r.assets[0]?.uri) setImageUri(r.assets[0].uri);
  };

  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Nouvelle action</Text>
        <Field label="Titre" value={title} onChangeText={setTitle} />
        <Field label="Date" value={date} onChangeText={setDate} />
        <Text style={styles.inputLbl}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(['Culture', 'Formation', 'Événement'] as const).map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[styles.miniChip, category === c && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, category === c && styles.miniChipTxtOn]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Field label="Participants" value={participants} onChangeText={setParticipants} keyboardType="number-pad" />
        <Field label="Impact" value={impact} onChangeText={setImpact} />
        <Pressable style={styles.uploadZone} onPress={() => void pick()}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadPreview} />
          ) : (
            <>
              <Ionicons name="image-outline" size={40} color={Colors.gray} />
              <Text style={styles.uploadHint}>Upload photo</Text>
            </>
          )}
        </Pressable>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!title.trim()) {
              Alert.alert('Action', 'Titre requis.');
              return;
            }
            onSave({
              title: title.trim(),
              date: date.trim() || '—',
              category,
              participants: Number(participants) || 0,
              impact: impact.trim() || '—',
              imageUrl: MOCK_ACTIONS[0]!.imageUrl,
              imageUri,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Enregistrer l’action</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const EditActionSheet = forwardRef<
  BottomSheetModal,
  {
    snap: string[];
    renderBackdrop: SheetBackdrop;
    action: AssoAction | null;
    onSave: (a: AssoAction) => void;
    onDelete: (id: string) => void;
    onCancel: () => void;
  }
>(function EditActionSheet({ snap, renderBackdrop, action, onSave, onDelete, onCancel }, ref) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<'Culture' | 'Formation' | 'Événement'>('Culture');
  const [participants, setParticipants] = useState('');
  const [impact, setImpact] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // sync fields when action changes
  useEffect(() => {
    if (!action) return;
    setTitle(action.title ?? '');
    setDate(action.date ?? '');
    setCategory((['Culture', 'Formation', 'Événement'] as const).includes(action.category as any) ? (action.category as any) : 'Culture');
    setParticipants(String(action.participants ?? 0));
    setImpact(action.impact ?? '');
    setImageUri(action.imageUri ?? null);
  }, [action]);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo', 'Autorise l’accès à la photothèque.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!r.canceled && r.assets[0]?.uri) setImageUri(r.assets[0].uri);
  };

  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad} keyboardShouldPersistTaps="handled">
        <Text style={styles.sheetTitle}>Modifier l’action</Text>
        <Field label="Titre" value={title} onChangeText={setTitle} />
        <Field label="Date" value={date} onChangeText={setDate} />
        <Text style={styles.inputLbl}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(['Culture', 'Formation', 'Événement'] as const).map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[styles.miniChip, category === c && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, category === c && styles.miniChipTxtOn]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Field label="Participants" value={participants} onChangeText={setParticipants} keyboardType="number-pad" />
        <Field label="Impact" value={impact} onChangeText={setImpact} />
        <Pressable style={styles.uploadZone} onPress={() => void pick()}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadPreview} />
          ) : (
            <>
              <Ionicons name="image-outline" size={40} color={Colors.gray} />
              <Text style={styles.uploadHint}>Changer la photo</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!action) {
              onCancel();
              return;
            }
            if (!title.trim()) {
              Alert.alert('Action', 'Titre requis.');
              return;
            }
            onSave({
              ...action,
              title: title.trim(),
              date: date.trim() || '—',
              category,
              participants: Number(participants) || 0,
              impact: impact.trim() || '—',
              imageUri,
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Enregistrer</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            style={[styles.sheetPrimary, { flex: 1, backgroundColor: '#F3F4F6', marginTop: 0 }]}
            onPress={onCancel}
          >
            <Text style={[styles.sheetPrimaryTxt, { color: Colors.dark }]}>Annuler</Text>
          </Pressable>
          <Pressable
            style={[styles.sheetPrimary, { flex: 1, backgroundColor: '#DC2626', marginTop: 0 }]}
            onPress={() => {
              if (!action) return;
              Alert.alert('Supprimer', 'Retirer cette action ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(action.id) },
              ]);
            }}
          >
            <Text style={styles.sheetPrimaryTxt}>Supprimer</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const CreateEventSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onPublish: (e: Omit<AssoEvent, 'id'>) => void }
>(function CreateEventSheet({ snap, renderBackdrop, onPublish }, ref) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState<'Gratuit' | 'Payant'>('Gratuit');
  const [amount, setAmount] = useState('');
  const [cap, setCap] = useState('80');
  const [visibility, setVisibility] = useState<'Publique' | 'Membres'>('Publique');
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
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadPreview} />
          ) : (
            <>
              <Ionicons name="image-outline" size={40} color={Colors.gray} />
              <Text style={styles.uploadHint}>Upload image couverture</Text>
            </>
          )}
        </Pressable>
        <Field label="Titre" value={title} onChangeText={setTitle} />
        <Field label="Date & heure" value={date} onChangeText={setDate} />
        <Field label="Lieu" value={location} onChangeText={setLocation} />
        <Text style={styles.inputLbl}>Description</Text>
        <BottomSheetTextInput style={[styles.sheetInput, { minHeight: 90 }]} value={desc} onChangeText={setDesc} multiline />
        <Text style={styles.inputLbl}>Prix</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Gratuit', 'Payant'] as const).map((p) => (
            <Pressable key={p} onPress={() => setPrice(p)} style={[styles.miniChip, price === p && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, price === p && styles.miniChipTxtOn]}>{p}</Text>
            </Pressable>
          ))}
        </View>
        {price === 'Payant' ? (
          <Field label="Montant (€)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
        ) : null}
        <Field label="Capacité max" value={cap} onChangeText={setCap} keyboardType="number-pad" />
        <Text style={styles.inputLbl}>Visibilité</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Publique', 'Membres'] as const).map((v) => (
            <Pressable key={v} onPress={() => setVisibility(v)} style={[styles.miniChip, visibility === v && styles.miniChipOn]}>
              <Text style={[styles.miniChipTxt, visibility === v && styles.miniChipTxtOn]}>{v}</Text>
            </Pressable>
          ))}
        </View>
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
              location: location.trim() || 'Reims',
              imageUrl: MOCK_EVENTS[0]!.imageUrl,
              imageUri,
              attendees: 0,
              maxAttendees: Number(cap) || 80,
              price: price === 'Gratuit' ? 'Gratuit' : `${Number(amount) || 0}€`,
              description: desc.trim() || '—',
              isJoined: false,
              status: 'upcoming',
            });
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Publier l’événement 🚀</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const InviteSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onSend: (email: string) => void }
>(function InviteSheet({ snap, renderBackdrop, onSend }, ref) {
  const [email, setEmail] = useState('');
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Inviter un membre</Text>
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="default" />
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            const v = email.trim();
            if (!v || !v.includes('@')) {
              Alert.alert('Invitation', 'Email invalide.');
              return;
            }
            setEmail('');
            onSend(v);
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Envoyer l’invitation</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const DonSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onDonate: () => void }
>(function DonSheet({ snap, renderBackdrop, onDonate }, ref) {
  const [amt, setAmt] = useState<string>('10');
  const [msg, setMsg] = useState('');
  const presets = ['5', '10', '20', '50', 'Autre'] as const;
  const [mode, setMode] = useState<(typeof presets)[number]>('10');
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Choisissez un montant</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {presets.map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                setMode(p);
                if (p !== 'Autre') setAmt(p);
              }}
              style={[styles.miniChip, mode === p && styles.miniChipOn]}
            >
              <Text style={[styles.miniChipTxt, mode === p && styles.miniChipTxtOn]}>{p === 'Autre' ? p : `${p}€`}</Text>
            </Pressable>
          ))}
        </View>
        {mode === 'Autre' ? (
          <Field label="Montant" value={amt} onChangeText={setAmt} keyboardType="number-pad" />
        ) : null}
        <Text style={styles.inputLbl}>Message (optionnel)</Text>
        <BottomSheetTextInput style={[styles.sheetInput, { minHeight: 80 }]} value={msg} onChangeText={setMsg} multiline />
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            void msg;
            onDonate();
          }}
        >
          <Text style={styles.sheetPrimaryTxt}>Faire un don 💛</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const AddSupporterSheet = forwardRef<
  BottomSheetModal,
  { snap: string[]; renderBackdrop: SheetBackdrop; onAdd: (s: Omit<AssoSupporter, 'id'>) => void }
>(function AddSupporterSheet({ snap, renderBackdrop, onAdd }, ref) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Commerce');
  const [amount, setAmount] = useState('');
  const [inkind, setInkind] = useState('');
  return (
    <BottomSheetModal ref={ref} snapPoints={snap} enablePanDownToClose backdropComponent={renderBackdrop} keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.sheetPad}>
        <Text style={styles.sheetTitle}>Ajouter un soutien</Text>
        <Field label="Nom" value={name} onChangeText={setName} />
        <Field label="Type" value={type} onChangeText={setType} />
        <Field label="Montant (€) — 0 si en nature" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
        <Field label="En nature (optionnel)" value={inkind} onChangeText={setInkind} />
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            if (!name.trim()) {
              Alert.alert('Soutien', 'Nom requis.');
              return;
            }
            onAdd({
              name: name.trim(),
              type: type.trim() || 'Commerce',
              amount: Number(amount) || 0,
              logo: '🤝',
              color: ACCENT,
              since: '2026',
              inkind: inkind.trim() || undefined,
            });
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
  headerLoc: { fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
  catPill: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: 'rgba(217,119,6,0.3)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  catPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#FCD34D' },
  avatar: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  verBadge: { position: 'absolute', bottom: -4, right: -4 },
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
  tabBtnOn: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 6,
  },
  tabTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 12, color: Colors.gray },
  tabTxtOn: { color: Colors.white },

  section: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  subTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.dark },
  bodyText: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6, lineHeight: 19 },
  ownerHint: { marginTop: 12, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  btnAccentSm: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  btnAccentSmTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },

  kpiRail: { paddingVertical: 8, gap: 10 },
  kpiCardH: {
    width: 190,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(42,47,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconH: { fontSize: 18 },
  kpiValH: { fontFamily: Fonts.title.family, fontSize: 22, color: Colors.dark, fontWeight: '900' },
  kpiLblH: { marginTop: 2, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  chartCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, ...Shadows.card },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 },
  chartBar: { width: 14, borderRadius: 999, backgroundColor: ACCENT },
  chartLbl: { marginTop: 8, fontFamily: Fonts.body.family, fontSize: 11, color: Colors.gray },
  chartHint: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },

  actionCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', ...Shadows.card },
  actionImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  actionGrad: { ...StyleSheet.absoluteFillObject },
  actionOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12 },
  actionCat: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  actionCatTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: Colors.white },
  actionTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
  actionMeta: { fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray, lineHeight: 18 },
  actionBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  iconBtn: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  iconBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.dark },

  filterPill: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.grayBorder, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  filterPillOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterPillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.gray },
  filterPillTxtOn: { color: Colors.white },

  eventCard: { marginTop: 12, borderRadius: 20, overflow: 'hidden', height: 260, backgroundColor: Colors.grayLight, ...Shadows.card },
  eventImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  eventGrad: { ...StyleSheet.absoluteFillObject },
  eventPricePill: { position: 'absolute', top: 12, right: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  eventPriceTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.white },
  eventOwnerBtns: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  eventOwnerBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  eventOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  eventTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.white },
  eventMeta: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  eventBottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventCap: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  capTrack: { marginTop: 6, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' },
  capFill: { height: 4, backgroundColor: Colors.white, borderRadius: 999 },
  joinBtn: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  joinBtnOff: { backgroundColor: ACCENT },
  joinBtnOn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  joinBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },

  searchWrap: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.grayBorder },
  searchInput: { flex: 1, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark },
  engageRow: { marginTop: 4, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  engageMain: { fontFamily: Fonts.titleSemi.family, fontSize: 13, color: Colors.dark },
  engageSub: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  engageUp: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: '#16A34A' },

  memberCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', ...Shadows.card },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  memberAvatarTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  memberName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  memberEvents: { fontFamily: Fonts.body.family, fontSize: 11, color: Colors.gray },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  rolePill: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  rolePillTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11 },
  roleFounder: { backgroundColor: 'rgba(220,38,38,0.1)' },
  roleFounderTxt: { color: '#DC2626' },
  roleAdmin: { backgroundColor: 'rgba(217,119,6,0.1)' },
  roleAdminTxt: { color: CATEGORY_ORANGE },
  roleVolunteer: { backgroundColor: 'rgba(42,47,255,0.1)' },
  roleVolunteerTxt: { color: ACCENT },
  roleMember: { backgroundColor: '#F3F4F6' },
  roleMemberTxt: { color: '#6B7280' },

  budgetCard: { marginTop: 10, backgroundColor: HEADER_BG, borderRadius: 20, padding: 20 },
  budgetKicker: { fontFamily: Fonts.mono.family, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  budgetValue: { fontFamily: Fonts.title.family, fontSize: 36, color: Colors.white, fontWeight: '900', marginTop: 8 },
  progTrack: { marginTop: 12, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' },
  progFill: { height: 8, backgroundColor: ACCENT, borderRadius: 999 },
  budgetSub: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  budgetStatsRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  budgetStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  budgetStatV: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  budgetStatL: { fontFamily: Fonts.body.family, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  primaryWide: { marginTop: 12, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryWideTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.white },

  supporterCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', ...Shadows.card },
  supporterLogo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  supporterLogoTxt: { fontSize: 18 },
  supporterName: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  supporterType: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  supporterAmt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: ACCENT },
  inkindPill: { backgroundColor: '#EEF2FF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  inkindTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 11, color: ACCENT },

  calloutCard: { marginTop: 16, borderRadius: 16, padding: 16 },
  calloutTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.white },
  calloutSub: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  calloutBtn: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  calloutBtnTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: ACCENT },

  suggestCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, ...Shadows.card },
  suggestName: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  suggestDesc: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 12, color: Colors.gray },
  suggestLink: { marginTop: 10, fontFamily: Fonts.bodySemi.family, fontSize: 13, color: ACCENT },

  sheetPad: { padding: 20, paddingBottom: 40 },
  sheetTitle: { fontFamily: Fonts.title.family, fontSize: 20, color: Colors.dark, marginBottom: 12 },
  sheetInput: { borderWidth: 1, borderColor: Colors.grayBorder, borderRadius: 12, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, textAlignVertical: 'top' },
  sheetField: { borderWidth: 1, borderColor: Colors.grayBorder, borderRadius: 12, padding: 12, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.dark, marginBottom: 8 },
  sheetPrimary: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  sheetPrimaryTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.white },
  sheetDismiss: { alignItems: 'center', marginTop: 16 },
  sheetDismissTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.primary },
  inputLbl: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.dark, marginTop: 10, marginBottom: 6 },
  uploadZone: { height: 160, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  uploadPreview: { width: '100%', height: 160, resizeMode: 'cover' },
  uploadHint: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 8 },
  miniChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6', marginRight: 8, marginTop: 8 },
  miniChipOn: { backgroundColor: ACCENT },
  miniChipTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 12, color: Colors.dark },
  miniChipTxtOn: { color: Colors.white },

  yuniRecCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.grayBorder },
  yuniRecTitle: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  yuniRecDesc: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray, marginTop: 6 },
  yuniRecLink: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: ACCENT, marginTop: 8 },
});

