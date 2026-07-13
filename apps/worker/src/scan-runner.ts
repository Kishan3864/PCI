import {
  diffScan,
  PER_SITE_FETCH_INTERVAL_MS,
  sha256Hex,
  type KnownScript,
  type ObservedScript,
} from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, desc, eq, ne } from 'drizzle-orm';
import type PgBoss from 'pg-boss';
import { chromium, type Browser } from 'playwright';
import { crawlPage, type ScriptContentCache } from './crawler';
import { db } from './db';
import { ALERT_DISPATCH, type AlertDispatchJob, type ScanSiteJob } from './queues';
import { isPageDue } from './scheduler';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PageRow = typeof schema.pages.$inferSelect;

/**
 * Handles a `scan.site` job: scans the site's due (or requested) pages
 * sequentially with ≥2s spacing — never concurrently — per crawler etiquette.
 */
export async function handleScanSite(job: ScanSiteJob, boss: PgBoss): Promise<void> {
  const site = await db.query.sites.findFirst({ where: eq(schema.sites.id, job.siteId) });
  if (!site || !site.verifiedAt) {
    console.log(`[scan] skipping site ${job.siteId}: not found or unverified`);
    return;
  }

  let pages = await db.query.pages.findMany({
    where: and(eq(schema.pages.siteId, site.id), eq(schema.pages.isActive, true)),
  });
  if (job.pageIds && job.pageIds.length > 0) {
    const wanted = new Set(job.pageIds);
    pages = pages.filter((p) => wanted.has(p.id));
  }
  if (!job.force) {
    const now = new Date();
    pages = pages.filter((p) => isPageDue(p.lastScanAt, p.scanFrequency, now));
  }
  if (pages.length === 0) return;

  const cache: ScriptContentCache = new Map();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [index, page] of pages.entries()) {
      if (index > 0) await sleep(PER_SITE_FETCH_INTERVAL_MS);
      await scanOnePage(browser, site.id, page, cache, boss);
    }
  } finally {
    await browser.close();
  }
}

async function scanOnePage(
  browser: Browser,
  siteId: string,
  page: PageRow,
  cache: ScriptContentCache,
  boss: PgBoss,
): Promise<void> {
  const [scan] = await db
    .insert(schema.scans)
    .values({ pageId: page.id, status: 'running' })
    .returning();
  if (!scan) throw new Error('failed to insert scan row');

  try {
    const outcome = await crawlPage(browser, page.url, cache);

    // Previous successful scan of this page → headers baseline & isBaseline flag.
    const prevScan = await db.query.scans.findFirst({
      where: and(
        eq(schema.scans.pageId, page.id),
        eq(schema.scans.status, 'success'),
        ne(schema.scans.id, scan.id),
      ),
      orderBy: desc(schema.scans.startedAt),
      with: { headerSnapshots: true },
    });
    const prevHeaders = prevScan?.headerSnapshots[0]?.headersJson ?? null;

    const knownRows = await db.query.scripts.findMany({
      where: eq(schema.scripts.siteId, siteId),
    });
    const known: KnownScript[] = knownRows.map((s) => ({
      id: s.id,
      urlKey: s.urlKey,
      isInline: s.isInline,
      status: s.status,
      latestSha256: s.latestSha256,
      latestSriPresent: s.latestSriPresent,
      missingStreak: s.missingStreak,
      expectedOnPage: s.lastSeenPageId === page.id,
    }));

    const result = diffScan({
      pageLabel: page.label,
      isBaseline: !prevScan,
      observed: outcome.observed,
      known,
      headers: outcome.headers,
      prevHeaders,
    });

    const now = new Date();
    const criticalChangeIds: string[] = [];

    await db.transaction(async (tx) => {
      await tx
        .update(schema.scans)
        .set({ status: 'success', finishedAt: now, httpStatus: outcome.httpStatus })
        .where(eq(schema.scans.id, scan.id));

      const headersHash = sha256Hex(
        JSON.stringify(Object.entries(outcome.headers).sort(([a], [b]) => a.localeCompare(b))),
      );
      await tx
        .insert(schema.headerSnapshots)
        .values({ scanId: scan.id, headersJson: outcome.headers, headersHash });

      // New inventory rows (pending review — 6.4.3 workflow starts here).
      const createdByKey = new Map<string, string>();
      if (result.toCreate.length > 0) {
        const created = await tx
          .insert(schema.scripts)
          .values(
            result.toCreate.map((o: ObservedScript) => ({
              siteId,
              urlKey: o.urlKey,
              srcUrl: o.srcUrl,
              isInline: o.isInline,
              status: 'pending' as const,
              firstSeenAt: now,
              lastSeenAt: now,
              lastSeenPageId: page.id,
              latestSha256: o.sha256,
              latestByteSize: o.byteSize,
              latestSriPresent: o.sriPresent,
            })),
          )
          .returning({ id: schema.scripts.id, urlKey: schema.scripts.urlKey });
        for (const row of created) createdByKey.set(row.urlKey, row.id);
      }

      for (const update of result.updates) {
        await tx
          .update(schema.scripts)
          .set(
            update.seen
              ? {
                  lastSeenAt: now,
                  lastSeenPageId: page.id,
                  missingStreak: update.missingStreak,
                  latestSha256: update.latestSha256,
                  latestByteSize: update.latestByteSize,
                  latestSriPresent: update.latestSriPresent,
                  srcUrl: update.srcUrl,
                }
              : { missingStreak: update.missingStreak },
          )
          .where(eq(schema.scripts.id, update.scriptId));
      }

      const knownByKey = new Map(known.map((k) => [k.urlKey, k.id]));
      const scriptIdFor = (urlKey: string | null): string | null =>
        urlKey ? (knownByKey.get(urlKey) ?? createdByKey.get(urlKey) ?? null) : null;

      if (outcome.observed.length > 0) {
        await tx.insert(schema.scriptObservations).values(
          outcome.observed.flatMap((o) => {
            const scriptId = scriptIdFor(o.urlKey);
            if (!scriptId) return [];
            return [
              {
                scanId: scan.id,
                scriptId,
                sha256: o.sha256,
                byteSize: o.byteSize,
                sriPresent: o.sriPresent,
                attrs: o.attrs,
              },
            ];
          }),
        );
      }

      if (result.changes.length > 0) {
        const inserted = await tx
          .insert(schema.changes)
          .values(
            result.changes.map((c) => ({
              pageId: page.id,
              scriptId: c.scriptId ?? scriptIdFor(c.urlKey),
              type: c.type,
              severity: c.severity,
              detail: c.detail,
              detectedAt: now,
            })),
          )
          .returning({ id: schema.changes.id, severity: schema.changes.severity });
        criticalChangeIds.push(...inserted.filter((c) => c.severity === 'critical').map((c) => c.id));
      }

      await tx
        .update(schema.pages)
        .set({ lastScanAt: now, updatedAt: now })
        .where(eq(schema.pages.id, page.id));
    });

    // Critical → immediate alert. Warning/info wait for the daily digest.
    for (const changeId of criticalChangeIds) {
      const payload: AlertDispatchJob = { changeId };
      await boss.send(ALERT_DISPATCH, { ...payload });
    }

    console.log(
      `[scan] ${page.url}: ${outcome.observed.length} scripts, ` +
        `${result.toCreate.length} new, ${result.changes.length} changes`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(schema.scans)
      .set({ status: 'error', finishedAt: new Date(), error: message.slice(0, 2000) })
      .where(eq(schema.scans.id, scan.id));
    console.error(`[scan] ${page.url} failed:`, message);
  }
}
