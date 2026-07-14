import { buildFreeScanReport, isValidSiteDomain, normalizeDomain } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import { chromium } from 'playwright';
import { crawlPage, type ScriptContentCache } from './crawler';
import { db } from './db';
import { isTestMode } from './env';
import { buildFreeScanHtml } from './evidence/free-scan-html';
import { renderHtmlToPdf } from './pdf';
import type { FreeScanJob } from './queues';
import { writeArtifact } from './storage';

/**
 * Runs a one-off free scan of an arbitrary public URL (lead magnet). The URL's
 * host is validated and the crawler's SSRF guard blocks private targets. Stores
 * only the report row — nothing else is retained (hard rule 2).
 */
export async function handleFreeScan(job: FreeScanJob): Promise<void> {
  const row = await db.query.freeScans.findFirst({
    where: eq(schema.freeScans.id, job.freeScanId),
  });
  if (!row) return;

  await db
    .update(schema.freeScans)
    .set({ status: 'running' })
    .where(eq(schema.freeScans.id, row.id));

  try {
    const parsed = new URL(row.url);
    if (parsed.protocol !== 'https:' && !(isTestMode() && parsed.protocol === 'http:')) {
      throw new Error('Only https:// URLs can be scanned.');
    }
    const domain = normalizeDomain(parsed.host);
    if (!domain || !isValidSiteDomain(domain, { testMode: isTestMode() })) {
      throw new Error('That does not look like a public website address.');
    }

    const cache: ScriptContentCache = new Map();
    const browser = await chromium.launch({ headless: true });
    try {
      const outcome = await crawlPage(browser, row.url, cache);
      const report = buildFreeScanReport(
        row.url,
        outcome.httpStatus,
        outcome.observed,
        outcome.headers,
      );

      // One-page PDF summary, stored for the email-gated download.
      const pdf = await renderHtmlToPdf(buildFreeScanHtml(report, new Date()));
      const pdfPath = await writeArtifact(`free-scan/${row.id}.pdf`, pdf);

      await db
        .update(schema.freeScans)
        .set({
          status: 'done',
          resultJson: { ...report, pdfPath } as unknown as Record<string, unknown>,
        })
        .where(eq(schema.freeScans.id, row.id));
      console.log(`[free-scan] ${row.url}: ${report.scriptCount} scripts`);
    } finally {
      await browser.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(schema.freeScans)
      .set({ status: 'error', resultJson: { error: message.slice(0, 500) } })
      .where(eq(schema.freeScans.id, row.id));
    console.error(`[free-scan] ${row.url} failed:`, message);
  }
}
