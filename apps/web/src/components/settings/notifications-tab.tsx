'use client';

import { useState } from 'react';
import type { CurrentUser } from '@/hooks/use-current-user';

type NotifPrefs = {
  email: boolean;
  push: boolean;
  sms: boolean;
  tribes: boolean;
  marketing: boolean;
};

export function NotificationsTab({ user }: { user: CurrentUser }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(
    user.notificationPrefs ?? {
      email: true,
      push: true,
      sms: false,
      tribes: true,
      marketing: false,
    },
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof NotifPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    // TODO: appel API PUT /users/users/:id/notifications
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-[#0D0F2E]">Préférences de notifications</h3>
        <p className="font-mono text-[11px] text-[#6B7280] mt-1">
          Choisissez comment et quand vous souhaitez être notifié.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card divide-y divide-[#F3F4F6]">
        <ToggleRow
          label="Notifications par email"
          description="Recevez un email pour les messages importants et les mises à jour."
          checked={prefs.email}
          onChange={() => toggle('email')}
        />
        <ToggleRow
          label="Notifications push"
          description="Notifications en temps réel dans votre navigateur."
          checked={prefs.push}
          onChange={() => toggle('push')}
        />
        <ToggleRow
          label="Notifications SMS"
          description="Recevez des alertes urgentes par SMS."
          checked={prefs.sms}
          onChange={() => toggle('sms')}
        />
        <ToggleRow
          label="Activité des tribus"
          description="Nouveaux posts, événements et réactions dans vos tribus."
          checked={prefs.tribes}
          onChange={() => toggle('tribes')}
        />
        <ToggleRow
          label="Communications marketing"
          description="Offres spéciales, nouveautés et actualités Yunicity."
          checked={prefs.marketing}
          onChange={() => toggle('marketing')}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold hover:bg-[#1A1ECC] disabled:opacity-60 transition-colors"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && (
          <span className="font-body text-sm text-[#16A34A] font-medium">
            Préférences enregistrées ✓
          </span>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
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
    <div className="flex items-center justify-between p-5">
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
