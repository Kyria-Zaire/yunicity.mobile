'use client';

import { useEffect, useMemo, useState } from 'react';
import { REIMS_CENTER } from '@/lib/config';

export type ProfileType = 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';

export type MapActor = {
  id: string;
  profileType: ProfileType;
  displayName: string;
  coordinates: [number, number];
  city: string;
  description?: string;
  district?: string;
  isVerified?: boolean;
};

const MOCK_ACTORS: MapActor[] = [
  {
    id: '1',
    profileType: 'commercial',
    displayName: 'Boulangerie du Marché',
    coordinates: REIMS_CENTER,
    city: 'reims',
    district: 'Centre',
    isVerified: true,
    description: 'Pain au levain, viennoiseries, café du matin.',
  },
  {
    id: '2',
    profileType: 'association',
    displayName: 'Asso Jazz Reims',
    coordinates: [4.028, 49.256],
    city: 'reims',
    district: 'Jean-Jaurès',
    isVerified: true,
    description: 'Concerts, jam sessions, ateliers débutants.',
  },
  {
    id: '3',
    profileType: 'freelance',
    displayName: 'Studio Photo',
    coordinates: [4.035, 49.261],
    city: 'reims',
    district: 'Boucicaut',
    isVerified: false,
    description: 'Portraits, événements, shooting produits.',
  },
  {
    id: '4',
    profileType: 'ecole',
    displayName: 'École des Arts',
    coordinates: [4.029, 49.26],
    city: 'reims',
    district: 'Forum',
    isVerified: true,
    description: 'Cours du soir, ateliers, expositions locales.',
  },
  {
    id: '5',
    profileType: 'commercial',
    displayName: 'Restaurant Le Cellier',
    coordinates: [4.033, 49.2545],
    city: 'reims',
    district: 'Cathédrale',
    isVerified: true,
    description: 'Cuisine de saison, terrasse, menu midi.',
  },
];

function haversineKm(pointA: [number, number], pointB: [number, number]): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const [lng1, lat1] = pointA;
  const [lng2, lat2] = pointB;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinLat1 = toRad(lat1);
  const sinLat2 = toRad(lat2);
  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(sinLat1) * Math.cos(sinLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export function useMapData(params?: { center?: [number, number]; radiusKm?: number }) {
  const [actors, setActors] = useState<MapActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Placeholder : branchement futur sur /map/data
        // const res = await fetch('/map/data', { cache: 'no-store' });
        // const data = (await res.json()) as MapActor[];
        const data = MOCK_ACTORS;
        if (!cancelled) setActors(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    const mapCenter = params?.center;
    const radius = params?.radiusKm;
    if (!mapCenter || !radius)
      return actors.map((actor) => ({ ...actor, distanceKm: undefined as number | undefined }));
    return actors
      .map((actor) => ({ ...actor, distanceKm: haversineKm(mapCenter, actor.coordinates) }))
      .filter((actor) => (actor.distanceKm ?? 0) <= radius)
      .sort((left, right) => (left.distanceKm ?? 0) - (right.distanceKm ?? 0));
  }, [actors, params?.center, params?.radiusKm]);

  return { actors, items, loading, error };
}
