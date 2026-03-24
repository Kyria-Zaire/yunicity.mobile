import { env } from '../config/env.js';

const DEFAULT_ALLOWED = [
  'user-service',
  'payment-service',
  'worker',
  'community-service',
  'notification-service',
  'moderation-service',
  'crm-service',
];

function allowedList(): string[] {
  const raw = env.INTERNAL_SERVICE_NAMES?.trim();
  if (!raw) return DEFAULT_ALLOWED;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Valide le header X-Internal-Service (valeur = nom du service appelant). */
export function isTrustedInternalService(
  header: string | string[] | undefined,
): boolean {
  const v = Array.isArray(header) ? header[0] : header;
  if (typeof v !== 'string' || !v.trim()) return false;
  return allowedList().includes(v.trim());
}
