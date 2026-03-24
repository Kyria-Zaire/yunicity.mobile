process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';

import { describe, it, expect, vi } from 'vitest';
import { TribeService } from '../services/tribe.service.js';
import { TribeRepository } from '../repositories/tribe.repository.js';

vi.mock('../repositories/tribe.repository.js');

describe('TribeService.create', () => {
  it('rejette si le nom existe déjà dans la ville', async () => {
    vi.mocked(TribeRepository.findBySlugAndCity).mockResolvedValueOnce({
      id: '1',
    } as never);
    const result = await TribeService.create({
      name: 'Cyclistes Reims',
      description: 'Description test de 10 chars minimum',
      category: 'sport',
      city: 'reims',
      creatorId: 'user1',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('TRIBE_EXISTS');
  });

  it('crée la tribu avec le créateur comme premier membre', async () => {
    vi.mocked(TribeRepository.findBySlugAndCity).mockResolvedValueOnce(null);
    vi.mocked(TribeRepository.create).mockResolvedValueOnce({
      id: 'tribe-1',
      name: 'Cyclistes Reims',
      members: [{ userId: 'user1' }],
      membersCount: 1,
    } as never);
    const result = await TribeService.create({
      name: 'Cyclistes Reims',
      description: 'Description test de 10 chars minimum',
      category: 'sport',
      city: 'reims',
      creatorId: 'user1',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.membersCount).toBe(1);
  });
});

describe('TribeService.join', () => {
  it('rejette si déjà membre', async () => {
    vi.mocked(TribeRepository.findById).mockResolvedValueOnce({
      id: 'tribe-1',
      members: [{ userId: 'user1' }],
      creatorId: 'creator',
    } as never);
    const result = await TribeService.join('tribe-1', 'user1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ALREADY_MEMBER');
  });
});

describe('TribeService.leave', () => {
  it('interdit au créateur de quitter la tribu', async () => {
    vi.mocked(TribeRepository.findById).mockResolvedValueOnce({
      id: 'tribe-1',
      members: [{ userId: 'creator' }, { userId: 'user1' }],
      creatorId: 'creator',
    } as never);
    const result = await TribeService.leave('tribe-1', 'creator');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CREATOR_CANNOT_LEAVE');
  });
});
