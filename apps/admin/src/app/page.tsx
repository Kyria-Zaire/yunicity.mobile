import { getAdminStats, getAdminUsers } from '@/lib/api';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

const STATUS: Record<string, { cls: string; label: string }> = {
  pending: { cls: 'bg-[#FEF3C7]/20 text-[#D97706] border-[#D97706]/30', label: 'En attente' },
  under_review: { cls: 'bg-[#DBEAFE]/20 text-[#2563EB] border-[#2563EB]/30', label: 'En cours' },
  verified: { cls: 'bg-[#DCFCE7]/20 text-[#16A34A] border-[#16A34A]/30', label: 'Vérifié' },
  rejected: { cls: 'bg-[#FEE2E2]/20 text-[#DC2626] border-[#DC2626]/30', label: 'Rejeté' },
};

export default async function DashboardPage() {
  const [stats, users] = await Promise.all([getAdminStats(), getAdminUsers()]);
  const rows = users.items.slice(0, 10).map((u) => ({
    id: u._id,
    email: u.email,
    type: u.profileType,
    status: u.verificationStatus?.status ?? 'pending',
    date: formatDate(u.createdAt),
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold text-white tracking-tight">Dashboard</h1>
          <p className="font-body text-sm text-[#6B7280] mt-1">Vue d&apos;ensemble · Mis à jour il y a 2 min</p>
        </div>
        <button
          type="button"
          className="self-start sm:self-auto text-sm text-[#9395FF] hover:text-white px-4 py-2 rounded-lg border border-[#1C1F4A] hover:bg-[#1C1F4A] transition-colors font-mono text-[11px] uppercase tracking-wider"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
        {[
          {
            value: String(stats.pending),
            label: 'En attente',
            trend: '+2 aujourd’hui',
            color: 'text-[#D97706]',
            icon: (
              <svg className="w-6 h-6 text-[#D97706]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            value: String(stats.under_review),
            label: 'En cours de review',
            trend: '',
            color: 'text-[#2563EB]',
            icon: (
              <svg className="w-6 h-6 text-[#2563EB]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ),
          },
          {
            value: String(stats.verified),
            label: 'Vérifiés ce mois',
            trend: '',
            color: 'text-[#16A34A]',
            icon: (
              <svg className="w-6 h-6 text-[#16A34A]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            value: String(stats.rejected),
            label: 'Rejetés ce mois',
            trend: '',
            color: 'text-[#DC2626]',
            icon: (
              <svg className="w-6 h-6 text-[#DC2626]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#2A2FFF]/10 bg-[#1C1F4A] p-6 hover:border-[#2A2FFF]/25 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[11px] text-[#6B7280] uppercase tracking-[0.15em]">{s.label}</p>
                <p className={`font-display text-[40px] font-bold leading-tight mt-2 ${s.color}`}>{s.value}</p>
                {s.trend ? <p className="text-xs text-[#16A34A] mt-2 font-body">{s.trend}</p> : null}
              </div>
              <div className="p-2 rounded-xl bg-[#0D0F2E]/50">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-[#1C1F4A] overflow-hidden bg-[#1C1F4A]/40">
        <h2 className="font-display text-lg font-semibold text-white px-6 py-4 border-b border-[#1C1F4A]">
          Dernières inscriptions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#1C1F4A]">
                {['Email', 'Type', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left font-mono text-[11px] text-[#6B7280] uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const st = STATUS[row.status] ?? STATUS['pending']!;
                return (
                  <tr key={row.id ?? i} className="border-b border-[#1C1F4A]/80 hover:bg-[#1C1F4A]/50 transition-colors">
                    <td className="px-6 py-3.5 font-body text-sm text-white">{row.email}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-[#9395FF]">{row.type}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wide border ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-[#6B7280]">{row.date}</td>
                    <td className="px-6 py-3.5">
                      <a
                        href={`/kyc/${row.id ?? i + 1}`}
                        className="text-xs font-semibold text-[#2A2FFF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] rounded"
                      >
                        Voir →
                      </a>
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
