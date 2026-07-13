import { analyzeCspWeakening } from './csp';
import type { ProposedChange } from './types';

/** Security-relevant headers monitored for 11.6.1 (full set is still snapshotted). */
export const TRACKED_HEADERS = [
  'content-security-policy',
  'content-security-policy-report-only',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
] as const;

/** Lowercases header names and joins multi-value headers. */
export function normalizeHeaders(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    out[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
  }
  return out;
}

/**
 * Compares tracked security headers between two scans (5.2):
 * - value changed or header removed → warning
 * - header newly added → info
 * - CSP removed entirely → critical
 * - CSP changed → warning, with weakening analysis attached when applicable
 */
export function diffTrackedHeaders(
  prevHeaders: Record<string, string>,
  headers: Record<string, string>,
): ProposedChange[] {
  const changes: ProposedChange[] = [];

  for (const header of TRACKED_HEADERS) {
    const before = prevHeaders[header] ?? null;
    const after = headers[header] ?? null;
    if (before === after) continue;

    const isCsp = header === 'content-security-policy';
    const detail: Record<string, unknown> = { header, before, after };
    let severity: ProposedChange['severity'];

    if (before !== null && after === null) {
      detail.kind = 'removed';
      severity = isCsp ? 'critical' : 'warning';
    } else if (before === null && after !== null) {
      detail.kind = 'added';
      severity = 'info';
    } else {
      detail.kind = 'modified';
      severity = 'warning';
      if (isCsp && before !== null && after !== null) {
        const weakening = analyzeCspWeakening(before, after);
        if (weakening) detail.weakening = weakening;
      }
    }

    changes.push({ type: 'header_changed', severity, scriptId: null, urlKey: null, detail });
  }

  return changes;
}
