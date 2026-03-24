'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

/**
 * Redirige les utilisateurs connectés vers /onboarding tant que
 * localStorage `onboarding_done` n’est pas défini (S5-04).
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession() as unknown as {
    data: { user?: { id: string } } | null;
    isPending: boolean;
  };

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('onboarding_done') === '1') return;
    if (pathname?.startsWith('/onboarding')) return;
    router.replace('/onboarding');
  }, [session, isPending, pathname, router]);

  return <>{children}</>;
}
