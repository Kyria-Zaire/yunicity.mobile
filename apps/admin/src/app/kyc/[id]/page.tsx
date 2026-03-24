import { KycDecision } from '../kyc-decision';

const MOCK_USERS: Record<
  string,
  {
    id: string;
    email: string;
    profileType: string;
    status: string;
    createdAt: string;
    phone: string;
    city: string;
    documents: { type: string; uploadedAt: string }[];
  }
> = {
  '1': {
    id: '1',
    email: 'marie@test.fr',
    profileType: 'commercial',
    status: 'pending',
    createdAt: '10/03/2026',
    phone: '+33612345678',
    city: 'Reims',
    documents: [{ type: 'Kbis', uploadedAt: '10/03/2026 14:32' }],
  },
  '2': {
    id: '2',
    email: 'assoc@test.fr',
    profileType: 'association',
    status: 'under_review',
    createdAt: '11/03/2026',
    phone: '+33698765432',
    city: 'Reims',
    documents: [
      { type: 'RNA', uploadedAt: '11/03/2026 09:15' },
      { type: 'Statuts', uploadedAt: '11/03/2026 09:20' },
    ],
  },
  '3': {
    id: '3',
    email: 'ecole@test.fr',
    profileType: 'ecole',
    status: 'pending',
    createdAt: '12/03/2026',
    phone: '+33326987654',
    city: 'Reims',
    documents: [{ type: 'UAI', uploadedAt: '12/03/2026 11:00' }],
  },
  '4': {
    id: '4',
    email: 'free@test.fr',
    profileType: 'freelance',
    status: 'verified',
    createdAt: '13/03/2026',
    phone: '+33611122333',
    city: 'Épernay',
    documents: [{ type: 'URSSAF', uploadedAt: '13/03/2026 08:00' }],
  },
  '5': {
    id: '5',
    email: 'yuni@test.fr',
    profileType: 'yunicitizen',
    status: 'rejected',
    createdAt: '14/03/2026',
    phone: '—',
    city: 'Reims',
    documents: [],
  },
};

async function verifyUser(id: string) {
  'use server';
  console.log(`[ADMIN] Vérification du profil ${id}`);
}

async function rejectUser(id: string, reason: string) {
  'use server';
  console.log(`[ADMIN] Rejet ${id} — ${reason}`);
}

export default async function KycDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = MOCK_USERS[id];

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="font-display text-2xl font-bold text-white">Profil introuvable</h1>
        <a
          href="/kyc"
          className="inline-flex mt-6 px-6 py-3 rounded-xl bg-[#2A2FFF] text-white text-sm font-semibold shadow-primary hover:bg-[#1A1ECC]"
        >
          Retour à la liste
        </a>
      </div>
    );
  }

  const initials = user.email
    .split('@')[0]
    ?.slice(0, 2)
    .toUpperCase() ?? '??';

  async function verifyProfile() {
    'use server';
    await verifyUser(id);
  }

  async function rejectProfile(formData: FormData) {
    'use server';
    const reason = (formData.get('reason') as string) ?? '';
    if (!reason.trim()) return;
    await rejectUser(id, reason);
  }

  const STATUS: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'bg-[#FEF3C7]/20 text-[#D97706]', label: 'En attente' },
    under_review: { cls: 'bg-[#DBEAFE]/20 text-[#2563EB]', label: 'En cours' },
    verified: { cls: 'bg-[#DCFCE7]/20 text-[#16A34A]', label: 'Vérifié' },
    rejected: { cls: 'bg-[#FEE2E2]/20 text-[#DC2626]', label: 'Rejeté' },
  };
  const st = STATUS[user.status] ?? STATUS['pending']!;

  return (
    <div>
      <a
        href="/kyc"
        className="text-sm text-[#9395FF] hover:text-white transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
      >
        ← Retour à la liste
      </a>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Mobile: actions d'abord. Desktop: colonne droite sticky */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start order-1 lg:order-2">
          {(user.status === 'pending' || user.status === 'under_review') && (
            <KycDecision verifyProfile={verifyProfile} rejectProfile={rejectProfile} />
          )}

          <div className="rounded-2xl border border-[#1C1F4A] bg-[#1C1F4A]/40 p-6">
            <h2 className="font-display text-base font-semibold text-white mb-4">Historique</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                <span className="text-[#6B7280]">Profil créé — {user.createdAt} 14:32</span>
              </li>
              {user.documents.map((doc, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#2A2FFF] mt-1.5 shrink-0 animate-pulseDot" />
                  <span className="text-[#6B7280]">
                    Document {doc.type} — {doc.uploadedAt}
                  </span>
                </li>
              ))}
              {(user.status === 'pending' || user.status === 'under_review') && (
                <li className="flex gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#2A2FFF] mt-1.5 shrink-0 ring-4 ring-[#2A2FFF]/30 animate-pulse" />
                  <span className="text-[#9395FF]">En attente de décision</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
          <div className="rounded-2xl border border-[#1C1F4A] bg-[#1C1F4A]/40 p-8">
            <div className="flex flex-wrap items-start gap-6">
              <div
                className="w-16 h-16 rounded-full bg-[#2A2FFF] flex items-center justify-center font-display text-xl font-bold text-white shrink-0"
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-xl font-bold text-white break-all">{user.email}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8E9FF]/10 text-[#9395FF]">
                    {user.profileType}
                  </span>
                  <span className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-sm">
                  <div>
                    <dt className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider">Inscription</dt>
                    <dd className="text-white mt-1">{user.createdAt}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider">Téléphone</dt>
                    <dd className="text-white mt-1">{user.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] text-[#6B7280] uppercase tracking-wider">Ville</dt>
                    <dd className="text-white mt-1">{user.city}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-white mb-4">Documents KYC</h2>
            <div className="space-y-3">
              {user.documents.length === 0 ? (
                <p className="text-sm text-[#6B7280] rounded-xl border border-[#1C1F4A] bg-[#1C1F4A]/30 p-6">Aucun document.</p>
              ) : (
                user.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#1C1F4A] bg-[#0D0F2E]/60 px-5 py-4"
                  >
                    <div>
                      <p className="font-mono text-xs text-[#2A2FFF] uppercase">{doc.type}</p>
                      <p className="font-mono text-[11px] text-[#6B7280] mt-1">Upload : {doc.uploadedAt}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#6B7280] px-3 py-1.5 rounded-lg border border-[#1C1F4A]">
                      PDF (URL signée)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
