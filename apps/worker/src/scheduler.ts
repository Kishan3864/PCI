import { schema } from '@scriptproof/db';
import { isNotNull } from 'drizzle-orm';
import type PgBoss from 'pg-boss';
import { db } from './db';
import { SCAN_SITE, type ScanSiteJob } from './queues';

const INTERVALS_MS = { daily: 24 * 60 * 60 * 1000, '6h': 6 * 60 * 60 * 1000 } as const;
/** Lets a scheduler tick that lands slightly early still count as due. */
const TOLERANCE_MS = 5 * 60 * 1000;

export function isPageDue(
  lastScanAt: Date | null,
  frequency: 'daily' | '6h',
  now: Date,
): boolean {
  if (!lastScanAt) return true;
  return now.getTime() - lastScanAt.getTime() >= INTERVALS_MS[frequency] - TOLERANCE_MS;
}

/** Cron tick: enqueue one scan.site job per verified site with due pages. */
export async function scheduleDueScans(boss: PgBoss): Promise<number> {
  const verifiedSites = await db.query.sites.findMany({
    where: isNotNull(schema.sites.verifiedAt),
    with: { pages: true },
  });

  const now = new Date();
  let enqueued = 0;
  for (const site of verifiedSites) {
    const duePages = site.pages.filter(
      (p) => p.isActive && isPageDue(p.lastScanAt, p.scanFrequency, now),
    );
    if (duePages.length === 0) continue;

    const payload: ScanSiteJob = { siteId: site.id, pageIds: duePages.map((p) => p.id) };
    await boss.send(SCAN_SITE, { ...payload }, { singletonKey: site.id, singletonSeconds: 60 });
    enqueued += 1;
  }
  if (enqueued > 0) console.log(`[scheduler] enqueued ${enqueued} site scan(s)`);
  return enqueued;
}
