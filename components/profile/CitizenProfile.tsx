import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PostCard } from '@/components/PostCard';
import type { ProfileViewModel } from '@/components/profile/profileUtils';
import { ProfileTypeBadge } from '@/components/ui/Badge';
import type { FeedPost } from '@/constants/mockPosts';
import { Colors, Fonts } from '@/constants/theme';
import type { Tribe } from '@/constants/mockTribes';

type Props = {
  profile: ProfileViewModel;
  isOwner: boolean;
  topInset: number;
  posts: FeedPost[];
  taggedPosts: FeedPost[];
  tribes: Tribe[];
  topPosts: FeedPost[];
  events: Array<{ id: string; title: string; time: string }>;
  subscribed: boolean;
  onToggleSubscribe: () => void;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onContact: () => void;
  onOpenPass: () => void;
  onOpenPost: (postId: string) => void;
  onOpenSettings: () => void;
  onBack?: () => void;
  onMore?: () => void;
};

const PLACEHOLDER = require('../../assets/images/placeholder.png');

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'YU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function gridImageSource(post: FeedPost, failed: boolean) {
  if (failed) return PLACEHOLDER;
  const uri = post.imageUrl ?? post.thumbnailUrl;
  if (uri) return { uri };
  return PLACEHOLDER;
}

