'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { API_URL } from '@/lib/config';

function safeUserAndEmail(session: unknown): {
  userId: string | null;
  email: string | null;
} {
  const s = session as Record<string, Record<string, string>>;
  return {
    userId: s?.['user']?.['id'] ?? s?.['user']?.['userId'] ?? s?.['user']?.['_id'] ?? null,
    email: s?.['user']?.['email'] ?? null,
  };
}

const PREMIUM_FEATURES = [
  'Tout le plan Gratuit',
  'Acces etendu aux tribus',
  'Suppression de la publicite',
  'Badge Premium exclusif',
  'Statistiques de profil',
  'Priorite dans les recherches',
];

const COMMERCIAL_FEATURES = [
  'Mise en avant locale',
  'Campagnes digitales ciblees',
  'Programme de fidelite integre',
  'Evenements exclusifs',
  'Statistiques de visibilite',
];

const FREE_FEATURES = [
  'Acces aux tribus publiques',
  'Carte interactive de base',
  'Profil communautaire',
  'Notifications basiques',
];

const FAQ = [
  {
    q: "Comment fonctionne l'essai gratuit ?",
    a: "Profitez de 7 jours complets sans engagement. Aucune carte bancaire requise pour commencer. Vous serez prevenus avant la fin de l'essai.",
  },
  {
    q: 'Puis-je me desabonner a tout moment ?',
    a: "Oui. Vous pouvez annuler depuis votre espace Stripe a tout moment. Votre acces Premium reste actif jusqu'a la fin de la periode payee.",
  },
  {
    q: 'Mon abonnement se renouvelle-t-il automatiquement ?',
    a: 'Oui, chaque mois automatiquement. Vous recevez une facture par email. Modifiable depuis votre portail Stripe.',
  },
  {
    q: 'Y a-t-il des tarifs speciaux pour les associations ?',
    a: 'Oui, nous proposons des tarifs preferentiels pour les associations loi 1901. Contactez-nous a partenariats@yunicity.fr.',
  },
];

