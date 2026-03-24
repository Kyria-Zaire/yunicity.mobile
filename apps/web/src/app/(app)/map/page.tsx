'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { MapActor, ProfileType } from '@/hooks/use-map-data';
import { useMapData } from '@/hooks/use-map-data';
import { YunicityMap } from '@/components/map/yunicity-map';

type FilterKey = 'all' | ProfileType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'commercial', label: 'Commerçants' },
  { key: 'association', label: 'Associations' },
  { key: 'freelance', label: 'Freelances' },
  { key: 'ecole', label: 'Écoles' },
];

const badgeByType: Record<ProfileType, string> = {
  yunicitizen: 'bg-[#E8E9FF] text-[#2A2FFF]',
  commercial: 'bg-[#DCFCE7] text-[#16A34A]',
  association: 'bg-[#FEF3C7] text-[#D97706]',
  freelance: 'bg-[#F5F3FF] text-[#7C3AED]',
  ecole: 'bg-[#ECFDF5] text-[#059669]',
};

const avatarBgByType: Record<ProfileType, string> = {
  yunicitizen: '#2A2FFF',
  commercial: '#16A34A',
  association: '#D97706',
  freelance: '#7C3AED',
  ecole: '#059669',
};

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  const a = parts[0]?.[0] ?? 'Y';
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
  return (a + b).toUpperCase();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function MapPage() {
  const [center, setCenter] = useState<[number, number]>([4.0317, 49.2583]);
  const [zoom, setZoom] = useState(13);
  const [selected, setSelected] = useState<MapActor | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [radiusM, setRadiusM] = useState(2000);

  const radiusKm = radiusM / 1000;
  const { items, loading, error } = useMapData({ center, radiusKm });

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((a) => (filter === 'all' ? true : a.profileType === filter))
      .filter((a) => (query ? a.displayName.toLowerCase().includes(query) : true));
  }, [items, filter, q]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="relative h-[calc(100dvh-64px)]">
      <div className="absolute inset-0">
        <YunicityMap
          center={center}
          zoom={zoom}
          actors={filtered.map((a) => ({ ...a }))}
          onActorClick={(actor) => {
            setSelected(actor);
            setCenter(actor.coordinates);
            setZoom(clamp(zoom, 14, 16));
          }}
        />
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex absolute left-4 top-4 bottom-4 w-[320px] z-20 bg-[#0D0F2E]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-hover overflow-hidden flex-col">
        <div className="p-4 border-b border-white/10">
          <label className="sr-only" htmlFor="map-search">
            Rechercher
          </label>
          <input
            id="map-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un acteur, lieu..."
            className="w-full h-11 rounded-xl bg-[#1C1F4A] border border-white/10 px-4 text-white placeholder:text-white/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2FFF]"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest border border-white/10 transition-colors
                    ${active ? 'bg-[#2A2FFF] text-white' : 'bg-[#1C1F4A] text-[#9395FF] hover:bg-[#2A2FFF]/20'}`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#9395FF]">Rayon</span>
              <span className="font-mono text-[10px] text-white/80">{`Rayon : ${radiusKm.toFixed(radiusKm >= 1 ? 0 : 1)}km`}</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={250}
              value={radiusM}
              onChange={(e) => setRadiusM(Number(e.target.value))}
              className="w-full mt-3 accent-[#2A2FFF]"
              aria-label="Rayon de recherche"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {loading && (
            <div className="p-3 text-white/70 font-body text-sm">Chargement des acteurs…</div>
          )}
          {error && <div className="p-3 text-[#FEE2E2] font-body text-sm">{error}</div>}
          {!loading && !filtered.length && (
            <div className="p-3 text-white/70 font-body text-sm">Aucun résultat dans ce rayon.</div>
          )}

          <div className="grid gap-1">
            {filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelected(a);
                  setCenter(a.coordinates);
                  setZoom(15);
                }}
                className="w-full text-left rounded-xl px-3 py-3 hover:bg-[#1C1F4A] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center font-mono text-[12px] text-white"
                    style={{ background: avatarBgByType[a.profileType] }}
                    aria-hidden
                  >
                    {initials(a.displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-body text-sm text-white truncate">{a.displayName}</span>
                      <span className="font-mono text-[10px] text-white/60 shrink-0">
                        {typeof (a as any).distanceKm === 'number'
                          ? `${Math.max(0.1, Math.round(((a as any).distanceKm as number) * 10) / 10)}km`
                          : ''}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeByType[a.profileType]}`}>
                        {a.profileType === 'ecole' ? 'École' : a.profileType === 'yunicitizen' ? 'Citoyen' : a.profileType}
                      </span>
                      <span className="font-body text-[12px] text-white/50 truncate">{a.district ?? 'Reims'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile FAB */}
      <button
        type="button"
        className="md:hidden fixed bottom-5 right-5 z-30 h-12 px-5 rounded-full bg-[#2A2FFF] text-white font-display font-semibold shadow-primary active:scale-[0.98] transition-transform"
        onClick={() => setMobileFiltersOpen(true)}
      >
        Filtres
      </button>

      {/* Mobile bottom sheet */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Fermer"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 right-0 bottom-0 h-[450px] bg-[#0D0F2E]/95 backdrop-blur-md rounded-t-3xl border-t border-white/10 shadow-hover overflow-hidden">
            <div className="p-4">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-white text-lg">Filtres</span>
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl hover:bg-white/5 transition-colors inline-flex items-center justify-center"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Fermer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher un acteur, lieu..."
                  className="w-full h-11 rounded-xl bg-[#1C1F4A] border border-white/10 px-4 text-white placeholder:text-white/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2FFF]"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest border border-white/10 transition-colors
                        ${active ? 'bg-[#2A2FFF] text-white' : 'bg-[#1C1F4A] text-[#9395FF] hover:bg-[#2A2FFF]/20'}`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#9395FF]">Rayon</span>
                  <span className="font-mono text-[10px] text-white/80">{`Rayon : ${radiusKm.toFixed(radiusKm >= 1 ? 0 : 1)}km`}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={250}
                  value={radiusM}
                  onChange={(e) => setRadiusM(Number(e.target.value))}
                  className="w-full mt-3 accent-[#2A2FFF]"
                  aria-label="Rayon de recherche"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="font-body text-white/70 text-sm">{filtered.length} résultats</span>
                <button
                  type="button"
                  className="h-11 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Voir sur la carte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer détail */}
      {selected && (
        <div className="fixed inset-0 z-30">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Fermer le détail"
            onClick={() => setSelected(null)}
          />
          <aside className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-hover border-l border-[#E5E7EB] p-5 overflow-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-[#E8E9FF] border border-[#2A2FFF]/15 flex items-center justify-center font-display font-black text-[#2A2FFF] text-xl shrink-0">
                  {initials(selected.displayName)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-black text-xl text-[#0D0F2E] truncate">{selected.displayName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${badgeByType[selected.profileType]}`}>
                      {selected.profileType}
                    </span>
                    {selected.isVerified && (
                      <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                        Vérifié ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-10 h-10 rounded-xl border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors inline-flex items-center justify-center"
                aria-label="Fermer"
                onClick={() => setSelected(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0F2E" strokeWidth="2">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-6">
              <p className="font-body text-sm text-[#6B7280] leading-relaxed">
                {(selected.district ? `${selected.district}, ` : '') + (selected.city ? selected.city.toUpperCase() : 'REIMS')}
              </p>
              {selected.description && (
                <p className="font-body text-[15px] text-[#0D0F2E] leading-relaxed mt-3">{selected.description}</p>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href={`/profil/${selected.id}`}
                className="h-12 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors inline-flex items-center justify-center"
              >
                Voir le profil complet
              </Link>
              <button
                type="button"
                className="h-12 rounded-xl border-2 border-[#2A2FFF] text-[#2A2FFF] font-display font-semibold hover:bg-[#2A2FFF] hover:text-white transition-colors"
              >
                Contacter
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">Astuce</p>
              <p className="font-body text-sm text-[#6B7280] mt-2">
                Clique sur un marqueur pour ouvrir le détail, ou sur un résultat dans la liste.
              </p>
            </div>
          </aside>
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {loading ? 'Chargement' : ''}
      </div>
    </div>
  );
}