export function CitizenProfile({
  profile,
  isOwner,
  topInset,
  posts,
  taggedPosts,
  tribes,
  topPosts,
  events,
  subscribed,
  onToggleSubscribe,
  onEditProfile,
  onShareProfile,
  onContact,
  onOpenPass,
  onOpenPost,
  onOpenSettings,
  onBack,
  onMore,
}: Props) {
  const [tab, setTab] = useState<'grid' | 'list' | 'tagged'>('grid');
  const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});

  const gridPosts = useMemo(() => posts.slice(0, 12), [posts]);
  const gridCellSize = useMemo(() => Math.floor((Dimensions.get('window').width - 4) / 3), []);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topInset + 6 }]}>
        {isOwner ? (
          <>
            <Text style={styles.headerTitle}>{profile.firstName}</Text>
            <Pressable onPress={onOpenSettings} hitSlop={12}>
              <Ionicons name="settings-outline" size={24} color={Colors.dark} />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.dark} />
              <Text style={styles.backText}>Retour</Text>
            </Pressable>
            <Text style={styles.headerTitleCentered} numberOfLines={1}>
              {profile.firstName}
            </Text>
            <Pressable onPress={onMore} hitSlop={12} style={styles.moreBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={Colors.dark} />
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.identityWrap}>
        <View style={styles.identityRow}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
              <Text style={styles.avatarText}>{initials(profile.displayName)}</Text>
            </View>
            {profile.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              </View>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <Stat value={String(profile.stats.posts)} label="Posts" />
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/profile/followers',
                  params: { userId: profile.id, initialTab: 'followers' },
                })
              }
              style={styles.statPress}
            >
              <Stat value={profile.stats.followers} label="Abonnés" />
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/profile/followers',
                  params: { userId: profile.id, initialTab: 'following' },
                })
              }
              style={styles.statPress}
            >
              <Stat value={profile.stats.following} label="Abonnements" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.fullName}>{profile.displayName}</Text>
        <View style={styles.metaRow}>
          <ProfileTypeBadge type={profile.type} />
        </View>
        <Text style={styles.location}>{profile.location}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>

      <View style={styles.actionsRow}>
        {isOwner ? (
          <>
            <ActionButton label="Modifier le profil" onPress={onEditProfile} />
            <ActionButton label="Partager le profil" onPress={onShareProfile} />
          </>
        ) : (
          <>
            <ActionButton
              label={subscribed ? 'Abonne ✓' : "S'abonner"}
              onPress={onToggleSubscribe}
              primary={!subscribed}
            />
            <ActionButton label="Contacter" onPress={onContact} />
          </>
        )}
      </View>

      <View style={styles.tabsRow}>
        <IconTab icon="grid-outline" active={tab === 'grid'} onPress={() => setTab('grid')} />
        <IconTab icon="list-outline" active={tab === 'list'} onPress={() => setTab('list')} />
        <IconTab
          icon="pricetag-outline"
          active={tab === 'tagged'}
          onPress={() => setTab('tagged')}
        />
      </View>

      {tab === 'grid' ? (
        <View style={styles.grid}>
          {gridPosts.map((post) => (
            <Pressable key={post.id} onPress={() => onOpenPost(post.id)}>
              <Image
                source={gridImageSource(post, !!failedMedia[post.id])}
                style={[styles.gridCell, { width: gridCellSize, height: gridCellSize }]}
                resizeMode="cover"
                onError={() => setFailedMedia((prev) => ({ ...prev, [post.id]: true }))}
              />
              {post.hasVideo ? (
                <View style={styles.gridVideoBadge}>
                  <Ionicons name="play" size={14} color={Colors.white} />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {tab === 'list' ? (
        <View style={styles.postsList}>
          {posts.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} disableAuthorNav />)
          ) : (
            <Text style={styles.emptyText}>Aucun post pour l'instant</Text>
          )}
        </View>
      ) : null}

      {tab === 'tagged' ? (
        <View style={styles.taggedWrap}>
          <Text style={styles.taggedTitle}>Mentionne dans {taggedPosts.length} posts</Text>
          <View style={styles.grid}>
            {taggedPosts.slice(0, 6).map((post) => (
              <Pressable key={post.id} onPress={() => onOpenPost(post.id)}>
                <Image
                  source={gridImageSource(post, !!failedMedia[post.id])}
                  style={[styles.gridCell, { width: gridCellSize, height: gridCellSize }]}
                  resizeMode="cover"
                  onError={() => setFailedMedia((prev) => ({ ...prev, [post.id]: true }))}
                />
                {post.hasVideo ? (
                  <View style={styles.gridVideoBadge}>
                    <Ionicons name="play" size={14} color={Colors.white} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, primary && styles.actionButtonPrimary]}
    >
      <Text style={[styles.actionButtonText, primary && styles.actionButtonTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function IconTab({
  icon,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.iconTab, active && styles.iconTabActive]}>
      <Ionicons name={icon} size={24} color={active ? Colors.dark : Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.dark,
  },
  headerTitleCentered: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 84,
  },
  backText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.dark,
  },
  moreBtn: {
    width: 32,
    alignItems: 'flex-end',
  },
  identityWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.title.family,
    fontSize: 28,
    color: Colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statPress: { flex: 1 },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  fullName: {
    marginTop: 14,
    fontFamily: Fonts.titleSemi.family,
    fontSize: 15,
    color: Colors.dark,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  location: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
  },
  bio: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.textBody,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  actionButtonTextPrimary: {
    color: Colors.white,
  },
  sectionTitle: {
    marginTop: 18,
    paddingHorizontal: 16,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  momentsRow: {
    paddingHorizontal: 12,
    paddingTop: 18,
    gap: 16,
  },
  momentItem: {
    alignItems: 'center',
    width: 76,
  },
  momentRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentIcon: {
    fontSize: 24,
  },
  momentLabel: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: Colors.dark,
    textAlign: 'center',
  },
  momentLabelMuted: {
    marginTop: 6,
    fontFamily: Fonts.body.family,
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
  },
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
  passportCard: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.dark,
  },
  passportTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passportTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 16,
    color: Colors.white,
  },
  passportTrack: {
    marginTop: 10,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  passportFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  passportLink: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
    paddingVertical: 10,
  },
  iconTab: {
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  iconTabActive: {
    borderBottomColor: Colors.dark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingTop: 4,
  },
  gridCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridVideoBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(13,15,46,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postsList: {
    marginTop: 8,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
  },
  taggedWrap: {
    paddingTop: 10,
  },
  taggedTitle: {
    paddingHorizontal: 16,
    marginBottom: 10,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
  },
  sheetTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 14,
  },
  sheetEmoji: {
    fontSize: 20,
    marginTop: 2,
  },
  sheetCopy: {
    flex: 1,
  },
  sheetRowTitle: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  sheetRowMeta: {
    marginTop: 4,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  viewerRoot: { flex: 1, backgroundColor: '#000' },
  viewerHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  viewerBack: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  viewerTitle: { flex: 1, textAlign: 'center', fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  viewerMore: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  viewerScroll: { paddingHorizontal: 16, paddingBottom: 24 },
  viewerCard: { backgroundColor: Colors.darkCard, borderRadius: 16, padding: 14, marginTop: 12 },
  viewerEmoji: { fontSize: 22 },
  viewerCardTitle: { marginTop: 8, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  viewerCardMeta: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  compactImg: { width: 54, height: 54, borderRadius: 12, backgroundColor: Colors.darkCard },
  compactTitle: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
  compactMeta: { marginTop: 4, fontFamily: Fonts.body.family, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  viewerPhoto: { width: Dimensions.get('window').width, height: Dimensions.get('window').height - 56, backgroundColor: '#000' },
  tribeEmojiWrap: { width: 54, height: 54, borderRadius: 12, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  tribeEmoji: { fontSize: 22 },
  createBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', padding: 16 },
  createSheet: { backgroundColor: Colors.white, borderRadius: 18, padding: 16 },
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
});
