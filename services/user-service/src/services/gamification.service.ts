import type { Redis } from 'ioredis';
import { getRedis } from '../config/redis.js';
import { UserRepository } from '../repositories/user.repository.js';
import {
  BADGES,
  type BadgeId,
  getLevelForPoints,
  LEVELS,
  POINTS,
} from '../config/gamification.js';

export class GamificationService {
  static async addPoints(
    userId: string,
    action: keyof typeof POINTS,
  ): Promise<{
    newPoints: number;
    newLevel: number;
    levelUp: boolean;
    newBadges: string[];
  }> {
    const pts = POINTS[action];
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const oldLevel = getLevelForPoints(user.points);
    const newPoints = user.points + pts;
    const newLevel = getLevelForPoints(newPoints);
    const levelUp = newLevel.level > oldLevel.level;

    await UserRepository.updateYunicity(userId, {
      points: newPoints,
      level: newLevel.level,
    });

    // Classement Redis — scores par ville
    const city = (user.city ?? 'reims').toLowerCase();
    const redis = getRedis() as unknown as Redis;
    await redis.zadd(`leaderboard:${city}:weekly`, newPoints, userId);
    await redis.zadd(`leaderboard:${city}:alltime`, newPoints, userId);

    // Vérifier badges
    const newBadges = await GamificationService.checkAndAwardBadges(
      userId,
      newPoints,
    );

    return {
      newPoints,
      newLevel: newLevel.level,
      levelUp,
      newBadges,
    };
  }

  static async checkAndAwardBadges(
    userId: string,
    points: number,
  ): Promise<string[]> {
    const user = await UserRepository.findById(userId);
    if (!user) return [];

    const current = new Set(user.badges ?? []);
    const newBadges: string[] = [];

    if (
      points >= LEVELS[4].minPoints /* 1500 */ &&
      !current.has(BADGES.AMBASSADEUR.id)
    ) {
      newBadges.push(BADGES.AMBASSADEUR.id);
    }

    if (
      points >= LEVELS[5].minPoints /* 3000 */ &&
      !current.has(BADGES.TRIPLE_A.id)
    ) {
      newBadges.push(BADGES.TRIPLE_A.id);
    }

    if (
      user.profileType === 'commercial' &&
      user.verificationStatus === 'verified' &&
      !current.has(BADGES.COMMERCIAL_VERIFIE.id)
    ) {
      newBadges.push(BADGES.COMMERCIAL_VERIFIE.id);
    }

    if (newBadges.length > 0) {
      await UserRepository.addBadges(userId, newBadges);
    }
    return newBadges;
  }

  static async awardBadge(
    userId: string,
    badgeId: BadgeId,
  ): Promise<boolean> {
    const user = await UserRepository.findById(userId);
    if (!user) return false;
    if (user.badges?.includes(BADGES[badgeId].id)) return false;
    await UserRepository.addBadges(userId, [BADGES[badgeId].id]);
    return true;
  }

  static async getWeeklyLeaderboard(city: string): Promise<
    Array<{ rank: number; userId: string; points: number }>
  > {
    const key = `leaderboard:${city.toLowerCase()}:weekly`;
    const results = await getRedis().zrevrangebyscore(
      key,
      '+inf',
      '-inf',
      'WITHSCORES',
      'LIMIT',
      0,
      20,
    );

    const board: Array<{ rank: number; userId: string; points: number }> =
      [];
    for (let i = 0; i < results.length; i += 2) {
      board.push({
        rank: Math.floor(i / 2) + 1,
        userId: String(results[i] ?? ''),
        points: Number(results[i + 1] ?? 0),
      });
    }
    return board;
  }

  static async resetWeeklyLeaderboard(city: string): Promise<void> {
    const redis = getRedis();
    const weekKey = `leaderboard:${city.toLowerCase()}:weekly`;
    const archiveKey = `leaderboard:${city.toLowerCase()}:week:${new Date()
      .toISOString()
      .slice(0, 10)}`;
    await redis.rename(weekKey, archiveKey).catch(() => {});
    await redis.expire(archiveKey, 60 * 60 * 24 * 90);
  }
}

