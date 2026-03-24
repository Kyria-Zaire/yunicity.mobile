import { env } from '../config/env.js';

const DEFAULT = ['user-service'];

function list(): string[] {
  const raw = env.INTERNAL_SERVICE_NAMES?.trim();
  if (!raw) return DEFAULT;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function isTrustedInternalService(
  header: string | string[] | undefined,
): boolean {
  const v = Array.isArray(header) ? header[0] : header;
  if (typeof v !== 'string' || !v.trim()) return false;
  return list().includes(v.trim());
}
