'use client';

import { useEffect, useRef } from 'react';

const PARTNERS = [
  { id: 1, name: 'Ville de Reims', initials: 'VR', color: '#2A2FFF' },
  { id: 2, name: 'CCI Grand Est', initials: 'CCI', color: '#1A1ECC' },
  { id: 3, name: 'Chambre des Métiers', initials: 'CM', color: '#16A34A' },
  { id: 4, name: 'Reims Développement', initials: 'RD', color: '#D97706' },
  { id: 5, name: 'Grand Reims', initials: 'GR', color: '#7C3AED' },
  { id: 6, name: "Office du Tourisme", initials: 'OT', color: '#059669' },
  { id: 7, name: 'Réseau Entreprendre', initials: 'RE', color: '#DC2626' },
  { id: 8, name: 'BNI Champagne', initials: 'BNI', color: '#2563EB' },
  { id: 9, name: 'Pôle Emploi Reims', initials: 'PE', color: '#D97706' },
  { id: 10, name: 'Université de Reims', initials: 'UR', color: '#7C3AED' },
  { id: 11, name: "Maison de l'Emploi", initials: 'ME', color: '#16A34A' },
  { id: 12, name: 'French Tech Grand Est', initials: 'FT', color: '#2A2FFF' },
] as const;

interface Partner {
  id: number;
  name: string;
  initials: string;
  color: string;
  logoUrl?: string;
}

export function PartnersCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const t = track;

    const speed = 0.5;

    function animate() {
      posRef.current -= speed;
      const halfWidth = t.scrollWidth / 2;
      if (Math.abs(posRef.current) >= halfWidth) posRef.current = 0;
      t.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    const parent = t.parentElement?.parentElement;
    const pause = () => cancelAnimationFrame(animRef.current);
    const resume = () => {
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    parent?.addEventListener('mouseenter', pause);
    parent?.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animRef.current);
      parent?.removeEventListener('mouseenter', pause);
      parent?.removeEventListener('mouseleave', resume);
    };
  }, []);

  const items: Partner[] = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-16 bg-white overflow-hidden border-t border-b border-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center">
        <span className="font-mono text-[11px] text-[#9395FF] uppercase tracking-[0.2em]">
          Ils nous font confiance
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0D0F2E] mt-2">
          Nos partenaires
        </h2>
        <p className="font-body text-[#6B7280] text-base mt-3 max-w-lg mx-auto">
          Institutions, associations et acteurs locaux qui co-construisent Yunicity avec nous.
        </p>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, white, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, white, transparent)' }}
        />

        <div className="overflow-hidden">
          <div ref={trackRef} className="flex gap-4 sm:gap-6 w-max py-2">
            {items.map((partner, index) => (
              <PartnerCard key={`${partner.id}-${index}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center font-mono text-[11px] text-[#D1D5DB] mt-8 tracking-wide">
        Les logos officiels seront intégrés prochainement
      </p>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center gap-3 bg-white border border-[#F3F4F6] rounded-2xl px-5 py-4 w-[140px] sm:w-[160px] shadow-[0_2px_8px_rgba(13,15,46,0.05)] hover:border-[#2A2FFF]/20 hover:shadow-[0_4px_16px_rgba(13,15,46,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-default"
      aria-label={partner.name}
    >
      {partner.logoUrl ? (
        <img src={partner.logoUrl} alt={partner.name} className="w-12 h-12 object-contain" />
      ) : (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-white text-sm"
          style={{ backgroundColor: partner.color }}
        >
          {partner.initials}
        </div>
      )}
      <span className="font-body text-[12px] text-[#374151] text-center leading-tight line-clamp-2">
        {partner.name}
      </span>
    </div>
  );
}

