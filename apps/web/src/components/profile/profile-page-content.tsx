'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DirectMessageModal } from '@/components/chat/direct-message-modal';
import { AboutTab } from './about-tab';
import { CoverHeader } from './cover-header';
import {
  AssociationMembersTab,
  AssociationProjectsTab,
  EventsTab,
  MediaTab,
  OffersTab,
  PortfolioTab,
  ReviewsTab,
} from './profile-tab-panels';
import type { MockProfile } from './profile-types';
import { ProfileSidebar } from './profile-sidebar';
import { getTabsForType, ProfileTabs, type TabId } from './profile-tabs';
import { TimelineTab } from './timeline-tab';

function ProfilePageContentInner({
  profile,
  isAccountOwner,
}: {
  profile: MockProfile;
  isAccountOwner: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visitorPreview, setVisitorPreview] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followers);
  const [contactOpen, setContactOpen] = useState(false);

  const showOwnerControls = isAccountOwner && !visitorPreview;
  const tabIds = getTabsForType(profile.profileType).map((t) => t.id);
  const rawTab = (searchParams?.get('tab') as TabId) || 'timeline';
  const activeTab: TabId = tabIds.includes(rawTab) ? rawTab : 'timeline';

  const profileView = useMemo(
    () => ({ ...profile, followers: followerCount }),
    [profile, followerCount],
  );

  function setTab(tab: TabId) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB] pb-24">
      {isAccountOwner && visitorPreview && (
        <div className="bg-[#E8E9FF] border-b border-[#2A2FFF]/20 px-4 py-2 text-center font-body text-sm text-[#0D0F2E]">
          Prévisualisation visiteur — ce que les autres voient.
        </div>
      )}

      <CoverHeader
        profile={profileView}
        showOwnerControls={showOwnerControls}
        isAccountOwner={isAccountOwner}
        visitorPreview={visitorPreview}
        onToggleVisitorPreview={() => setVisitorPreview((v) => !v)}
        onContact={() => setContactOpen(true)}
        onFollowCountDelta={(d) => setFollowerCount((c) => Math.max(0, c + d))}
      />

      <ProfileTabs profileType={profile.profileType} activeTab={activeTab} onTabChange={setTab} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex">
        <div className="flex-1 min-w-0 pt-6 pb-12 lg:pr-6">
          {activeTab === 'timeline' && (
            <TimelineTab profile={profile} isOwner={showOwnerControls} />
          )}
          {activeTab === 'about' && <AboutTab profile={profile} />}
          {activeTab === 'media' && <MediaTab profile={profile} />}
          {activeTab === 'events' && <EventsTab profile={profile} />}
          {activeTab === 'reviews' && profile.profileType === 'commercial' && (
            <ReviewsTab profile={profile} />
          )}
          {activeTab === 'offers' && profile.profileType === 'commercial' && <OffersTab />}
          {activeTab === 'portfolio' && profile.profileType === 'freelance' && (
            <PortfolioTab profile={profile} />
          )}
          {activeTab === 'members' && profile.profileType === 'association' && <AssociationMembersTab />}
          {activeTab === 'projects' && profile.profileType === 'association' && <AssociationProjectsTab />}
        </div>
        <ProfileSidebar profile={profileView} showFollowMini={!isAccountOwner} />
      </div>

      <DirectMessageModal open={contactOpen} onClose={() => setContactOpen(false)} profile={profile} />
    </main>
  );
}

export function ProfilePageContent(props: { profile: MockProfile; isAccountOwner: boolean }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center bg-[#F9FAFB]">
          <div className="w-8 h-8 border-2 border-[#2A2FFF] border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ProfilePageContentInner {...props} />
    </Suspense>
  );
}
