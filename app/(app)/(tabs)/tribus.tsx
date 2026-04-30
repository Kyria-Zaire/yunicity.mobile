import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Shadows, tabBarFloatingLayout } from '@/constants/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateTribeModal } from '@/components/tribes/CreateTribeModal';
import { useTabSwipe } from '@/hooks/useTabSwipe';
import {
  MOCK_TRIBES,
  TRIBE_CATEGORIES,
  type Tribe,
} from '@/constants/mockTribes';

const CATEGORY_COLORS: Record<string, string> = {
  all: Colors.dark,
  sport: '#16A34A',
  culture: '#D97706',
  ecology: '#059669',
  food: '#DC2626',
  business: '#2A2FFF',
  art: '#7C3AED',
  tech: '#0891B2',
  famille: '#F59E0B',
};

function activityPill(activityLevel: Tribe['activityLevel']) {
  if (activityLevel === 'très active') return { label: '🔥 Très active', bg: '#DC2626' };
  if (activityLevel === 'active') return { label: '✨ Active', bg: '#D97706' };
  return { label: '🌙 Calme', bg: '#6B7280' };
}

function categoryLabel(categoryId: string) {
  return TRIBE_CATEGORIES.find((item) => item.id === categoryId)?.label ?? categoryId;
}

function findYuniSuggestions(tribes: Tribe[]) {
  return tribes
    .filter((tribe) => ['ecology', 'food', 'tech'].includes(tribe.category))
    .slice(0, 3);
}

