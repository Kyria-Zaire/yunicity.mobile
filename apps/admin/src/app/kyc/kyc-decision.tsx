'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { rejectUser, verifyUser } from '@/lib/api';

export function KycDecision({
}: {
  verifyProfile: () => Promise<void>;
  rejectProfile: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'verify' | 'reject' | null>(null);

  const userId = useMemo(() => {
    const parts = (pathname ?? '').split('/').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  }, [pathname]);

  return (
    <div className="rounded-2xl border border-[#1C1F4A] bg-[#1C1F4A]/50 p-6">
      <h2 className="font-display text-base font-semibold text-white mb-4">Décision</h2>
      <button
        type="button"
        onClick={async () => {
          setError(null);
          if (!userId) {
            setError('Identifiant utilisateur introuvable');
            return;
          }
          setLoading('verify');
          const success = await verifyUser(userId);
          setLoading(null);
          if (success) router.refresh();
          else setError('Échec de la vérification (403 si clé admin invalide)');
        }}
        className="w-full h-12 rounded-xl bg-[#16A34A] text-white font-semibold text-sm hover:bg-[#15803D] shadow-[0_4px_16px_rgba(22,163,74,0.3)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading !== null}
      >
        {loading === 'verify' ? 'Vérification…' : '✓ Vérifier le profil'}
      </button>
      {!showReject ? (
        <button
          type="button"
          onClick={() => setShowReject(true)}
          className="w-full h-12 mt-3 rounded-xl bg-transparent text-[#DC2626] border border-[#DC2626]/30 font-semibold text-sm hover:bg-[#DC2626]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
        >
          ✕ Rejeter
        </button>
      ) : (
        <form
          className="mt-4 space-y-3 animate-fade-down"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!userId) {
              setError('Identifiant utilisateur introuvable');
              return;
            }
            if (!reason.trim()) {
              setError('Motif obligatoire');
              return;
            }
            setLoading('reject');
            const success = await rejectUser(userId, reason.trim());
            setLoading(null);
            if (success) router.refresh();
            else setError('Échec du rejet (403 si clé admin invalide)');
          }}
        >
          <label htmlFor="reject-reason" className="block font-mono text-[11px] text-[#6B7280] uppercase">
            Motif du rejet (obligatoire)
          </label>
          <textarea
            id="reject-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl bg-[#0D0F2E] border border-[#1C1F4A] text-white text-sm px-4 py-3 placeholder:text-[#6B7280] focus:border-[#DC2626]/50 focus:outline-none resize-none"
            placeholder="Expliquez la raison du rejet…"
          />
          {error ? <p className="text-sm text-[#FCA5A5] font-body">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-[#B91C1C] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading !== null}
            >
              {loading === 'reject' ? 'Rejet…' : 'Confirmer le rejet'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReject(false);
                setReason('');
                setError(null);
              }}
              className="px-4 rounded-xl border border-[#1C1F4A] text-[#9395FF] text-sm hover:bg-[#1C1F4A]"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
