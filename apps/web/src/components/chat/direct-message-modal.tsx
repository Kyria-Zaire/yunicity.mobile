'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/config';
import {
  type MockProfile,
  AVATAR_BG,
  initials,
} from '@/components/profile/profile-types';

type Props = {
  open: boolean;
  onClose: () => void;
  profile: MockProfile;
};

export function DirectMessageModal({ open, onClose, profile }: Props) {
  const [subject, setSubject] = useState('message');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setMessage('');
      setSent(false);
      setSubject('message');
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch(`${API_URL}/crm/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          profileId: profile.id,
          profileName: profile.displayName,
          subject,
          message: message.trim(),
        }),
      }).catch(() => undefined);
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button type="button" className="fixed inset-0 z-[90] bg-black/40" aria-label="Fermer" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-md bg-white shadow-[-8px_0_40px_rgba(13,15,46,0.12)] flex flex-col">
        <header className="flex items-center gap-3 px-4 py-4 border-b border-[#F3F4F6] shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-display text-sm shrink-0"
            style={{ background: AVATAR_BG[profile.profileType] }}
          >
            {initials(profile.displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">Message direct</p>
            <p className="font-display font-semibold text-[#0D0F2E] truncate">{profile.displayName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center">
            <p className="font-body text-sm text-[#6B7280]">Aucun message — commencez la conversation.</p>
          </div>
          <p className="mt-4 font-body text-xs text-[#6B7280] leading-relaxed">
            Les messages directs arrivent prochainement. Pour l&apos;instant, utilisez le formulaire ci-dessous.
          </p>
        </div>

        <div className="border-t border-[#F3F4F6] p-4 bg-[#FAFAFA] shrink-0">
          {sent ? (
            <p className="font-body text-sm text-[#16A34A] text-center py-2">Message envoyé ✓</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">Objet</span>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-[#E5E7EB] px-3 font-body text-sm text-[#0D0F2E] bg-white"
                >
                  <option value="message">Message général</option>
                  <option value="partnership">Partenariat</option>
                  <option value="support">Support</option>
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Votre message…"
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 font-body text-sm text-[#0D0F2E] resize-none bg-white"
                />
              </label>
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full h-11 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm hover:bg-[#1A1ECC] disabled:opacity-50 transition-colors"
              >
                {sending ? 'Envoi…' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
