import { prisma, type Prisma, type PartnerStatus } from '@yunicity/database';

export type { PartnerStatus };

export class PartnerRepository {
  static async create(data: Prisma.PartnerCreateInput) {
    return prisma.partner.create({ data: { ...data, isActive: true } });
  }

  static async findById(id: string) {
    return prisma.partner.findFirst({ where: { id, deletedAt: null } });
  }

  static async findByEmail(email: string) {
    return prisma.partner.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.partner.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  static async updateStatus(
    id: string,
    status: PartnerStatus,
    extra?: Record<string, unknown>,
  ) {
    return prisma.partner.update({
      where: { id },
      data: { status, ...(extra as Prisma.PartnerUpdateInput) },
    });
  }

  static async getPipeline(
    filters: {
      status?: PartnerStatus | undefined;
      tier?: string | undefined;
    } = {},
  ) {
    const where: Prisma.PartnerWhereInput = {
      isActive: true,
      deletedAt: null,
    };
    if (filters.status) where.status = filters.status;
    if (filters.tier)
      where.tier = filters.tier as Prisma.EnumPartnerTierFilter;

    return prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  static async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    totalRevenue: number;
  }> {
    const where: Prisma.PartnerWhereInput = {
      isActive: true,
      deletedAt: null,
    };

    const [total, statusGroups, tierGroups, revenueAgg] = await Promise.all([
      prisma.partner.count({ where }),
      prisma.partner.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.partner.groupBy({
        by: ['tier'],
        where,
        _count: { id: true },
      }),
      prisma.partner.aggregate({
        where,
        _sum: { annualValue: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const item of statusGroups) {
      byStatus[item.status] = item._count.id;
    }

    const byTier: Record<string, number> = {};
    for (const item of tierGroups) {
      byTier[item.tier] = item._count.id;
    }

    return {
      total,
      byStatus,
      byTier,
      totalRevenue: revenueAgg._sum.annualValue ?? 0,
    };
  }
}
