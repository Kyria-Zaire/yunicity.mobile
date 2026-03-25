'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';

const PROFILES = [
  {
    id: 'yunicitizen' as const,
    label: 'Yunicitizen',
    desc: 'Habitant, curieux du quartier et de la ville.',
    emoji: '🏙️',
    ring: 'ring-[#2A2FFF]',
    circle: 'bg-[#2A2FFF]/15',
    badge: 'bg-[#E8E9FF] text-[#2A2FFF]',
  },
  {
    id: 'commercial' as const,
    label: 'Commerce',
    desc: 'Commerce, restauration, services locaux.',
    emoji: '🏪',
    ring: 'ring-[#16A34A]',
    circle: 'bg-[#16A34A]/15',
    badge: 'bg-[#DCFCE7] text-[#16A34A]',
  },
  {
    id: 'association' as const,
    label: 'Association',
    desc: 'Association loi 1901, culture, sport.',
    emoji: '🤝',
    ring: 'ring-[#D97706]',
    circle: 'bg-[#D97706]/15',
    badge: 'bg-[#FEF3C7] text-[#D97706]',
  },
  {
    id: 'freelance' as const,
    label: 'Freelance',
    desc: 'Indépendant, auto-entrepreneur, consultant.',
    emoji: '💼',
    ring: 'ring-[#7C3AED]',
    circle: 'bg-[#7C3AED]/15',
    badge: 'bg-[#F5F3FF] text-[#7C3AED]',
  },
  {
    id: 'ecole' as const,
    label: 'École / Entité',
    desc: 'Établissement scolaire ou structure éducative.',
    emoji: '🎓',
    ring: 'ring-[#059669]',
    circle: 'bg-[#059669]/15',
    badge: 'bg-[#ECFDF5] text-[#059669]',
  },
];

type ProfileId = (typeof PROFILES)[number]['id'];

const step2Schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(12, 'Minimum 12 caractères').max(128),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || v === '' || /^\+[1-9]\d{7,14}$/.test(v), {
      message: 'Format international : +33612345678',
    }),
  siret: z.string().optional(),
  rna: z.string().optional(),
  uai: z.string().optional(),
});
type Step2Form = z.infer<typeof step2Schema>;

const step3Schema = z.object({
  rgpd: z.boolean().refine((v) => v === true, {
    message: 'Consentement RGPD obligatoire',
  }),
  marketing: z.boolean(),
});
type Step3Form = z.infer<typeof step3Schema>;

function passwordStrength(pw: string): { n: number; label: string } {
  const len = pw.length;
  if (len === 0) return { n: 0, label: '' };
  if (len < 8) return { n: 1, label: 'Faible' };
  if (len < 12) return { n: 2, label: 'Moyen' };
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSpec = /[^a-zA-Z0-9]/.test(pw);
  const score = [hasLower, hasUpper, hasNum, hasSpec].filter(Boolean).length;
  if (score >= 3) return { n: 4, label: 'Excellent' };
  return { n: 3, label: 'Fort' };
}

const segColors = ['bg-[#DC2626]', 'bg-[#EA580C]', 'bg-[#CA8A04]', 'bg-[#16A34A]'];

