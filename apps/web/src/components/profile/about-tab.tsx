'use client';

import Link from 'next/link';
import type { MockProfile } from './profile-types';
import { AVATAR_BG } from './profile-types';

export function AboutTab({ profile }: { profile: MockProfile }) {
  return (
    <div className="space-y-6">
      {/* Bio / Présentation */}
      <Card title="Présentation">
        <p className="font-body text-sm text-[#374151] leading-relaxed whitespace-pre-line">
          {profile.bio}
        </p>
      </Card>

      {/* Infos par type */}
      {profile.profileType === 'yunicitizen' && <YunicitizenAbout profile={profile} />}
      {profile.profileType === 'commercial' && <CommercialAbout profile={profile} />}
      {profile.profileType === 'association' && <AssociationAbout profile={profile} />}
      {profile.profileType === 'freelance' && <FreelanceAbout profile={profile} />}
      {profile.profileType === 'ecole' && <EcoleAbout profile={profile} />}

      {/* Tribus — commun */}
      {profile.tribes.length > 0 && (
        <Card title="Tribus">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.tribes.map((t) => (
              <Link
                key={t}
                href="/tribus"
                className="flex items-center gap-3 p-3 rounded-xl border border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display text-[11px]"
                  style={{ background: AVATAR_BG[profile.profileType] }}
                >
                  {t.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-[#0D0F2E]">{t}</p>
                  <p className="font-mono text-[10px] text-[#6B7280] uppercase tracking-widest">Membre</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function YunicitizenAbout({ profile }: { profile: MockProfile }) {
  return (
    <>
      <Card title="Informations">
        <div className="space-y-3">
          <InfoRow icon="📍" label="Ville" value={profile.city} />
          {profile.quartier && <InfoRow icon="🏘️" label="Quartier" value={profile.quartier} />}
          <InfoRow icon="📅" label="Membre depuis" value={profile.joinedAt} />
        </div>
      </Card>
      {profile.interests && profile.interests.length > 0 && (
        <Card title="Centres d'intérêt">
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-[#E8E9FF] text-[#2A2FFF] font-body text-sm">
                {i}
              </span>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function CommercialAbout({ profile }: { profile: MockProfile }) {
  return (
    <>
      <Card title="Coordonnées">
        <div className="space-y-3">
          {profile.address && (
            <InfoRow icon="📍" label="Adresse" value={profile.address} link={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} />
          )}
          {profile.hours && <InfoRow icon="🕒" label="Horaires" value={profile.hours} />}
          {profile.website && (
            <InfoRow icon="🌐" label="Site web" value={profile.website} link={`https://${profile.website}`} />
          )}
          {profile.phone && <InfoRow icon="📞" label="Téléphone" value={profile.phone} />}
        </div>
      </Card>

      <Card title="Informations légales">
        <div className="space-y-3">
          {profile.siret && <InfoRow icon="📋" label="SIRET" value={maskSiret(profile.siret)} />}
          {profile.activityType && <InfoRow icon="🏷️" label="Activité" value={profile.activityType} />}
        </div>
      </Card>

      {profile.tags && profile.tags.length > 0 && (
        <Card title="Spécialités">
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-body text-sm">
                #{t}
              </span>
            ))}
          </div>
        </Card>
      )}

      {profile.rating != null && (
        <Card title="Note moyenne">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-[36px] text-[#D97706]">{profile.rating}</span>
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.round(profile.rating ?? 0) ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
                ))}
              </div>
              <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">{profile.reviewCount} avis</p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function AssociationAbout({ profile }: { profile: MockProfile }) {
  return (
    <>
      <Card title="Coordonnées">
        <div className="space-y-3">
          {profile.address && (
            <InfoRow icon="📍" label="Adresse" value={profile.address} link={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} />
          )}
          {profile.phone && <InfoRow icon="📞" label="Téléphone" value={profile.phone} />}
          {profile.website && (
            <InfoRow icon="🌐" label="Site web" value={profile.website} link={`https://${profile.website}`} />
          )}
        </div>
      </Card>

      <Card title="Informations">
        <div className="space-y-3">
          {profile.rna && <InfoRow icon="📋" label="RNA" value={profile.rna} />}
          <InfoRow icon="👥" label="Membres actifs" value={String(profile.stats['members'] ?? 0)} />
          <InfoRow icon="📅" label="Membre depuis" value={profile.joinedAt} />
        </div>
      </Card>
    </>
  );
}

function FreelanceAbout({ profile }: { profile: MockProfile }) {
  return (
    <>
      <Card title="Informations professionnelles">
        <div className="space-y-3">
          {profile.specialty && <InfoRow icon="💼" label="Spécialité" value={profile.specialty} />}
          {profile.experience && <InfoRow icon="📅" label="Expérience" value={profile.experience} />}
          {profile.siret && <InfoRow icon="📋" label="SIRET" value={maskSiret(profile.siret)} />}
          {profile.availability && (
            <div className="flex items-start gap-3">
              <span className="text-base shrink-0 mt-0.5">🟢</span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">Disponibilité</p>
                <AvailabilityBadge status={profile.availability} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {profile.tags && profile.tags.length > 0 && (
        <Card title="Compétences">
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] font-body text-sm">
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function EcoleAbout({ profile }: { profile: MockProfile }) {
  return (
    <>
      <Card title="Informations">
        <div className="space-y-3">
          {profile.uai && <InfoRow icon="📋" label="Code UAI" value={profile.uai} />}
          {profile.address && (
            <InfoRow icon="📍" label="Adresse" value={profile.address} link={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} />
          )}
          {profile.phone && <InfoRow icon="📞" label="Téléphone" value={profile.phone} />}
          {profile.website && (
            <InfoRow icon="🌐" label="Site web" value={profile.website} link={`https://${profile.website}`} />
          )}
          {profile.studentCount && (
            <InfoRow icon="🎓" label="Effectifs" value={`${profile.studentCount} étudiants`} />
          )}
        </div>
      </Card>

      {profile.courses && profile.courses.length > 0 && (
        <Card title="Cours proposés">
          <div className="flex flex-wrap gap-2">
            {profile.courses.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#DC2626] font-body text-sm">
                {c}
              </span>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// ─── Shared sub-components ───

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-card p-5">
      <h3 className="font-display font-bold text-[#0D0F2E] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, link }: { icon: string; label: string; value: string; link?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">{label}</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-[#2A2FFF] hover:underline">
            {value}
          </a>
        ) : (
          <p className="font-body text-sm text-[#0D0F2E]">{value}</p>
        )}
      </div>
    </div>
  );
}

function AvailabilityBadge({ status }: { status: 'available' | 'busy' | 'on_demand' }) {
  const config = {
    available: { label: 'Disponible', bg: '#DCFCE7', color: '#16A34A' },
    busy: { label: 'Occupé', bg: '#FEE2E2', color: '#DC2626' },
    on_demand: { label: 'Sur demande', bg: '#FEF3C7', color: '#D97706' },
  };
  const c = config[status];
  return (
    <span
      className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-1"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function maskSiret(siret: string): string {
  const clean = siret.replace(/\s/g, '');
  if (clean.length <= 5) return siret;
  return clean.slice(0, 3) + ' *** *** ' + clean.slice(-5);
}
