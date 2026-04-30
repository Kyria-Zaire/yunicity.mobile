import { useMemo, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import {
  PROFILE_COLORS,
  profileTypeBadgeLabel,
  rankingProfiles,
  type MockProfile,
} from '@/constants/mockProfiles';
import {
  MOCK_PERKS,
  MOCK_STAMPS,
  PASSPORT_LEVEL_ORDER,
  PASSPORT_LEVELS,
  PERK_GROUP_ORDER,
  type MockPerk,
  type PassportLevelId,
} from '@/constants/mockPassport';
import { useTabSwipe } from '@/hooks/useTabSwipe';
import { QRCodeModal } from '@/components/pass/QRCodeModal';
import { CommercialDashboard } from '@/components/pass/CommercialDashboard';
import { FreelanceDashboard } from '@/components/pass/FreelanceDashboard';
import { AssociationDashboard } from '@/components/pass/AssociationDashboard';
import { EcoleDashboard } from '@/components/pass/EcoleDashboard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STAMP_COL_W = (SCREEN_WIDTH - 40 - 16) / 3;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'KY';
}

function displayNameFromEmail(email?: string | null) {
  const base = email?.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Kyria';
  return base
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function passportLevelFromPoints(points: number): PassportLevelId {
  if (points >= PASSPORT_LEVELS.gold.minPoints) return 'gold';
  if (points >= PASSPORT_LEVELS.silver.minPoints) return 'silver';
  return 'basic';
}

function levelReached(levelId: PassportLevelId, points: number): boolean {
  switch (levelId) {
    case 'basic':
      return true;
    case 'silver':
      return points >= PASSPORT_LEVELS.silver.minPoints;
    case 'gold':
      return points >= PASSPORT_LEVELS.gold.minPoints;
    case 'neo':
      return false;
    case 'business':
      return points >= PASSPORT_LEVELS.business.minPoints;
    case 'press':
      return points >= PASSPORT_LEVELS.press.minPoints;
    default:
      return false;
  }
}

function nextTier(points: number, currentLevel: PassportLevelId) {
  if (currentLevel === 'basic') {
    const pct = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((points - PASSPORT_LEVELS.basic.minPoints) /
            (PASSPORT_LEVELS.basic.maxPoints - PASSPORT_LEVELS.basic.minPoints)) *
            100,
        ),
      ),
    );
    return { pct, label: `${pct}% → Silver` };
  }

  if (currentLevel === 'silver') {
    const pct = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((points - PASSPORT_LEVELS.silver.minPoints) /
            (PASSPORT_LEVELS.silver.maxPoints - PASSPORT_LEVELS.silver.minPoints)) *
            100,
        ),
      ),
    );
    return { pct, label: `${pct}% → Gold` };
  }

  return { pct: 100, label: 'Niveau max atteint' };
}

function partnerStampColor(partnerId: string) {
  const palette = ['#16A34A', '#0891B2', '#D97706', '#7C3AED', '#DC2626', '#2A2FFF', '#B45309'];
  let hash = 0;
  for (let index = 0; index < partnerId.length; index += 1) {
    hash = (hash * 31 + partnerId.charCodeAt(index)) >>> 0;
  }
  return palette[hash % palette.length];
}

function slugForQr(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();

  return (slug || 'KYRIA').slice(0, 8);
}

