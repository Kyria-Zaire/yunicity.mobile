'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/config';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/crm/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactEmail: email.trim().toLowerCase(),
          source: 'inscription',
        }),
      });
      if (res.ok || res.status === 409) {
        setStatus('ok');
        return;
      }
      setStatus('err');
    } catch {
      setStatus('err');
    }
  }

  if (status === 'ok') {
    return (
      <p className="mt-8 text-lg text-[#86EFAC] animate-[fadeIn_0.5s_ease-out_forwards]">
        ✅ Tu es sur la liste ! On te contacte très bientôt.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.fr"
          className="w-full h-14 sm:h-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 sm:px-4 text-base sm:text-sm outline-none focus:ring-2 focus:ring-[#2A2FFF]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-12 rounded-xl bg-[#2A2FFF] text-white font-semibold px-6 shrink-0 disabled:opacity-60"
        >
          {status === 'loading' ? '…' : 'Rejoindre la beta'}
        </button>
      </form>
      {status === 'err' && (
        <p className="text-sm text-[#FCA5A5] mt-2">Une erreur est survenue. Réessaie plus tard.</p>
      )}
      <div className="mt-8">
        <div className="flex justify-between font-mono text-[11px] text-[#9395FF] mb-2">
          <span>Places beta</span>
          <span>47 / 100</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2A2FFF] transition-all duration-500"
            style={{ width: '47%' }}
          />
        </div>
      </div>
      <p className="font-mono text-[11px] text-[#6B7280] mt-8">
        Gratuit · RGPD · Données hébergées en France
      </p>
    </div>
  );
}
