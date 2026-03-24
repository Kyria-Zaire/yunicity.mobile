'use client';

import { useState } from 'react';
import Link from 'next/link';

type NotifType = 'new_member' | 'new_post' | 'level_up' | 'badge' | 'verification';

type NotifItem = {
  id: string;
  type: NotifType;
  title: string;
  time: string;
  read: boolean;
  url: string;
};

const MOCK_NOTIFS: NotifItem[] = [
  { id: '1', type: 'new_member', title: 'Léa M. a rejoint Cyclistes de Reims', time: 'il y a 5min', read: false, url: '/tribus/1' },
  { id: '2', type: 'new_post', title: 'Nouveau post dans Jazz au Parvis', time: 'il y a 1h', read: false, url: '/tribus/2' },
  { id: '3', type: 'level_up', title: 'Vous avez atteint le niveau 3 !', time: 'il y a 2h', read: true, url: '/passport' },
  { id: '4', type: 'badge', title: 'Badge "Connecteur" débloqué ! 🔗', time: 'hier', read: true, url: '/passport' },
  { id: '5', type: 'verification', title: 'Votre profil a été vérifié ✅', time: 'il y a 2j', read: true, url: '/profil' },
];

const TYPE_STYLES: Record<
  NotifType,
  { icon: string; bg: string }
> = {
  new_member: { icon: '👤', bg: 'bg-[#DCFCE7]' },
  new_post: { icon: '💬', bg: 'bg-[#E8E9FF]' },
  level_up: { icon: '⬆️', bg: 'bg-[#FEF3C7]' },
  badge: { icon: '⭐', bg: 'bg-[#F5F3FF]' },
  verification: { icon: '✅', bg: 'bg-[#DCFCE7]' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<NotifItem[]>(MOCK_NOTIFS);

  const unreadCount = notifs.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleActivatePush() {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // TODO S4: enregistrer SW + POST /push/subscribe
      }
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-[#F3F4F6] px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-[28px] text-[#0D0F2E] tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center font-mono text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#2A2FFF] text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="font-body text-[13px] text-[#6B7280] hover:text-[#2A2FFF] transition-colors"
          >
            Tout marquer comme lu
          </button>
        </header>

        <ul className="divide-y divide-[#F3F4F6]">
          {notifs.map((n) => {
            const style = TYPE_STYLES[n.type];
            return (
              <li key={n.id}>
                <Link
                  href={n.url}
                  className={`flex items-start gap-3 px-4 py-4 border-l-2 transition-colors ${
                    n.read
                      ? 'bg-white border-transparent'
                      : 'bg-[#E8E9FF]/30 border-[#2A2FFF]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center text-lg shrink-0`}
                    aria-hidden
                  >
                    {style.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[14px] font-medium text-[#0D0F2E] leading-snug">
                      {n.title}
                    </p>
                    <p className="font-mono text-[11px] text-[#9CA3AF] mt-1">
                      {n.time}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-4 mt-6 mb-10 rounded-2xl bg-[#F9FAFB] p-5">
          <h2 className="font-display font-semibold text-[16px] text-[#0D0F2E]">
            Activer les notifications push
          </h2>
          <p className="font-body text-[13px] text-[#6B7280] mt-1">
            Soyez le premier informé des activités de votre ville
          </p>
          <button
            type="button"
            onClick={handleActivatePush}
            className="mt-4 h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm shadow-primary hover:bg-[#1A1ECC] transition-colors"
          >
            Activer
          </button>
        </div>
      </div>
    </main>
  );
}