export default function PassScreen() {
  const insets = useSafeAreaInsets();
  const swipe = useTabSwipe('/(app)/(tabs)/pass');
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isCommercial = user?.profileType === 'commercial';
  const isAssociation = user?.profileType === 'association';
  const isFreelance = user?.profileType === 'freelance';
  const isEcole = user?.profileType === 'ecole';
  const _isPro = isCommercial || isAssociation || isFreelance || isEcole;
  void _isPro;

  const [qrOpen, setQrOpen] = useState(false);
  const [perkTab, setPerkTab] = useState<'active' | 'all'>('active');

  const firstName = displayNameFromEmail(user?.email);
  const points = 50;
  const currentLevel = passportLevelFromPoints(points);
  const levelDef = PASSPORT_LEVELS[currentLevel];
  const passportNo = 'YUN-2026-001';
  const qrPayload = `YUN-2026-${slugForQr(firstName)}-001`;
  const progress = nextTier(points, currentLevel);
  const stampsObtained = MOCK_STAMPS.filter((stamp) => stamp.obtained).length;
  const activePerks = useMemo(() => MOCK_PERKS.filter((perk) => perk.active), []);
  const ranked = useMemo(() => rankingProfiles(), []);
  const top3 = ranked.slice(0, 3);
  const rankRest = ranked.slice(3, 10);
  const myHighlightId = ranked.some((profile) => profile.id === user?.id) ? user?.id ?? 'u1' : 'u1';

  const perkGroups = useMemo(() => {
    const grouped = new Map<PassportLevelId, MockPerk[]>();

    for (const id of PERK_GROUP_ORDER) grouped.set(id, []);

    for (const perk of MOCK_PERKS) {
      const next = grouped.get(perk.level) ?? [];
      next.push(perk);
      grouped.set(perk.level, next);
    }

    return PERK_GROUP_ORDER.map((id) => ({
      id,
      title: PASSPORT_LEVELS[id].name,
      perks: grouped.get(id) ?? [],
    })).filter((group) => group.perks.length > 0);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (isCommercial) {
    return (
      <View style={styles.root} {...swipe.panHandlers}>
        <CommercialDashboard />
      </View>
    );
  }

  if (isAssociation) {
    return (
      <View style={styles.root} {...swipe.panHandlers}>
        <AssociationDashboard />
      </View>
    );
  }

  if (isFreelance) {
    return (
      <View style={styles.root} {...swipe.panHandlers}>
        <FreelanceDashboard />
      </View>
    );
  }

  if (isEcole) {
    return (
      <View style={styles.root} {...swipe.panHandlers}>
        <EcoleDashboard />
      </View>
    );
  }

  return (
    <View style={styles.root} {...swipe.panHandlers}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: scrollPaddingBottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={[]} style={styles.sectionWrap}>
          <LinearGradient
            colors={levelDef.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.passportCard,
              {
                shadowColor: levelDef.color,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.45,
                shadowRadius: 24,
                elevation: 14,
              },
            ]}
          >
            <View style={styles.passHeader}>
              <Text style={styles.passBrand}>YUNICITY</Text>
              <Text style={styles.passBrand}>PASSEPORT OFFICIEL</Text>
            </View>
            <View style={styles.passRule} />

            <View style={styles.passMainRow}>
              <View style={styles.photoSlot}>
                <Ionicons name="person-outline" size={36} color="rgba(255,255,255,0.5)" />
              </View>

              <View style={styles.passInfo}>
                <Text style={styles.passName}>{firstName}</Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>YUNICITIZEN</Text>
                </View>
                <Text style={styles.passMeta}>Reims · Grand Est</Text>
                <Text style={styles.passId}>N° {passportNo}</Text>
              </View>
            </View>

            <View style={styles.passFooter}>
              <Text style={styles.passFooterLabel}>NIVEAU {levelDef.name.toUpperCase()}</Text>
              <Text style={styles.passFooterValue}>{points} PTS 🏅</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress.pct}%` }]} />
            </View>
            <Text style={styles.progressHint}>{progress.label}</Text>
          </LinearGradient>

          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton} onPress={() => setQrOpen(true)}>
              <Text style={styles.primaryButtonText}>📱 QR Code</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => Alert.alert('Impression', 'Impression disponible bientôt')}
            >
              <Text style={styles.secondaryButtonText}>🖨️ Imprimer</Text>
            </Pressable>
          </View>
        </SafeAreaView>

        <SectionHeader title="Niveaux du passeport" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelsScroll}
          nestedScrollEnabled
        >
          {PASSPORT_LEVEL_ORDER.map((levelId) => {
            const level = PASSPORT_LEVELS[levelId];
            const isCurrent = levelId === currentLevel;
            const reached = levelReached(levelId, points);

            return (
              <LinearGradient
                key={levelId}
                colors={level.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.levelCard,
                  isCurrent && styles.levelCardCurrent,
                  !isCurrent && !reached && styles.levelCardDim,
                ]}
              >
                {isCurrent ? (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>ACTUEL</Text>
                  </View>
                ) : null}
                <Text style={styles.levelName}>{level.name}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </LinearGradient>
            );
          })}
        </ScrollView>

        <SectionHeader title="Mes tampons 🗂️" pill={`${stampsObtained}/${MOCK_STAMPS.length}`} />
        <View style={styles.stampsGrid}>
          {MOCK_STAMPS.map((stamp) => {
            const ink = partnerStampColor(stamp.partnerId);

            return (
              <Pressable
                key={stamp.id}
                style={[styles.stampCell, { width: STAMP_COL_W }]}
                onPress={() => {
                  if (!stamp.obtained) {
                    Alert.alert('Tampon', `Visitez ${stamp.partnerName} pour obtenir ce tampon !`);
                  }
                }}
              >
                {stamp.obtained ? (
                  <View style={styles.stampInkWrap}>
                    <View
                      style={[
                        styles.stampCircle,
                        {
                          backgroundColor: ink,
                          borderColor: ink,
                          transform: [{ rotate: '-5deg' }],
                        },
                      ]}
                    >
                      <Text style={styles.stampEmoji}>{stamp.emoji}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.stampCircleEmpty}>
                    <Text style={styles.stampQuestion}>?</Text>
                  </View>
                )}
                <Text style={styles.stampPartner} numberOfLines={1}>
                  {stamp.partnerName}
                </Text>
                <Text style={styles.stampDate}>{stamp.obtained ? stamp.date : 'À obtenir'}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Mes avantages ✨" />
        <View style={styles.perkPills}>
          <Pressable
            onPress={() => setPerkTab('active')}
            style={[styles.perkPill, perkTab === 'active' && styles.perkPillOn]}
          >
            <Text style={[styles.perkPillText, perkTab === 'active' && styles.perkPillTextOn]}>Actifs</Text>
          </Pressable>
          <Pressable
            onPress={() => setPerkTab('all')}
            style={[styles.perkPill, perkTab === 'all' && styles.perkPillOn]}
          >
            <Text style={[styles.perkPillText, perkTab === 'all' && styles.perkPillTextOn]}>Tous les niveaux</Text>
          </Pressable>
        </View>

        {perkTab === 'active' ? (
          <View style={styles.perkList}>
            {activePerks.map((perk) => (
              <View key={perk.id} style={styles.perkCard}>
                <View style={[styles.perkIconWrap, { backgroundColor: `${perk.color}22` }]}>
                  <Text style={styles.perkEmoji}>{perk.icon}</Text>
                </View>
                <View style={styles.perkBody}>
                  <Text style={styles.perkPartner}>{perk.partnerName}</Text>
                  <Text style={styles.perkOffer}>{perk.offer}</Text>
                </View>
                <View style={styles.perkTag}>
                  <Text style={styles.perkTagText}>Avantage</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.perkList}>
            {perkGroups.map((group) => (
              <View key={group.id} style={styles.perkGroup}>
                <LinearGradient colors={PASSPORT_LEVELS[group.id].gradient} style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>{group.title}</Text>
                </LinearGradient>

                {group.perks.map((perk) => (
                  <View key={perk.id} style={[styles.perkCard, !perk.active && styles.perkCardDim]}>
                    <View style={[styles.perkIconWrap, { backgroundColor: `${perk.color}22` }]}>
                      <Text style={styles.perkEmoji}>{perk.icon}</Text>
                    </View>
                    <View style={styles.perkBody}>
                      <Text style={styles.perkPartner}>{perk.partnerName}</Text>
                      <Text style={styles.perkOffer}>{perk.offer}</Text>
                      {!perk.active ? (
                        <Text style={styles.perkLock}>🔒 Niveau {PASSPORT_LEVELS[perk.level].name} requis</Text>
                      ) : null}
                    </View>
                    <View style={styles.perkTag}>
                      <Text style={styles.perkTagText}>{perk.active ? 'Actif' : 'Offre'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <SectionHeader title="Top Rémois 🏆" />
        <Podium top3={top3} />
        {rankRest.map((item, index) => (
          <RankRow key={item.id} rank={index + 4} profile={item} highlight={item.id === myHighlightId} />
        ))}
      </ScrollView>

      <QRCodeModal
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        qrPayload={qrPayload}
        displayName={firstName}
        levelName={levelDef.name}
      />
    </View>
  );
}

function SectionHeader({ title, pill }: { title: string; pill?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {pill ? (
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{pill}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Podium({ top3 }: { top3: MockProfile[] }) {
  const second = top3[1];
  const first = top3[0];
  const third = top3[2];

  if (!first) return null;

  return (
    <View style={styles.podium}>
      {second ? (
        <View style={[styles.podiumCol, styles.podiumSecond]}>
          <View style={[styles.podiumAvatarSmall, { backgroundColor: PROFILE_COLORS[second.type] }]}>
            <Text style={styles.podiumInitialsSmall}>{initials(second.name)}</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {second.name.split(' ')[0]}
          </Text>
          <Text style={styles.podiumPoints}>{second.points} pts</Text>
        </View>
      ) : null}

      <View style={[styles.podiumCol, styles.podiumFirst]}>
        <Text style={styles.podiumCrown}>👑</Text>
        <View style={[styles.podiumAvatarLarge, { backgroundColor: PROFILE_COLORS[first.type] }]}>
          <Text style={styles.podiumInitialsLarge}>{initials(first.name)}</Text>
        </View>
        <Text style={styles.podiumNameLarge} numberOfLines={1}>
          {first.name.split(' ')[0]}
        </Text>
        <Text style={styles.podiumPointsLarge}>{first.points} pts</Text>
      </View>

      {third ? (
        <View style={[styles.podiumCol, styles.podiumThird]}>
          <View style={[styles.podiumAvatarSmall, { backgroundColor: PROFILE_COLORS[third.type] }]}>
            <Text style={styles.podiumInitialsSmall}>{initials(third.name)}</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {third.name.split(' ')[0]}
          </Text>
          <Text style={styles.podiumPoints}>{third.points} pts</Text>
        </View>
      ) : null}
    </View>
  );
}

function RankRow({ rank, profile, highlight }: { rank: number; profile: MockProfile; highlight: boolean }) {
  const color = PROFILE_COLORS[profile.type];

  return (
    <View style={[styles.rankRow, highlight && styles.rankRowHighlight]}>
      <Text style={styles.rankNum}>{rank}</Text>
      <View style={[styles.rankAvatar, { backgroundColor: color }]}>
        <Text style={styles.rankInitials}>{initials(profile.name)}</Text>
      </View>
      <View style={styles.rankBody}>
        <Text style={styles.rankName} numberOfLines={1}>
          {profile.name}
        </Text>
        <Text style={styles.rankType}>{profileTypeBadgeLabel(profile.type)}</Text>
      </View>
      <Text style={styles.rankPoints}>{profile.points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sectionWrap: {
    marginHorizontal: 20,
  },
  passportCard: {
    height: 220,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passBrand: {
    fontFamily: Fonts.mono.family,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  passRule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },
  passMainRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 14,
    flex: 1,
  },
  photoSlot: {
    width: 70,
    height: 90,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  passName: {
    fontFamily: Fonts.title.family,
    fontSize: 22,
    color: Colors.white,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rolePillText: {
    fontFamily: Fonts.mono.family,
    fontSize: 12,
    color: Colors.white,
  },
  passMeta: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  passId: {
    marginTop: 4,
    fontFamily: Fonts.mono.family,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  passFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  passFooterLabel: {
    fontFamily: Fonts.mono.family,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  passFooterValue: {
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.white,
  },
  progressTrack: {
    marginTop: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  progressHint: {
    marginTop: 6,
    fontFamily: Fonts.mono.family,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadows.card,
  },
  primaryButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(13,15,46,0.92)',
  },
  secondaryButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  sectionCount: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sectionCountText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.white,
  },
  levelsScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  levelCard: {
    width: 140,
    minHeight: 104,
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  levelCardCurrent: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  levelCardDim: {
    opacity: 0.6,
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontFamily: Fonts.monoMedium.family,
    fontSize: 9,
    color: Colors.white,
  },
  levelName: {
    marginTop: 18,
    fontFamily: Fonts.title.family,
    fontSize: 14,
    color: Colors.white,
  },
  levelDescription: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 8,
    justifyContent: 'space-between',
  },
  stampCell: {
    alignItems: 'center',
    marginBottom: 14,
  },
  stampInkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCircleEmpty: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampEmoji: {
    fontSize: 28,
  },
  stampQuestion: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 22,
    color: Colors.textMuted,
  },
  stampPartner: {
    marginTop: 6,
    width: '100%',
    textAlign: 'center',
    fontFamily: Fonts.body.family,
    fontSize: 10,
    color: Colors.dark,
  },
  stampDate: {
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Fonts.body.family,
    fontSize: 9,
    color: Colors.gray,
  },
  perkPills: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  perkPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  perkPillOn: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
  },
  perkPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  perkPillTextOn: {
    color: Colors.primary,
  },
  perkList: {
    paddingHorizontal: 20,
    gap: 0,
  },
  perkGroup: {
    marginBottom: 8,
  },
  groupBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  groupBadgeText: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 12,
    color: Colors.white,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Shadows.card,
  },
  perkCardDim: {
    opacity: 0.5,
  },
  perkIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkEmoji: {
    fontSize: 22,
  },
  perkBody: {
    flex: 1,
  },
  perkPartner: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  perkOffer: {
    marginTop: 4,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.textBody,
  },
  perkLock: {
    marginTop: 4,
    fontFamily: Fonts.bodyMedium.family,
    fontSize: 12,
    color: Colors.gray,
  },
  perkTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  perkTagText: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 12,
    color: Colors.primary,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  podiumCol: {
    alignItems: 'center',
  },
  podiumSecond: {
    minHeight: 80,
    justifyContent: 'flex-end',
    paddingBottom: 4,
    width: 100,
  },
  podiumFirst: {
    minHeight: 100,
    justifyContent: 'flex-end',
    paddingBottom: 4,
    width: 110,
  },
  podiumThird: {
    minHeight: 60,
    justifyContent: 'flex-end',
    paddingBottom: 4,
    width: 100,
  },
  podiumCrown: {
    fontSize: 20,
    marginBottom: 4,
  },
  podiumAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumInitialsSmall: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 15,
    color: Colors.white,
  },
  podiumInitialsLarge: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 18,
    color: Colors.white,
  },
  podiumName: {
    marginTop: 6,
    maxWidth: 96,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.dark,
  },
  podiumNameLarge: {
    marginTop: 6,
    maxWidth: 104,
    fontFamily: Fonts.titleSemi.family,
    fontSize: 13,
    color: Colors.dark,
  },
  podiumPoints: {
    marginTop: 2,
    fontFamily: Fonts.title.family,
    fontSize: 14,
    color: Colors.primary,
  },
  podiumPointsLarge: {
    marginTop: 2,
    fontFamily: Fonts.title.family,
    fontSize: 14,
    color: Colors.primary,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 6,
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  rankRowHighlight: {
    backgroundColor: '#EEF2FF',
  },
  rankNum: {
    width: 28,
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.primary,
  },
  rankAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankInitials: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 12,
    color: Colors.white,
  },
  rankBody: {
    flex: 1,
  },
  rankName: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  rankType: {
    marginTop: 2,
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: Colors.gray,
  },
  rankPoints: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
});

