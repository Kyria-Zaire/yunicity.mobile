'use client';

import { useState } from 'react';

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-[#0D0F2E]">Confidentialité & RGPD</h3>
        <p className="font-mono text-[11px] text-[#6B7280] mt-1">
          Gérez vos données personnelles conformément au RGPD.
        </p>
      </div>

      <ConsentSection />
      <DataExportSection />
      <DeleteAccountSection />
    </div>
  );
}

function ConsentSection() {
  const [consents, setConsents] = useState({
    analytics: true,
    personalization: true,
    thirdParty: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof typeof consents) {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    // TODO: appel API PUT /users/users/:id/consents
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
      <h4 className="font-display font-bold text-[#0D0F2E]">Consentements</h4>
      <p className="font-mono text-[11px] text-[#6B7280] mt-1">
        Vous pouvez modifier vos consentements à tout moment.
      </p>

      <div className="mt-4 divide-y divide-[#F3F4F6]">
        <ConsentRow
          label="Analyse d'utilisation"
          description="Nous aide à améliorer l'expérience Yunicity."
          checked={consents.analytics}
          onChange={() => toggle('analytics')}
        />
        <ConsentRow
          label="Personnalisation"
          description="Recommandations adaptées à votre profil et vos intérêts."
          checked={consents.personalization}
          onChange={() => toggle('personalization')}
        />
        <ConsentRow
          label="Partage avec des tiers"
          description="Partage de données anonymisées avec nos partenaires."
          checked={consents.thirdParty}
          onChange={() => toggle('thirdParty')}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm hover:bg-[#1A1ECC] disabled:opacity-60 transition-colors"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && (
          <span className="font-body text-sm text-[#16A34A] font-medium">
            Consentements mis à jour ✓
          </span>
        )}
      </div>
    </div>
  );
}

function ConsentRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="pr-4">
        <p className="font-body text-sm font-medium text-[#0D0F2E]">{label}</p>
        <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
          checked ? 'bg-[#2A2FFF]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function DataExportSection() {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  async function handleExport() {
    setExporting(true);
    // TODO: appel API GET /gdpr/export
    await new Promise((r) => setTimeout(r, 1500));
    setExporting(false);
    setExported(true);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
      <h4 className="font-display font-bold text-[#0D0F2E]">Exporter mes données</h4>
      <p className="font-body text-sm text-[#6B7280] mt-2">
        Téléchargez une copie de toutes vos données personnelles au format JSON.
        Conformément à l'article 20 du RGPD (droit à la portabilité).
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting || exported}
        className="mt-4 h-10 px-5 rounded-xl border-2 border-[#2A2FFF] text-[#2A2FFF] font-display font-semibold text-sm hover:bg-[#2A2FFF] hover:text-white disabled:opacity-60 transition-colors"
      >
        {exporting ? 'Préparation...' : exported ? 'Export envoyé par email ✓' : 'Exporter mes données'}
      </button>
    </div>
  );
}

function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="bg-white rounded-2xl border border-[#FEE2E2] shadow-card p-5">
      <h4 className="font-display font-bold text-[#DC2626]">Supprimer mon compte</h4>
      <p className="font-body text-sm text-[#6B7280] mt-2">
        Cette action est irréversible. Toutes vos données seront supprimées dans un délai de 30 jours
        conformément au RGPD (article 17 — droit à l'effacement).
      </p>

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="mt-4 h-10 px-5 rounded-xl border-2 border-[#DC2626] text-[#DC2626] font-display font-semibold text-sm hover:bg-[#DC2626] hover:text-white transition-colors"
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2]">
          <p className="font-body text-sm text-[#DC2626] font-medium">
            Tapez «SUPPRIMER» pour confirmer la suppression définitive.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-3 w-full h-10 px-3 rounded-lg border border-[#FCA5A5] bg-white font-mono text-sm text-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            placeholder="SUPPRIMER"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={confirmText !== 'SUPPRIMER'}
              className="h-10 px-5 rounded-xl bg-[#DC2626] text-white font-display font-semibold text-sm disabled:opacity-40 hover:bg-[#B91C1C] transition-colors"
            >
              Confirmer la suppression
            </button>
            <button
              type="button"
              onClick={() => { setShowConfirm(false); setConfirmText(''); }}
              className="h-10 px-5 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-body text-sm hover:bg-[#F3F4F6] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
