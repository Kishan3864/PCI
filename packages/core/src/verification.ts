import { randomBytes } from 'node:crypto';
import { isIP } from 'node:net';

export function generateVerifyToken(): string {
  return randomBytes(16).toString('hex');
}

export function txtRecordValue(token: string): string {
  return `scriptproof-verify=${token}`;
}

/** `records` as returned by dns.resolveTxt (chunked) or already-flat strings. */
export function txtRecordsContainToken(records: Array<string | string[]>, token: string): boolean {
  const expected = txtRecordValue(token);
  return records.some((r) => (Array.isArray(r) ? r.join('') : r).trim() === expected);
}

const META_TAG_RE = /<meta\b[^>]*>/gi;
const ATTR_RE = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

/** Extracts content values of `<meta name="scriptproof-verify" content="...">` tags. */
export function extractVerificationMetaContents(html: string): string[] {
  const results: string[] = [];
  for (const tag of html.match(META_TAG_RE) ?? []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(ATTR_RE)) {
      const name = m[1]?.toLowerCase();
      const value = m[3] ?? m[4] ?? m[5] ?? '';
      if (name) attrs[name] = value;
    }
    if (attrs['name']?.toLowerCase() === 'scriptproof-verify' && attrs['content']) {
      results.push(attrs['content'].trim());
    }
  }
  return results;
}

/**
 * Normalizes user-entered domain input: strips scheme, path, query, fragment,
 * credentials and trailing dots; lowercases. Keeps an explicit port (needed for
 * localhost fixtures in test mode). Returns null when unparseable.
 */
export function normalizeDomain(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname) return null;
    const host = url.hostname.replace(/\.+$/, '');
    if (!/^[a-z0-9.-]+$/.test(host)) return null;
    return url.port ? `${host}:${url.port}` : host;
  } catch {
    return null;
  }
}

const PRIVATE_V4_RANGES: Array<[number, number]> = [
  // [network, prefix bits]
  [ipv4ToInt('0.0.0.0'), 8],
  [ipv4ToInt('10.0.0.0'), 8],
  [ipv4ToInt('100.64.0.0'), 10],
  [ipv4ToInt('127.0.0.0'), 8],
  [ipv4ToInt('169.254.0.0'), 16],
  [ipv4ToInt('172.16.0.0'), 12],
  [ipv4ToInt('192.168.0.0'), 16],
];

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, part) => acc * 256 + Number(part), 0);
}

/** True for loopback, RFC1918, link-local, CGNAT and private/unique-local IPv6. */
export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const value = ipv4ToInt(ip);
    return PRIVATE_V4_RANGES.some(([network, bits]) => {
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      return (value & mask) >>> 0 === network;
    });
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    // unique-local fc00::/7, link-local fe80::/10, IPv4-mapped
    if (/^f[cd]/.test(lower) || lower.startsWith('fe8') || lower.startsWith('fe9')) return true;
    if (lower.startsWith('fea') || lower.startsWith('feb')) return true;
    if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice('::ffff:'.length));
    return false;
  }
  return false;
}

/** Hostnames the crawler and verifier must never touch in production (SSRF guard). */
export function isForbiddenHost(hostWithOptionalPort: string): boolean {
  const host = hostWithOptionalPort.split(':')[0] ?? '';
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.home.arpa'))
    return true;
  if (!host.includes('.')) return true; // bare hostnames (intranet)
  if (isIP(host) && isPrivateIp(host)) return true;
  return false;
}

export interface DomainPolicy {
  /** Test mode allows http and localhost fixture domains. */
  testMode: boolean;
}

const PUBLIC_DOMAIN_RE = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

/** Validates a normalized domain for site creation under the given policy. */
export function isValidSiteDomain(domain: string, policy: DomainPolicy): boolean {
  if (policy.testMode) {
    const host = domain.split(':')[0] ?? '';
    return host === 'localhost' || (PUBLIC_DOMAIN_RE.test(host) && !isForbiddenHost(domain));
  }
  if (domain.includes(':')) return false; // no explicit ports in production
  return PUBLIC_DOMAIN_RE.test(domain) && !isForbiddenHost(domain);
}

/** Origin used to fetch the site's pages (verification, crawling). */
export function siteOrigin(domain: string, policy: DomainPolicy): string {
  return `${policy.testMode ? 'http' : 'https'}://${domain}`;
}

/** A monitored page URL must live exactly on the verified domain. */
export function pageUrlWithinSite(pageUrl: string, domain: string, policy: DomainPolicy): boolean {
  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return false;
  }
  const allowedProtocols = policy.testMode ? ['https:', 'http:'] : ['https:'];
  if (!allowedProtocols.includes(url.protocol)) return false;
  return url.host.toLowerCase() === domain.toLowerCase();
}