export default function TribusScreen() {
  const insets = useSafeAreaInsets();
  const swipe = useTabSwipe('/(app)/(tabs)/tribus');
  const { scrollPaddingBottom } = tabBarFloatingLayout(insets.bottom);

  const [tribes, setTribes] = useState<Tribe[]>(MOCK_TRIBES);
  const [activeTab, setActiveTab] = useState<'mes' | 'explorer'>('mes');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const myTribes = useMemo(() => tribes.filter((tribe) => tribe.isMember), [tribes]);
  const explorerTribes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tribes.filter((tribe) => {
      const matchesCategory = activeCategory === 'all' || tribe.category === activeCategory;
      const haystack = `${tribe.name} ${tribe.description} ${tribe.quartier}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, tribes]);

  const fomoTribe = useMemo(
    () => myTribes.find((tribe) => tribe.activityLevel === 'très active') ?? null,
    [myTribes],
  );
  const aiSuggestions = useMemo(() => findYuniSuggestions(tribes), [tribes]);

  const openTribe = (tribe: Tribe) => {
    router.push({
      pathname: '/(app)/tribes/[id]' as const,
      params: { id: tribe.id },
    });
  };

  const joinTribe = (tribeId: string) => {
    setTribes((current) =>
      current.map((tribe) =>
        tribe.id === tribeId
          ? { ...tribe, isMember: true }
          : tribe,
      ),
    );
  };

  const createTribe = (tribe: Tribe) => {
    setTribes((current) => [tribe, ...current]);
    setShowCreateModal(false);
    setActiveTab('mes');
  };

  return (
    <View style={styles.root} {...swipe.panHandlers}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Tribus 🏘️</Text>
          <Pressable onPress={() => setShowCreateModal(true)} style={styles.plusButton}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.tabsRail}>
          <Pressable
            onPress={() => setActiveTab('mes')}
            style={[styles.tabPill, activeTab === 'mes' && styles.tabPillActive]}
          >
            <Text style={[styles.tabText, activeTab === 'mes' && styles.tabTextActive]}>
              Mes tribus ({myTribes.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('explorer')}
            style={[styles.tabPill, activeTab === 'explorer' && styles.tabPillActive]}
          >
            <Text style={[styles.tabText, activeTab === 'explorer' && styles.tabTextActive]}>
              Explorer ({tribes.length})
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        {activeTab === 'mes' ? (
          <>
            {myTribes.length === 0 ? (
              <EmptyState
                title={"Tu n'as pas encore rejoint de tribu 🏘️"}
                description="Rejoins des communautés locales qui te ressemblent"
                actionLabel="Explorer les tribus →"
                onAction={() => setActiveTab('explorer')}
              />
            ) : (
              <>
                {fomoTribe ? (
                  <Pressable onPress={() => openTribe(fomoTribe)} style={styles.fomoWrap}>
                    <LinearGradient colors={['#2A2FFF', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fomoCard}>
                      <Text style={styles.fomoTitle}>🔥 {fomoTribe.name} est très active !</Text>
                      <Text style={styles.fomoMeta}>
                        {fomoTribe.activeToday} membres actifs · {fomoTribe.postsToday} nouveaux posts
                      </Text>
                      <View style={styles.fomoButton}>
                        <Text style={styles.fomoButtonText}>Voir →</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ) : null}

                <View style={styles.cardsList}>
                  {myTribes.map((tribe) => (
                    <MyTribeCard key={tribe.id} tribe={tribe} onPress={() => openTribe(tribe)} />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.gray} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher une tribu..."
                placeholderTextColor={Colors.gray}
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {TRIBE_CATEGORIES.map((category) => {
                const active = category.id === activeCategory;
                const activeColor = CATEGORY_COLORS[category.id] ?? Colors.primary;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setActiveCategory(category.id)}
                    style={[
                      styles.categoryChip,
                      active && { backgroundColor: activeColor },
                    ]}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                      {category.emoji} {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.aiSuggestionCard}>
              <Text style={styles.aiSuggestionTitle}>✨ Yuni AI recommande pour toi</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiPillsRow}>
                {aiSuggestions.map((tribe) => (
                  <Pressable
                    key={tribe.id}
                    onPress={() => openTribe(tribe)}
                    style={styles.aiPill}
                  >
                    <Text style={styles.aiPillText}>
                      {tribe.emoji} {tribe.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.cardsList}>
              {explorerTribes.map((tribe) => (
                <ExplorerTribeCard
                  key={tribe.id}
                  tribe={tribe}
                  onJoin={() => joinTribe(tribe.id)}
                  onOpen={() => openTribe(tribe)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <CreateTribeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createTribe}
      />
    </View>
  );
}

function MyTribeCard({ onPress, tribe }: { tribe: Tribe; onPress: () => void }) {
  const activity = activityPill(tribe.activityLevel);

  return (
    <View style={styles.card}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: tribe.coverUrl }} style={styles.coverImage} resizeMode="cover" />
        <View style={[styles.activityBadge, { backgroundColor: activity.bg }]}>
          <Text style={styles.activityBadgeText}>{activity.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <View style={[styles.emojiWrap, { backgroundColor: `${tribe.color}18` }]}>
            <Text style={styles.emoji}>{tribe.emoji}</Text>
          </View>
          <Text style={styles.cardTitle}>{tribe.name}</Text>
        </View>

        <Text style={styles.cardDescription} numberOfLines={1}>
          {tribe.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>👥 {tribe.members} membres</Text>
          <Text style={styles.metaText}>📝 {tribe.postsToday} posts aujourd'hui</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{tribe.isFounder ? 'Fondateur' : 'Membre actif'}</Text>
          </View>
        </View>

        <Pressable onPress={onPress} style={styles.secondaryCta}>
          <Text style={styles.secondaryCtaText}>Voir la tribu →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ExplorerTribeCard({
  onJoin,
  onOpen,
  tribe,
}: {
  tribe: Tribe;
  onJoin: () => void;
  onOpen: () => void;
}) {
  const activity = activityPill(tribe.activityLevel);

  return (
    <View style={styles.card}>
      <View style={styles.explorerCoverWrap}>
        <Image source={{ uri: tribe.coverUrl }} style={styles.explorerCoverImage} resizeMode="cover" />
        {!tribe.isPublic ? (
          <View style={styles.privatePill}>
            <Text style={styles.privatePillText}>🔒 Privée</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.explorerHeader}>
          <View style={styles.nameRowCompact}>
            <Text style={styles.emoji}>{tribe.emoji}</Text>
            <Text style={styles.cardTitle}>{tribe.name}</Text>
          </View>
          <View style={[styles.smallActivityBadge, { backgroundColor: `${tribe.color}18` }]}>
            <Text style={[styles.smallActivityText, { color: tribe.color }]}>{activity.label}</Text>
          </View>
        </View>

        <Text style={styles.cardDescriptionLong} numberOfLines={2}>
          {tribe.description}
        </Text>

        <View style={styles.explorerMeta}>
          <Text style={styles.metaText}>👥 {tribe.members}</Text>
          <Text style={styles.metaText}>📍 {tribe.quartier}</Text>
          <View style={[styles.categoryPill, { backgroundColor: `${tribe.color}14` }]}>
            <Text style={[styles.categoryPillText, { color: tribe.color }]}>{categoryLabel(tribe.category)}</Text>
          </View>
        </View>

        {tribe.badges.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {tribe.badges.map((badge) => (
              <View key={badge} style={styles.collectiveBadge}>
                <Text style={styles.collectiveBadgeText}>{badge}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.fomoPill}>
          <Text style={styles.fomoPillText}>🔥 {tribe.postsToday} posts aujourd'hui</Text>
        </View>

        <Pressable
          onPress={tribe.isMember ? onOpen : onJoin}
          style={[styles.primaryExplorerCta, tribe.isMember ? styles.secondaryExplorerCta : null]}
        >
          <Text style={[styles.primaryExplorerCtaText, tribe.isMember ? styles.secondaryExplorerCtaText : null]}>
            {tribe.isMember ? 'Voir ma tribu →' : 'Rejoindre'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  safeArea: {
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Fonts.title.family,
    fontSize: 24,
    color: Colors.dark,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  tabsRail: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    gap: 4,
  },
  tabPill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
    ...Shadows.card,
  },
  tabText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.gray,
  },
  tabTextActive: {
    color: Colors.white,
  },
  fomoWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  fomoCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  fomoTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.white,
  },
  fomoMeta: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
  },
  fomoButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  fomoButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.primary,
  },
  cardsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 8,
    ...Shadows.card,
  },
  coverWrap: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  activityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activityBadgeText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.white,
  },
  cardBody: {
    padding: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emoji: {
    fontSize: 20,
  },
  cardTitle: {
    flex: 1,
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  cardDescription: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  roleBadgeText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.primary,
  },
  secondaryCta: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  aiSuggestionCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  aiSuggestionTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  aiPillsRow: {
    gap: 8,
    paddingTop: 10,
  },
  aiPill: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.primary,
  },
  explorerCoverWrap: {
    position: 'relative',
  },
  explorerCoverImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  privatePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  privatePillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.dark,
  },
  explorerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  smallActivityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallActivityText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 11,
  },
  cardDescriptionLong: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
  },
  explorerMeta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 11,
  },
  badgesRow: {
    gap: 8,
    paddingTop: 10,
  },
  collectiveBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  collectiveBadgeText: {
    fontFamily: Fonts.bodyMedium.family,
    fontSize: 11,
    color: Colors.dark,
  },
  fomoPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: Colors.fomoPillBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fomoPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.fomoPillText,
  },
  primaryExplorerCta: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryExplorerCta: {
    backgroundColor: '#F3F4F6',
  },
  primaryExplorerCtaText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.white,
  },
  secondaryExplorerCtaText: {
    color: Colors.dark,
  },
});

