'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ProfileTab } from '@/components/settings/profile-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import { NotificationsTab } from '@/components/settings/notifications-tab';
import { SubscriptionTab } from '@/components/settings/subscription-tab';
import { PrivacyTab } from '@/components/settings/privacy-tab';

const TABS = [
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'security', label: 'Sécurité', icon: '🛡️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'subscription', label: 'Abonnement', icon: '💳' },
  { id: 'privacy', label: 'Confidentialité', icon: '🔒' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function isValidTab(tab: string | null): tab is TabId {
  return TABS.some((t) => t.id === tab);
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsLoading() {
  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A2FFF] border-t-transparent rounded-full animate-spin" />
    </main>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams?.get('tab') ?? null;
  const activeTab: TabId = isValidTab(rawTab) ? rawTab : 'profile';
  const { user, loading } = useCurrentUser();

  const tabContent = useMemo(() => {
    if (!user) return null;
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab user={user} />;
      case 'subscription':
        return <SubscriptionTab user={user} />;
      case 'privacy':
        return <PrivacyTab />;
    }
  }, [activeTab, user]);

  if (loading) {
    return <SettingsLoading />;
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB] flex items-center justify-center">
        <p className="font-body text-[#6B7280]">Impossible de charger les paramètres.</p>
      </main>
    );
  }

  function setTab(tab: TabId) {
    router.push(`/settings?tab=${tab}`, { scroll: false });
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB]">
      {/* Header */}
      <section className="bg-white border-b border-[#F3F4F6] px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display font-bold text-[28px] text-[#0D0F2E] tracking-tight">
            Paramètres
          </h1>
          <p className="font-mono text-[12px] text-[#9395FF] mt-1">
            Gérez votre profil, sécurité et préférences.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <nav className="lg:w-56 shrink-0">
            {/* Desktop sidebar */}
            <div className="hidden lg:block space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-[#E8E9FF] text-[#2A2FFF] font-semibold'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0D0F2E]'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile horizontal scroll tabs */}
            <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-body text-sm whitespace-nowrap shrink-0 snap-start transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#E8E9FF] text-[#2A2FFF] font-semibold'
                      : 'bg-white border border-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            {tabContent}
          </div>
        </div>
      </div>
    </main>
  );
}
