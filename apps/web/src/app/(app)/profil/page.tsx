'use client';

import { ProfilePageContent } from '@/components/profile/profile-page-content';
import { currentUserToMockProfile } from '@/components/profile/profile-types';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function MonProfilPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2A2FFF] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100dvh-64px)] bg-[#F9FAFB] flex items-center justify-center">
        <p className="font-body text-[#6B7280]">Impossible de charger le profil.</p>
      </main>
    );
  }

  const profile = currentUserToMockProfile(user);

  return <ProfilePageContent profile={profile} isAccountOwner />;
}