export default function PremiumPage() {
  const { data: session } = useSession() as unknown as {
    data: unknown;
    isPending: boolean;
  };
  const { userId, email } = useMemo(() => safeUserAndEmail(session), [session]);
  const [loading, setLoading] = useState(false);

  async function startCheckout(planId: 'PREMIUM' | 'PACK_COMMERCIAL') {
    if (!userId || !email) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payment/payments/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, email, planId }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = (await res.json()) as { checkoutUrl: string };
      window.location.href = json.checkoutUrl;
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* [1] HERO */}
      <section className="bg-[#0D0F2E] py-20 text-center px-4">
        <span className="inline-flex bg-[#2A2FFF]/20 border border-[#2A2FFF]/40 text-[#9395FF] font-mono text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full">
          PREMIUM
        </span>
        <h1 className="font-display font-black text-[36px] sm:text-[52px] text-white mt-4 leading-tight">
          Passe Yunicity
          <br />a la vitesse <span className="text-[#2A2FFF]">superieure.</span>
        </h1>
        <p className="font-body text-[18px] text-[#9395FF] mt-4 max-w-lg mx-auto">
          Debloquez l&apos;acces complet a la ville.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {['7 jours gratuits', 'Sans engagement', 'Resiliable a tout moment'].map((g) => (
            <span key={g} className="font-mono text-[12px] text-[#6B7280]">
              &#10003; {g}
            </span>
          ))}
        </div>
      </section>

      {/* [2] CARTES PLANS */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {/* Gratuit */}
        <div className="bg-[#1C1F4A] border border-white/10 rounded-2xl p-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280] bg-[#F3F4F6]/10 px-3 py-1 rounded-full">
            ACTUEL
          </span>
          <p className="font-display font-bold text-[40px] text-white mt-4">Gratuit</p>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px]">
                <span className="text-[#6B7280]">&#10003;</span>
                <span className="text-[#9395FF]">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 w-full h-12 bg-white/10 text-white/50 rounded-xl flex items-center justify-center font-display font-semibold cursor-default">
            Plan actuel
          </div>
        </div>

        {/* Premium */}
        <div
          className="bg-gradient-to-br from-[#2A2FFF] to-[#1A1ECC] rounded-2xl p-8 scale-[1.02] z-10"
          style={{
            boxShadow: '0 20px 60px rgba(42,47,255,0.45)',
          }}
        >
          <span className="inline-flex font-mono text-[10px] uppercase tracking-widest text-white bg-white/20 px-3 py-1 rounded-full">
            RECOMMANDE
          </span>
          <div className="mt-4">
            <span className="font-display font-black text-[56px] text-white leading-none">
              4,99&euro;
            </span>
            <span className="font-body text-[20px] text-white/70 ml-1">/mois</span>
          </div>
          <p className="font-mono text-[12px] text-white/60 mt-1">7 jours d&apos;essai gratuit</p>
          <ul className="mt-6 space-y-3">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={f} className="flex items-start gap-2 text-[14px] text-white">
                <span>{i === 0 ? '\u2713' : '\u2726'}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={loading}
            onClick={() => void startCheckout('PREMIUM')}
            className="mt-8 w-full h-12 bg-white text-[#2A2FFF] font-display font-semibold text-[15px] rounded-xl hover:bg-[#E8E9FF] shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? 'Redirection vers Stripe...' : "Commencer l'essai gratuit"}
          </button>
        </div>

        {/* Pack Commercants */}
        <div className="bg-white border border-[#16A34A]/30 rounded-2xl p-8">
          <span className="inline-flex font-mono text-[10px] uppercase tracking-widest text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full">
            PRO
          </span>
          <div className="mt-4">
            <span className="font-display font-bold text-[40px] text-[#0D0F2E]">20&euro;</span>
            <span className="font-body text-[16px] text-[#6B7280] ml-1">/mois</span>
          </div>
          <p className="font-body text-[14px] text-[#6B7280] italic mt-2">
            Pour commercants, associations et freelances verifies
          </p>
          <ul className="mt-6 space-y-3">
            {COMMERCIAL_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px]">
                <span className="text-[#16A34A]">&#10003;</span>
                <span className="text-[#374151]">{f}</span>
              </li>
            ))}
          </ul>
          <a
            href="mailto:partenariats@yunicity.fr"
            className="mt-8 w-full h-12 bg-[#16A34A] text-white font-display font-semibold rounded-xl flex items-center justify-center hover:bg-[#15803D] transition-colors"
          >
            Contacter l&apos;equipe
          </a>
        </div>
      </section>

      {/* [3] FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="font-display font-semibold text-[28px] text-[#0D0F2E] text-center mb-8">
          Questions frequentes
        </h2>
        {FAQ.map((item) => (
          <details key={item.q} className="border-b border-[#F3F4F6] group">
            <summary className="py-4 font-display font-semibold text-[16px] text-[#0D0F2E] cursor-pointer list-none flex justify-between items-center group-open:text-[#2A2FFF]">
              {item.q}
              <span className="text-[20px] group-open:hidden">+</span>
              <span className="text-[20px] hidden group-open:inline">&minus;</span>
            </summary>
            <p className="font-body text-[15px] text-[#6B7280] pt-2 pb-4 leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </section>

      {/* [4] CTA FINAL */}
      <section className="bg-[#0D0F2E] py-16 text-center px-4">
        <h2 className="font-display font-bold text-[36px] text-white">
          Pret a rejoindre la ville ?
        </h2>
        <p className="font-body text-[16px] text-[#9395FF] mt-2">
          Plus de 20 acteurs locaux vous attendent.
        </p>
        <Link
          href="/premium"
          className="mt-8 inline-flex h-14 px-10 bg-[#2A2FFF] text-white font-display font-semibold text-[16px] rounded-xl hover:bg-[#1A1ECC] shadow-lg transition-all items-center justify-center"
        >
          Commencer maintenant
        </Link>
      </section>
    </main>
  );
}
