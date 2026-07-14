import { planAllows, shortHashSafe } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, asc, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import type PgBoss from 'pg-boss';
import { db } from './db';
import {
  buildEvidenceHtml,
  type EvidenceChange,
  type EvidenceData,
  type EvidenceHeaderChange,
  type EvidenceScan,
  type EvidenceScript,
} from './evidence/report-html';
import { renderHtmlToPdf } from './pdf';
import { EVIDENCE_GENERATE, type EvidenceGenerateJob } from './queues';
import { writeArtifact } from './storage';

function changeSummary(type: string, detail: Record<string, unknown>): string {
  const src = typeof detail.srcUrl === 'string' ? detail.srcUrl : null;
  if (type === 'header_changed') return String(detail.header ?? 'header');
  if (type === 'script_removed') return String(detail.urlKey ?? 'script');
  if (type === 'script_modified') {
    return `${src ?? 'script'} ${shortHashSafe(detail.before)}→${shortHashSafe(detail.after)}`;
  }
  return (
    src ?? (typeof detail.sha256 === 'string' ? `inline ${detail.sha256.slice(0, 12)}` : 'script')
  );
}

/** Generates one Evidence Pack PDF for a site + period, storing the row + file. */
export async function handleEvidenceGenerate(job: EvidenceGenerateJob): Promise<void> {
  const periodStart = new Date(job.periodStart);
  const periodEnd = new Date(job.periodEnd);

  const site = await db.query.sites.findFirst({ where: eq(schema.sites.id, job.siteId) });
  if (!site) return;
  const org = await db.query.orgs.findFirst({ where: eq(schema.orgs.id, site.orgId) });
  if (!org) return;

  const pages = await db.query.pages.findMany({ where: eq(schema.pages.siteId, site.id) });
  const pageIds = pages.map((p) => p.id);
  const pageLabel = new Map(pages.map((p) => [p.id, p.label]));

  // Section A — inventory
  const scriptRows = await db.query.scripts.findMany({
    where: eq(schema.scripts.siteId, site.id),
    orderBy: [asc(schema.scripts.status)],
  });
  const justifierIds = [
    ...new Set(scriptRows.map((s) => s.justifiedBy).filter(Boolean)),
  ] as string[];
  const justifiers = justifierIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, justifierIds) })
    : [];
  const justifierName = new Map(justifiers.map((u) => [u.id, u.name]));
  const scripts: EvidenceScript[] = scriptRows.map((s) => ({
    label: s.srcUrl ?? `inline (${shortHashSafe(s.latestSha256)})`,
    status: s.status,
    justification: s.justification,
    justifiedByName: s.justifiedBy ? (justifierName.get(s.justifiedBy) ?? null) : null,
    justifiedAt: s.justifiedAt,
    hash: s.latestSha256,
    sri: s.latestSriPresent,
    isInline: s.isInline,
  }));

  // Sections B & C(changes) — changes in period
  const changeRows = pageIds.length
    ? await db.query.changes.findMany({
        where: and(
          inArray(schema.changes.pageId, pageIds),
          gte(schema.changes.detectedAt, periodStart),
          lte(schema.changes.detectedAt, periodEnd),
        ),
        orderBy: desc(schema.changes.detectedAt),
      })
    : [];
  const changes: EvidenceChange[] = changeRows.map((c) => ({
    type: c.type,
    severity: c.severity,
    summary: changeSummary(c.type, c.detail),
    pageLabel: pageLabel.get(c.pageId) ?? '',
    detectedAt: c.detectedAt,
    acknowledgedAt: c.acknowledgedAt,
  }));
  const headerChanges: EvidenceHeaderChange[] = changeRows
    .filter((c) => c.type === 'header_changed')
    .map((c) => ({
      header: String(c.detail.header ?? ''),
      before: typeof c.detail.before === 'string' ? c.detail.before : null,
      after: typeof c.detail.after === 'string' ? c.detail.after : null,
      detectedAt: c.detectedAt,
    }));

  // Section C — current headers (latest successful scan snapshot for the site)
  let currentHeaders: Array<{ header: string; value: string | null }> = [];
  if (pageIds.length) {
    const latestScan = await db.query.scans.findFirst({
      where: and(inArray(schema.scans.pageId, pageIds), eq(schema.scans.status, 'success')),
      orderBy: desc(schema.scans.startedAt),
      with: { headerSnapshots: true },
    });
    const snap = latestScan?.headerSnapshots[0]?.headersJson ?? {};
    const tracked = [
      'content-security-policy',
      'content-security-policy-report-only',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
    ];
    currentHeaders = tracked.map((h) => ({ header: h, value: snap[h] ?? null }));
  }

  // Section D — scan cadence
  const scanRows = pageIds.length
    ? await db.query.scans.findMany({
        where: and(
          inArray(schema.scans.pageId, pageIds),
          gte(schema.scans.startedAt, periodStart),
          lte(schema.scans.startedAt, periodEnd),
        ),
        orderBy: desc(schema.scans.startedAt),
      })
    : [];
  const scans: EvidenceScan[] = scanRows.map((s) => ({
    pageLabel: pageLabel.get(s.pageId) ?? '',
    startedAt: s.startedAt,
    status: s.status,
  }));

  const data: EvidenceData = {
    orgName: org.name,
    // White-label logo (Agency plan) — org.logo may hold a data URI.
    logoDataUri: planAllows(org.plan, 'whiteLabel') && org.logo ? org.logo : null,
    siteDomain: site.domain,
    periodStart,
    periodEnd,
    generatedAt: new Date(),
    scripts,
    currentHeaders,
    headerChanges,
    changes,
    scans,
  };

  const pdf = await renderHtmlToPdf(buildEvidenceHtml(data));
  const stamp = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}`;
  const relPath = `evidence/${org.id}/${site.id}-${stamp}-${Date.now()}.pdf`;
  await writeArtifact(relPath, pdf);

  await db.insert(schema.evidenceReports).values({
    orgId: org.id,
    siteId: site.id,
    periodStart,
    periodEnd,
    pdfPath: relPath,
  });
  console.log(`[evidence] generated for ${site.domain} (${stamp})`);
}

/** Monthly cron: enqueue last-month Evidence Packs for every Pro+ site. */
export async function scheduleMonthlyEvidence(boss: PgBoss): Promise<void> {
  const now = new Date();
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));

  const sites = await db.query.sites.findMany({ with: { org: true } });
  let enqueued = 0;
  for (const site of sites) {
    if (!site.verifiedAt || !planAllows(site.org.plan, 'evidencePacks')) continue;
    const payload: EvidenceGenerateJob = {
      siteId: site.id,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
    await boss.send(EVIDENCE_GENERATE, { ...payload });
    enqueued += 1;
  }
  if (enqueued > 0) console.log(`[evidence] enqueued ${enqueued} monthly pack(s)`);
}
