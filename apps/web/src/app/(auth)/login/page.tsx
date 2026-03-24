'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useId } from 'react';
import { signIn } from '@/lib/auth-client';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type LoginForm = z.infer<typeof loginSchema>;

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [shake, setShake] = useState(false);
  const emailId = useId();
  const pwdId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    try {
      await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      });
      router.push('/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  });

  const inputClass =
    'w-full h-12 rounded-xl border border-[#D1D5DB] pl-10 pr-4 text-sm text-[#0D0F2E] placeholder:text-[#9CA3AF] focus:border-[#2A2FFF] focus:outline-none focus:shadow-[0_0_0_4px_rgba(42,47,255,0.08)] transition-all duration-200';

  return (
    <div>
      <p className="font-mono text-[11px] text-[#9395FF] tracking-[0.2em] uppercase">CONNEXION</p>
      <h1 className="font-display text-[32px] font-bold text-[#0D0F2E] mt-2 tracking-tight">Bon retour</h1>
      <p className="font-body text-base text-[#6B7280] mt-2">Content de te revoir sur Yunicity.</p>

      <form
        onSubmit={onSubmit}
        className={`mt-10 space-y-6 ${shake ? 'animate-shake' : ''}`}
        noValidate
      >
        <div>
          <label htmlFor={emailId} className="block font-body text-sm font-medium text-[#0D0F2E] mb-1.5">
            Adresse email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
              <EmailIcon />
            </span>
            <input
              id={emailId}
              {...register('email')}
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="toi@exemple.fr"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-err` : undefined}
            />
          </div>
          {errors.email && (
            <p id={`${emailId}-err`} className="text-[#DC2626] text-sm mt-1.5" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={pwdId} className="block font-body text-sm font-medium text-[#0D0F2E]">
              Mot de passe
            </label>
            <a
              href="mailto:support@yunicity.fr?subject=Yunicity%20%E2%80%94%20Mot%20de%20passe"
              className="text-[13px] text-[#2A2FFF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id={pwdId}
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${inputClass} pr-12`}
              placeholder="••••••••••••"
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0D0F2E] p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF]"
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              <EyeIcon open={showPwd} />
            </button>
          </div>
          {errors.password && (
            <p className="text-[#DC2626] text-sm mt-1.5" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-[#FEE2E2]/80 border border-[#DC2626]/25 px-4 py-3" role="alert">
            <p className="text-[#DC2626] text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative w-full h-12 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-[15px] tracking-wide shadow-primary hover:bg-[#1A1ECC] hover:shadow-[0_12px_40px_rgba(42,47,255,0.45)] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-[#E5E7EB]" aria-hidden />
        <span className="font-mono text-[11px] text-[#9CA3AF] uppercase tracking-wider">ou</span>
        <div className="flex-1 h-px bg-[#E5E7EB]" aria-hidden />
      </div>

      <p className="text-center font-body text-sm text-[#6B7280]">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-[#2A2FFF] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded">
          Créer un compte →
        </Link>
      </p>

      <p className="text-center font-mono text-[11px] text-[#D1D5DB] mt-10">🔒 Connexion sécurisée</p>
    </div>
  );
}
