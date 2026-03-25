'use client';

import { useEffect, useRef, useCallback } from 'react';
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
  const markersRef = useRef<import('maplibre-gl').Marker[]>([]);
  const observerRef = useRef<ResizeObserver | null>(null);
  const readyRef = useRef(false);

  // Store latest callback in ref to avoid stale closures in marker click handlers
  const onActorClickRef = useRef(onActorClick);
  onActorClickRef.current = onActorClick;

  const createMarkerElement = useCallback((actor: MapActor): HTMLElement => {
    const color = typeColors[actor.profileType];
    const el = document.createElement('div');
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 9px;
      transition: box-shadow 0.15s ease;
      user-select: none;
      will-change: box-shadow;
      transform-origin: center center;
      position: relative;
      z-index: 1;
    `;
    el.innerHTML = iconSvg[actor.profileType];
    el.title = actor.displayName;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Ouvrir ${actor.displayName}`);

    el.addEventListener('mouseenter', () => {
      el.style.boxShadow = '0 6px 24px rgba(0,0,0,0.45)';
      el.style.zIndex = '10';
      el.style.border = '3px solid rgba(255,255,255,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
      el.style.zIndex = '1';
      el.style.border = '3px solid white';
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onActorClickRef.current(actor);
    });

    return el;
  }, []);

  // Init map once
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (!isMounted) return;
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

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
        'bottom-right',
      );
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showAccuracyCircle: false,
          showUserLocation: true,
        }),
        'bottom-right',
      );

      map.on('load', () => {
        map.resize();
      });

      mapRef.current = map;
      readyRef.current = true;

      const ro = new ResizeObserver(() => {
        mapRef.current?.resize();
      });
      if (containerRef.current) {
        ro.observe(containerRef.current);
      }
      observerRef.current = ro;
    }

    void init();
    return () => {
      isMounted = false;
      readyRef.current = false;
      observerRef.current?.disconnect();
      observerRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to new center/zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center, zoom, essential: true, duration: 650 });
  }, [center, zoom]);

  // Sync markers — clear all and recreate to avoid stale closures
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove all existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Re-import is instant (module already cached from init)
    (async () => {
      const ml = (await import('maplibre-gl')).default;
      actors.forEach((actor) => {
        const el = createMarkerElement(actor);
        const marker = new ml.Marker({ element: el, anchor: 'center' })
          .setLngLat(actor.coordinates)
          .addTo(map);
        markersRef.current.push(marker);
      });
    })();
  }, [actors, createMarkerElement]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      aria-label="Carte de la ville"
    />
  );
}
