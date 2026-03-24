'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

const NAV = [
  { href: '/dashboard', label: 'Accueil' },
  { href: '/map', label: 'Carte' },
  { href: '/tribus', label: 'Tribus' },
  { href: '/passport', label: 'Passeport', badge: '340' },
  { href: '/premium', label: 'Premium', pro: true },
] as const;

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      NAV.map((n) => ({
        ...n,
        active: isActive(pathname, n.href),
        badge: 'badge' in n ? n.badge : undefined,
        pro: 'pro' in n ? n.pro : undefined,
      })),
    [pathname],
  );

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur border-b border-[#F3F4F6] shadow-sm">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display font-black text-xl text-[#2A2FFF] tracking-tight"
        >
          Yunicity
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {items.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-3 py-2 rounded-xl font-body text-[13px] transition-colors inline-flex items-center gap-2 ${
                n.active
                  ? 'text-[#2A2FFF] font-semibold border-b-2 border-[#2A2FFF] pb-0.5'
                  : 'text-[#6B7280] hover:text-[#0D0F2E]'
              }`}
            >
              {n.label}
              {n.badge ? (
                <span className="bg-[#E8E9FF] text-[#2A2FFF] font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                  {n.badge}
                </span>
              ) : null}
              {n.pro ? (
                <span className="bg-[#FEF3C7] text-[#D97706] font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                  PRO
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#F3F4F6] transition-colors"
            aria-label="Notifications"
          >
            <span className="text-xl" aria-hidden>🔔</span>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#DC2626] text-white font-mono text-[10px] font-medium">
              2
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full bg-[#1C1F4A] border border-[#2A2FFF]/15"
              aria-hidden
            />
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0D0F2E"
              strokeWidth="2"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-3 left-3 right-3 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-3">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-display font-black text-[#2A2FFF]">
                Yunicity
              </span>
              <button
                type="button"
                className="w-10 h-10 rounded-xl hover:bg-[#F3F4F6] transition-colors inline-flex items-center justify-center"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0D0F2E"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 grid gap-1">
              {items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-3 rounded-xl font-body text-sm transition-colors inline-flex items-center gap-2 ${
                    n.active
                      ? 'bg-[#E8E9FF] text-[#2A2FFF]'
                      : 'text-[#0D0F2E] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {n.label}
                  {n.badge ? (
                    <span className="bg-[#E8E9FF] text-[#2A2FFF] font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                      {n.badge}
                    </span>
                  ) : null}
                  {n.pro ? (
                    <span className="bg-[#FEF3C7] text-[#D97706] font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
