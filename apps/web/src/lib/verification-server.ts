import 'server-only';
import dns from 'node:dns/promises';
import {
  extractScriptproofTokens,
  extractVerificationMetaContents,
  siteOrigin,
  txtRecordsContainToken,
} from '@scriptproof/core';
import { safeFetch } from '@scriptproof/core/net-guard';
import { isTestMode } from './env';

export const BOT_USER_AGENT = `ScriptProofBot/1.0 (+${process.env.BOT_INFO_URL ?? 'https://scriptproof.local/bot'})`;

export interface DnsVerificationResult {
  verified: boolean;
  /** Tokens of every scriptproof-verify record found (for stale-record hints). */
  foundTokens: string[];
}

/** DNS-over-HTTPS JSON answer (Google `dns.google` / Cloudflare `cloudflare-dns.com`). */
interface DohAnswer {
  Answer?: Array<{ type: number; data: string }>;
}

const TXT_TYPE = 16;

async function resolveTxtViaDoH(host: string, endpoint: 'google' | 'cloudflare'): Promise<string[]> {
  const url =
    endpoint === 'google'
      ? `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=TXT`
      : `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=TXT`;
  const res = await fetch(url, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(6_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`DoH ${endpoint} responded ${res.status}`);
  const body = (await res.json()) as DohAnswer;
  return (body.Answer ?? [])
    .filter((a) => a.type === TXT_TYPE)
    .map((a) => a.data.replace(/"/g, '').trim());
}

async function resolveTxtViaSystem(host: string): Promise<string[]> {
  const records = await dns.resolveTxt(host);
  return records.map((chunks) => chunks.join(''));
}

/**
 * DNS TXT verification. Queries public DoH resolvers (Google, Cloudflare) AND
 * the system resolver in parallel and unions the answers — a freshly added
 * record often reaches one resolver minutes before the others, and users bail
 * out during that gap. Test mode reads MOCK_TXT_RECORDS instead of live DNS.
 */
export async function checkDnsVerification(
  domain: string,
  token: string,
): Promise<DnsVerificationResult> {
  if (isTestMode() && process.env.MOCK_TXT_RECORDS) {
    let map: Record<string, string[]>;
    try {
      map = JSON.parse(process.env.MOCK_TXT_RECORDS) as Record<string, string[]>;
    } catch {
      return { verified: false, foundTokens: [] };
    }
    const records = map[domain] ?? [];
    return {
      verified: txtRecordsContainToken(records, token),
      foundTokens: extractScriptproofTokens(records),
    };
  }

  const host = domain.split(':')[0] ?? domain;
  const results = await Promise.allSettled([
    resolveTxtViaDoH(host, 'google'),
    resolveTxtViaDoH(host, 'cloudflare'),
    resolveTxtViaSystem(host),
  ]);
  const records = results
    .filter((r): r is PromiseFulfilledResult<string[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  return {
    verified: txtRecordsContainToken(records, token),
    foundTokens: [...new Set(extractScriptproofTokens(records))],
  };
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
