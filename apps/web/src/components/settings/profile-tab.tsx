'use client';

import { useState } from 'react';
import type { CurrentUser, ProfileType } from '@/hooks/use-current-user';

const TYPE_OPTIONS: { value: ProfileType; label: string }[] = [
  { value: 'yunicitizen', label: 'Citoyen' },
  { value: 'commercial', label: 'Commerce' },
  { value: 'association', label: 'Association' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'ecole', label: 'École' },
];

export function ProfileTab({ user }: { user: CurrentUser }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [city, setCity] = useState(user.city);
  const [quartier, setQuartier] = useState(user.quartier ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [profileType] = useState(user.profileType);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: appel API PUT /users/users/:id
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-[#0D0F2E]">Informations personnelles</h3>
        <p className="font-mono text-[11px] text-[#6B7280] mt-1">
          Ces informations sont visibles sur votre profil public.
        </p>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2A2FFF] flex items-center justify-center text-white font-display font-bold text-xl">
          {displayName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <button
            type="button"
            className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-sm font-body font-medium text-[#0D0F2E] hover:bg-[#F3F4F6] transition-colors"
          >
            Changer la photo
          </button>
          <p className="font-mono text-[10px] text-[#9CA3AF] mt-1">JPG, PNG. Max 2 Mo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom affiché" required>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            maxLength={60}
          />
        </Field>

        <Field label="Type de profil">
          <select disabled className="input-field bg-[#F9FAFB] cursor-not-allowed" value={profileType}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="font-mono text-[10px] text-[#9CA3AF] mt-1">
            Contactez le support pour changer de type.
          </p>
        </Field>

        <Field label="Ville" required>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field"
          />
        </Field>

        <Field label="Quartier">
          <input
            type="text"
            value={quartier}
            onChange={(e) => setQuartier(e.target.value)}
            className="input-field"
            placeholder="Ex: Croix-Rouge"
          />
        </Field>

        <Field label="Téléphone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="+33 6 12 34 56 78"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={user.email}
            disabled
            className="input-field bg-[#F9FAFB] cursor-not-allowed"
          />
          <p className="font-mono text-[10px] text-[#9CA3AF] mt-1">
            Contactez le support pour changer d'email.
          </p>
        </Field>
      </div>

      <Field label="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input-field min-h-[80px] resize-y"
          maxLength={300}
          placeholder="Décrivez-vous en quelques mots..."
        />
        <p className="font-mono text-[10px] text-[#9CA3AF] mt-1 text-right">{bio.length}/300</p>
      </Field>

      {/* Champs spécifiques par type de profil */}
      {(profileType === 'commercial' || profileType === 'freelance') && (
        <SpecificFieldsCommercial user={user} />
      )}
      {profileType === 'association' && <SpecificFieldsAssociation user={user} />}
      {profileType === 'ecole' && <SpecificFieldsEcole user={user} />}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold hover:bg-[#1A1ECC] disabled:opacity-60 transition-colors"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && (
          <span className="font-body text-sm text-[#16A34A] font-medium">
            Modifications enregistrées ✓
          </span>
        )}
      </div>
    </form>
  );
}

function SpecificFieldsCommercial({ user }: { user: CurrentUser }) {
  const [siret, setSiret] = useState(user.siret ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [hours, setHours] = useState(user.hours ?? '');
  const [website, setWebsite] = useState(user.website ?? '');

  return (
    <div className="border-t border-[#F3F4F6] pt-6">
      <h3 className="font-display font-bold text-[#0D0F2E]">Informations professionnelles</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="SIRET">
          <input type="text" value={siret} onChange={(e) => setSiret(e.target.value)} className="input-field" placeholder="352 999 993 00037" />
        </Field>
        <Field label="Adresse">
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
        </Field>
        <Field label="Horaires">
          <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} className="input-field" placeholder="Lun-Ven 9h-18h" />
        </Field>
        <Field label="Site web">
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" placeholder="https://..." />
        </Field>
      </div>
    </div>
  );
}

function SpecificFieldsAssociation({ user }: { user: CurrentUser }) {
  const [rna, setRna] = useState(user.rna ?? '');
  const [address, setAddress] = useState(user.address ?? '');

  return (
    <div className="border-t border-[#F3F4F6] pt-6">
      <h3 className="font-display font-bold text-[#0D0F2E]">Informations association</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Numéro RNA">
          <input type="text" value={rna} onChange={(e) => setRna(e.target.value)} className="input-field" placeholder="W512345678" />
        </Field>
        <Field label="Adresse du siège">
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
        </Field>
      </div>
    </div>
  );
}

function SpecificFieldsEcole({ user }: { user: CurrentUser }) {
  const [uai, setUai] = useState(user.uai ?? '');
  const [address, setAddress] = useState(user.address ?? '');

  return (
    <div className="border-t border-[#F3F4F6] pt-6">
      <h3 className="font-display font-bold text-[#0D0F2E]">Informations établissement</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Code UAI">
          <input type="text" value={uai} onChange={(e) => setUai(e.target.value)} className="input-field" placeholder="0511234A" />
        </Field>
        <Field label="Adresse">
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B7280]">
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
