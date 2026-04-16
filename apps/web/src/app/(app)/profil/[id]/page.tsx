'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ProfilePageContent } from '@/components/profile/profile-page-content';
import { MOCK_PROFILES } from '@/components/profile/profile-types';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function ProfilPublicPage() {
  const params = useParams<{ id: string }>();
  const profileId = params?.id ?? '1';
  const profile = useMemo(() => MOCK_PROFILES[profileId] ?? MOCK_PROFILES['1']!, [profileId]);
  const { userId } = useCurrentUser();

  const isAccountOwner = userId != null && userId === profile.id;

  return <ProfilePageContent profile={profile} isAccountOwner={isAccountOwner} />;
}
