'use client';

import { useState } from 'react';
import {
  type MockProfile,
  type MockPost,
  AVATAR_BG,
  MOCK_POSTS_BY_TYPE,
  initials,
} from './profile-types';

const POST_TYPE_ICON: Record<string, string> = {
  text: '💬',
  event: '📅',
  offer: '🎁',
  question: '❓',
  project: '🎨',
};

const FILTERS = ['Tous', 'Posts', 'Événements', 'Offres'] as const;

export function TimelineTab({ profile, isOwner }: { profile: MockProfile; isOwner: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Tous');
  const posts = MOCK_POSTS_BY_TYPE[profile.profileType] ?? [];

  const filtered = posts.filter((p) => {
    if (filter === 'Tous') return true;
    if (filter === 'Posts') return p.type === 'text' || p.type === 'question';
    if (filter === 'Événements') return p.type === 'event';
    if (filter === 'Offres') return p.type === 'offer' || p.type === 'project';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Composer — owner only */}
      {isOwner && <PostComposer profile={profile} />}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full font-body text-sm whitespace-nowrap transition-colors shrink-0 ${
              filter === f
                ? 'bg-[#2A2FFF] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      {filtered.map((post) => (
        <PostCard key={post.id} post={post} profile={profile} />
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="font-body text-[#6B7280]">Aucune publication dans cette catégorie.</p>
        </div>
      )}

      {filtered.length >= 5 && (
        <button
          type="button"
          className="w-full py-3 rounded-xl border border-[#E5E7EB] font-body text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
        >
          Voir plus de publications
        </button>
      )}
    </div>
  );
}

function PostComposer({ profile }: { profile: MockProfile }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-mono text-[11px] shrink-0"
          style={{ background: AVATAR_BG[profile.profileType] }}
        >
          {initials(profile.displayName)}
        </div>
        <div className="flex-1 h-10 px-4 rounded-full bg-[#F3F4F6] flex items-center cursor-pointer hover:bg-[#E5E7EB] transition-colors">
          <span className="font-body text-sm text-[#9CA3AF]">
            Quoi de neuf à {profile.city} ?
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-2 border-t border-[#F3F4F6] pt-3">
        <ComposerButton icon="📷" label="Photo" />
        <ComposerButton icon="📅" label="Événement" />
        {profile.profileType === 'commercial' && <ComposerButton icon="🎁" label="Offre" />}
        <ComposerButton icon="❓" label="Question" />
      </div>
    </div>
  );
}

function ComposerButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

function PostCard({ post, profile }: { post: MockPost; profile: MockProfile }) {
  const [liked, setLiked] = useState(false);
  const reactionCount = post.reactions + (liked ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-mono text-[11px] shrink-0"
            style={{ background: AVATAR_BG[profile.profileType] }}
          >
            {initials(profile.displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-[#0D0F2E]">
                {profile.displayName}
              </span>
              <span className="font-mono text-[10px] text-[#9CA3AF]">{post.time}</span>
              {post.type !== 'text' && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                  {POST_TYPE_ICON[post.type]} {post.type}
                </span>
              )}
            </div>
            <p className="font-body text-sm text-[#374151] mt-2 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>
        </div>

        {/* Image placeholder */}
        {post.image && (
          <div
            className="mt-3 h-48 rounded-xl flex items-center justify-center"
            style={{ background: `${AVATAR_BG[profile.profileType]}15` }}
          >
            <span className="font-mono text-[12px] text-[#6B7280]">📷 Photo</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-[#F3F4F6] px-2">
        <button
          type="button"
          onClick={() => setLiked((p) => !p)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-body text-sm transition-colors ${
            liked ? 'text-[#2A2FFF] font-medium' : 'text-[#6B7280] hover:text-[#0D0F2E]'
          }`}
        >
          {liked ? '💙' : '👍'} {reactionCount}
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-body text-sm text-[#6B7280] hover:text-[#0D0F2E] transition-colors"
        >
          💬 {post.comments}
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-body text-sm text-[#6B7280] hover:text-[#0D0F2E] transition-colors"
        >
          ↗ Partager
        </button>
      </div>
    </div>
  );
}
