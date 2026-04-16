'use client';

import { useEffect, useRef } from 'react';

type Props = {
  lngLat: [number, number];
};

/** Carte non interactive, zoom fixe — évite le jitter MapLibre (pas de scale au hover). */
export function ProfileMiniMap({ lngLat }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: import('maplibre-gl').Map | null = null;
    let cancelled = false;

    void (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (cancelled || !containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: lngLat,
        zoom: 14,
        interactive: false,
        attributionControl: false,
      });

      const el = document.createElement('div');
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: #2A2FFF; border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      `;
      new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lngLat[0], lngLat[1]]);

  return <div ref={containerRef} className="h-32 w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6]" />;
}