function stepBarColor(i: number) {
  if (i <= 1) return 'bg-[#2A2FFF]';
  if (i === 2) return 'bg-[#2A2FFF]/40';
  return 'bg-[#F3F4F6]';
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Form | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwdWatch, setPwdWatch] = useState('');
  const strength = useMemo(() => passwordStrength(pwdWatch), [pwdWatch]);

  const step2 = useForm<Step2Form>({ resolver: zodResolver(step2Schema), mode: 'onChange' });
  const step3 = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: { rgpd: false, marketing: false },
  });

  const labels = ['Mon profil', 'Mes infos', 'Finaliser'];

  const inputWrap = 'relative';
  const inputClass =
    'w-full h-12 rounded-xl border border-[#D1D5DB] pl-10 pr-4 text-sm text-[#0D0F2E] focus:border-[#2A2FFF] focus:outline-none focus:shadow-[0_0_0_4px_rgba(42,47,255,0.08)] transition-all duration-200';

  if (step === 1) {
    return (
      <div>
        <StepIndicator currentStep={1} labels={labels} />
        <h1 className="font-display text-[28px] font-bold text-[#0D0F2E] mt-6">
          Qui es-tu sur Yunicity ?
        </h1>
        <p className="font-body text-base text-[#6B7280] mt-2">
          Choisis le profil qui te correspond — tu pourras le faire vérifier ensuite.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {PROFILES.map((p) => {
            const sel = profile === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfile(p.id)}
                className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200
                  ${sel ? `border-[#2A2FFF] bg-[#E8E9FF]/50 shadow-primary scale-[1.02] ring-2 ${p.ring}` : 'border-[#E5E7EB] bg-white hover:border-[#2A2FFF]/30 hover:bg-[#2A2FFF]/[0.03] hover:-translate-y-0.5 shadow-card hover:shadow-hover'}`}
              >
                {sel && (
                  <span
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#2A2FFF] text-white flex items-center justify-center text-sm font-bold animate-scale-in"
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
                <div
                  className={`w-12 h-12 rounded-full ${p.circle} flex items-center justify-center text-2xl mb-3`}
                >
                  {p.emoji}
                </div>
                <div className="font-display font-semibold text-base text-[#0D0F2E]">{p.label}</div>
                <p className="font-body text-sm text-[#6B7280] mt-1 line-clamp-2">{p.desc}</p>
                <span
                  className={`inline-block mt-3 font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${p.badge}`}
                >
                  Profil
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={!profile}
          onClick={() => setStep(2)}
          className="w-full h-12 mt-10 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold shadow-primary hover:bg-[#1A1ECC] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Continuer →
        </button>
        <p className="text-center text-sm text-[#6B7280] mt-8">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#2A2FFF] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  if (step === 2) {
    const selected = PROFILES.find((x) => x.id === profile);
    const emailError = step2.formState.errors.email;
    const passwordError = step2.formState.errors.password;
    const phoneError = step2.formState.errors.phone;
    return (
      <div>
        <StepIndicator currentStep={2} labels={labels} />
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm text-[#6B7280] hover:text-[#2A2FFF] mb-4"
        >
          ← Changer de profil
        </button>
        <h1 className="font-display text-[28px] font-bold text-[#0D0F2E]">
          {selected?.emoji} {selected?.label}
        </h1>
        <form
          className="mt-8 space-y-5"
          onSubmit={step2.handleSubmit((data) => {
            setStep2Data(data);
            setStep(3);
          })}
        >
          <div>
            <label className="font-body text-[13px] font-medium text-[#374151]">Email</label>
            <div className={`${inputWrap} mt-1.5`}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16v16H4z M22 6l-10 7L2 6" />
                </svg>
              </span>
              <input
                {...step2.register('email')}
                type="email"
                className={`${inputClass} ${emailError ? 'border-[#DC2626]' : ''}`}
                placeholder="toi@exemple.fr"
              />
            </div>
            {emailError && <p className="text-[#DC2626] text-sm mt-1">{emailError.message}</p>}
          </div>
          <div>
            <label className="font-body text-[13px] font-medium text-[#374151]">Mot de passe</label>
            <div className={`${inputWrap} mt-1.5`}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <input
                {...step2.register('password', { onChange: (e) => setPwdWatch(e.target.value) })}
                type="password"
                className={`${inputClass} ${strength.n === 4 ? 'border-[#16A34A]/60' : ''}`}
                placeholder="12 caractères minimum"
              />
              {strength.n === 4 && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16A34A]"
                  aria-hidden
                >
                  ✓
                </span>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i < strength.n ? segColors[Math.min(strength.n, 4) - 1] : 'bg-[#E5E7EB]'}`}
                />
              ))}
            </div>
            {strength.label && (
              <p className="text-xs text-[#6B7280] mt-1">Robustesse : {strength.label}</p>
            )}
            {passwordError && (
              <p className="text-[#DC2626] text-sm mt-1">{passwordError.message}</p>
            )}
          </div>
          <div>
            <label className="font-body text-[13px] font-medium text-[#374151]">
              Téléphone <span className="text-[#9CA3AF] font-normal">(optionnel)</span>
            </label>
            <div className={`${inputWrap} mt-1.5`}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </span>
              <input
                {...step2.register('phone')}
                type="tel"
                className={inputClass}
                placeholder="+33612345678"
              />
            </div>
            {phoneError && <p className="text-[#DC2626] text-sm mt-1">{phoneError.message}</p>}
          </div>
          {(profile === 'commercial' || profile === 'freelance') && (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs italic text-[#9CA3AF] mb-2">
                Requis pour la vérification de votre profil
              </p>
              <label className="font-body text-[13px] font-medium text-[#374151]">SIRET</label>
              <input
                {...step2.register('siret')}
                className="w-full h-11 mt-1 rounded-lg border border-[#D1D5DB] px-3 text-sm"
                placeholder="14 chiffres"
              />
              <p className="text-xs text-[#6B7280] mt-2">
                Votre SIRET sera vérifié automatiquement via l&apos;INSEE.
              </p>
            </div>
          )}
          {profile === 'association' && (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs italic text-[#9CA3AF] mb-2">Requis pour la vérification</p>
              <label className="font-body text-[13px] font-medium text-[#374151]">Numéro RNA</label>
              <input
                {...step2.register('rna')}
                className="w-full h-11 mt-1 rounded-lg border border-[#D1D5DB] px-3 text-sm"
                placeholder="W123456789"
              />
            </div>
          )}
          {profile === 'ecole' && (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs italic text-[#9CA3AF] mb-2">Requis pour la vérification</p>
              <label className="font-body text-[13px] font-medium text-[#374151]">Code UAI</label>
              <input
                {...step2.register('uai')}
                className="w-full h-11 mt-1 rounded-lg border border-[#D1D5DB] px-3 text-sm"
                placeholder="0123456A"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#2A2FFF] text-white font-semibold shadow-primary hover:bg-[#1A1ECC] transition-all"
          >
            Continuer →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={3} labels={labels} />
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E8E9FF] flex items-center justify-center text-3xl border border-[#2A2FFF]/20">
          🛡️
        </div>
      </div>
      <h1 className="font-display text-2xl font-bold text-[#0D0F2E] text-center">
        Vos données, vos droits.
      </h1>
      <p className="font-body text-sm text-[#6B7280] text-center mt-3 leading-relaxed">
        Yunicity traite vos données pour créer et sécuriser votre compte, conformément au RGPD. Vous
        disposez d&apos;un droit d&apos;accès, de rectification et d&apos;effacement. Données
        hébergées en France.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={step3.handleSubmit(async () => {
          if (!step2Data || !profile) return;
          setLoading(true);
          setError(null);
          try {
            const result = (await signUp.email({
              email: step2Data.email,
              password: step2Data.password,
              name: step2Data.email.split('@')[0] ?? 'Yunicitizen',
              callbackURL: '/verify-email',
            })) as { data?: { user?: { id?: string } } };
            const userId = result.data?.user?.id ?? '';
            router.push(`/verify-email?userId=${userId}&profileType=${profile}`);
          } catch {
            setError('Erreur lors de la création du compte. Cet email est peut-être déjà utilisé.');
          } finally {
            setLoading(false);
          }
        })}
      >
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="peer sr-only" {...step3.register('rgpd')} />
            <span className="mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 border-[#D1D5DB] flex items-center justify-center peer-checked:bg-[#2A2FFF] peer-checked:border-[#2A2FFF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2A2FFF] peer-checked:[&_svg]:opacity-100 transition-colors">
              <svg
                className="w-3 h-3 text-white opacity-0 transition-opacity"
                viewBox="0 0 12 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 5l3 3 7-7" />
              </svg>
            </span>
            <span className="font-body text-sm text-[#374151] leading-relaxed">
              J&apos;accepte le traitement de mes données personnelles selon la{' '}
              <a href="/privacy" className="text-[#2A2FFF] underline">
                politique de confidentialité
              </a>
              . <span className="text-[#DC2626]">*</span>
            </span>
          </label>
          {step3.formState.errors.rgpd && (
            <p className="text-[#DC2626] text-sm">{step3.formState.errors.rgpd.message}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="peer sr-only" {...step3.register('marketing')} />
            <span className="mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 border-[#D1D5DB] flex items-center justify-center peer-checked:bg-[#2A2FFF] peer-checked:border-[#2A2FFF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2A2FFF] peer-checked:[&_svg]:opacity-100">
              <svg
                className="w-3 h-3 text-white opacity-0 transition-opacity"
                viewBox="0 0 12 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 5l3 3 7-7" />
              </svg>
            </span>
            <span className="font-body text-sm text-[#6B7280]">
              J&apos;accepte de recevoir des actualités Yunicity (optionnel).
            </span>
          </label>
        </div>

        {error && (
          <div className="rounded-xl bg-[#FEE2E2] border border-[#DC2626]/30 px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-[#2A2FFF] text-white font-display font-bold text-base shadow-[0_8px_32px_rgba(42,47,255,0.35)] hover:bg-[#1A1ECC] disabled:opacity-50 transition-all"
        >
          {loading ? 'Création...' : 'Rejoindre Yunicity 🏙️'}
        </button>
      </form>
    </div>
  );
}

function StepIndicator({ currentStep, labels }: { currentStep: 1 | 2 | 3; labels: string[] }) {
  return (
    <div
      className={`flex gap-1 ${currentStep === 1 ? 'mb-2' : currentStep === 2 ? 'mb-4' : 'mb-6'}`}
    >
      {[0, 1, 2].map((i) => {
        let barColor: string;
        if (currentStep === 1) barColor = i === 0 ? 'bg-[#2A2FFF]' : 'bg-[#F3F4F6]';
        else if (currentStep === 2) barColor = stepBarColor(i);
        else barColor = 'bg-[#2A2FFF]/60';

        return (
          <div key={i} className={`flex-1 ${currentStep === 1 ? 'flex flex-col gap-2' : ''}`}>
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === 1 ? 'ease-out' : ''} ${barColor}`}
            />
            {currentStep === 1 && (
              <span className="font-mono text-[9px] sm:text-[10px] text-[#6B7280] uppercase tracking-wider text-center hidden sm:block">
                {labels[i]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
