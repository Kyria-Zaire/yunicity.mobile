import { prisma } from '@yunicity/database';

export class FollowRepository {
  static async upsert(followerId: string, followingId: string) {
    return prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
      select: { id: true, followerId: true, followingId: true, createdAt: true },
    });
  }

  static async delete(followerId: string, followingId: string): Promise<number> {
    const result = await prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
    return result.count;
  }
}
