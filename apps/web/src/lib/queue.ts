import 'server-only';
import PgBoss from 'pg-boss';
import { requireEnv } from './env';

export const SCAN_SITE_QUEUE = 'scan.site';
export const FREE_SCAN_QUEUE = 'free.scan';
export const EVIDENCE_GENERATE_QUEUE = 'evidence.generate';

export interface ScanSiteJob {
  siteId: string;
  /** Limit the scan to specific pages (baseline of a new page). Omit = all due/active pages. */
  pageIds?: string[];
  /** Manual scans ignore frequency-due checks. */
  force?: boolean;
}

const globalForBoss = globalThis as unknown as { __scriptproofBoss?: Promise<PgBoss> };

async function startBoss(): Promise<PgBoss> {
  const boss = new PgBoss({ connectionString: requireEnv('DATABASE_URL') });
  boss.on('error', (err) => console.error('[pg-boss:web]', err));
  await boss.start();
  await boss.createQueue(SCAN_SITE_QUEUE);
  await boss.createQueue(FREE_SCAN_QUEUE);
  await boss.createQueue(EVIDENCE_GENERATE_QUEUE);
  return boss;
}

export function getBoss(): Promise<PgBoss> {
  globalForBoss.__scriptproofBoss ??= startBoss();
  return globalForBoss.__scriptproofBoss;
}

/** Enqueues a site scan. singletonKey stops double-queuing the same site. */
export async function enqueueSiteScan(job: ScanSiteJob): Promise<void> {
  const boss = await getBoss();
  await boss.send(SCAN_SITE_QUEUE, { ...job }, { singletonKey: job.siteId, singletonSeconds: 30 });
}

export async function enqueueFreeScan(freeScanId: string): Promise<void> {
  const boss = await getBoss();
  await boss.send(FREE_SCAN_QUEUE, { freeScanId });
}

export async function enqueueEvidence(job: {
  siteId: string;
  periodStart: string;
  periodEnd: string;
}): Promise<void> {
  const boss = await getBoss();
  await boss.send(EVIDENCE_GENERATE_QUEUE, { ...job });
}
