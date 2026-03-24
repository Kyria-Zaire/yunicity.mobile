'use client';

import Link from 'next/link';

const STATS = [
  { label: 'Vue profil ce mois', value: 247, icon: '👁' },
  { label: 'Clics vers votre site', value: 34, icon: '🔗' },
  { label: 'Membres vous suivant', value: 18, icon: '👥' },
  { label: 'Événements créés', value: 2, icon: '📅' },
];

const MISSING_ITEMS = [
  { label: 'photo de couverture', action: 'Compléter →' },
  { label: 'horaires', action: 'Compléter →' },
  { label: 'description complète', action: 'Compléter →' },
];

const RECENT_POSTS = [
  { id: '1', excerpt: 'Happy hour ce vendredi 18h — venez nombreux !', time: 'il y a 2h' },
  { id: '2', excerpt: 'Nouvelle carte des vins disponible', time: 'hier' },
];

export default function PartenairePage() {
  const isSubscribed = false;

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-[#0D0F2E] px-4 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <span className="inline-flex font-mono text-[11px] tracking-[0.2em] uppercase px-4 py-1.5 rounded-full bg-[#2A2FFF] text-white">
            PARTENAIRE YUNICITY
          </span>
          <h1 className="font-display font-black text-[36px] text-white mt-4 tracking-tight">
            Votre espace partenaire
          </h1>
          <p className="font-body text-[#9395FF] mt-2">
            Gérez votre visibilité et suivez vos performances
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 -mt-4">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
                    {s.label}
                  </p>
                  <p className="font-display font-black text-[32px] text-[#0D0F2E] mt-1">
                    {s.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-2xl">
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="font-display font-bold text-[20px] text-[#0D0F2E]">
            Votre visibilité
          </h2>
          <div className="mt-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-body text-[14px] text-[#0D0F2E]">
                Profil complété à 65%
              </p>
              <div className="flex-1 max-w-[200px]">
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2A2FFF] rounded-full"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {MISSING_ITEMS.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F3F4F6]"
                >
                  <span className="font-body text-[13px] text-[#6B7280]">
                    {m.label}
                  </span>
                  <button
                    type="button"
                    className="font-mono text-[11px] text-[#2A2FFF] font-semibold hover:underline"
                  >
                    {m.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display font-bold text-[20px] text-[#0D0F2E]">
              Vos publications
            </h2>
            <button
              type="button"
              className="h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm shadow-primary hover:bg-[#1A1ECC] transition-colors"
            >
              Créer un post
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {RECENT_POSTS.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-4"
              >
                <p className="font-body text-[14px] text-[#0D0F2E]">
                  {p.excerpt}
                </p>
                <p className="font-mono text-[11px] text-[#9CA3AF] mt-2">
                  {p.time}
                </p>
              </div>
            ))}
          </div>
        </section>

        {!isSubscribed && (
          <section className="mt-10">
            <div className="rounded-2xl bg-[#F9FAFB] border border-[#16A34A]/20 p-6">
              <h2 className="font-display font-bold text-[18px] text-[#0D0F2E]">
                Pack Commerçants
              </h2>
              <p className="font-body text-[14px] text-[#6B7280] mt-2">
                Boostez votre visibilité avec le Pack Commerçants (20€/mois)
              </p>
              <Link
                href="/premium"
                className="mt-4 inline-flex h-10 px-5 rounded-xl bg-[#16A34A] text-white font-display font-semibold text-sm hover:bg-[#15803D] transition-colors"
              >
                Découvrir le pack
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
