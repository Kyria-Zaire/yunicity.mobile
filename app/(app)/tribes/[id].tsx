import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { PostCard } from '@/components/PostCard';
import { AppBottomSheet } from '@/components/ui/BottomSheet';
import {
  MOCK_POLLS,
  MOCK_TRIBES,
  TRIBE_POSTS,
  type Tribe,
} from '@/constants/mockTribes';
import { MOCK_POSTS, postsForTribe, type FeedPost } from '@/constants/mockPosts';
import { getProfileById, MOCK_PROFILES, PROFILE_COLORS, type MockProfile, type ProfileKind } from '@/constants/mockProfiles';

type SectionKey = 'feed' | 'events' | 'polls' | 'members' | 'infos';

type PollState = {
  id: string;
  tribeId: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVote: string | null;
  closes: string;
};

const SECTIONS: { id: SectionKey; label: string; icon: string }[] = [
  { id: 'feed', label: 'Feed', icon: '📝' },
  { id: 'events', label: 'Événements', icon: '📅' },
  { id: 'polls', label: 'Sondages', icon: '🗳️' },
  { id: 'members', label: 'Membres', icon: '👥' },
  { id: 'infos', label: 'Infos', icon: 'ℹ️' },
];

function fallbackTribe(id: string): Tribe {
  return {
    id,
    name: 'Tribu Yunicity',
    description: 'Communauté locale en construction.',
    category: 'culture',
    emoji: '🏘️',
    color: Colors.primary,
    coverUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=800',
    members: 12,
    activeToday: 3,
    postsToday: 1,
    activityLevel: 'active',
    isPublic: true,
    quartier: 'Toute la ville',
    badges: ['🚀 Nouvelle tribu'],
    rules: ['Rester bienveillant', 'Partager des infos utiles', 'Participer localement'],
    moderators: ['u1'],
    isMember: false,
    isFounder: false,
    stats: { actions: 4, events: 1, votes: 1 },
  };
}

function authorTypeFromProfile(profile?: MockProfile): ProfileKind {
  return profile?.type ?? 'yunicitizen';
}

function authorNameFromProfile(profile?: MockProfile, fallback = 'Membre Yunicity') {
  return profile?.name ?? fallback;
}

function tribePosts(tribeId: string): FeedPost[] {
  const custom = TRIBE_POSTS[tribeId];
  if (custom?.length) {
    return custom.map((item, index) => {
      const profile = getProfileById(item.authorId);
      return {
        id: item.id,
        authorId: item.authorId,
        authorName: authorNameFromProfile(profile),
        authorType: authorTypeFromProfile(profile),
        content: item.content,
        type: item.type,
        likes: item.likes,
        comments: item.comments,
        shares: Math.max(1, Math.round(item.likes / 5)),
        timestamp: item.time,
        hasImage: !!item.imageUrl,
        imageColor: profile ? PROFILE_COLORS[profile.type] : Colors.primary,
        imageEmoji: undefined,
        imageUrl: item.imageUrl,
        tribeId,
      } as FeedPost;
    });
  }

  const tagged = postsForTribe(tribeId);
  if (tagged.length) return tagged;
  return MOCK_POSTS.slice(0, 3);
}

function buildEvents(tribe: Tribe) {
  return [
    {
      id: `${tribe.id}-ev1`,
      title: `${tribe.name} Meetup`,
      date: 'Vendredi 19h30',
      place: tribe.quartier,
      desc: 'Rencontre de la communauté, échanges et nouvelles idées.',
    },
    {
      id: `${tribe.id}-ev2`,
      title: `Atelier ${tribe.category}`,
      date: 'Dimanche 10h00',
      place: 'Centre-ville',
      desc: 'Session pratique pour se retrouver et lancer des actions concrètes.',
    },
    {
      id: `${tribe.id}-ev3`,
      title: 'Afterwork local',
      date: 'Mardi 18h30',
      place: 'Place d’Erlon',
      desc: 'Moment convivial pour accueillir les nouveaux membres.',
    },
  ];
}

function activityLabel(level: Tribe['activityLevel']) {
  if (level === 'très active') return '🔥 Très active';
  if (level === 'active') return '✨ Active';
  return '🌙 Calme';
}

