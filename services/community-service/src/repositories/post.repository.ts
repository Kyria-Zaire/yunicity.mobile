import { prisma, type Prisma } from '@yunicity/database';

export class PostRepository {
  static async create(data: {
    authorId: string;
    city: string;
    content: string;
    type: string;
    tribeId?: string | undefined;
  }) {
    return prisma.post.create({
      data: {
        authorId: data.authorId,
        city: data.city,
        content: data.content,
        type: data.type as 'text' | 'event' | 'offer' | 'question' | 'announcement',
        tribeId: data.tribeId ?? null,
        isModerated: false,
        isFlagged: false,
        isPinned: false,
      },
    });
  }

  static async addReaction(postId: string, userId: string, emoji: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return null;

    // Upsert reaction
    await prisma.reaction.upsert({
      where: { postId_userId: { postId, userId } },
      update: { emoji },
      create: { postId, userId, emoji },
    });

    // Recalculate denormalized counts
    const reactions = await prisma.reaction.findMany({ where: { postId } });
    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
    }

    return prisma.post.update({
      where: { id: postId },
      data: { reactionCounts: counts },
    });
  }

  static async findPaginated(params: {
    filter: Prisma.PostWhereInput;
    cursor?: string | undefined;
    limit: number;
  }) {
    const items = await prisma.post.findMany({
      where: {
        ...params.filter,
        deletedAt: null,
        ...(params.cursor ? { id: { lt: params.cursor } } : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: params.limit + 1,
      include: {
        author: {
          select: { id: true, profileType: true, profileData: true },
        },
      },
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
