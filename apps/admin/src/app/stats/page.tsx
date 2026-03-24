'use client';

const KPIS = [
  { label: 'Utilisateurs total', value: 127 },
  { label: 'Dont vérifiés', value: 89 },
  { label: 'Tribus actives', value: 12 },
  { label: 'Posts ce mois', value: 340 },
  { label: 'MRR (abonnements)', value: '149,70 €' },
];

const INSCRIPTIONS = [
  { day: 'Lun', count: 24 },
  { day: 'Mar', count: 15 },
  { day: 'Mer', count: 31 },
  { day: 'Jeu', count: 18 },
  { day: 'Ven', count: 27 },
  { day: 'Sam', count: 12 },
  { day: 'Dim', count: 9 },
];

const PROFILS = [
  { id: 'yunicitizen', label: 'yunicitizen', pct: 67, color: 'bg-[#2A2FFF]' },
  { id: 'commercial', label: 'commercial', pct: 18, color: 'bg-[#16A34A]' },
  { id: 'association', label: 'association', pct: 8, color: 'bg-[#D97706]' },
  { id: 'freelance', label: 'freelance', pct: 5, color: 'bg-[#7C3AED]' },
  { id: 'ecole', label: 'ecole', pct: 2, color: 'bg-[#059669]' },
];

const maxCount = Math.max(...INSCRIPTIONS.map((i) => i.count));

export default function StatsPage() {
  return (
    <div>
      <h1 className="font-display text-[28px] font-bold text-white tracking-tight">
        Analytics
      </h1>
      <p className="font-body text-sm text-[#6B7280] mt-1">
        KPIs et métriques globales
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-[#2A2FFF]/10 bg-[#1C1F4A] p-5"
          >
            <p className="font-mono text-[11px] text-[#6B7280] uppercase tracking-[0.15em]">
              {k.label}
            </p>
            <p className="font-display text-[28px] font-bold text-white mt-2">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[#1C1F4A] bg-[#1C1F4A]/40 p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-6">
          Inscriptions (7 derniers jours)
        </h2>
        <div className="flex items-end gap-3 h-[120px]">
          {INSCRIPTIONS.map((i) => (
            <div key={i.day} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-[#2A2FFF] min-h-[4px]"
                style={{
                  height: `${Math.max(8, (i.count / maxCount) * 100)}px`,
                }}
              />
              <span className="font-mono text-[11px] text-[#6B7280]">
                {i.day} {i.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-[#1C1F4A] bg-[#1C1F4A]/40 p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-6">
          Répartition profils
        </h2>
        <div className="space-y-3">
          {PROFILS.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-[#9395FF] w-24">
                {p.label}
              </span>
              <div className="flex-1 h-6 bg-[#0D0F2E] rounded overflow-hidden">
                <div
                  className={`h-full ${p.color}`}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-[#6B7280] w-10 text-right">
                {p.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
