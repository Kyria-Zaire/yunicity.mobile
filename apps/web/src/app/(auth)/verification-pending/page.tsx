'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[#6B7280]">Chargement...</div>}>
      <VerificationPendingContent />
    </Suspense>
  );
}

function VerificationPendingContent() {
  const searchParams = useSearchParams();
  const step = searchParams?.get('step') ?? 'email';
  const profileType = searchParams?.get('profileType') ?? 'yunicitizen';
  const userId = searchParams?.get('userId') ?? '';

  if (step === 'email') {
    return (
      <div className="max-w-lg w-full text-center">
        <div className="text-5xl mb-4">📨</div>
        <span className="inline-block font-mono text-[11px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full bg-[#E8E9FF] text-[#2A2FFF] border border-[#2A2FFF]/20">
          VÉRIFICATION EMAIL
        </span>
        <h1 className="font-display text-[32px] font-bold text-[#0D0F2E] mt-6 tracking-tight">
          Presque terminé
        </h1>
        <p className="font-body text-base text-[#6B7280] mt-4 leading-relaxed">
          On t&apos;a envoyé un code OTP à 6 chiffres par email.
          <br />
          Vérifie ton email pour activer ton compte.
        </p>

        <Link
          href={`/verify-email?userId=${userId}&profileType=${profileType}`}
          className="inline-flex items-center justify-center mt-8 w-full h-12 rounded-xl bg-[#2A2FFF] text-white font-semibold shadow-[0_8px_32px_rgba(42,47,255,0.35)] hover:bg-[#1A1ECC] transition-all"
        >
          Entrer le code OTP
        </Link>

        <p className="mt-5 text-[13px] text-[#6B7280]">
          Tu n&apos;as rien reçu ? Vérifie tes spams ou demande un nouveau code.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full text-center">
      <div className="mx-auto w-48 h-36 mb-8" aria-hidden>
        <svg
          viewBox="0 0 200 140"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="20" y="60" width="36" height="70" rx="2" fill="#0D0F2E" />
          <rect x="62" y="40" width="42" height="90" rx="2" fill="#1C1F4A" />
          <rect x="112" y="55" width="38" height="75" rx="2" fill="#0D0F2E" />
          <rect x="158" y="30" width="32" height="100" rx="2" fill="#1C1F4A" />
          <rect
            x="28"
            y="72"
            width="6"
            height="6"
            fill="#2A2FFF"
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '2.5s' }}
          />
          <rect
            x="38"
            y="88"
            width="6"
            height="6"
            fill="#2A2FFF"
            className="animate-pulse opacity-70"
            style={{ animationDelay: '0.8s', animationDuration: '3s' }}
          />
          <rect
            x="72"
            y="52"
            width="6"
            height="6"
            fill="#2A2FFF"
            className="animate-pulse"
            style={{ animationDelay: '0.3s', animationDuration: '2.2s' }}
          />
          <rect
            x="88"
            y="70"
            width="6"
            height="6"
            fill="#2A2FFF"
            className="animate-pulse opacity-80"
            style={{ animationDuration: '3.5s' }}
          />
          <rect
            x="122"
            y="68"
            width="6"
            height="6"
            fill="#2A2FFF"
            className="animate-pulse"
            style={{ animationDelay: '1.2s', animationDuration: '2.8s' }}
          />
          <rect
            x="168"
            y="48"
            width="6"
            height="6"
            fill="#2A2FFF"
            className="animate-pulse opacity-60"
            style={{ animationDuration: '4s' }}
          />
        </svg>
      </div>

      <span className="inline-block font-mono text-[11px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full bg-[#E8E9FF] text-[#2A2FFF] border border-[#2A2FFF]/20">
        PROFIL EN VÉRIFICATION
      </span>
      <h1 className="font-display text-[32px] font-bold text-[#0D0F2E] mt-6 tracking-tight">
        Bienvenue dans Yunicity !
      </h1>
      <p className="font-body text-base text-[#6B7280] mt-4 leading-relaxed">
        Notre équipe vérifie votre profil. Vous serez opérationnel sous{' '}
        <strong className="text-[#0D0F2E] font-semibold">24 h</strong>.
      </p>

      <div className="mt-10 text-left pl-2">
        <div className="relative">
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-[#E5E7EB]" aria-hidden />
          <ul className="space-y-8 relative">
            <li className="flex gap-4">
              <span
                className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs shrink-0 z-10 ring-4 ring-white"
                aria-hidden
              >
                ✓
              </span>
              <div>
                <p className="font-body text-sm font-medium text-[#0D0F2E]">Compte créé</p>
                <p className="text-[13px] text-[#6B7280]">Tout est bon de notre côté.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span
                className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs shrink-0 z-10 ring-4 ring-white"
                aria-hidden
              >
                ✓
              </span>
              <div>
                <p className="font-body text-sm font-medium text-[#0D0F2E]">Email vérifié</p>
                <p className="text-[13px] text-[#6B7280]">
                  Votre adresse email est bien confirmée.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span
                className="w-6 h-6 rounded-full border-[3px] border-[#2A2FFF] border-t-transparent animate-spin shrink-0 z-10 ring-4 ring-white bg-white"
                style={{ animationDuration: '2.5s' }}
                aria-hidden
              />
              <div>
                <p className="font-body text-sm font-medium text-[#0D0F2E]">
                  Documents KYC en cours de vérification
                </p>
                <p className="text-[13px] text-[#6B7280]">Validation sous 24 h maximum.</p>
              </div>
            </li>
            <li className="flex gap-4 opacity-50">
              <span
                className="w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xs shrink-0 z-10 ring-4 ring-white"
                aria-hidden
              >
                🔒
              </span>
              <div>
                <p className="font-body text-sm font-medium text-[#374151]">
                  Accès à la plateforme
                </p>
                <p className="text-[13px] text-[#9CA3AF]">Bientôt : carte, tribus, événements…</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-xl bg-[#E8E9FF]/80 border-l-4 border-[#2A2FFF] px-5 py-4 text-left">
        <p className="font-body text-sm text-[#1C1F4A]">
          💡 En attendant, vous pouvez préparer vos infos KYC ou explorer la carte de Reims.
        </p>
        <Link
          href="/map"
          className="inline-block mt-3 text-sm font-semibold text-[#2A2FFF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
        >
          Explorer la carte →
        </Link>
      </div>

      <p className="mt-10 text-[13px] text-[#6B7280]">
        Des questions ?{' '}
        <a href="mailto:support@yunicity.fr" className="text-[#2A2FFF] hover:underline">
          support@yunicity.fr
        </a>
      </p>
    </div>
  );
}
