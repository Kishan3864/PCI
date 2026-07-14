/**
 * Dev utility: enqueue an arbitrary job.
 *   pnpm exec tsx src/cli/enqueue-job.ts free.scan '{"freeScanId":"..."}'
 */
import PgBoss from 'pg-boss';
import '../env';
import { pool } from '../db';
import { requireEnv } from '../env';

const queue = process.argv[2];
const json = process.argv[3] ?? '{}';
if (!queue) {
  console.error('usage: tsx src/cli/enqueue-job.ts <queue> <jsonData>');
  process.exit(1);
}

const boss = new PgBoss({ connectionString: requireEnv('DATABASE_URL') });
await boss.start();
await boss.createQueue(queue);
const id = await boss.send(queue, JSON.parse(json) as Record<string, unknown>);
console.log(`enqueued ${queue} job ${id}`);
await boss.stop({ wait: false });
await pool.end();
