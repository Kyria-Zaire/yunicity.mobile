import { prisma, type Prisma } from '@yunicity/database';

export class TribeRepository {
  static async findById(id: string) {
    return prisma.tribe.findFirst({
      where: { id, deletedAt: null },
      include: { members: { select: { userId: true } } },
    });
  }

  static async findBySlugAndCity(slug: string, city: string) {
    return prisma.tribe.findFirst({
      where: { slug, city, deletedAt: null },
    });
  }

  static async create(data: {
    name: string;
    slug: string;
    description: string;
    category: string;
    city: string;
    creatorId: string;
    isPublic?: boolean | undefined;
    tags?: string[] | undefined;
    members: string[];
    membersCount: number;
    lat?: number | undefined;
    lng?: number | undefined;
  }) {
    return prisma.tribe.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category as 'culture' | 'sport' | 'business' | 'education' | 'social' | 'ecology' | 'food' | 'art' | 'tech' | 'other',
        city: data.city,
        creatorId: data.creatorId,
        isPublic: data.isPublic ?? true,
        tags: data.tags ?? [],
        membersCount: data.membersCount,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        members: {
          create: data.members.map((userId) => ({ userId })),
        },
      },
    });
  }

  static async addMember(tribeId: string, userId: string) {
    await prisma.tribeMember.create({ data: { tribeId, userId } });
    return prisma.tribe.update({
      where: { id: tribeId },
      data: { membersCount: { increment: 1 } },
    });
  }

  static async removeMember(tribeId: string, userId: string) {
    await prisma.tribeMember.delete({
      where: { userId_tribeId: { userId, tribeId } },
    });
    return prisma.tribe.update({
      where: { id: tribeId },
      data: { membersCount: { decrement: 1 } },
    });
  }

  static async findPaginated(params: {
    filter: Prisma.TribeWhereInput;
    cursor?: string | undefined;
    limit: number;
  }) {
    const items = await prisma.tribe.findMany({
      where: {
        ...params.filter,
        deletedAt: null,
        ...(params.cursor ? { id: { gt: params.cursor } } : {}),
      },
      orderBy: [{ membersCount: 'desc' }, { id: 'asc' }],
      take: params.limit + 1,
    });

    const hasNextPage = items.length > params.limit;
    const result = hasNextPage ? items.slice(0, -1) : items;
    return {
      items: result,
      nextCursor: hasNextPage ? (result.at(-1)?.id ?? null) : null,
      hasNextPage,
    };
  }
}
