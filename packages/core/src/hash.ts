import { createHash } from 'node:crypto';

export function sha256Hex(input: string | Uint8Array): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Short display form of a hash-ish value; tolerant of non-strings (JSONB detail). */
export function shortHashSafe(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? `${value.slice(0, 12)}…` : '—';
}
