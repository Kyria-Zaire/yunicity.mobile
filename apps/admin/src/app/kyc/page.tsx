import Link from 'next/link';
import { getAdminUsers } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-[#FEF3C7]/15 text-[#D97706] border-[#D97706]/25',
  under_review: 'bg-[#DBEAFE]/15 text-[#2563EB] border-[#2563EB]/25',
  verified: 'bg-[#DCFCE7]/15 text-[#16A34A] border-[#16A34A]/25',
  rejected: 'bg-[#FEE2E2]/15 text-[#DC2626] border-[#DC2626]/25',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  under_review: 'En cours',
  verified: 'Vérifié',
  rejected: 'Rejeté',
};

type Tab = 'all' | 'pending' | 'under_review' | 'verified' | 'rejected';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function tabHref(tab: Tab) {
  if (tab === 'all') return '/kyc';
  return `/kyc?status=${encodeURIComponent(tab)}`;
}

export default async function KycListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; profileType?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const profileType = params.profileType;

  const [data, pendingData, reviewData] = await Promise.all([
    getAdminUsers({ status, profileType }),
    getAdminUsers({ status: 'pending', profileType }),
    getAdminUsers({ status: 'under_review', profileType }),
  ]);

  const activeTab: Tab = (status as Tab | undefined) ?? 'all';
  const counts = { pending: pendingData.items.length, review: reviewData.items.length };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'pending', label: `En attente (${counts.pending})` },
    { id: 'under_review', label: `En cours (${counts.review})` },
    { id: 'verified', label: 'Vérifiés' },
    { id: 'rejected', label: 'Rejetés' },
  ];

  return (
    <div>
      <h1 className="font-display text-[28px] font-bold text-white tracking-tight">Review KYC</h1>
      <p className="font-body text-sm text-[#6B7280] mt-1">Filtrez et traitez les profils en attente.</p>

      <div className="flex flex-wrap gap-2 mt-8">
        {tabs.map((t) => (
          <Link
            key={t.id}
            className={`px-4 py-2 rounded-full text-sm font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] ${
              activeTab === t.id
                ? 'bg-[#E8E9FF]/15 text-[#2A2FFF] border border-[#2A2FFF]/30'
                : 'text-[#6B7280] hover:text-[#9395FF] border border-transparent'
            }`}
            href={tabHref(t.id)}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[#1C1F4A] overflow-hidden bg-[#1C1F4A]/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#1C1F4A] bg-[#0D0F2E]/40">
                {['Email', 'Type', 'Statut', 'Documents', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-mono text-[11px] text-[#6B7280] uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => {
                const user = {
                  id: u._id,
                  email: u.email,
                  profileType: u.profileType,
                  status: u.verificationStatus?.status ?? 'pending',
                  createdAt: formatDate(u.createdAt),
                  docs: 0,
                };
                return (
                <tr
                  key={user.id}
                  className="border-b border-[#1C1F4A]/70 hover:bg-[#1C1F4A]/40 transition-colors group"
                >
                  <td className="px-5 py-4 font-body text-sm text-white">{user.email}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#9395FF]">{user.profileType}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-mono uppercase border ${STATUS_BADGE[user.status] ?? ''}`}
                    >
                      {STATUS_LABEL[user.status] ?? user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-[#6B7280]">{user.docs}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#6B7280]">{user.createdAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 relative">
                      <Link
                        href={`/kyc/${user.id}`}
                        className="text-xs font-semibold text-[#2A2FFF] hover:underline"
                      >
                        Ouvrir
                      </Link>
                      <span className="hidden group-hover:inline-flex items-center gap-1 ml-2 animate-fade-in opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-[#16A34A]/20 text-[#16A34A] hover:bg-[#16A34A]/30 text-sm"
                          aria-label="Valider rapidement"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-[#DC2626]/20 text-[#DC2626] hover:bg-[#DC2626]/30 text-sm"
                          aria-label="Rejeter rapidement"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
