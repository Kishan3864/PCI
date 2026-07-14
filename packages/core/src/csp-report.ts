/** A normalized CSP violation extracted from either report format. */
export interface CspViolation {
  blockedUri: string;
  violatedDirective: string;
  documentUri: string;
}

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

function fromReportBody(body: Record<string, unknown>): CspViolation | null {
  const blockedUri = pick(body, ['blocked-uri', 'blockedURL', 'blockedURI']);
  const violatedDirective = pick(body, [
    'violated-directive',
    'effective-directive',
    'effectiveDirective',
  ]);
  const documentUri = pick(body, ['document-uri', 'documentURL', 'documentURI']);
  if (!blockedUri && !violatedDirective) return null;
  return {
    blockedUri: blockedUri || 'unknown',
    violatedDirective: violatedDirective || 'unknown',
    documentUri: documentUri || 'unknown',
  };
}

/**
 * Parses a CSP report payload. Accepts:
 * - legacy `application/csp-report`: `{ "csp-report": { ... } }`
 * - Reporting API `application/reports+json`: `[ { "type": "csp-violation", "body": { ... } } ]`
 * Returns the normalized violations (may be empty).
 */
export function parseCspReports(payload: unknown): CspViolation[] {
  if (!payload || typeof payload !== 'object') return [];

  // Legacy single-report shape.
  const legacy = (payload as Record<string, unknown>)['csp-report'];
  if (legacy && typeof legacy === 'object') {
    const v = fromReportBody(legacy as Record<string, unknown>);
    return v ? [v] : [];
  }

  // Reporting API: an array of reports.
  if (Array.isArray(payload)) {
    const out: CspViolation[] = [];
    for (const entry of payload) {
      if (!entry || typeof entry !== 'object') continue;
      const rec = entry as Record<string, unknown>;
      if (rec.type !== undefined && rec.type !== 'csp-violation') continue;
      const body = rec.body;
      if (body && typeof body === 'object') {
        const v = fromReportBody(body as Record<string, unknown>);
        if (v) out.push(v);
      }
    }
    return out;
  }

  return [];
}

/** Suggested Report-Only header value the merchant pastes to start collecting reports. */
export function cspReportOnlyHeader(reportUri: string): string {
  return `default-src 'self'; script-src 'self' 'unsafe-inline'; report-uri ${reportUri}`;
}
