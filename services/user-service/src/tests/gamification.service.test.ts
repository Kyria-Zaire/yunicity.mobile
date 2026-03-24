process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { getLevelForPoints } from '../config/gamification.js';
import { GamificationService } from '../services/gamification.service.js';
import { UserRepository } from '../repositories/user.repository.js';

vi.mock('../repositories/user.repository.js');
vi.mock('../config/redis.js', () => ({
  getRedis: vi.fn().mockReturnValue({
    zadd: vi.fn().mockResolvedValue(1),
    zrevrangebyscore: vi.fn().mockResolvedValue([]),
    rename: vi.fn().mockResolvedValue('OK'),
    expire: vi.fn().mockResolvedValue(1),
  }),
}));

describe('getLevelForPoints', () => {
  it('niveau 1 à 0 points', () =>
    expect(getLevelForPoints(0).level).toBe(1));
  it('niveau 2 à 100 points', () =>
    expect(getLevelForPoints(100).level).toBe(2));
  it('niveau 1 à 99 points', () =>
    expect(getLevelForPoints(99).level).toBe(1));
  it('niveau 6 Triple A à 3000', () =>
    expect(getLevelForPoints(3000).level).toBe(6));
});

describe('GamificationService.addPoints', () => {
  it('détecte le level up (90+50=140 → niveau 2)', async () => {
    const user = {
      id: 'u1',
      points: 90,
      level: 1,
      badges: [],
      city: 'reims',
      profileType: 'yunicitizen',
      verificationStatus: 'pending',
    } as never;

    vi.mocked(UserRepository.findById).mockResolvedValue(user);
    vi.mocked(UserRepository.updateYunicity).mockResolvedValue(undefined);
    vi.mocked(UserRepository.addBadges).mockResolvedValue(undefined);

    const result = await GamificationService.addPoints('u1', 'INSCRIPTION');

    expect(result.newPoints).toBe(140);
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('pas de level up si on reste au même niveau', async () => {
    const user = {
      id: 'u2',
      points: 200,
      level: 2,
      badges: [],
      city: 'reims',
      profileType: 'yunicitizen',
      verificationStatus: 'pending',
    } as never;

    vi.mocked(UserRepository.findById).mockResolvedValue(user);
    vi.mocked(UserRepository.updateYunicity).mockResolvedValue(undefined);
    vi.mocked(UserRepository.addBadges).mockResolvedValue(undefined);

    const result = await GamificationService.addPoints('u2', 'POST_PUBLIE');

    expect(result.levelUp).toBe(false);
    expect(result.newPoints).toBe(205);
  });
});

describe('GamificationService.checkAndAwardBadges', () => {
  it('attribue le badge Ambassadeur à 1500 points', async () => {
    const user = {
      id: 'u3',
      points: 1500,
      badges: [],
      city: 'reims',
      profileType: 'yunicitizen',
      verificationStatus: 'verified',
    } as never;

    vi.mocked(UserRepository.findById).mockResolvedValue(user);
    vi.mocked(UserRepository.addBadges).mockResolvedValue(undefined);

    const badges = await GamificationService.checkAndAwardBadges('u3', 1500);
    expect(badges).toContain('ambassadeur');
  });

  it("n'attribue pas un badge déjà obtenu", async () => {
    const user = {
      id: 'u4',
      points: 2000,
      badges: ['ambassadeur'],
      city: 'reims',
      profileType: 'yunicitizen',
      verificationStatus: 'verified',
    } as never;

    vi.mocked(UserRepository.findById).mockResolvedValue(user);

    const badges = await GamificationService.checkAndAwardBadges('u4', 2000);
    expect(badges).not.toContain('ambassadeur');
  });
});
