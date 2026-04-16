'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfilePageContent } from '@/components/profile/profile-page-content';
import { currentUserToMockProfile } from '@/components/profile/profile-types';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function MonProfilPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;
    router.replace('/login');
  }, [loading, user, router]);

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
        <div className="w-8 h-8 border-2 border-[#2A2FFF] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const profile = currentUserToMockProfile(user);

  return <ProfilePageContent profile={profile} isAccountOwner />;
}
