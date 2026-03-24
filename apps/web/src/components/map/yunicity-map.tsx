'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { MapActor, ProfileType } from '@/hooks/use-map-data';

type Props = {
  center: [number, number];
  zoom: number;
  actors: MapActor[];
  onActorClick: (actor: MapActor) => void;
};

const typeColors: Record<ProfileType, string> = {
  commercial: '#16A34A',
  association: '#D97706',
  freelance: '#7C3AED',
  ecole: '#059669',
  yunicitizen: '#2A2FFF',
};

const iconSvg: Record<ProfileType, string> = {
  commercial: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="20" height="20">
  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
  <polyline points="9,22 9,12 15,12 15,22"/>
</svg>`,
  association: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="20" height="20">
  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
  <circle cx="9" cy="7" r="4"/>
  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
  <path d="M16 3.13a4 4 0 010 7.75"/>
</svg>`,
  freelance: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="20" height="20">
  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
</svg>`,
  ecole: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="20" height="20">
  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
  <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
</svg>`,
  yunicitizen: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="20" height="20">
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
  <circle cx="12" cy="10" r="3"/>
</svg>`,
};

export function YunicityMap({ center, zoom, actors, onActorClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const markersRef = useRef<Map<string, import('maplibre-gl').Marker>>(new Map());

  const markerStyle = useMemo(
    () => (color: string) => `
      width: 40px;
      height: 40px;
      background: ${color};
      border-radius: 50%;
      border: 2.5px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 9px;
    `,
    [],
  );

  useEffect(() => {
    let alive = true;

    async function init() {
      const maplibregl = (await import('maplibre-gl')).default;
      if (!alive) return;
      if (!containerRef.current) return;
      if (mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center,
        zoom,
        pitch: 30,
        bearing: -5,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'bottom-right');
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showAccuracyCircle: false,
          showUserLocation: true,
        }),
        'bottom-right',
      );

      mapRef.current = map;
    }

    void init();
    return () => {
      alive = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center, zoom, essential: true, duration: 650 });
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextIds = new Set(actors.map((a) => a.id));
    for (const [id, marker] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    (async () => {
      const ml = (await import('maplibre-gl')).default;
      actors.forEach((actor) => {
        if (markersRef.current.has(actor.id)) return;
        const el = document.createElement('div');
        const color = typeColors[actor.profileType];
        el.style.cssText = markerStyle(color);
        el.innerHTML = iconSvg[actor.profileType];
        el.title = actor.displayName;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Ouvrir ${actor.displayName}`);
        el.addEventListener('click', () => onActorClick(actor));
        const marker = new ml.Marker({ element: el }).setLngLat(actor.coordinates).addTo(map);
        markersRef.current.set(actor.id, marker);
      });
    })();
  }, [actors, markerStyle, onActorClick]);

  return <div ref={containerRef} className="w-full h-full" aria-label="Carte de la ville" />;
}

