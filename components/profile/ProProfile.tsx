import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ProfileTypeBadge, VerifiedBadge } from '@/components/ui/Badge';
import { PostCard } from '@/components/PostCard';
import { CommercialProfile } from '@/components/profile/CommercialProfile';
import { AssociationProfile } from '@/components/profile/AssociationProfile';
import { FreelanceProfile } from '@/components/profile/FreelanceProfile';
import { EcoleProfile } from '@/components/profile/EcoleProfile';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { MOCK_PERKS } from '@/constants/mockPassport';
import type { FeedPost } from '@/constants/mockPosts';
import type { ProfileViewModel } from '@/components/profile/profileUtils';

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

type ProTab = 'actualites' | 'events' | 'medias';

export function ProProfile({
  profile,
  isOwner,
  topInset,
  posts,
  subscribed,
  onToggleSubscribe,
  onEditProfile,
  onShareProfile,
  onContact,
  onOpenPass,
  onOpenSettings,
  onBack,
  onMore,
}: Props) {
  const [tab, setTab] = useState<ProTab>('actualites');
  const [infosOpen, setInfosOpen] = useState(true);

  const unlockedPerks = useMemo(
    () => MOCK_PERKS.filter((perk) => perk.active).slice(0, 2),
    [],
  );

  const filteredPosts = useMemo(() => {
    if (tab === 'events') return posts.filter((post) => post.type === 'event');
    if (tab === 'medias') return posts.filter((post) => post.imageUrl);
    return posts;
  }, [posts, tab]);

  if (profile.type === 'commercial') {
    return (
      <CommercialProfile
        profile={profile}
        isOwner={isOwner}
        topInset={topInset}
        posts={posts}
        subscribed={subscribed}
        onToggleSubscribe={onToggleSubscribe}
        onEditProfile={onEditProfile}
        onShareProfile={onShareProfile}
        onContact={onContact}
        onOpenPass={onOpenPass}
        onOpenSettings={onOpenSettings}
        onBack={onBack}
        onMore={onMore}
      />
    );
  }

  if (profile.type === 'association') {
    return (
      <AssociationProfile
        profile={profile}
        isOwner={isOwner}
        topInset={topInset}
        posts={posts}
        subscribed={subscribed}
        onToggleSubscribe={onToggleSubscribe}
        onEditProfile={onEditProfile}
        onShareProfile={onShareProfile}
        onContact={onContact}
        onOpenPass={onOpenPass}
        onOpenSettings={onOpenSettings}
        onBack={onBack}
        onMore={onMore}
      />
    );
  }

  if (profile.type === 'freelance') {
    return (
      <FreelanceProfile
        profile={profile}
        isOwner={isOwner}
        topInset={topInset}
        posts={posts}
        subscribed={subscribed}
        onToggleSubscribe={onToggleSubscribe}
        onEditProfile={onEditProfile}
        onShareProfile={onShareProfile}
        onContact={onContact}
        onOpenPass={onOpenPass}
        onOpenSettings={onOpenSettings}
        onBack={onBack}
        onMore={onMore}
      />
    );
  }

  if (profile.type === 'ecole') {
    return (
      <EcoleProfile
        profile={profile}
        isOwner={isOwner}
        topInset={topInset}
        posts={posts}
        subscribed={subscribed}
        onToggleSubscribe={onToggleSubscribe}
        onEditProfile={onEditProfile}
        onShareProfile={onShareProfile}
        onContact={onContact}
        onOpenPass={onOpenPass}
        onOpenSettings={onOpenSettings}
        onBack={onBack}
        onMore={onMore}
      />
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={profile.coverColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topInset + 10 }]}
      >
        <View style={styles.heroTop}>
          {isOwner ? (
            <View style={styles.heroOwnerActions}>
              <Pressable onPress={onOpenSettings} style={styles.heroIconButton}>
                <Ionicons name="settings-outline" size={20} color={Colors.white} />
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable onPress={onBack} style={styles.heroIconButton}>
                <Ionicons name="chevron-back" size={22} color={Colors.white} />
              </Pressable>
              <Pressable onPress={onMore} style={styles.heroIconButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={Colors.white} />
              </Pressable>
            </>
          )}
        </View>

        <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
          <Text style={styles.avatarText}>{profile.displayName.slice(0, 2).toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.identityBlock}>
        <Text style={styles.name}>{profile.displayName}</Text>
        <View style={styles.badgesRow}>
          <ProfileTypeBadge type={profile.type} />
          {profile.verified ? <VerifiedBadge /> : null}
        </View>
        <Text style={styles.headline}>{profile.headline}</Text>
        <Text style={styles.location}>{profile.location}</Text>
        <Text style={styles.bio} numberOfLines={3}>
          {profile.bio}
        </Text>

        <View style={styles.actionsRow}>
          {isOwner ? (
            <>
              <ActionButton label="✏️ Modifier" onPress={onEditProfile} />
              <ActionButton label="📤 Partager" onPress={onShareProfile} />
              <ActionButton label="⚙️ Paramètres" onPress={onOpenSettings} />
            </>
          ) : (
            <>
              <ActionButton label="Contacter" onPress={onContact} primary />
              <ActionButton label={subscribed ? 'Suivi ✓' : 'Suivre'} onPress={onToggleSubscribe} />
              <ActionButton label="🗺️ Itinéraire" onPress={onContact} />
            </>
          )}
        </View>

        <View style={styles.proStats}>
          <ProStat label="Posts" value={String(profile.stats.posts)} icon="📝" />
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/profile/followers',
                params: { userId: profile.id, initialTab: 'followers' },
              })
            }
            style={{ flex: 1 }}
          >
            <ProStat label="Abonnés" value={profile.stats.followers} icon="👥" />
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/profile/followers',
                params: { userId: profile.id, initialTab: 'following' },
              })
            }
            style={{ flex: 1 }}
          >
            <ProStat label="Abonnements" value={profile.stats.following} icon="➕" />
          </Pressable>
        </View>
        <Text style={styles.viewsMonth}>{profile.stats.viewsMonth} vues ce mois</Text>

        <Pressable onPress={() => setInfosOpen((value) => !value)} style={styles.accordionHead}>
          <Text style={styles.accordionTitle}>Infos métier</Text>
          <Ionicons name={infosOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.dark} />
        </Pressable>
        {infosOpen ? (
          <View style={styles.infoCard}>
            {profile.proInfo.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.proTabs}>
          <TabPill label="Actualités" active={tab === 'actualites'} onPress={() => setTab('actualites')} />
          <TabPill label="Événements" active={tab === 'events'} onPress={() => setTab('events')} />
          <TabPill label="Médias" active={tab === 'medias'} onPress={() => setTab('medias')} />
        </View>

        <View style={styles.postsList}>
          {filteredPosts.length ? (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} disableAuthorNav />)
          ) : (
            <Text style={styles.emptyText}>Aucun contenu pour cette section.</Text>
          )}
        </View>

        <Pressable onPress={onShareProfile} style={styles.moreNews}>
          <Text style={styles.moreNewsText}>Voir toutes les actualités →</Text>
        </Pressable>
      </View>

    </View>
  );
}

function ActionButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, primary && styles.actionButtonPrimary]}>
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.proStat}>
      <Text style={styles.proStatValue}>{icon} {value}</Text>
      <Text style={styles.proStatLabel}>{label}</Text>
    </View>
  );
}

function TabPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tabPill, active && styles.tabPillActive]}>
      <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.pageBg,
  },
  hero: {
    height: 180,
    paddingHorizontal: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroOwnerActions: {
    marginLeft: 'auto',
  },
  heroIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
    left: 16,
    bottom: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  avatarText: {
    fontFamily: Fonts.title.family,
    fontSize: 28,
    color: Colors.white,
  },
  identityBlock: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    marginTop: 18,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  momentsRow: { paddingTop: 16, gap: 14, paddingHorizontal: 0 },
  momentItem: { alignItems: 'center', width: 76 },
  momentRing: { width: 64, height: 64, borderRadius: 32, padding: 3, alignItems: 'center', justifyContent: 'center' },
  momentInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  momentEmoji: { fontSize: 24 },
  momentLabel: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 11, color: Colors.dark, textAlign: 'center' },
  momentLabelMuted: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 11, color: Colors.gray, textAlign: 'center' },
  momentAddRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.grayLight,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  name: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.dark,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  headline: {
    marginTop: 10,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.gray,
  },
  location: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
  },
  bio: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textBody,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.dark,
  },
  actionTextPrimary: {
    color: Colors.white,
  },
  proStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  viewerRoot: { flex: 1, backgroundColor: '#000' },
  viewerHeader: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  viewerBack: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  viewerTitle: { flex: 1, textAlign: 'center', fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  viewerBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  viewerText: { fontFamily: Fonts.body.family, fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  createTitle: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 10 },
  createOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  createIcon: { fontSize: 20 },
  createLabel: { fontFamily: Fonts.bodySemi.family, fontSize: 14, color: Colors.dark },
  createInline: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  createInput: {
    marginTop: 8,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  proStat: {
    flex: 1,
    alignItems: 'center',
  },
  proStatValue: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  proStatLabel: {
    marginTop: 4,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  viewsMonth: {
    marginTop: 8,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.primary,
  },
  accordionHead: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  infoCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  infoLabel: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.dark,
  },
  passCard: {
    marginTop: 18,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.dark,
  },
  passTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.white,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  perkPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  perkPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 12,
    color: Colors.white,
  },
  proTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  tabPillActive: {
    backgroundColor: '#E8E9FF',
  },
  tabPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  tabPillTextActive: {
    color: Colors.primary,
  },
  postsList: {
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyText: {
    paddingVertical: 24,
    textAlign: 'center',
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
  },
  moreNews: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  moreNewsText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.primary,
  },
});
