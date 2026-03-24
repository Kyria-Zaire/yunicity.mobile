import type { ReactNode } from 'react';
import { AppNavbar } from '@/components/app/app-navbar';
import { OnboardingGate } from '@/components/onboarding-gate';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingGate>
      <div className="min-h-screen bg-white">
        <AppNavbar />
        {children}
      </div>
    </OnboardingGate>
  );
}

