import { DISCLAIMER, type FreeScanReport } from '@scriptproof/core';

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** One-page PDF summary of a free scan (the lead-magnet download). */
export function buildFreeScanHtml(report: FreeScanReport, generatedAt: Date): string {
  const headerRows = report.securityHeaders
    .map(
      (h) =>
        `<tr><td class="mono">${esc(h.header)}</td><td>${
          h.present
            ? '<span style="color:#047857;font-weight:600">Present</span>'
            : '<span style="color:#b91c1c;font-weight:600">Missing</span>'
        }</td></tr>`,
    )
    .join('');

  const domainRows =
    report.externalDomains.length > 0
      ? report.externalDomains.map((d) => `<li class="mono">${esc(d)}</li>`).join('')
      : '<li class="muted">None</li>';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color:#1e293b; font-size:12px; margin:0; }
  .footer { position: fixed; bottom:-12mm; left:0; right:0; font-size:8px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:4px; }
  h1 { color:#0b2545; font-size:22px; margin:0 0 2px; }
  h2 { color:#0b2545; font-size:14px; margin:18px 0 6px; border-bottom:2px solid #0b2545; padding-bottom:3px; }
  .brand { font-size:12px; font-weight:700; color:#0b2545; letter-spacing:.04em; text-transform:uppercase; }
  .lead { color:#475569; margin:2px 0 0; }
  .grid { display:flex; gap:12px; margin-top:10px; }
  .stat { flex:1; border:1px solid #e2e8f0; border-radius:6px; padding:10px; text-align:center; }
  .stat .n { font-size:22px; font-weight:700; color:#0b2545; }
  .stat .l { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:.03em; }
  table { width:100%; border-collapse:collapse; margin-top:4px; }
  td { padding:4px 6px; border-bottom:1px solid #eef2f6; }
  .mono { font-family:'Consolas','Menlo',monospace; word-break:break-all; }
  .muted { color:#94a3b8; }
  ul { margin:6px 0 0; padding-left:18px; }
</style></head><body>
  <div class="footer">${esc(DISCLAIMER)}</div>
  <div class="brand">ScriptProof</div>
  <h1>Free payment-page scan</h1>
  <p class="lead mono">${esc(report.url)}</p>
  <p class="lead">Scanned ${esc(generatedAt.toLocaleString('en-GB'))}</p>

  <div class="grid">
    <div class="stat"><div class="n">${report.scriptCount}</div><div class="l">Scripts</div></div>
    <div class="stat"><div class="n">${report.externalDomains.length}</div><div class="l">External domains</div></div>
    <div class="stat"><div class="n">${report.scriptsWithoutSri}</div><div class="l">Without SRI</div></div>
    <div class="stat"><div class="n">${report.headersPresent}/${report.headersTotal}</div><div class="l">Security headers</div></div>
  </div>

  <h2>Security headers</h2>
  <table><tbody>${headerRows}</tbody></table>

  <h2>External script domains</h2>
  <ul>${domainRows}</ul>

  <h2>What this means</h2>
  <p class="lead">This is a one-time snapshot. PCI DSS 6.4.3 and 11.6.1 ask you to keep an authorized
  inventory of these scripts and detect changes to them at least weekly. ScriptProof monitors these
  pages on a schedule, alerts you on unauthorized changes, and produces monthly evidence — start a
  free trial at scriptproof to enable ongoing monitoring.</p>
</body></html>`;
}
