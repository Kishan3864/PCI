import { TRACKED_HEADERS } from './headers';
import type { ObservedScript } from './types';

/** Free scans allowed per IP per rolling 24h window (lead-magnet rate limit). */
export const FREE_SCAN_DAILY_LIMIT = 3;

export interface FreeScanHeaderResult {
  header: string;
  present: boolean;
  value: string | null;
}

export interface FreeScanScript {
  srcUrl: string | null;
  isInline: boolean;
  sriPresent: boolean;
  byteSize: number;
}

export interface FreeScanReport {
  url: string;
  httpStatus: number;
  scriptCount: number;
  externalScriptCount: number;
  inlineScriptCount: number;
  externalDomains: string[];
  scriptsWithSri: number;
  scriptsWithoutSri: number;
  securityHeaders: FreeScanHeaderResult[];
  /** Present security headers (of the tracked set). */
  headersPresent: number;
  headersTotal: number;
  scripts: FreeScanScript[];
}

/** Builds the one-off scanner report from a crawl outcome. Pure + testable. */
export function buildFreeScanReport(
  url: string,
  httpStatus: number,
  observed: ObservedScript[],
  headers: Record<string, string>,
): FreeScanReport {
  const external = observed.filter((s) => !s.isInline);
  const inline = observed.filter((s) => s.isInline);

  const domains = new Set<string>();
  for (const s of external) {
    if (s.srcUrl) {
      try {
        domains.add(new URL(s.srcUrl).host);
      } catch {
        // ignore unparseable src
      }
    }
  }

  const securityHeaders: FreeScanHeaderResult[] = TRACKED_HEADERS.map((header) => {
    const value = headers[header];
    const present = value !== undefined && value.trim() !== '';
    return { header, present, value: present ? value : null };
  });

  const externalWithSri = external.filter((s) => s.sriPresent).length;

  return {
    url,
    httpStatus,
    scriptCount: observed.length,
    externalScriptCount: external.length,
    inlineScriptCount: inline.length,
    externalDomains: [...domains].sort(),
    scriptsWithSri: externalWithSri,
    scriptsWithoutSri: external.length - externalWithSri,
    securityHeaders,
    headersPresent: securityHeaders.filter((h) => h.present).length,
    headersTotal: securityHeaders.length,
    scripts: observed.map((s) => ({
      srcUrl: s.srcUrl,
      isInline: s.isInline,
      sriPresent: s.sriPresent,
      byteSize: s.byteSize,
    })),
  };
}