function memberRole(memberId: string, tribe: Tribe, index: number) {
  if (index === 0) return 'Fondateur';
  if (tribe.moderators.includes(memberId)) return 'Modérateur';
  return 'Membre';
}

export default function TribeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { fabBottom, scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);
  const params = useLocalSearchParams<{ id: string }>();
  const tribeId = String(params.id ?? '');
  const initialTribe = MOCK_TRIBES.find((item) => item.id === tribeId) ?? fallbackTribe(tribeId);

  const [tribe, setTribe] = useState<Tribe>(initialTribe);
  const [isMember, setIsMember] = useState(initialTribe.isMember);
  const [activeSection, setActiveSection] = useState<SectionKey>('feed');
  const [draftPost, setDraftPost] = useState('');
  const [eventPresence, setEventPresence] = useState<Record<string, boolean>>({});
  const [polls, setPolls] = useState<PollState[]>(
    MOCK_POLLS.filter((poll) => poll.tribeId === tribeId).map((poll) => ({
      ...poll,
      options: poll.options.map((option) => ({ ...option })),
    })),
  );

  const createSheetRef = useRef<BottomSheet>(null);
  const posts = useMemo(() => tribePosts(tribe.id), [tribe.id]);
  const events = useMemo(() => buildEvents(tribe), [tribe]);

  const members = useMemo(() => {
    const ids = Array.from(
      new Set([tribe.moderators[0], ...tribe.moderators, ...MOCK_PROFILES.slice(0, 5).map((profile) => profile.id)].filter(Boolean)),
    ) as string[];
    return ids
      .map((id) => getProfileById(id))
      .filter((profile): profile is MockProfile => !!profile);
  }, [tribe]);

  const vote = (pollId: string, optionId: string) => {
    setPolls((current) =>
      current.map((poll) => {
        if (poll.id !== pollId || poll.userVote) return poll;
        return {
          ...poll,
          userVote: optionId,
          totalVotes: poll.totalVotes + 1,
          options: poll.options.map((option) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
          ),
        };
      }),
    );
  };

  const toggleMembership = () => {
    setIsMember((value) => !value);
    setTribe((current) => ({
      ...current,
      members: current.members + (isMember ? -1 : 1),
    }));
  };

  const openMenu = () => {
    Alert.alert('Tribu', 'Options disponibles', [
      { text: 'Partager', onPress: () => Alert.alert('Partager', 'Partage de la tribu bientôt disponible.') },
      { text: 'Signaler', onPress: () => Alert.alert('Signaler', 'Merci, le signalement sera bientôt disponible.') },
      { text: 'Fermer', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView stickyHeaderIndices={[3]} contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: tribe.coverUrl }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.heroOverlay} />

          <View style={[styles.heroTopBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.heroIconButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Pressable onPress={openMenu} style={styles.heroIconButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {tribe.emoji} {tribe.name}
            </Text>
            <Text style={styles.heroMeta}>
              👥 {tribe.members} membres · {activityLabel(tribe.activityLevel)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox value={tribe.stats.actions} label="Actions" />
          <StatBox value={tribe.stats.events} label="Événements" />
          <StatBox value={posts.length} label="Posts" />
          <StatBox value={tribe.stats.votes} label="Votes" />
        </View>

        <View style={styles.joinSection}>
          <Pressable
            onPress={toggleMembership}
            style={[styles.joinButton, isMember ? styles.leaveButton : styles.joinPrimaryButton]}
          >
            <Text style={[styles.joinButtonText, isMember ? styles.leaveButtonText : styles.joinPrimaryButtonText]}>
              {isMember ? 'Quitter la tribu' : 'Rejoindre la tribu'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionNavWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionNav}
          >
            {SECTIONS.map((section) => {
              const active = section.id === activeSection;
              return (
                <Pressable
                  key={section.id}
                  onPress={() => setActiveSection(section.id)}
                  style={styles.sectionTab}
                >
                  <Text style={[styles.sectionTabText, active && styles.sectionTabTextActive]}>
                    {section.icon} {section.label}
                  </Text>
                  <View style={[styles.sectionUnderline, active && styles.sectionUnderlineActive]} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          {activeSection === 'feed' ? (
            <View>
              {posts.map((post) => (
                <View key={post.id} style={styles.postCardWrap}>
                  <PostCard post={post} />
                </View>
              ))}
            </View>
          ) : null}

          {activeSection === 'events' ? (
            <View style={styles.cardsColumn}>
              {events.map((event) => {
                const attending = eventPresence[event.id] ?? false;
                return (
                  <View key={event.id} style={styles.eventCard}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>
                      📅 {event.date} · 📍 {event.place}
                    </Text>
                    <Text style={styles.eventDesc}>{event.desc}</Text>
                    <Pressable
                      onPress={() =>
                        setEventPresence((current) => ({ ...current, [event.id]: !attending }))
                      }
                      style={[styles.eventButton, attending && styles.eventButtonActive]}
                    >
                      <Text style={[styles.eventButtonText, attending && styles.eventButtonTextActive]}>
                        {attending ? "Tu y vas" : "J'y vais"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : null}

          {activeSection === 'polls' ? (
            <View style={styles.cardsColumn}>
              {polls.length === 0 ? (
                <Text style={styles.emptyText}>Aucun sondage en cours pour cette tribu.</Text>
              ) : (
                polls.map((poll) => (
                  <View key={poll.id} style={styles.pollCard}>
                    <Text style={styles.pollQuestion}>{poll.question}</Text>
                    <View style={styles.pollOptions}>
                      {poll.options.map((option) => {
                        const pct = poll.totalVotes ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                        const selected = poll.userVote === option.id;
                        return (
                          <View key={option.id} style={styles.pollOption}>
                            <View style={styles.pollTopLine}>
                              <Text style={[styles.pollOptionText, selected && styles.pollOptionTextActive]}>
                                {option.text}
                              </Text>
                              <Text style={styles.pollPct}>{pct}%</Text>
                            </View>
                            <View style={styles.pollTrack}>
                              <View style={[styles.pollFill, { width: `${pct}%` }, selected && styles.pollFillActive]} />
                            </View>
                            {poll.userVote === null ? (
                              <Pressable onPress={() => vote(poll.id, option.id)} style={styles.voteButton}>
                                <Text style={styles.voteButtonText}>Voter</Text>
                              </Pressable>
                            ) : selected ? (
                              <Text style={styles.votedText}>✓ Tu as voté</Text>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.pollCloseText}>Ferme {poll.closes.toLowerCase()}</Text>
                  </View>
                ))
              )}
            </View>
          ) : null}

          {activeSection === 'members' ? (
            <View style={styles.cardsColumn}>
              {members.map((member, index) => {
                const role = memberRole(member.id, tribe, index);
                const color = PROFILE_COLORS[member.type];
                return (
                  <View key={member.id} style={styles.memberRow}>
                    <View style={[styles.memberAvatar, { backgroundColor: color }]}>
                      <Text style={styles.memberInitials}>{member.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.memberBody}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberRole}>{role}</Text>
                    </View>
                    <View style={styles.memberBadge}>
                      <Text style={styles.memberBadgeText}>{role}</Text>
                    </View>
                  </View>
                );
              })}

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
                {tribe.badges.map((badge) => (
                  <View key={badge} style={styles.collectiveBadge}>
                    <Text style={styles.collectiveBadgeText}>{badge}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {activeSection === 'infos' ? (
            <View style={styles.cardsColumn}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Description</Text>
                <Text style={styles.infoText}>{tribe.description}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Règles de la tribu</Text>
                {tribe.rules.map((rule, index) => (
                  <Text key={rule} style={styles.ruleText}>
                    {index + 1}. {rule}
                  </Text>
                ))}
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Modérateurs</Text>
                {tribe.moderators.map((moderatorId) => {
                  const moderator = getProfileById(moderatorId);
                  if (!moderator) return null;
                  return (
                    <View key={moderatorId} style={styles.moderatorRow}>
                      <View style={[styles.moderatorAvatar, { backgroundColor: PROFILE_COLORS[moderator.type] }]}>
                        <Text style={styles.moderatorInitials}>{moderator.name.slice(0, 2).toUpperCase()}</Text>
                      </View>
                      <Text style={styles.moderatorName}>{moderator.name}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Infos complémentaires</Text>
                <Text style={styles.infoText}>Créée le 12 avril 2026</Text>
                <Text style={styles.infoText}>Visibilité : {tribe.isPublic ? 'Publique' : 'Privée'}</Text>
                <Text style={styles.infoText}>Quartier : {tribe.quartier}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {activeSection === 'feed' ? (
        <Pressable onPress={() => createSheetRef.current?.expand()} style={[styles.fab, { bottom: fabBottom }]}>
          <Ionicons name="add" size={26} color={Colors.white} />
        </Pressable>
      ) : null}

      <AppBottomSheet ref={createSheetRef} snapPoints={['40%', '72%']}>
        <Text style={styles.sheetTitle}>Créer un post</Text>
        <Text style={styles.sheetSubtitle}>{tribe.name}</Text>
        <TextInput
          value={draftPost}
          onChangeText={setDraftPost}
          placeholder="Partage quelque chose avec la tribu..."
          placeholderTextColor={Colors.gray}
          multiline
          style={styles.sheetInput}
        />
        <Pressable
          onPress={() => {
            setDraftPost('');
            createSheetRef.current?.close();
            Alert.alert('Post', 'Création de post bientôt disponible.');
          }}
          style={styles.sheetButton}
        >
          <Text style={styles.sheetButtonText}>Publier</Text>
        </Pressable>
      </AppBottomSheet>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  heroWrap: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  heroIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  heroTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 24,
    color: Colors.white,
  },
  heroMeta: {
    marginTop: 6,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.dark,
  },
  statLabel: {
    marginTop: 4,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  joinSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  joinButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinPrimaryButton: {
    backgroundColor: Colors.primary,
  },
  leaveButton: {
    backgroundColor: '#F3F4F6',
  },
  joinButtonText: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 15,
  },
  joinPrimaryButtonText: {
    color: Colors.white,
  },
  leaveButtonText: {
    color: '#DC2626',
  },
  sectionNavWrap: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionNav: {
    paddingHorizontal: 12,
    gap: 18,
  },
  sectionTab: {
    paddingTop: 12,
    paddingBottom: 10,
  },
  sectionTabText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.gray,
  },
  sectionTabTextActive: {
    color: Colors.primary,
  },
  sectionUnderline: {
    marginTop: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  sectionUnderlineActive: {
    backgroundColor: Colors.primary,
  },
  contentSection: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  postCardWrap: {
    backgroundColor: Colors.white,
    marginBottom: 10,
  },
  cardsColumn: {
    gap: 12,
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    ...Shadows.card,
  },
  eventTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  eventMeta: {
    marginTop: 6,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  eventDesc: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textBody,
  },
  eventButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  eventButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  eventButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.dark,
  },
  eventButtonTextActive: {
    color: Colors.primary,
  },
  pollCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    ...Shadows.card,
  },
  pollQuestion: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  pollOptions: {
    marginTop: 14,
    gap: 12,
  },
  pollOption: {
    gap: 6,
  },
  pollTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollOptionText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  pollOptionTextActive: {
    color: Colors.primary,
  },
  pollPct: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  pollTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pollFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#C7D2FE',
  },
  pollFillActive: {
    backgroundColor: Colors.primary,
  },
  voteButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  voteButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.primary,
  },
  votedText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: '#16A34A',
  },
  pollCloseText: {
    marginTop: 14,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    ...Shadows.card,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 13,
    color: Colors.white,
  },
  memberBody: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  memberRole: {
    marginTop: 2,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  memberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  memberBadgeText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 11,
    color: Colors.dark,
  },
  badgesRow: {
    gap: 8,
    paddingTop: 4,
  },
  collectiveBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  collectiveBadgeText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 11,
    color: Colors.dark,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    ...Shadows.card,
  },
  infoTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 15,
    color: Colors.dark,
  },
  infoText: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textBody,
  },
  ruleText: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textBody,
  },
  moderatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  moderatorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  moderatorInitials: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 11,
    color: Colors.white,
  },
  moderatorName: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.dark,
  },
  emptyText: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    paddingVertical: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  sheetTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  sheetSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
  },
  sheetInput: {
    marginTop: 12,
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    padding: 14,
    textAlignVertical: 'top',
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
  },
  sheetButton: {
    marginTop: 14,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetButtonText: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 15,
    color: Colors.white,
  },
});
