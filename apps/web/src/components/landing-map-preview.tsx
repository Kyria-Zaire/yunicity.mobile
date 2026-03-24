'use client';

import { useEffect, useRef } from 'react';

export function LandingMapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('maplibre-gl').Map | null = null;

    async function initMap() {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css');

      if (!mapContainer.current) return;

      map = new maplibregl.Map({
        container: mapContainer.current,
        // Style gratuit OpenFreeMap — aucune clé API requise
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [4.0317, 49.2583], // Reims, France
        zoom: 13,
        pitch: 45,
        bearing: -10,
        interactive: false, // Preview statique — pas d'interaction
        attributionControl: false,
      });

      map.on('load', () => {
        const m = map;
        if (!m) return;

        // Hotspots fictifs pour le preview (acteurs locaux)
        const hotspots = [
          { lng: 4.0317, lat: 49.2583, type: 'commercial', label: 'Boulangerie du Marché' },
          { lng: 4.028, lat: 49.256, type: 'association', label: 'Association Vélo Reims' },
          { lng: 4.035, lat: 49.261, type: 'freelance', label: 'Studio Graphique' },
          { lng: 4.029, lat: 49.26, type: 'ecole', label: 'École des Arts' },
          { lng: 4.033, lat: 49.2545, type: 'commercial', label: 'Restaurant Le Cellier' },
        ];

        const typeColors: Record<string, string> = {
          commercial: '#16A34A',
          association: '#D97706',
          freelance: '#7C3AED',
          ecole: '#059669',
          yunicitizen: '#2A2FFF',
        };

        const iconSvg: Record<string, string> = {
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

        hotspots.forEach(({ lng, lat, type, label }) => {
          const el = document.createElement('div');
          const color = typeColors[type] ?? '#2A2FFF';
          const icon = iconSvg[type] ?? iconSvg['yunicitizen']!;
          el.style.cssText = `
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
          `;
          el.title = label;
          el.innerHTML = icon;
          new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(m);
        });
      });
    }

    void initMap();

    return () => {
      map?.remove();
      map = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
        style={{
          background: 'linear-gradient(to bottom, transparent 60%, rgba(13,15,46,0.4) 100%)',
        }}
      />
      <div ref={mapContainer} className="w-full h-full bg-[#0D0F2E]" />

      <div
        className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0D0F2E]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10"
        aria-label="Activité en temps réel"
      >
        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" aria-hidden />
        <span className="font-mono text-[11px] text-white tracking-wide">47 actifs maintenant</span>
      </div>

      <div className="absolute bottom-3 right-3 z-20 bg-[#0D0F2E]/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
        <p className="font-mono text-[10px] text-[#9395FF] uppercase tracking-widest mb-1.5">Profils</p>
        {[
          { label: 'Commercial', color: '#16A34A' },
          { label: 'Association', color: '#D97706' },
          { label: 'Freelance', color: '#7C3AED' },
          { label: 'École', color: '#059669' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 mb-1 last:mb-0">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-white/70 text-[11px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

