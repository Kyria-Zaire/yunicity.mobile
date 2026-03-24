import { env } from '../config/env.js';

interface MapActor {
  id: string;
  profileType: string;
  displayName: string;
  coordinates: [number, number];
  city: string;
  distance?: number | undefined;
}

interface MapTribe {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  coordinates?: [number, number] | undefined;
}

export class MapService {
  static async getActorsNearby(params: {
    lat: number;
    lng: number;
    radius: number;
    types?: string[] | undefined;
    limit?: number | undefined;
  }): Promise<MapActor[]> {
    const radius = Math.min(params.radius, 10_000);
    const limit = Math.min(params.limit ?? 50, 100);

    const url = new URL(`${env.USER_SERVICE_URL}/users/nearby`);
    url.searchParams.set('lat', String(params.lat));
    url.searchParams.set('lng', String(params.lng));
    url.searchParams.set('radius', String(radius));
    url.searchParams.set('limit', String(limit));
    if (params.types?.length) {
      url.searchParams.set('types', params.types.join(','));
    }

    try {
      const res = await fetch(url.toString(), {
        headers: { 'X-Internal-Service': 'map-service' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { items?: MapActor[] };
      return data.items ?? [];
    } catch {
      return [];
    }
  }

  static async getTribesNearby(params: {
    city: string;
    lat?: number | undefined;
    lng?: number | undefined;
    limit?: number | undefined;
  }): Promise<MapTribe[]> {
    const url = new URL(`${env.COMMUNITY_SERVICE_URL}/tribes`);
    url.searchParams.set('city', params.city);
    url.searchParams.set('limit', String(params.limit ?? 20));

    try {
      const res = await fetch(url.toString(), {
        headers: { 'X-Internal-Service': 'map-service' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { items?: MapTribe[] };
      return data.items ?? [];
    } catch {
      return [];
    }
  }

  static async getMapData(params: {
    lat: number;
    lng: number;
    radius: number;
    city: string;
    types?: string[] | undefined;
  }) {
    const [actors, tribes] = await Promise.all([
      MapService.getActorsNearby({
        lat: params.lat,
        lng: params.lng,
        radius: params.radius,
        types: params.types,
      }),
      MapService.getTribesNearby({ city: params.city }),
    ]);

    return {
      actors,
      tribes,
      meta: { lat: params.lat, lng: params.lng, radius: params.radius },
    };
  }
}
