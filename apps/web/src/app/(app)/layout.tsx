import type { ReactNode } from 'react';
import { AppNavbar } from '@/components/app/app-navbar';
import { OnboardingGate } from '@/components/onboarding-gate';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <AppNavbar />
      <main className="flex-1">
        <OnboardingGate>
          {children}
        </OnboardingGate>
      </main>
    </div>
  );
}
