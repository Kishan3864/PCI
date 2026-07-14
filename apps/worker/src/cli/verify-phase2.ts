/**
 * One-off Phase 2 verification: exercises the free-scan and evidence-generate
 * job handlers end to end (crawl -> report -> PDF -> storage/DB) and reports.
 *   pnpm exec tsx src/cli/verify-phase2.ts
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { schema } from '@scriptproof/db';
import { and, desc, eq, gt } from 'drizzle-orm';
import PgBoss from 'pg-boss';
import '../env';
import { db, pool } from '../db';
import { requireEnv } from '../env';
import { EVIDENCE_GENERATE, FREE_SCAN } from '../queues';
import { storageDir } from '../storage';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor<T>(
  fn: () => Promise<T | null>,
  label: string,
  timeoutMs = 90_000,
): Promise<T> {
  const start = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - start > timeoutMs) throw new Error(`timed out waiting for ${label}`);
    await sleep(2000);
  }
}

const boss = new PgBoss({ connectionString: requireEnv('DATABASE_URL') });
await boss.start();
await boss.createQueue(FREE_SCAN);
await boss.createQueue(EVIDENCE_GENERATE);

// ── Free scan ────────────────────────────────────────────────────────────────
const [fs] = await db
  .insert(schema.freeScans)
  .values({ url: 'http://localhost:4820/checkout', ip: '127.0.0.9', status: 'queued' })
  .returning();
if (!fs) throw new Error('failed to insert free scan');
await boss.send(FREE_SCAN, { freeScanId: fs.id });
console.log(`[verify] free scan enqueued (${fs.id})`);

const fsDone = await waitFor(async () => {
  const row = await db.query.freeScans.findFirst({ where: eq(schema.freeScans.id, fs.id) });
  return row && (row.status === 'done' || row.status === 'error') ? row : null;
}, 'free scan');
const report = fsDone.resultJson as Record<string, unknown> | null;
const fsPdf = typeof report?.pdfPath === 'string' ? report.pdfPath : null;
console.log(
  `[verify] free scan: status=${fsDone.status} scripts=${report?.scriptCount} ` +
    `headers=${report?.headersPresent}/${report?.headersTotal} ` +
    `pdf=${fsPdf ? (existsSync(path.join(storageDir(), fsPdf)) ? 'written ✓' : 'MISSING ✗') : 'none'}`,
);

// ── Evidence pack ──────────────────────────────────────────────────────────────
const site = await db.query.sites.findFirst({ where: eq(schema.sites.domain, 'localhost:4820') });
if (!site) throw new Error('demo site not found');
const before = new Date();
const periodStart = new Date(Date.UTC(before.getUTCFullYear(), before.getUTCMonth(), 1));
await boss.send(EVIDENCE_GENERATE, {
  siteId: site.id,
  periodStart: periodStart.toISOString(),
  periodEnd: before.toISOString(),
});
console.log(`[verify] evidence enqueued for ${site.domain}`);

const ev = await waitFor(async () => {
  const row = await db.query.evidenceReports.findFirst({
    where: and(
      eq(schema.evidenceReports.siteId, site.id),
      gt(schema.evidenceReports.generatedAt, before),
    ),
    orderBy: desc(schema.evidenceReports.generatedAt),
  });
  return row ?? null;
}, 'evidence report');
console.log(
  `[verify] evidence: pdf=${existsSync(path.join(storageDir(), ev.pdfPath)) ? 'written ✓' : 'MISSING ✗'} (${ev.pdfPath})`,
);

await boss.stop({ wait: false });
await pool.end();
console.log('[verify] done');
