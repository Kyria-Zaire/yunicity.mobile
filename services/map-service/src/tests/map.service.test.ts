process.env['NODE_ENV'] = 'test';
process.env['USER_SERVICE_URL'] = 'http://localhost:3002';
process.env['COMMUNITY_SERVICE_URL'] = 'http://localhost:3003';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapService } from '../services/map.service.js';

const fetchMock = vi.fn();
global.fetch = fetchMock;

beforeEach(() => {
  fetchMock.mockReset();
});

describe('MapService', () => {
  it('retourne un tableau vide si user-service est indisponible', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Connection refused'));
    const result = await MapService.getActorsNearby({
      lat: 49.25,
      lng: 4.03,
      radius: 2000,
    });
    expect(result).toEqual([]);
  });

  it('cap le radius à 10000m', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);
    await MapService.getActorsNearby({
      lat: 49.25,
      lng: 4.03,
      radius: 99999,
    });
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('radius=10000');
  });

  it('getMapData appelle actors et tribes en parallèle', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);
    const result = await MapService.getMapData({
      lat: 49.25,
      lng: 4.03,
      radius: 2000,
      city: 'reims',
    });
    expect(result).toHaveProperty('actors');
    expect(result).toHaveProperty('tribes');
    expect(result.meta.radius).toBe(2000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
