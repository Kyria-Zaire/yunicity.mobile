'use client';

import { useState } from 'react';

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <ChangePasswordSection />
      <ActiveSessionsSection />
      <TwoFactorSection />
    </div>
  );
}

function ChangePasswordSection() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPwd.length < 12) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 12 caractères.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setSaving(true);
    // TODO: appel API POST /auth/change-password
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setMessage({ type: 'success', text: 'Mot de passe modifié avec succès.' });
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
      <h3 className="font-display font-bold text-[#0D0F2E]">Mot de passe</h3>
      <p className="font-mono text-[11px] text-[#6B7280] mt-1">
        Minimum 12 caractères, avec majuscules, chiffres et caractères spéciaux.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-md">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B7280]">
            Mot de passe actuel
          </span>
          <input
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            className="input-field mt-1.5"
            required
            autoComplete="current-password"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B7280]">
            Nouveau mot de passe
          </span>
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="input-field mt-1.5"
            required
            minLength={12}
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B7280]">
            Confirmer le nouveau mot de passe
          </span>
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            className="input-field mt-1.5"
            required
            minLength={12}
            autoComplete="new-password"
          />
        </label>

        {message && (
          <p className={`font-body text-sm ${message.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm hover:bg-[#1A1ECC] disabled:opacity-60 transition-colors"
        >
          {saving ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  );
}

function ActiveSessionsSection() {
  const sessions = [
    { id: '1', device: 'Chrome — Windows', location: 'Reims, France', current: true, lastActive: 'Maintenant' },
    { id: '2', device: 'Safari — iPhone', location: 'Reims, France', current: false, lastActive: 'il y a 3h' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
      <h3 className="font-display font-bold text-[#0D0F2E]">Sessions actives</h3>
      <p className="font-mono text-[11px] text-[#6B7280] mt-1">
        Appareils connectés à votre compte.
      </p>

      <div className="mt-4 space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-[#F3F4F6]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-base">
                {s.device.includes('iPhone') ? '📱' : '💻'}
              </div>
              <div>
                <p className="font-body text-sm text-[#0D0F2E] font-medium">
                  {s.device}
                  {s.current && (
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                      Session actuelle
                    </span>
                  )}
                </p>
                <p className="font-mono text-[10px] text-[#6B7280]">
                  {s.location} · {s.lastActive}
                </p>
              </div>
            </div>
            {!s.current && (
              <button
                type="button"
                className="font-body text-sm text-[#DC2626] hover:underline"
              >
                Révoquer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoFactorSection() {
  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-[#0D0F2E]">Authentification à deux facteurs</h3>
          <p className="font-mono text-[11px] text-[#6B7280] mt-1">
            Ajoutez une couche de sécurité supplémentaire à votre compte.
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706]">
          Bientôt
        </span>
      </div>
      <p className="font-body text-sm text-[#6B7280] mt-3">
        Fonctionnalité disponible prochainement. Vous pourrez activer l'authentification par application (TOTP) ou par SMS.
      </p>
    </div>
  );
}
