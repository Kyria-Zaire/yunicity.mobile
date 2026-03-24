'use client';

import type { ProfileType } from '@/hooks/use-map-data';

export type CommunityPost = {
  id: string;
  authorName: string;
  profileType: ProfileType;
  content: string;
  type: 'text' | 'event' | 'question' | 'offer';
  createdAt: string;
  reactions?: Record<string, number>;
  event?: { title: string; date: string; location: string };
};

const badgeByType: Record<ProfileType, string> = {
  yunicitizen: 'bg-[#E8E9FF] text-[#2A2FFF]',
  commercial: 'bg-[#DCFCE7] text-[#16A34A]',
  association: 'bg-[#FEF3C7] text-[#D97706]',
  freelance: 'bg-[#F5F3FF] text-[#7C3AED]',
  ecole: 'bg-[#ECFDF5] text-[#059669]',
};

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  const a = parts[0]?.[0] ?? 'Y';
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
  return (a + b).toUpperCase();
}

export function PostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="bg-white rounded-2xl border border-[#F3F4F6] p-5 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#1C1F4A] border border-[#2A2FFF]/15 text-white flex items-center justify-center font-mono text-[11px] shrink-0" aria-hidden>
            {initials(post.authorName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-[#0D0F2E] text-sm">{post.authorName}</span>
              <span className={`inline-flex items-center font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeByType[post.profileType]}`}>
                {post.profileType}
              </span>
              <span className="font-mono text-[10px] text-[#6B7280]">{post.createdAt}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-4">
        <p className="font-body text-[15px] text-[#0D0F2E] leading-relaxed">{post.content}</p>

        {post.type === 'event' && post.event && (
          <div className="mt-4 rounded-2xl border border-[#2A2FFF]/15 bg-[#E8E9FF]/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold text-[#0D0F2E]">{post.event.title}</p>
                <p className="font-body text-sm text-[#1C1F4A] mt-1">{post.event.date}</p>
                <p className="font-body text-sm text-[#1C1F4A]">{post.event.location}</p>
              </div>
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] transition-colors"
              >
                J&apos;y vais
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(post.reactions ?? {}).map(([k, v]) => (
            <button
              key={k}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[#0D0F2E] font-mono text-[10px] uppercase tracking-widest hover:bg-[#E5E7EB] transition-colors"
            >
              <span className="text-[12px]" aria-hidden>
                {k}
              </span>
              <span>{v}</span>
            </button>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] font-mono text-[10px] uppercase tracking-widest hover:bg-[#F3F4F6] transition-colors"
          >
            Réagir
          </button>
        </div>

        <button
          type="button"
          className="text-[#2A2FFF] font-body text-sm font-semibold hover:underline"
        >
          Commenter
        </button>
      </footer>
    </article>
  );
}

