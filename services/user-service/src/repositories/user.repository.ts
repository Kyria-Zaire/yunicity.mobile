import { prisma, type Prisma } from '@yunicity/database';

// Projection safe — champs sensibles exclus par defaut
const SAFE_SELECT = {
  id: true,
  email: true,
  phone: true,
  profileType: true,
  verificationStatus: true,
  verifiedAt: true,
  autoVerified: true,
  emailVerified: true,
  city: true,
  quartier: true,
  cp: true,
  lat: true,
  lng: true,
  profileData: true,
  points: true,
  level: true,
  badges: true,
  ambassadorLabel: true,
  weeklyRank: true,
  plan: true,
  periodEnd: true,
  consentRgpd: true,
  consentRgpdDate: true,
  consentMarketing: true,
  consentAnalytics: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  kycDocuments: true,
} satisfies Prisma.UserSelect;

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: SAFE_SELECT,
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: SAFE_SELECT,
    });
  }

  static async findByPhone(phone: string) {
    return prisma.user.findFirst({
      where: { phone, deletedAt: null },
      select: SAFE_SELECT,
    });
  }

  static async create(data: {
    email: string;
    passwordHash: string;
    profileType: string;
    profileData: Record<string, unknown>;
    phone?: string | undefined;
    consent: { rgpd: boolean; marketing: boolean; analytics: boolean };
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        profileType: data.profileType as 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole',
        profileData: data.profileData as Prisma.InputJsonValue,
        phone: data.phone ?? null,
        consentRgpd: data.consent.rgpd,
        consentMarketing: data.consent.marketing,
        consentAnalytics: data.consent.analytics,
        consentRgpdDate: new Date(),
      },
      select: SAFE_SELECT,
    });
  }

  static async updateVerificationStatus(
    id: string,
    status: 'pending' | 'under_review' | 'verified' | 'rejected',
    extra?: {
      verifiedAt?: Date | undefined;
      autoVerified?: boolean | undefined;
    },
  ): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        verificationStatus: status,
        ...(extra?.verifiedAt ? { verifiedAt: extra.verifiedAt } : {}),
        ...(extra?.autoVerified !== undefined
          ? { autoVerified: extra.autoVerified }
          : {}),
      },
    });
  }

  static async updateYunicity(
    userId: string,
    data: { points: number; level: number },
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { points: data.points, level: data.level },
    });
  }

  static async addBadges(userId: string, badges: string[]): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { badges: true },
    });
    if (!user) return;
    const merged = [...new Set([...user.badges, ...badges])];
    await prisma.user.update({
      where: { id: userId },
      data: { badges: merged },
    });
  }

  static async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  static async addKycDocument(
    userId: string,
    doc: { type: string; r2Key: string; uploadedAt: Date },
  ): Promise<void> {
    await prisma.kycDocument.create({ data: { userId, ...doc } });
  }

  static async updateProfileData(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { profileData: data as Prisma.InputJsonValue },
    });
  }

  static async countByStatus(status: string): Promise<number> {
    return prisma.user.count({
      where: {
        verificationStatus: status as 'pending' | 'under_review' | 'verified' | 'rejected',
        deletedAt: null,
      },
    });
  }

  // Pagination cursor-based (scalable)
  static async findPaginated(params: {
    filter: Prisma.UserWhereInput;
    cursor?: string | undefined;
    limit: number;
  }): Promise<{
    items: Array<Prisma.UserGetPayload<{ select: typeof SAFE_SELECT }>>;
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    const items = await prisma.user.findMany({
      where: {
        ...params.filter,
        deletedAt: null,
        ...(params.cursor ? { id: { gt: params.cursor } } : {}),
      },
      orderBy: { id: 'asc' },
      take: params.limit + 1,
      select: SAFE_SELECT,
    });

    const hasNextPage = items.length > params.limit;
    const result = hasNextPage ? items.slice(0, -1) : items;
    return {
      items: result,
      nextCursor: hasNextPage ? (result.at(-1)?.id ?? null) : null,
      hasNextPage,
    };
  }

  // Requete geospatiale — acteurs proches via PostGIS
  static async findNearby(params: {
    lat: number;
    lng: number;
    radius: number;
    types?: string[] | undefined;
    limit?: number | undefined;
  }) {
    const limit = params.limit ?? 50;
    const types = params.types ?? [
      'commercial',
      'association',
      'freelance',
      'ecole',
    ];

    const result = await prisma.$queryRaw<
      Array<{
        id: string;
        profileType: string;
        profileData: unknown;
        lat: number;
        lng: number;
        city: string;
        distance_m: number;
      }>
    >`
      SELECT
        id,
        "profileType",
        "profileData",
        lat,
        lng,
        city,
        ST_Distance(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${params.lng}, ${params.lat})::geography
        ) AS distance_m
      FROM "User"
      WHERE
        "verificationStatus" = 'verified'
        AND "isActive" = true
        AND "deletedAt" IS NULL
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND "profileType" = ANY(${types}::text[])
        AND ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${params.lng}, ${params.lat})::geography,
          ${params.radius}
        )
      ORDER BY distance_m ASC
      LIMIT ${limit}
    `;

    return result;
  }
}
