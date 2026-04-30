import { Colors } from '@/constants/theme';
import { MOCK_POSTS, type FeedPost } from '@/constants/mockPosts';
import { getProfileById, type MockProfile } from '@/constants/mockProfiles';
import { MOCK_TRIBES, type Tribe } from '@/constants/mockTribes';
import { PASSPORT_LEVELS, type PassportLevelId } from '@/constants/mockPassport';
import type { ProfileType } from '@/components/ui/Badge';

export type ApiMeProfile = {
  _id?: string;
  email?: string;
  profileType?: ProfileType;
  verificationStatus?: { status?: string };
  profileData?: { displayName?: string; bio?: string };
};

export type AuthLikeUser = {
  id?: string;
  email?: string;
  profileType?: string;
  verificationStatus?: string;
  profileData?: { displayName?: string };
};

export type ProfileViewModel = {
  id: string;
  type: ProfileType;
  displayName: string;
  firstName: string;
  verified: boolean;
  bio: string;
  location: string;
  headline: string;
  avatarColor: string;
  coverColors: [string, string];
  passport: {
    points: number;
    levelId: PassportLevelId;
    levelName: string;
    progressPct: number;
    progressLabel: string;
  };
  stats: {
    posts: number;
    followers: string;
    following: string;
    events: string;
    helps: string;
    neighbors: string;
    hours: string;
    tribes: string;
    rating: string;
    viewsMonth: string;
  };
  proInfo: Array<{ label: string; value: string }>;
};

function compact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.', ',')}k`;
  return String(value);
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function profileTint(type: ProfileType) {
  switch (type) {
    case 'commercial':
      return Colors.commercial;
    case 'association':
      return Colors.association;
    case 'freelance':
      return Colors.freelance;
    case 'ecole':
      return Colors.ecole;
    default:
      return Colors.primary;
  }
}

function coverColors(type: ProfileType): [string, string] {
  switch (type) {
    case 'commercial':
      return [Colors.commercial, '#065F46'];
    case 'association':
      return [Colors.association, '#92400E'];
    case 'freelance':
      return [Colors.freelance, '#4C1D95'];
    case 'ecole':
      return [Colors.ecole, '#991B1B'];
    default:
      return [Colors.primary, '#7C3AED'];
  }
}

function citizenLocation(profile?: MockProfile) {
  if (profile?.type === 'yunicitizen') return `📍 ${profile.quartier} · Reims`;
  return '📍 Croix-Rouge · Reims';
}

function headlineFor(profile: MockProfile | undefined, type: ProfileType) {
  if (!profile) {
    if (type === 'commercial') return 'Commerce de proximité';
    if (type === 'freelance') return 'Expert indépendant';
    if (type === 'ecole') return 'Établissement local';
    if (type === 'association') return 'Association engagée';
    return 'Habitant engagé';
  }

  switch (profile.type) {
    case 'commercial':
      return profile.category;
    case 'freelance':
      return profile.specialty;
    case 'ecole':
      return 'Établissement local';
    case 'association':
      return 'Association locale';
    default:
      return 'Habitant engagé';
  }
}

function locationFor(profile: MockProfile | undefined, type: ProfileType) {
  if (!profile) return '📍 Reims - Centre';

  switch (profile.type) {
    case 'commercial':
      return `📍 ${profile.address}, Reims`;
    case 'freelance':
      return '📍 Reims - Centre';
    case 'ecole':
      return '📍 Reims - Centre';
    case 'association':
      return '📍 Reims - Centre';
    default:
      return `📍 ${profile.quartier} · Reims`;
  }
}

function bioFor(profile: MockProfile | undefined, type: ProfileType, apiBio?: string) {
  if (apiBio?.trim()) return apiBio.trim();
  if (profile?.type === 'yunicitizen') return profile.bio;
  if (profile?.type === 'association') return profile.bio;
  if (profile?.type === 'freelance') return profile.bio;
  if (profile?.type === 'ecole') return profile.bio;
  if (profile?.type === 'commercial') return `${profile.category} incontournable à Reims.`;

  if (type === 'yunicitizen') return 'Actif dans mon quartier et toujours partant pour aider autour de moi.';
  if (type === 'commercial') return 'Commerce local engagé dans la vie de quartier.';
  if (type === 'freelance') return 'Professionnel indépendant au service du territoire.';
  if (type === 'association') return 'Association engagée pour faire vivre le local.';
  return 'Acteur local engagé dans la communauté Yunicity.';
}

function passportLevelFromPoints(points: number): PassportLevelId {
  if (points >= PASSPORT_LEVELS.gold.minPoints) return 'gold';
  if (points >= PASSPORT_LEVELS.silver.minPoints) return 'silver';
  return 'basic';
}

function passportProgress(points: number, levelId: PassportLevelId) {
  if (levelId === 'gold') return { pct: 100, label: 'Niveau max atteint' };

  const current = PASSPORT_LEVELS[levelId];
  const next = levelId === 'basic' ? PASSPORT_LEVELS.silver : PASSPORT_LEVELS.gold;
  const raw = ((points - current.minPoints) / (current.maxPoints - current.minPoints)) * 100;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  return { pct, label: `${pct}% vers ${next.name}` };
}

