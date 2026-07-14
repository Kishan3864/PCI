import { DISCLAIMER } from '@scriptproof/core';

export interface EvidenceScript {
  label: string;
  status: string;
  justification: string | null;
  justifiedByName: string | null;
  justifiedAt: Date | null;
  hash: string | null;
  sri: boolean;
  isInline: boolean;
}

export interface EvidenceChange {
  type: string;
  severity: string;
  summary: string;
  pageLabel: string;
  detectedAt: Date;
  acknowledgedAt: Date | null;
}

export interface EvidenceHeaderChange {
  header: string;
  before: string | null;
  after: string | null;
  detectedAt: Date;
}

export interface EvidenceScan {
  pageLabel: string;
  startedAt: Date;
  status: string;
}

export interface EvidenceData {
  orgName: string;
  logoDataUri: string | null; // white-label (Agency)
  siteDomain: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  scripts: EvidenceScript[];
  currentHeaders: Array<{ header: string; value: string | null }>;
  headerChanges: EvidenceHeaderChange[];
  changes: EvidenceChange[];
  scans: EvidenceScan[];
}

const CHANGE_LABELS: Record<string, string> = {
  new_script: 'New script detected',
  script_modified: 'Script content changed',
  script_removed: 'Authorized script missing',
  header_changed: 'Security header changed',
  sri_removed: 'SRI integrity attribute removed',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const statusColor: Record<string, string> = {
  authorized: '#047857',
  pending: '#b45309',
  blocked: '#b91c1c',
};

const severityColor: Record<string, string> = {
  critical: '#b91c1c',
  warning: '#b45309',
  info: '#0369a1',
};

/** Builds the Evidence Pack HTML (self-contained; rendered to PDF by renderHtmlToPdf). */
export function buildEvidenceHtml(data: EvidenceData): string {
  const scriptRows = data.scripts
    .map(
      (s) => `<tr>
      <td class="mono">${esc(s.label)}${s.isInline ? ' <span class="tag">inline</span>' : ''}</td>
      <td><span style="color:${statusColor[s.status] ?? '#334155'};font-weight:600;text-transform:capitalize">${esc(s.status)}</span></td>
      <td>${s.justification ? esc(s.justification) : '<span class="muted">—</span>'}</td>
      <td>${s.justifiedByName ? esc(s.justifiedByName) : '<span class="muted">—</span>'}<br><span class="muted">${fmtDate(s.justifiedAt)}</span></td>
      <td class="mono small">${s.hash ? esc(s.hash.slice(0, 16)) : '—'}</td>
      <td>${s.isInline ? '<span class="muted">n/a</span>' : s.sri ? 'Yes' : 'No'}</td>
    </tr>`,
    )
    .join('');

  const changeRows =
    data.changes.length > 0
      ? data.changes
          .map(
            (c) => `<tr>
        <td>${fmtDate(c.detectedAt)}</td>
        <td>${esc(c.pageLabel)}</td>
        <td>${esc(CHANGE_LABELS[c.type] ?? c.type)}</td>
        <td><span style="color:${severityColor[c.severity] ?? '#334155'};font-weight:600;text-transform:capitalize">${esc(c.severity)}</span></td>
        <td class="mono small">${esc(c.summary)}</td>
        <td>${c.acknowledgedAt ? fmtDate(c.acknowledgedAt) : '<span class="muted">Not acknowledged</span>'}</td>
      </tr>`,
          )
          .join('')
      : `<tr><td colspan="6" class="muted" style="text-align:center;padding:16px">No changes detected in this period.</td></tr>`;

  const headerRows = data.currentHeaders
    .map(
      (h) => `<tr>
      <td class="mono small">${esc(h.header)}</td>
      <td class="mono small">${h.value ? esc(h.value) : '<span class="muted">missing</span>'}</td>
    </tr>`,
    )
    .join('');

  const headerChangeRows =
    data.headerChanges.length > 0
      ? data.headerChanges
          .map(
            (h) => `<tr>
        <td>${fmtDate(h.detectedAt)}</td>
        <td class="mono small">${esc(h.header)}</td>
        <td class="mono small">${h.before ? esc(h.before) : '<span class="muted">—</span>'}</td>
        <td class="mono small">${h.after ? esc(h.after) : '<span class="muted">—</span>'}</td>
      </tr>`,
          )
          .join('')
      : `<tr><td colspan="4" class="muted" style="text-align:center;padding:12px">No security-header changes in this period.</td></tr>`;

  const scanRows = data.scans
    .map(
      (s) => `<tr>
      <td>${fmtDate(s.startedAt)}</td>
      <td>${esc(s.pageLabel)}</td>
      <td style="text-transform:capitalize">${esc(s.status)}</td>
    </tr>`,
    )
    .join('');

  const scanCount = data.scans.filter((s) => s.status === 'success').length;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; font-size: 11px; margin: 0; }
  .footer { position: fixed; bottom: -12mm; left: 0; right: 0; font-size: 7.5px; color: #94a3b8; line-height: 1.4; padding-top: 4px; border-top: 1px solid #e2e8f0; }
  h1 { color: #0b2545; font-size: 24px; margin: 0 0 4px; }
  h2 { color: #0b2545; font-size: 15px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #0b2545; }
  .cover { page-break-after: always; padding-top: 40mm; }
  .cover .brand { font-size: 13px; font-weight: 700; color: #0b2545; letter-spacing: .04em; text-transform: uppercase; }
  .cover .logo { max-height: 48px; margin-bottom: 20px; }
  .cover dl { margin-top: 28px; font-size: 12px; }
  .cover dt { color: #64748b; margin-top: 10px; }
  .cover dd { margin: 2px 0 0; font-weight: 600; color: #0b2545; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { text-align: left; font-size: 8px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; border-bottom: 1px solid #cbd5e1; padding: 5px 6px; }
  td { padding: 5px 6px; border-bottom: 1px solid #eef2f6; vertical-align: top; }
  .mono { font-family: 'Consolas', 'Menlo', monospace; word-break: break-all; }
  .small { font-size: 9px; }
  .muted { color: #94a3b8; }
  .tag { background:#e2e8f0; border-radius:3px; padding:0 4px; font-size:8px; }
  .lead { color:#475569; margin: 4px 0 0; }
  .note { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; font-size:9.5px; color:#475569; margin-top:8px;}
</style>
</head>
<body>
  <div class="footer">${esc(DISCLAIMER)}</div>

  <section class="cover">
    ${data.logoDataUri ? `<img class="logo" src="${data.logoDataUri}" alt="logo">` : `<div class="brand">ScriptProof</div>`}
    <h1>PCI DSS Script Monitoring Evidence Pack</h1>
    <p class="lead">Supporting evidence for requirements 6.4.3 and 11.6.1</p>
    <dl>
      <dt>Site</dt><dd>${esc(data.siteDomain)}</dd>
      <dt>Organization</dt><dd>${esc(data.orgName)}</dd>
      <dt>Reporting period</dt><dd>${fmtDay(data.periodStart)} – ${fmtDay(data.periodEnd)}</dd>
      <dt>Generated</dt><dd>${fmtDate(data.generatedAt)}</dd>
    </dl>
    <div class="note">This document summarizes the payment-page script inventory, change history,
    HTTP header monitoring, and scan cadence recorded by ScriptProof for the site and period above.
    It is intended as supporting evidence to attach to your self-assessment questionnaire.</div>
  </section>

  <h2>Section A — Script Inventory &amp; Authorization (supports Req 6.4.3)</h2>
  <table>
    <thead><tr><th>Script</th><th>Status</th><th>Justification</th><th>Authorized by</th><th>Current hash (sha256)</th><th>SRI</th></tr></thead>
    <tbody>${scriptRows || '<tr><td colspan="6" class="muted" style="text-align:center;padding:16px">No scripts recorded.</td></tr>'}</tbody>
  </table>

  <h2>Section B — Change &amp; Tamper Detection Log (supports Req 11.6.1)</h2>
  <table>
    <thead><tr><th>Detected</th><th>Page</th><th>Type</th><th>Severity</th><th>Detail</th><th>Acknowledged</th></tr></thead>
    <tbody>${changeRows}</tbody>
  </table>

  <h2>Section C — HTTP Header Monitoring</h2>
  <p class="lead">Current security-relevant response headers</p>
  <table>
    <thead><tr><th>Header</th><th>Current value</th></tr></thead>
    <tbody>${headerRows}</tbody>
  </table>
  <p class="lead" style="margin-top:12px">Header changes during the period</p>
  <table>
    <thead><tr><th>Detected</th><th>Header</th><th>Before</th><th>After</th></tr></thead>
    <tbody>${headerChangeRows}</tbody>
  </table>

  <h2>Section D — Scan Cadence</h2>
  <div class="note">${scanCount} successful scan${scanCount === 1 ? '' : 's'} recorded in this period,
  demonstrating the payment page was checked for change and tampering. Requirement 11.6.1 asks for
  at least weekly checks.</div>
  <table>
    <thead><tr><th>Scan time</th><th>Page</th><th>Status</th></tr></thead>
    <tbody>${scanRows || '<tr><td colspan="3" class="muted" style="text-align:center;padding:16px">No scans recorded.</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}
