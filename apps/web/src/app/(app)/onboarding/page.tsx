'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { API_URL } from '@/lib/config';

const QUARTIERS = [
  'Croix-Rouge',
  'Centre-ville',
  'Clairmarais',
  'Maison-Blanche',
  'Orgeval',
  'Europe',
  'Wilson',
  'Châtillons',
] as const;

const INTERESTS = [
  { id: 'culture', label: '🎭 Culture' },
  { id: 'sport', label: '🚴 Sport' },
  { id: 'ecologie', label: '🌱 Écologie' },
  { id: 'business', label: '💼 Business' },
  { id: 'food', label: '🍕 Food' },
  { id: 'musique', label: '🎵 Musique' },
  { id: 'patrimoine', label: '🏛️ Patrimoine' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'social', label: '🤝 Social' },
] as const;

const MOCK_TRIBES = [
  { id: '1', name: 'Reims Culture', desc: 'Sorties et événements culturels.', members: 128 },
  { id: '2', name: 'Vélo & quartiers', desc: 'Balades et mobilité douce.', members: 64 },
  { id: '3', name: 'Foodies Reims', desc: 'Bonnes adresses et convivialité.', members: 201 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession() as unknown as {
    data: { user?: { id: string; name?: string | null } } | null;
    isPending: boolean;
  };
  const [step, setStep] = useState(0);
  const [quartier, setQuartier] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedTribes, setSelectedTribes] = useState<string[]>(['1', '2', '3']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) router.replace('/login');
  }, [isPending, session, router]);

  const firstName = useMemo(() => {
    const n = session?.user?.name?.split(/\s+/)[0];
    return n || 'toi';
  }, [session?.user?.name]);

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const finish = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      router.replace('/login');
      return;
    }
    setSaving(true);
    try {
      await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartier: quartier || QUARTIERS[0],
          interests: interests.length ? interests : ['social'],
        }),
      });
    } catch {
      /* ignore — on marque quand même l’onboarding fait côté client */
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_done', '1');
      }
      setSaving(false);
      router.replace('/dashboard');
    }
  }, [session?.user?.id, quartier, interests, router]);

  const handleSkipToDashboard = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_done', '1');
    }
    router.replace('/dashboard');
  };

  const dots = [
    { label: 'Bienvenue', done: step > 0, active: step === 0 },
    { label: 'Préférences', done: step > 1, active: step === 1 },
    { label: 'Tribus', done: false, active: step === 2 },
  ];

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#0D0F2E] text-white flex flex-col items-center px-4 py-8">
      <div className="flex items-center gap-3 mb-10 w-full max-w-lg justify-center">
        {dots.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                d.done ? 'bg-[#16A34A]' : d.active ? 'bg-[#2A2FFF] animate-pulse' : 'bg-[#D1D5DB]'
              }`}
            />
            <span className="font-mono text-[9px] text-[#6B7280] uppercase tracking-wider">
              {d.label}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg flex-1 flex flex-col">
        {step === 0 && (
          <div className="text-center flex flex-col items-center flex-1">
            <div
              className="font-display text-5xl font-black text-[#2A2FFF] mb-4 animate-scale-in opacity-0"
              style={{ animationFillMode: 'forwards' }}
            >
              Y
            </div>
            <h1 className="font-display text-[40px] font-black text-white leading-tight animate-fade-up opacity-0 [animation-delay:120ms] [animation-fill-mode:forwards]">
              Bienvenue, {firstName} ! 🏙️
            </h1>
            <p className="font-body text-lg text-[#9395FF] mt-4 max-w-md animate-fade-up opacity-0 [animation-delay:220ms] [animation-fill-mode:forwards]">
              Tu rejoins la première ville connectée de France.
            </p>
            <div className="flex gap-6 mt-10 text-4xl">
              {['🗺️', '🤝', '⭐'].map((e, i) => (
                <span
                  key={e}
                  className="animate-fade-up opacity-0 inline-block"
                  style={{
                    animationDelay: `${360 + i * 140}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-14 h-14 px-10 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-base shadow-primary hover:bg-[#1A1ECC] transition-colors"
            >
              Commencer la visite →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col flex-1">
            <h2 className="font-display text-[28px] font-bold text-white">
              Personnalise ton expérience
            </h2>
            <label className="mt-8 font-mono text-[11px] uppercase tracking-widest text-[#9395FF]">
              Ton quartier à Reims
            </label>
            <select
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              className="mt-2 h-12 rounded-xl bg-white/10 border border-white/20 px-4 text-white"
            >
              <option value="">Choisir…</option>
              {QUARTIERS.map((q) => (
                <option key={q} value={q} className="text-[#0D0F2E]">
                  {q}
                </option>
              ))}
            </select>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-[#9395FF]">
              Intérêts (max 5)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((it) => {
                const on = interests.includes(it.id);
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => toggleInterest(it.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      on ? 'bg-[#2A2FFF] text-white' : 'bg-[#F3F4F6] text-[#374151]'
                    }`}
                  >
                    {it.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleSkipToDashboard}
              className="mt-8 text-sm text-[#9395FF] underline-offset-4 hover:underline self-start"
            >
              Je complèterai plus tard
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-auto mb-4 h-12 rounded-xl bg-[#2A2FFF] text-white font-semibold"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col flex-1">
            <h2 className="font-display text-[28px] font-bold text-white">
              3 tribus qui pourraient t&apos;intéresser
            </h2>
            <ul className="mt-8 space-y-4">
              {MOCK_TRIBES.map((t) => (
                <li
                  key={t.id}
                  className="rounded-2xl border border-white/15 bg-white/5 p-4 flex gap-3 items-start"
                >
                  <input
                    type="checkbox"
                    checked={selectedTribes.includes(t.id)}
                    onChange={() =>
                      setSelectedTribes((p) =>
                        p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id],
                      )
                    }
                    className="mt-1 h-4 w-4 accent-[#2A2FFF]"
                  />
                  <div>
                    <div className="font-display font-bold text-white">{t.name}</div>
                    <p className="text-sm text-[#9395FF] mt-1">{t.desc}</p>
                    <span className="inline-block mt-2 font-mono text-[10px] bg-[#2A2FFF]/30 text-[#E8E9FF] px-2 py-0.5 rounded-full">
                      {t.members} membres
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="mt-8 h-12 rounded-xl bg-[#2A2FFF] text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Rejoindre les tribus sélectionnées'}
            </button>
            <button
              type="button"
              onClick={handleSkipToDashboard}
              className="mt-3 text-sm text-[#9395FF]"
            >
              Passer pour l&apos;instant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
