'use client';

import { useEffect, useMemo, useState } from 'react';

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
  { id: '1', profileType: 'commercial', displayName: 'Boulangerie du Marché', coordinates: [4.0317, 49.2583], city: 'reims', district: 'Centre', isVerified: true, description: 'Pain au levain, viennoiseries, café du matin.' },
  { id: '2', profileType: 'association', displayName: 'Asso Jazz Reims', coordinates: [4.028, 49.256], city: 'reims', district: 'Jean-Jaurès', isVerified: true, description: 'Concerts, jam sessions, ateliers débutants.' },
  { id: '3', profileType: 'freelance', displayName: 'Studio Photo', coordinates: [4.035, 49.261], city: 'reims', district: 'Boucicaut', isVerified: false, description: 'Portraits, événements, shooting produits.' },
  { id: '4', profileType: 'ecole', displayName: 'École des Arts', coordinates: [4.029, 49.26], city: 'reims', district: 'Forum', isVerified: true, description: 'Cours du soir, ateliers, expositions locales.' },
  { id: '5', profileType: 'commercial', displayName: 'Restaurant Le Cellier', coordinates: [4.033, 49.2545], city: 'reims', district: 'Cathédrale', isVerified: true, description: 'Cuisine de saison, terrasse, menu midi.' },
];

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sLat1 = toRad(lat1);
  const sLat2 = toRad(lat2);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(sLat1) * Math.cos(sLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
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
    const c = params?.center;
    const r = params?.radiusKm;
    if (!c || !r) return actors.map((a) => ({ ...a, distanceKm: undefined as number | undefined }));
    return actors
      .map((a) => ({ ...a, distanceKm: haversineKm(c, a.coordinates) }))
      .filter((a) => (a.distanceKm ?? 0) <= r)
      .sort((x, y) => (x.distanceKm ?? 0) - (y.distanceKm ?? 0));
  }, [actors, params?.center, params?.radiusKm]);

  return { actors, items, loading, error };
}

