import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Yunicity',
  description:
    'Comment Yunicity collecte, utilise et protège vos données personnelles (RGPD). Hébergement en France.',
};

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'responsable',
    title: '1. Responsable du traitement',
    body: (
      <>
        <p>
          Le responsable du traitement des données personnelles est <strong>Yunicity</strong> (projet en cours de
          structuration juridique). Pour toute question relative à vos données :{' '}
          <a href="mailto:privacy@yunicity.fr" className="text-[#2A2FFF] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded">
            privacy@yunicity.fr
          </a>{' '}
          ou{' '}
          <a href="mailto:support@yunicity.fr" className="text-[#2A2FFF] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded">
            support@yunicity.fr
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'donnees',
    title: '2. Données collectées',
    body: (
      <ul className="list-disc pl-5 space-y-2 marker:text-[#2A2FFF]">
        <li>
          <strong>Compte :</strong> adresse e-mail, mot de passe (haché), type de profil, et le cas échéant numéro de
          téléphone, identifiants professionnels (SIRET, RNA, UAI) pour la vérification.
        </li>
        <li>
          <strong>Utilisation du service :</strong> contenus que vous publiez, interactions, préférences, logs
          techniques (adresse IP, type d’appareil, horodatages) dans la limite du nécessaire.
        </li>
        <li>
          <strong>Communications :</strong> si vous acceptez l’option marketing, nous pouvons utiliser votre e-mail pour
          des actualités Yunicity.
        </li>
      </ul>
    ),
  },
  {
    id: 'finalites',
    title: '3. Finalités et bases légales',
    body: (
      <ul className="list-disc pl-5 space-y-2 marker:text-[#2A2FFF]">
        <li>
          <strong>Fourniture du service</strong> (création de compte, carte, profils) — exécution du contrat / mesures
          précontractuelles.
        </li>
        <li>
          <strong>Vérification des profils professionnels</strong> — intérêt légitime et obligation légale le cas
          échéant.
        </li>
        <li>
          <strong>Sécurité, lutte contre la fraude</strong> — intérêt légitime.
        </li>
        <li>
          <strong>Newsletter / prospection</strong> — uniquement avec votre consentement (case à cocher distincte).
        </li>
      </ul>
    ),
  },
  {
    id: 'duree',
    title: '4. Durée de conservation',
    body: (
      <p>
        Les données de compte sont conservées pendant la durée d’utilisation du service, puis archivées ou supprimées
        selon les obligations légales. Les logs techniques sont conservés pour une durée limitée (généralement 12 mois),
        sauf obligation contraire.
      </p>
    ),
  },
  {
    id: 'destinataires',
    title: '5. Destinataires et sous-traitants',
    body: (
      <p>
        Vos données sont traitées par Yunicity et, le cas échéant, par des prestataires techniques strictement
        nécessaires (hébergement, e-mail transactionnel, authentification), sous contrat conforme au RGPD. Nous ne
        vendons pas vos données personnelles.
      </p>
    ),
  },
  {
    id: 'transferts',
    title: '6. Transferts hors UE',
    body: (
      <p>
        Nous privilégions l’hébergement et le traitement des données en France / Union européenne. Si un transfert hors
        UE devait avoir lieu, il sera encadré par des garanties appropriées (clauses types, décision d’adéquation, etc.).
      </p>
    ),
  },
  {
    id: 'droits',
    title: '7. Vos droits (RGPD)',
    body: (
      <>
        <p className="mb-3">Vous disposez des droits suivants :</p>
        <ul className="list-disc pl-5 space-y-1 marker:text-[#2A2FFF]">
          <li>d’accès, de rectification et d’effacement ;</li>
          <li>de limitation du traitement et d’opposition ;</li>
          <li>à la portabilité des données lorsque applicable ;</li>
          <li>de retirer votre consentement marketing à tout moment ;</li>
          <li>d’introduire une réclamation auprès de la CNIL (www.cnil.fr).</li>
        </ul>
        <p className="mt-3">
          Pour exercer vos droits :{' '}
          <a href="mailto:privacy@yunicity.fr" className="text-[#2A2FFF] font-medium hover:underline">
            privacy@yunicity.fr
          </a>
          . Nous répondons dans un délai d’un mois (prolongeable en cas de complexité).
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '8. Cookies et traceurs',
    body: (
      <p>
        Nous utilisons des cookies strictement nécessaires au fonctionnement du site (session, sécurité). Tout cookie
        non essentiel fera l’objet d’un bandeau de consentement lorsque la matrice cookies sera déployée. Vous pouvez
        paramétrer votre navigateur pour refuser les cookies, avec un impact possible sur certaines fonctionnalités.
      </p>
    ),
  },
  {
    id: 'mineurs',
    title: '9. Mineurs',
    body: (
      <p>
        Yunicity s’adresse aux personnes âgées d’au moins 15 ans (ou âge légal applicable). Les comptes des mineurs
        non autorisés peuvent être supprimés sur simple demande.
      </p>
    ),
  },
  {
    id: 'modifications',
    title: '10. Modifications',
    body: (
      <p>
        Cette politique peut être mise à jour. La date de dernière mise à jour est indiquée en bas de page. En cas de
        changement substantiel, nous vous en informerons par e-mail ou notification dans l’application lorsque la loi
        l’exige.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono text-[#6B7280] hover:text-[#2A2FFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
          >
            ← Accueil
          </Link>
          <span className="font-display text-xl font-black text-[#2A2FFF]">Yunicity</span>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="font-mono text-[11px] text-[#9395FF] tracking-[0.2em] uppercase">Document légal</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0D0F2E] tracking-tight mt-3">
          Politique de confidentialité
        </h1>
        <p className="font-body text-[#6B7280] mt-4 leading-relaxed">
          Transparence sur le traitement de vos données personnelles, conformément au Règlement général sur la protection
          des données (RGPD) et à la loi « Informatique et Libertés ».
        </p>
        <p className="font-mono text-xs text-[#9CA3AF] mt-6 pb-8 border-b border-[#E5E7EB]">
          Dernière mise à jour : mars 2026
        </p>

        <nav className="mt-10 p-5 rounded-2xl bg-[#E8E9FF]/50 border border-[#2A2FFF]/15" aria-label="Sommaire">
          <p className="font-display font-semibold text-sm text-[#0D0F2E] mb-3">Sommaire</p>
          <ol className="font-body text-sm text-[#374151] space-y-1.5 list-decimal list-inside">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#2A2FFF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded">
                  {s.title.replace(/^\d+\.\s*/, '')}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-14 space-y-14">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0D0F2E] border-l-4 border-[#2A2FFF] pl-4">
                {s.title}
              </h2>
              <div className="mt-4 font-body text-[#374151] text-[15px] leading-relaxed space-y-3">{s.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-2xl bg-[#0D0F2E] text-white">
          <p className="font-display font-semibold text-lg">Une question ?</p>
          <p className="font-body text-[#9395FF] text-sm mt-2 leading-relaxed">
            Notre équipe est à votre écoute pour tout complément sur la protection de vos données.
          </p>
          <a
            href="mailto:privacy@yunicity.fr"
            className="inline-flex mt-4 h-11 items-center px-6 rounded-xl bg-[#2A2FFF] text-white font-semibold text-sm shadow-primary hover:bg-[#1A1ECC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F2E]"
          >
            Écrire à privacy@yunicity.fr
          </a>
        </div>

        <p className="text-center mt-12">
          <Link href="/register" className="text-sm text-[#6B7280] hover:text-[#2A2FFF] transition-colors">
            ← Retour à l’inscription
          </Link>
        </p>
      </article>
    </div>
  );
}
