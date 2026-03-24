import Link from 'next/link';

const ADVANTAGES = [
  'Acces etendu aux tribus',
  'Suppression de la publicite',
  'Badge Premium exclusif',
  'Statistiques de profil avancees',
  'Priorite dans les recherches locales',
];

export default function PremiumSuccessPage() {
  return (
    <main className="min-h-screen bg-[#0D0F2E] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-sm w-full">
        <div className="text-6xl animate-bounce">&#10004;&#65039;</div>

        <span className="mt-6 inline-block bg-[#16A34A]/20 text-[#16A34A] font-mono text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full">
          PREMIUM ACTIVE
        </span>

        <h1 className="font-display font-black text-[40px] text-white mt-4 leading-tight">
          Bienvenue dans
          <br />
          Yunicity Premium !
        </h1>
        <p className="font-body text-[16px] text-[#9395FF] mt-3">
          Votre essai de 7 jours commence maintenant.
        </p>

        <div className="bg-[#1C1F4A] rounded-2xl p-6 mt-8 text-left">
          {ADVANTAGES.map((a) => (
            <div key={a} className="flex items-start gap-3 py-1.5">
              <span className="text-[#16A34A] shrink-0">
                &#10003;
              </span>
              <span className="font-body text-[14px] text-white">
                {a}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/passport"
          className="mt-6 w-full h-12 bg-[#2A2FFF] text-white font-display font-semibold rounded-xl hover:bg-[#1A1ECC] transition-colors flex items-center justify-center"
        >
          Decouvrir mon passeport
        </Link>
        <Link
          href="/map"
          className="mt-3 w-full h-12 text-[#9395FF] font-body rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center"
        >
          Explorer la ville
        </Link>
      </div>
    </main>
  );
}