function proDetails(profile: MockProfile | undefined, type: ProfileType): Array<{ label: string; value: string }> {
  if (!profile) return [];

  switch (profile.type) {
    case 'commercial':
      return [
        { label: 'Catégorie', value: profile.category },
        { label: 'Adresse', value: profile.address },
        { label: 'Horaires', value: 'Lun-Sam 9h-19h' },
        { label: 'Site web', value: 'yunicity.fr/partner' },
        { label: 'Téléphone', value: '+33 3 26 00 00 00' },
      ];
    case 'freelance':
      return [
        { label: 'Spécialité', value: profile.specialty },
        { label: 'Disponibilité', value: 'Disponible cette semaine' },
        { label: 'Tarif jour', value: '420 EUR / jour' },
        { label: 'Portfolio', value: 'portfolio.yunicity.fr' },
      ];
    case 'ecole':
      return [
        { label: 'Type établissement', value: 'École locale' },
        { label: 'Niveau', value: 'Secondaire / supérieur' },
        { label: 'UAI', value: profile.uai },
        { label: 'Capacité', value: '480 places' },
      ];
    case 'association':
      return [
        { label: 'RNA', value: profile.rna },
        { label: 'Objet social', value: profile.bio },
        { label: 'Année création', value: '2018' },
        { label: 'Président', value: 'Conseil associatif Yunicity' },
      ];
    default:
      return [];
  }
}

export function isProProfileType(type?: string | null) {
  return ['commercial', 'freelance', 'ecole', 'association'].includes(type ?? '');
}

export function postsForProfile(profileId: string, fallbackId = 'u1') {
  const own = MOCK_POSTS.filter((post) => post.authorId === profileId);
  if (own.length) return own;
  return MOCK_POSTS.filter((post) => post.authorId === fallbackId);
}

export function taggedPostsForProfile(profileId: string) {
  return MOCK_POSTS.filter((post) => post.authorId !== profileId).slice(0, 6);
}

export function topPostsForProfile(profileId: string) {
  return [...postsForProfile(profileId)].sort((a, b) => b.likes - a.likes).slice(0, 3);
}

export function tribesForProfile(profileId: string, isOwner: boolean) {
  if (isOwner) return MOCK_TRIBES.filter((tribe) => tribe.isMember).slice(0, 3);

  const moderated = MOCK_TRIBES.filter((tribe) => tribe.moderators.includes(profileId));
  if (moderated.length) return moderated.slice(0, 3);

  return MOCK_TRIBES.slice(0, 3);
}

export function profileEventsFor(profileId: string) {
  return postsForProfile(profileId)
    .filter((post) => post.type === 'event')
    .slice(0, 3)
    .map((post) => ({ id: post.id, title: post.content, time: post.timestamp }));
}

function buildStats(type: ProfileType, postsCount: number, tribesCount: number, points: number) {
  const base = Math.max(1, Math.round(points / 22));
  return {
    posts: postsCount,
    followers: compact(base * 11),
    following: compact(base * 3),
    events: String(Math.max(8, Math.round(base / 2))),
    helps: String(Math.max(12, Math.round(base / 1.7))),
    neighbors: String(Math.max(6, Math.round(base / 2.4))),
    hours: `${Math.max(14, Math.round(base / 1.9))} h`,
    tribes: String(Math.max(tribesCount, 1)),
    rating: type === 'yunicitizen' ? '4.8' : '4.9',
    viewsMonth: compact(base * 47),
  };
}

export function normalizeMockProfile(profile: MockProfile, isOwner: boolean): ProfileViewModel {
  const type = profile.type as ProfileType;
  const posts = postsForProfile(profile.id);
  const points = profile.points;
  const levelId = passportLevelFromPoints(points);
  const progress = passportProgress(points, levelId);
  const tribes = tribesForProfile(profile.id, isOwner);

  return {
    id: profile.id,
    type,
    displayName: profile.name,
    firstName: firstName(profile.name),
    verified: !!profile.verified,
    bio: bioFor(profile, type),
    location: locationFor(profile, type),
    headline: headlineFor(profile, type),
    avatarColor: profileTint(type),
    coverColors: coverColors(type),
    passport: {
      points,
      levelId,
      levelName: PASSPORT_LEVELS[levelId].name,
      progressPct: progress.pct,
      progressLabel: progress.label,
    },
    stats: buildStats(type, posts.length, tribes.length, points),
    proInfo: proDetails(profile, type),
  };
}

export function normalizeOwnerProfile(options: {
  user: AuthLikeUser | null;
  apiProfile: ApiMeProfile | null;
  fallbackProfile: MockProfile;
  points: number;
}): ProfileViewModel {
  const fallback = options.fallbackProfile;
  const type = ((options.apiProfile?.profileType ?? options.user?.profileType ?? fallback.type) as ProfileType) ?? 'yunicitizen';
  const displayName =
    options.apiProfile?.profileData?.displayName?.trim() ??
    options.user?.profileData?.displayName?.trim() ??
    fallback.name;
  const verified =
    options.apiProfile?.verificationStatus?.status === 'verified' ||
    options.user?.verificationStatus === 'verified' ||
    !!fallback.verified;
  const points = options.points;
  const levelId = passportLevelFromPoints(points);
  const progress = passportProgress(points, levelId);
  const ownerId = options.user?.id ?? fallback.id;
  const posts = postsForProfile(ownerId, fallback.id);
  const tribes = tribesForProfile(ownerId, true);

  return {
    id: ownerId,
    type,
    displayName,
    firstName: firstName(displayName),
    verified,
    bio: bioFor(fallback, type, options.apiProfile?.profileData?.bio),
    location: type === 'yunicitizen' ? citizenLocation(fallback) : locationFor(fallback, type),
    headline: headlineFor(fallback, type),
    avatarColor: profileTint(type),
    coverColors: coverColors(type),
    passport: {
      points,
      levelId,
      levelName: PASSPORT_LEVELS[levelId].name,
      progressPct: progress.pct,
      progressLabel: progress.label,
    },
    stats: buildStats(type, posts.length, tribes.length, points),
    proInfo: proDetails(fallback, type),
  };
}

export function profileByIdOrFallback(id: string, fallbackId = 'u1') {
  return getProfileById(id) ?? getProfileById(fallbackId)!;
}

