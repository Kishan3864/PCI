import dns from 'node:dns/promises';
import { DISPOSABLE_DOMAINS, PROVIDER_TYPOS, TRUSTED_PROVIDERS } from './email-domains';

/**
 * Advanced signup email vetting. SERVER-ONLY: imports node:dns, so this module
 * must be imported via the '@scriptproof/core/email-guard' subpath from server
 * code only (same pattern as net-guard).
 *
 * Pipeline:
 *   1. strict syntax check
 *   2. provider-typo detection (gmial.com → "did you mean gmail.com?")
 *   3. disposable/temp-mail blocklist
 *   4. trusted major providers → accepted immediately
 *   5. everything else (company domains) → LIVE DNS check: the domain must
 *      publish MX records (or an A/AAAA fallback per RFC 5321) to be accepted.
 * Better Auth's email-verification link remains the final proof of mailbox
 * ownership — this guard stops fake/disposable addresses before an account row
 * is ever created.
 */

export type EmailVerdict =
  | { ok: true; domain: string; kind: 'trusted-provider' | 'company-domain' }
  | {
      ok: false;
      reason: 'syntax' | 'typo' | 'disposable' | 'no-mx' | 'forbidden';
      message: string;
      suggestion?: string;
    };

export interface EmailGuardPolicy {
  /** Test/dev mode accepts reserved/local domains (e.g. scriptproof.local fixtures). */
  testMode: boolean;
  /** DNS timeout in ms (default 5000). */
  timeoutMs?: number;
}

// Pragmatic RFC 5322 subset: printable local part (no consecutive/edge dots),
// domain of 2+ labels, alphanumeric TLD of 2+ chars.
const LOCAL_RE = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const DOMAIN_RE = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function splitEmail(email: string): { local: string; domain: string } | null {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (email.length > 254 || local.length > 64) return null;
  if (!LOCAL_RE.test(local) || !DOMAIN_RE.test(domain)) return null;
  return { local, domain };
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('dns timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/** True when `domain` publishes MX records, or an A/AAAA fallback (RFC 5321 §5.1). */
export async function domainAcceptsMail(domain: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const mx = await withTimeout(dns.resolveMx(domain), timeoutMs);
    if (mx.length > 0 && mx.some((r) => r.exchange && r.exchange !== '.')) return true;
  } catch {
    // fall through to A/AAAA fallback
  }
  try {
    const a = await withTimeout(dns.lookup(domain, { all: true }), timeoutMs);
    return a.length > 0;
  } catch {
    return false;
  }
}

/**
 * Full verdict for a signup email. Never throws — DNS failures surface as
 * `{ ok: false, reason: 'no-mx' }`.
 */
export async function assessSignupEmail(
  rawEmail: string,
  policy: EmailGuardPolicy,
): Promise<EmailVerdict> {
  const email = normalizeEmail(rawEmail);
  const parts = splitEmail(email);
  if (!parts) {
    return {
      ok: false,
      reason: 'syntax',
      message: 'That does not look like a valid email address.',
    };
  }
  const { domain } = parts;

  // Local fixtures (demo@scriptproof.local, e2e) only in test mode.
  if (policy.testMode && (domain.endsWith('.local') || domain.endsWith('.test'))) {
    return { ok: true, domain, kind: 'company-domain' };
  }

  const suggestion = PROVIDER_TYPOS.get(domain);
  if (suggestion) {
    return {
      ok: false,
      reason: 'typo',
      message: `Did you mean @${suggestion}? "${domain}" is not a real mail provider.`,
      suggestion,
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: 'disposable',
      message:
        'Disposable / temporary email addresses are not allowed. Please use your real work or personal email.',
    };
  }

  // Obviously-fake TLD-less or reserved domains outside test mode.
  if (domain.endsWith('.local') || domain.endsWith('.test') || domain.endsWith('.invalid')) {
    return {
      ok: false,
      reason: 'forbidden',
      message: 'Please use a real email address.',
    };
  }

  if (TRUSTED_PROVIDERS.has(domain)) {
    return { ok: true, domain, kind: 'trusted-provider' };
  }

  // Company/custom domain → live DNS: must actually accept mail.
  const deliverable = await domainAcceptsMail(domain, policy.timeoutMs ?? 5000);
  if (!deliverable) {
    return {
      ok: false,
      reason: 'no-mx',
      message: `"${domain}" cannot receive email (no mail server found). Please use a real email address.`,
    };
  }
  return { ok: true, domain, kind: 'company-domain' };
}
