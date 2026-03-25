'use client';

import { Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/config';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[#6B7280]">Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId') ?? '';
  const profileType = searchParams?.get('profileType') ?? 'yunicitizen';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Entrez les 6 chiffres du code');
      return;
    }

    if (!userId) {
      setError('Utilisateur introuvable. Recommencez l’inscription.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/users/${userId}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = (await res.json()) as {
        verified?: boolean;
        emailVerified?: boolean;
        nextStep?: string;
      };

      if (!res.ok) {
        setError('Code invalide ou expiré. Vérifiez et réessayez.');
        return;
      }

      if (data.verified) {
        router.push('/dashboard');
      } else if (data.nextStep === 'kyc_upload') {
        router.push(`/verification-pending?userId=${userId}&profileType=${profileType}&step=kyc`);
      } else {
        router.push('/verification-pending');
      }
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setResending(false);

    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="text-center max-w-lg w-full">
      <div className="text-5xl mb-4">📧</div>

      <h1 className="font-display text-2xl font-bold text-[#0D0F2E] mb-2">Vérifie ton email</h1>
      <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
        On t&apos;a envoyé un code à 6 chiffres.
        <br />
        <span className="text-[#0D0F2E] font-medium">Expire dans 10 minutes.</span>
      </p>

      <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2
              text-[#0D0F2E] bg-white
              transition-all duration-200
              ${digit ? 'border-[#2A2FFF] bg-[#E8E9FF]' : 'border-[#D1D5DB] focus:border-[#2A2FFF]'}
              focus:outline-none focus:shadow-[0_0_0_4px_rgba(42,47,255,0.08)]`}
          />
        ))}
      </div>

      {error && <p className="text-[#DC2626] text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || code.join('').length < 6}
        className="w-full h-12 bg-[#2A2FFF] text-white font-semibold rounded-xl
                   shadow-[0_8px_32px_rgba(42,47,255,0.35)]
                   hover:bg-[#1A1ECC] disabled:opacity-50
                   transition-all duration-200 mb-4"
      >
        {loading ? 'Vérification...' : 'Confirmer le code'}
      </button>

      <button
        onClick={handleResend}
        disabled={resending || countdown > 0}
        className="text-sm text-[#6B7280] hover:text-[#2A2FFF] transition-colors disabled:opacity-50"
      >
        {countdown > 0
          ? `Renvoyer le code dans ${countdown}s`
          : resending
            ? 'Envoi en cours...'
            : 'Renvoyer le code'}
      </button>
    </div>
  );
}
