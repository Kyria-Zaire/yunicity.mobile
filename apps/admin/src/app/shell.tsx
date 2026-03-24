'use client';

import { Suspense, useState } from 'react';
import { AdminSidebar } from './admin-sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111827]">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Suspense>
          <AdminSidebar />
        </Suspense>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0D0F2E] border-r border-[#1C1F4A]">
            <Suspense>
              <AdminSidebar />
            </Suspense>
          </div>
        </div>
      )}

      <div className="md:ml-[240px] min-h-screen">
        <header className="sticky top-0 z-40 border-b border-[#1C1F4A] bg-[#111827]/95 backdrop-blur-sm px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#1C1F4A] text-[#9395FF] hover:bg-[#1C1F4A] hover:text-white transition-colors"
              aria-label="Ouvrir le menu"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>
            <div className="font-mono text-[11px] text-[#6B7280] uppercase tracking-widest">
              Admin / <span className="text-[#9395FF]">Console</span>
            </div>
            <div className="w-10 h-10 md:hidden" aria-hidden />
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

