'use client';

import Link from 'next/link';

export type Tribe = {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  isVerified: boolean;
  description: string;
  isMember?: boolean;
};

const categoryMeta: Record<string, { emoji: string; circle: string; badge: string }> = {
  sport: { emoji: '🚴', circle: 'bg-[#2A2FFF]/15', badge: 'bg-[#E8E9FF] text-[#2A2FFF]' },
  culture: { emoji: '🎷', circle: 'bg-[#D97706]/15', badge: 'bg-[#FEF3C7] text-[#D97706]' },
  business: { emoji: '📈', circle: 'bg-[#16A34A]/15', badge: 'bg-[#DCFCE7] text-[#16A34A]' },
  social: { emoji: '🤝', circle: 'bg-[#7C3AED]/15', badge: 'bg-[#F5F3FF] text-[#7C3AED]' },
  ecology: { emoji: '🌿', circle: 'bg-[#059669]/15', badge: 'bg-[#ECFDF5] text-[#059669]' },
  tech: { emoji: '🧩', circle: 'bg-[#2563EB]/15', badge: 'bg-[#DBEAFE] text-[#2563EB]' },
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function TribeCard({ tribe }: { tribe: Tribe }) {
  const meta = categoryMeta[tribe.category] ?? { emoji: '🏙️', circle: 'bg-[#2A2FFF]/15', badge: 'bg-[#E8E9FF] text-[#2A2FFF]' };
  const members = tribe.membersCount;

  return (
    <article className="bg-white border border-[#F3F4F6] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(13,15,46,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${meta.circle} flex items-center justify-center text-2xl`} aria-hidden>
            {meta.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-[18px] text-[#0D0F2E] leading-tight">{tribe.name}</h3>
            <span className={`inline-flex mt-2 font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${meta.badge}`}>
              {cap(tribe.category)}
            </span>
          </div>
        </div>
      </div>

      <p className="font-body text-[14px] text-[#6B7280] leading-relaxed mt-4 line-clamp-2">{tribe.description}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2" aria-hidden>
            {['#2A2FFF', '#16A34A', '#D97706', '#9CA3AF'].slice(0, Math.min(3, members)).map((bg, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ backgroundColor: bg }} />
            ))}
            {members > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-[#F3F4F6] flex items-center justify-center font-mono text-[9px] text-[#6B7280]">
                +{members - 3}
              </div>
            )}
          </div>
          <span className="font-body text-[13px] text-[#6B7280]">{members} membres</span>
        </div>

        <div className="flex items-center gap-2">
          {tribe.isVerified && (
            <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
              Vérifiée ✓
            </span>
          )}

          {tribe.isMember ? (
            <span className="font-body text-[13px] text-[#16A34A] font-semibold">Membre ✓</span>
          ) : (
            <Link
              href={`/tribus/${tribe.id}`}
              className="h-8 px-4 rounded-xl bg-[#E8E9FF] text-[#2A2FFF] font-display font-semibold text-sm hover:bg-[#D4D5FF] transition-colors inline-flex items-center justify-center"
            >
              Rejoindre
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

