import type { ObservedScript } from './types';

/** Resolves a script `src` against the page URL. Returns null when unparseable. */
export function normalizeScriptUrl(src: string, pageUrl: string): string | null {
  try {
    return new URL(src, pageUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Identity key for an external script: absolute URL without query or fragment.
 * Cache-buster queries (`app.js?v=123`) would otherwise create a new inventory
 * row per deploy; content changes still surface via hash → `script_modified`.
 */
export function scriptUrlKey(absoluteUrl: string): string {
  const u = new URL(absoluteUrl);
  u.search = '';
  u.hash = '';
  return u.toString();
}

export function inlineUrlKey(sha256: string): string {
  return `inline:${sha256}`;
}

/**
 * Dedupes observations by identity key. `sriPresent` is only kept true when
 * every tag referencing the script carries an `integrity` attribute — a single
 * unprotected tag defeats SRI for that resource.
 */
export function dedupeObserved(observed: ObservedScript[]): ObservedScript[] {
  const byKey = new Map<string, ObservedScript>();
  for (const obs of observed) {
    const existing = byKey.get(obs.urlKey);
    if (!existing) {
      byKey.set(obs.urlKey, { ...obs });
    } else {
      existing.sriPresent = existing.sriPresent && obs.sriPresent;
    }
  }
  return [...byKey.values()];
}

const PAYMENT_LABEL_HINTS = ['checkout', 'payment', 'pay', 'cart', 'billing', 'order'];

/** Pages whose label suggests payment function get `critical` new-script severity. */
export function isPaymentPage(label: string): boolean {
  const lower = label.toLowerCase();
  return PAYMENT_LABEL_HINTS.some((hint) => lower.includes(hint));
}
