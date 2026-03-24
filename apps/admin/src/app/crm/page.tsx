'use client';

import { useState } from 'react';

const COLUMNS = [
  { id: 'lead', label: 'Lead' },
  { id: 'contacte', label: 'Contacté' },
  { id: 'negociation', label: 'Négociation' },
  { id: 'actif', label: 'Actif' },
  { id: 'pause', label: 'Pause' },
  { id: 'resilie', label: 'Résilié' },
];

const MOCK_CRM: Record<string, { id: string; name: string; type: string; ville: string; valeur?: string }[]> = {
  lead: [
    { id: '1', name: 'Boulangerie Martin', type: 'commercial', ville: 'Reims' },
    { id: '2', name: 'Asso Sport Reims', type: 'association', ville: 'Reims' },
  ],
  contacte: [
    { id: '3', name: 'Restaurant Le Cellier', type: 'commercial', ville: 'Reims' },
  ],
  negociation: [
    { id: '4', name: 'Studio Photo Pro', type: 'freelance', ville: 'Reims' },
  ],
  actif: [
    { id: '5', name: 'Jazz au Parvis', type: 'association', ville: 'Reims', valeur: '1000€/an' },
    { id: '6', name: 'CCI Reims', type: 'commercial', ville: 'Reims', valeur: '2000€/an' },
  ],
  pause: [],
  resilie: [],
};

export default function CrmPage() {
  const [data, setData] = useState(MOCK_CRM);

  function advance(id: string, fromCol: string) {
    const keys = Object.keys(COLUMNS);
    const idx = keys.indexOf(fromCol);
    if (idx < 0 || idx >= keys.length - 1) return;
    const nextCol = keys[idx + 1]!;
    const card = data[fromCol]?.find((c) => c.id === id);
    if (!card) return;
    setData((prev) => ({
      ...prev,
      [fromCol]: prev[fromCol]!.filter((c) => c.id !== id),
      [nextCol]: [...(prev[nextCol] ?? []), card],
    }));
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[28px] font-bold text-white tracking-tight">
            Partenaires
          </h1>
          <p className="font-body text-sm text-[#6B7280] mt-1">
            Pipeline CRM
          </p>
        </div>
        <div className="flex items-center gap-6 font-mono text-sm">
          <span className="text-[#16A34A]">MRR : 250 €</span>
          <span className="text-[#9395FF]">ARR : 3 000 €</span>
          <span className="text-white">Actifs : 2</span>
          <span className="text-[#D97706]">Leads : 2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="rounded-xl bg-[#111827] min-h-64 p-3"
          >
            <h3 className="font-mono text-[11px] text-[#6B7280] uppercase tracking-widest mb-3">
              {col.label}
            </h3>
            <div className="space-y-2">
              {(data[col.id] ?? []).map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl bg-[#1C1F4A] border border-white/10 p-4"
                >
                  <p className="font-body text-sm font-medium text-white">
                    {card.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#2A2FFF]/20 text-[#9395FF]">
                      {card.type}
                    </span>
                    <span className="font-mono text-[10px] text-[#6B7280]">
                      {card.ville}
                    </span>
                  </div>
                  {card.valeur && (
                    <p className="font-mono text-[12px] text-[#16A34A] mt-2">
                      {card.valeur}
                    </p>
                  )}
                  {col.id !== 'resilie' && (
                    <button
                      type="button"
                      onClick={() => advance(card.id, col.id)}
                      className="mt-3 text-[11px] text-[#9395FF] hover:text-[#2A2FFF] font-mono"
                    >
                      Avancer →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
