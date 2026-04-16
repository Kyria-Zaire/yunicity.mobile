'use client';

import Link from 'next/link';
import type { CurrentUser } from '@/hooks/use-current-user';

const PLAN_LABELS: Record<string, { name: string; color: string; bg: string }> = {
  FREE: { name: 'Gratuit', color: '#6B7280', bg: '#F3F4F6' },
  PREMIUM: { name: 'Premium', color: '#D97706', bg: '#FEF3C7' },
  PACK_COMMERCIAL: { name: 'Pack Commercial', color: '#2A2FFF', bg: '#E8E9FF' },
};

const FEATURES_FREE = [
  'Profil public',
  'Rejoindre 3 tribus',
  'Passeport citoyen basique',
  'Accès à la carte',
];

const FEATURES_PREMIUM = [
  'Tout le plan Gratuit',
  'Tribus illimitées',
  'Badge Premium',
  'Statistiques avancées',
  'Support prioritaire',
];

export function SubscriptionTab({ user }: { user: CurrentUser }) {
  const sub = user.subscription ?? { plan: 'FREE', status: 'active' };
  const planInfo = PLAN_LABELS[sub.plan] ?? PLAN_LABELS['FREE']!;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-[#0D0F2E]">Mon abonnement</h3>
        <p className="font-mono text-[11px] text-[#6B7280] mt-1">
          Gérez votre plan et votre facturation.
        </p>
      </div>

      {/* Plan actuel */}
      <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-[18px] text-[#0D0F2E]">
                Plan {planInfo.name}
              </h4>
              <span
                className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: planInfo.bg, color: planInfo.color }}
              >
                {sub.status === 'active' ? 'Actif' : sub.status === 'canceled' ? 'Annulé' : 'Impayé'}
              </span>
            </div>
            {sub.currentPeriodEnd && (
              <p className="font-mono text-[11px] text-[#6B7280] mt-1">
                Prochain renouvellement : {sub.currentPeriodEnd}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">
            Fonctionnalités incluses
          </p>
          <ul className="space-y-1.5">
            {(sub.plan === 'FREE' ? FEATURES_FREE : FEATURES_PREMIUM).map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[10px]">✓</span>
                <span className="font-body text-sm text-[#374151]">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade CTA */}
      {sub.plan === 'FREE' && (
        <div className="bg-gradient-to-br from-[#2A2FFF] to-[#1A1ECC] rounded-2xl p-6">
          <h4 className="font-display font-bold text-[20px] text-white">
            Passez à Premium
          </h4>
          <p className="font-body text-sm text-white/80 mt-2 max-w-md">
            Débloquez toutes les fonctionnalités : tribus illimitées, statistiques avancées, badge Premium et support prioritaire.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/premium"
              className="h-11 px-6 rounded-xl bg-white text-[#2A2FFF] font-display font-semibold hover:bg-white/90 transition-colors inline-flex items-center justify-center"
            >
              Voir les plans
            </Link>
          </div>
        </div>
      )}

      {/* Gestion facturation */}
      {sub.plan !== 'FREE' && (
        <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
          <h4 className="font-display font-bold text-[#0D0F2E]">Facturation</h4>
          <p className="font-body text-sm text-[#6B7280] mt-2">
            Fonctionnalité disponible prochainement. Vous pourrez gérer votre moyen de paiement et consulter vos factures directement depuis cette page.
          </p>
          <span className="inline-flex mt-3 font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706]">
            Bientôt
          </span>
        </div>
      )}

      {/* Historique */}
      <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
        <h4 className="font-display font-bold text-[#0D0F2E]">Historique des paiements</h4>
        <div className="mt-4 flex items-center justify-center py-8">
          <p className="font-body text-sm text-[#6B7280]">
            {sub.plan === 'FREE'
              ? 'Aucun paiement — vous utilisez le plan gratuit.'
              : 'Fonctionnalité disponible prochainement.'}
          </p>
        </div>
      </div>
    </div>
  );
}
