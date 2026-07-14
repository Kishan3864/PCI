import 'server-only';
import dns from 'node:dns/promises';
import {
  extractVerificationMetaContents,
  siteOrigin,
  txtRecordsContainToken,
} from '@scriptproof/core';
import { safeFetch } from '@scriptproof/core/net-guard';
import { isTestMode } from './env';

export const BOT_USER_AGENT = `ScriptProofBot/1.0 (+${process.env.BOT_INFO_URL ?? 'https://scriptproof.local/bot'})`;

/** DNS TXT verification. Test mode reads MOCK_TXT_RECORDS instead of live DNS. */
export async function checkDnsVerification(domain: string, token: string): Promise<boolean> {
  if (isTestMode() && process.env.MOCK_TXT_RECORDS) {
    let map: Record<string, string[]>;
    try {
      map = JSON.parse(process.env.MOCK_TXT_RECORDS) as Record<string, string[]>;
    } catch {
      return false;
    }
    return txtRecordsContainToken(map[domain] ?? [], token);
  }

  const host = domain.split(':')[0] ?? domain;
  try {
    const records = await dns.resolveTxt(host);
    return txtRecordsContainToken(
      records.map((chunks) => chunks.join('')),
      token,
    );
  } catch {
    return false;
  }
}

/**
 * Meta-tag verification: fetches the site root and looks for the token.
 * safeFetch enforces the SSRF guard — the target host must resolve to a public
 * IP and every redirect hop is re-validated (a public domain whose DNS or 3xx
 * points at 127.0.0.1 / 169.254.169.254 is refused in production).
 */
export async function checkMetaVerification(domain: string, token: string): Promise<boolean> {
  const testMode = isTestMode();
  try {
    const res = await safeFetch(
      siteOrigin(domain, { testMode }),
      {
        headers: { 'user-agent': BOT_USER_AGENT },
        signal: AbortSignal.timeout(15_000),
      },
      { testMode },
    );
    if (!res.ok) return false;
    const html = await res.text();
    return extractVerificationMetaContents(html).includes(token);
  } catch {
    return false;
  }
}
