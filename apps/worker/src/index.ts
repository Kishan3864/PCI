import PgBoss from 'pg-boss';
import './env';
import { handleAlertDispatch, handleDailyDigest } from './alerts';
import { pool } from './db';
import { fixturePort, isTestMode, requireEnv } from './env';
import { startFixtureServer } from './fixture-server';
import {
  ALERT_DISPATCH,
  ALL_QUEUES,
  DIGEST_DAILY,
  SCAN_SCHEDULE,
  SCAN_SITE,
  type AlertDispatchJob,
  type ScanSiteJob,
} from './queues';
import { handleScanSite } from './scan-runner';
import { scheduleDueScans } from './scheduler';

async function main(): Promise<void> {
  const boss = new PgBoss({ connectionString: requireEnv('DATABASE_URL') });
  boss.on('error', (error) => console.error('[pg-boss]', error));
  await boss.start();

  for (const queue of ALL_QUEUES) {
    await boss.createQueue(queue);
  }

  // Scheduler tick every 10 minutes; digest at 08:00 UTC.
  await boss.schedule(SCAN_SCHEDULE, '*/10 * * * *', {}, { tz: 'UTC' });
  await boss.schedule(DIGEST_DAILY, '0 8 * * *', {}, { tz: 'UTC' });

  await boss.work<ScanSiteJob>(SCAN_SITE, async ([job]) => {
    if (job) await handleScanSite(job.data, boss);
  });
  await boss.work(SCAN_SCHEDULE, async () => {
    await scheduleDueScans(boss);
  });
  await boss.work<AlertDispatchJob>(ALERT_DISPATCH, async ([job]) => {
    if (job) await handleAlertDispatch(job.data);
  });
  await boss.work(DIGEST_DAILY, async () => {
    await handleDailyDigest();
  });

  if (isTestMode() || process.env.NODE_ENV !== 'production') {
    startFixtureServer(fixturePort());
  }

  console.log('[worker] ready — queues registered, scheduler active');

  const shutdown = async (signal: string) => {
    console.log(`[worker] ${signal} received, shutting down`);
    await boss.stop({ wait: true });
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[worker] fatal:', error);
  process.exit(1);
});
