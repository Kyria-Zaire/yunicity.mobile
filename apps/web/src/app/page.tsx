import Link from 'next/link';
import { LandingMapPreview } from '@/components/landing-map-preview';
import { PartnersCarousel } from '@/components/partners-carousel';
import { SignupCounter } from '@/components/signup-counter';
import { WaitlistForm } from '@/components/waitlist-form';

const MOCK_STACK = [
  { name: 'Léa M.', type: 'Yunicitizen', color: 'bg-[#2A2FFF]', line: 'Découverte du quartier Croix-Rouge' },
  { name: 'Brasserie X', type: 'Commerce', color: 'bg-[#16A34A]', line: 'Happy hour ce vendredi 18h' },
  { name: 'Asso Jazz', type: 'Association', color: 'bg-[#D97706]', line: 'Concert gratuit samedi au Parvis' },
];

const FEATURES = [
  {
    title: 'Carte interactive 3D',
    desc: 'Explore Reims en temps réel : événements, commerces, tribus. Points lumineux pour chaque pulsation de la ville.',
    wide: true,
    visual: (
      <div className="mt-6">
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 rounded-2xl overflow-hidden border border-[#2A2FFF]/15">
          <LandingMapPreview />
          <div className="absolute left-3 bottom-3 z-30">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#0D0F2E]/80 text-white border border-white/10">
              Carte interactive · Reims
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: '5 types de profils',
    desc: 'Citoyen, commerce, association, freelance, école — chacun son espace, une ville qui vous ressemble.',
    wide: false,
    visual: (
      <div className="mt-4 grid grid-cols-3 gap-2 text-2xl">
        {['🏙️', '🏪', '🤝', '💼', '🎓'].map((e, i) => (
          <div key={i} className="aspect-square rounded-xl bg-[#F3F4F6] flex items-center justify-center border border-[#E5E7EB]">
            {e}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Vérification sécurisée',
    desc: 'Profils professionnels validés (SIRET, RNA, UAI). Moins de spam, plus de confiance.',
    wide: false,
    visual: (
      <div className="mt-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#E8E9FF] flex items-center justify-center text-2xl border border-[#2A2FFF]/20">
          🛡️
        </div>
        <p className="font-mono text-[11px] text-[#6B7280] leading-relaxed">
          Conformité & données hébergées en France
        </p>
      </div>
    ),
  },
];

const PROFILS = [
  { emoji: '🏙️', nom: 'Yunicitizen', desc: 'Habitant curieux, acteur du quotidien local.', badge: 'bg-[#E8E9FF] text-[#2A2FFF]', border: 'border-[#2A2FFF]' },
  { emoji: '🏪', nom: 'Commerce', desc: 'Commerçants, restos, services — rayonnez localement.', badge: 'bg-[#DCFCE7] text-[#16A34A]', border: 'border-transparent' },
  { emoji: '🤝', nom: 'Association', desc: 'Loi 1901, culture, sport, solidarité.', badge: 'bg-[#FEF3C7] text-[#D97706]', border: 'border-transparent' },
  { emoji: '💼', nom: 'Freelance', desc: 'Indépendants, consultants, créateurs.', badge: 'bg-[#F5F3FF] text-[#7C3AED]', border: 'border-transparent' },
  { emoji: '🎓', nom: 'École', desc: 'Établissements et acteurs de l’éducation.', badge: 'bg-[#ECFDF5] text-[#059669]', border: 'border-transparent' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100dvh] bg-[#0D0F2E] flex items-center">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase px-4 py-2 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#FCA5A5]">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden />
              BETA EN COURS · REIMS · PLACES LIMITÉES
            </p>
            <h1 className="font-display text-[52px] sm:text-[64px] lg:text-[80px] font-black text-white leading-[0.98] tracking-[-0.04em] mt-5">
              Ta ville,
              <br />
              <span className="text-[#2A2FFF] hero-underline">vraiment</span>
              <br />
              connectée.
            </h1>
            <p className="font-body text-lg text-[#9395FF] max-w-lg leading-relaxed mt-8">
              Yunicity reconnecte les habitants, met en avant les acteurs locaux et donne du relief à ta ville — réseau social phygitale, sans le bruit des géants.
            </p>
            <SignupCounter />
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm tracking-wide shadow-primary hover:bg-[#1A1ECC] hover:shadow-[0_12px_40px_rgba(42,47,255,0.45)] active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9395FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F2E]"
              >
                Rejoindre la beta →
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-[#2A2FFF]/30 text-[#9395FF] font-semibold text-sm hover:border-[#2A2FFF] hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F2E]"
              >
                Découvrir le concept
              </a>
            </div>
            <div className="flex flex-wrap gap-6 sm:gap-0 mt-14 pt-10 border-t border-white/10">
              {[
                { v: '182K', l: 'habitants' },
                { v: '5', l: 'profils' },
                { v: '2026', l: 'lancement' },
              ].map((s, i) => (
                <div key={s.l} className="flex items-center">
                  {i > 0 && <div className="hidden sm:block w-px h-12 bg-white/15 mx-8 lg:mx-10" aria-hidden />}
                  <div>
                    <div className="font-display text-3xl sm:text-4xl font-bold text-white">{s.v}</div>
                    <div className="font-mono text-[11px] text-[#6B7280] uppercase tracking-wider mt-1">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <div className="flex justify-end">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
              <div
                className="relative mt-8 rounded-[28px] border border-[#2A2FFF]/15 p-4 sm:p-5 min-h-[420px] sm:min-h-[480px] overflow-hidden"
                style={{
                  background: 'linear-gradient(165deg, #1C1F4A 0%, #0D0F2E 50%, #151839 100%)',
                }}
              >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#0D0F2E]/90 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="font-mono text-[12px] text-white tracking-wide whitespace-nowrap">
                    Live · 47 actifs maintenant
                  </span>
                </div>
                <div className="relative h-[380px] sm:h-[420px]">
                  {MOCK_STACK.map((card, i) => (
                    <div
                      key={card.name}
                      className="absolute left-0 right-0 rounded-2xl bg-[#1C1F4A] border border-white/10 p-4 shadow-card transition-transform duration-300 hover:-translate-y-1"
                      style={{
                        top: i * 56,
                        zIndex: 3 - i,
                        transform: `rotate(${i === 0 ? 0 : i === 1 ? -1.5 : -2.5}deg)`,
                        opacity: 1 - i * 0.12,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-full ${card.color} shrink-0`} aria-hidden />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-white text-sm truncate">{card.name}</span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#9395FF] shrink-0">{card.type}</span>
                          </div>
                          <p className="font-body text-xs text-[#6B7280] mt-1.5 line-clamp-2">{card.line}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0D0F2E] text-center tracking-tight">
            Une ville qui pulse
          </h2>
          <p className="font-body text-center text-[#6B7280] mt-4 max-w-xl mx-auto">
            Trois piliers pour une expérience locale premium.
          </p>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border border-[#F3F4F6] bg-white p-8 shadow-card hover:-translate-y-1 hover:shadow-hover transition-all duration-300 ${f.wide ? 'md:col-span-2 lg:col-span-2 lg:row-span-1' : ''}`}
              >
                <h3 className="font-display text-xl font-bold text-[#0D0F2E]">{f.title}</h3>
                <p className="font-body text-[#6B7280] text-sm leading-relaxed mt-3">{f.desc}</p>
                {f.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFILS */}
      <section className="bg-[#F9FAFB] py-20 sm:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0D0F2E] text-center">
            Pour tous les acteurs de ta ville
          </h2>
          <div className="mt-12 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
            {PROFILS.map((p, i) => (
              <article
                key={p.nom}
                className={`snap-center shrink-0 min-w-[280px] sm:min-w-[320px] rounded-2xl border-2 p-6 bg-white shadow-card hover:shadow-hover transition-all duration-300 ${i === 0 ? 'border-[#2A2FFF] bg-[#E8E9FF]/40' : 'border-[#E5E7EB]'}`}
              >
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="font-display font-bold text-lg text-[#0D0F2E]">{p.nom}</h3>
                <p className="font-body text-sm text-[#6B7280] mt-2 leading-relaxed min-h-[44px]">{p.desc}</p>
                <span className={`inline-block mt-4 font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${p.badge}`}>
                  Profil
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PartnersCarousel />

      {/* WAITLIST BETA */}
      <section className="bg-[#0D0F2E] py-20 sm:py-28 px-4 sm:px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#DC2626]/25 text-[#FCA5A5] border border-[#DC2626]/40">
            BETA FERMÉE · 50 PLACES
          </span>
          <h2 className="font-display text-[44px] sm:text-5xl font-black text-white tracking-tight mt-6">
            Reims — Printemps 2026
          </h2>
          <p className="font-body text-[#9395FF] text-lg mt-4">
            Vous êtes parmi les premiers. Inscrivez-vous maintenant.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* STATS BETA */}
      <section className="bg-[#F9FAFB] py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-12 justify-center text-center">
          {[
            { v: '47', l: 'inscrits' },
            { v: '8', l: 'tribus créées' },
            { v: '20+', l: 'acteurs locaux' },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-[40px] font-bold text-[#2A2FFF]">{s.v}</div>
              <div className="font-mono text-[11px] text-[#6B7280] uppercase tracking-wider mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0D0F2E] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-xl font-black text-[#2A2FFF]">Yunicity</span>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="font-mono text-[11px] text-[#6B7280] hover:text-[#9395FF] uppercase tracking-widest"
            >
              Confidentialité
            </a>
            <a
              href="mailto:contact@yunicity.fr"
              className="font-mono text-[11px] text-[#6B7280] hover:text-[#9395FF] uppercase tracking-widest"
            >
              Contact
            </a>
          </div>
          <span className="font-mono text-[11px] text-[#6B7280]">© 2026 Yunicity · Reims</span>
        </div>
      </footer>
    </>
  );
}
