import dns from 'node:dns/promises';
import { isForbiddenHost, isPrivateIp } from './verification';

// SSRF guards for every outbound request ScriptProof makes to a
// customer-controlled URL (domain verification, crawler page loads, external
// script fetches). SERVER-ONLY: imports node:dns, so this module is never part
// of the barrel export and must be imported via the '@scriptproof/core/net-guard'
// subpath from server code only.

export interface FetchGuardPolicy {
  /** Test/dev mode allows localhost fixtures and http; production does not. */
  testMode: boolean;
}

const MAX_REDIRECTS = 5;

/**
 * Resolves `host` and returns true only when it is safe to connect to: not a
 * forbidden name, and every resolved A/AAAA address is public. Test mode skips
 * the check so local fixtures (localhost:4820) work.
 *
 * Residual risk: Node re-resolves DNS when it actually connects, so a rebinding
 * attacker could return a public IP here and a private IP on connect. Closing
 * that fully needs connection-level IP pinning; documented in ASSUMPTIONS.md.
 */
export async function isHostConnectable(host: string, policy: FetchGuardPolicy): Promise<boolean> {
  if (policy.testMode) return true;
  const bare = host.split(':')[0] ?? host;
  if (!bare || isForbiddenHost(host)) return false;
  try {
    const addresses = await dns.lookup(bare, { all: true });
    return addresses.length > 0 && addresses.every((a) => !isPrivateIp(a.address));
  } catch {
    return false;
  }
}

/**
 * SSRF-safe fetch. Only http/https, host must resolve to a public IP, and every
 * redirect hop is re-validated (redirects are followed manually). Throws when a
 * hop targets a non-public host or an unsupported scheme.
 */
export async function safeFetch(
  url: string,
  init: RequestInit,
  policy: FetchGuardPolicy,
): Promise<Response> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const parsed = new URL(current);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error(`blocked non-http(s) request: ${parsed.protocol}`);
    }
    if (!(await isHostConnectable(parsed.host, policy))) {
      throw new Error(`blocked request to non-public host: ${parsed.host}`);
    }
    const res = await fetch(current, { ...init, redirect: 'manual' });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
    if (!location) return res;
    current = new URL(location, current).toString();
  }
  throw new Error('too many redirects');
}
