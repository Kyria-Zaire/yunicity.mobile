'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from '@/lib/auth-client';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, handleClickOutside]);

  async function handleSignOut() {
    setDropdownOpen(false);
    await signOut();
    window.location.href = '/';
  }

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

          {/* Avatar + Dropdown */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-[#2A2FFF] border border-[#2A2FFF]/15 flex items-center justify-center text-white font-display text-[11px] font-bold hover:ring-2 hover:ring-[#2A2FFF]/30 transition-all"
              aria-label="Menu utilisateur"
              aria-expanded={dropdownOpen}
            >
              LM
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#F3F4F6] shadow-lg py-2 z-50 animate-scale-in">
                {/* User info header */}
                <div className="px-4 py-2 border-b border-[#F3F4F6]">
                  <p className="font-display font-semibold text-sm text-[#0D0F2E] truncate">Léa Martin</p>
                  <p className="font-mono text-[10px] text-[#6B7280] truncate">lea.martin@email.com</p>
                </div>

                <div className="py-1">
                  <DropdownLink href="/profil" onClick={() => setDropdownOpen(false)}>
                    <DropdownIcon>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M20 21a8 8 0 1 0-16 0" />
                    </DropdownIcon>
                    Mon profil
                  </DropdownLink>
                  <DropdownLink href="/settings" onClick={() => setDropdownOpen(false)}>
                    <DropdownIcon>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </DropdownIcon>
                    Paramètres
                  </DropdownLink>
                  <DropdownLink href="/settings?tab=subscription" onClick={() => setDropdownOpen(false)}>
                    <DropdownIcon>
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </DropdownIcon>
                    Abonnement
                  </DropdownLink>
                </div>

                <div className="border-t border-[#F3F4F6] pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left"
                  >
                    <DropdownIcon color="#DC2626">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </DropdownIcon>
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
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

      {/* Mobile menu */}
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

              {/* Mobile user links */}
              <div className="border-t border-[#F3F4F6] mt-2 pt-2 grid gap-1">
                <Link
                  href="/profil"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-xl font-body text-sm text-[#0D0F2E] hover:bg-[#F3F4F6] transition-colors"
                >
                  Mon profil
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-xl font-body text-sm text-[#0D0F2E] hover:bg-[#F3F4F6] transition-colors"
                >
                  Paramètres
                </Link>
                <button
                  type="button"
                  onClick={() => { setOpen(false); void signOut().then(() => { window.location.href = '/'; }); }}
                  className="px-3 py-3 rounded-xl font-body text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-[#0D0F2E] hover:bg-[#F3F4F6] transition-colors"
    >
      {children}
    </Link>
  );
}

function DropdownIcon({ children, color = '#6B7280' }: { children: React.ReactNode; color?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}
