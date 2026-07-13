/**
 * Dev utility: enqueue a forced scan for a site by domain.
 *   pnpm --filter worker exec tsx src/cli/enqueue-scan.ts localhost:4820
 */
import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import PgBoss from 'pg-boss';
import '../env';
import { db, pool } from '../db';
import { requireEnv } from '../env';
import { SCAN_SITE, type ScanSiteJob } from '../queues';

const domain = process.argv[2];
if (!domain) {
  console.error('usage: tsx src/cli/enqueue-scan.ts <domain>');
  process.exit(1);
}

const site = await db.query.sites.findFirst({ where: eq(schema.sites.domain, domain) });
if (!site) {
  console.error(`no site found for domain ${domain}`);
  await pool.end();
  process.exit(1);
}

const boss = new PgBoss({ connectionString: requireEnv('DATABASE_URL') });
await boss.start();
await boss.createQueue(SCAN_SITE);
const payload: ScanSiteJob = { siteId: site.id, force: true };
const jobId = await boss.send(SCAN_SITE, { ...payload });
console.log(`enqueued scan.site job ${jobId} for ${domain} (${site.id})`);
await boss.stop({ wait: false });
await pool.end();
