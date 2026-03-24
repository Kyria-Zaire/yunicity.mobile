'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const ICONS = {
  home: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  kyc: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  clock: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  eye: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  chart: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  handshake: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  shield: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  settings: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

const NAV = [
  { href: '/', label: 'Accueil', icon: 'home' as const },
  { href: '/kyc', label: 'Review KYC', icon: 'kyc' as const, badge: 3 },
  { href: '/kyc?status=pending', label: 'Pending', icon: 'clock' as const },
  { href: '/kyc?status=under_review', label: 'En cours', icon: 'eye' as const },
  { href: '/stats', label: 'Analytics', icon: 'chart' as const },
  { href: '/crm', label: 'Partenaires', icon: 'handshake' as const, badgeMrr: '250€' },
  { href: '/moderation', label: 'Modération', icon: 'shield' as const, badge: 2 },
  { href: '/settings', label: 'Paramètres', icon: 'settings' as const },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const [path, q] = href.split('?');
    if (pathname !== path) return false;
    if (!q) return pathname === '/kyc' && !searchParams?.get('status');
    const sp = new URLSearchParams(q);
    return searchParams?.get('status') === sp.get('status');
  };

  return (
    <aside className="h-screen w-[240px] bg-[#0D0F2E] border-r border-[#1C1F4A] flex flex-col">
      <div className="px-5 py-6 border-b border-[#1C1F4A]">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-display font-bold text-base text-white">Yunicity</span>
          <span className="font-display font-bold text-base text-[#2A2FFF]">Admin</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] px-1.5 py-0.5 rounded border border-[#1C1F4A]">
            ADMIN
          </span>
        </div>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto" aria-label="Navigation admin">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mx-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] ${
                active
                  ? 'bg-[#2A2FFF]/10 text-[#2A2FFF] border-l-2 border-[#2A2FFF] -ml-0.5 pl-[14px]'
                  : 'text-[#9395FF] hover:bg-[#1C1F4A] hover:text-white border-l-2 border-transparent'
              }`}
            >
              {ICONS[item.icon]}
              <span className="flex-1">{item.label}</span>
              {'badgeMrr' in item && item.badgeMrr && (
                <span className="font-mono text-[10px] bg-[#16A34A]/20 text-[#16A34A] px-1.5 py-0.5 rounded-full">
                  {item.badgeMrr}
                </span>
              )}
              {'badge' in item && item.badge != null && (
                <span className="font-mono text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#1C1F4A] space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[#2A2FFF]/30 border border-[#2A2FFF]/40 flex items-center justify-center font-mono text-xs text-[#9395FF]">
            YU
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">Équipe Yunicity</p>
            <p className="font-mono text-[10px] text-[#6B7280]">admin@yunicity.fr</p>
          </div>
        </div>
        <button
          type="button"
          className="w-full py-2 text-sm text-[#9395FF] hover:text-white hover:bg-[#1C1F4A] rounded-lg transition-colors font-body"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
