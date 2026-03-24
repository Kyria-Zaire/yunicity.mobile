process.env['NODE_ENV'] = 'test';
process.env['USER_SERVICE_URL'] = 'http://localhost:3002';
process.env['COMMUNITY_SERVICE_URL'] = 'http://localhost:3003';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecommendationService } from '../services/recommendation.service.js';

global.fetch = vi.fn();

describe('RecommendationService.getRecommendations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne le stub si tous les services sont indisponibles', async () => {
    vi.mocked(fetch).mockRejectedValue(
      new Error('Connection refused'),
    );
    const result = await RecommendationService.getRecommendations({
      userId: 'u1',
      city: 'reims',
    });
    expect(result.source).toBe('stub');
    expect(Array.isArray(result.actors)).toBe(true);
    expect(Array.isArray(result.tribes)).toBe(true);
    expect(result.actors.length).toBeGreaterThan(0);
  });

  it('retourne geographic_fallback si les services repondent', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'a1',
            profileType: 'commercial',
            profileData: { businessName: 'Boulangerie Test' },
          },
        ],
      }),
    } as Response);
    const result =
      await RecommendationService.getGeographicFallback('reims');
    expect(result.source).toBe('geographic_fallback');
    expect(result.actors[0]?.name).toBe('Boulangerie Test');
  });

  it('fallback gracieux si un seul service repond (Promise.allSettled)', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      } as Response)
      .mockRejectedValueOnce(new Error('Timeout'));
    const result =
      await RecommendationService.getGeographicFallback('reims');
    expect(result).toHaveProperty('actors');
    expect(result).toHaveProperty('tribes');
  });

  it('getRecommendations retourne une structure valide dans tous les cas', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('All down'));
    const result = await RecommendationService.getRecommendations({
      userId: 'u-test',
      city: 'reims',
      limit: 3,
    });
    expect(result).toHaveProperty('actors');
    expect(result).toHaveProperty('tribes');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('reason');
  });
});
