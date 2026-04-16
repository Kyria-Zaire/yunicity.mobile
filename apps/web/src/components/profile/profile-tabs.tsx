'use client';

import type { ProfileType } from './profile-types';

export type TabId = 'timeline' | 'about' | 'media' | 'events' | 'reviews' | 'offers' | 'members' | 'projects' | 'portfolio';

type TabDef = { id: TabId; label: string };

const BASE_TABS: TabDef[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'about', label: 'À propos' },
  { id: 'media', label: 'Médias' },
  { id: 'events', label: 'Événements' },
];

const EXTRA_TABS: Partial<Record<ProfileType, TabDef[]>> = {
  commercial: [
    { id: 'reviews', label: 'Avis' },
    { id: 'offers', label: 'Offres du moment' },
  ],
  association: [
    { id: 'members', label: 'Membres' },
    { id: 'projects', label: 'Projets' },
  ],
  freelance: [
    { id: 'portfolio', label: 'Portfolio' },
  ],
};

export function getTabsForType(profileType: ProfileType): TabDef[] {
  return [...BASE_TABS, ...(EXTRA_TABS[profileType] ?? [])];
}

export function ProfileTabs({
  profileType,
  activeTab,
  onTabChange,
}: {
  profileType: ProfileType;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const tabs = getTabsForType(profileType);

  return (
    <div className="sticky top-16 z-10 bg-white border-b border-[#F3F4F6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto pb-px -mb-px scrollbar-hide" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 font-display text-sm whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'text-[#2A2FFF] font-semibold border-b-2 border-[#2A2FFF]'
                  : 'text-[#6B7280] hover:text-[#0D0F2E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
