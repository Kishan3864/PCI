import PgBoss from 'pg-boss';
import './env';
import { handleAlertDispatch, handleDailyDigest } from './alerts';
import { pool } from './db';
import { fixturePort, isTestMode, requireEnv } from './env';
import { handleEvidenceGenerate, scheduleMonthlyEvidence } from './evidence-runner';
import { startFixtureServer } from './fixture-server';
import { handleFreeScan } from './free-scan-runner';
import {
  ALERT_DISPATCH,
  ALL_QUEUES,
  DIGEST_DAILY,
  EVIDENCE_GENERATE,
  EVIDENCE_MONTHLY,
  FREE_SCAN,
  SCAN_SCHEDULE,
  SCAN_SITE,
  type AlertDispatchJob,
  type EvidenceGenerateJob,
  type FreeScanJob,
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

  // Scheduler tick every 10 minutes; digest at 08:00 UTC; evidence on the 1st at 06:00 UTC.
  await boss.schedule(SCAN_SCHEDULE, '*/10 * * * *', {}, { tz: 'UTC' });
  await boss.schedule(DIGEST_DAILY, '0 8 * * *', {}, { tz: 'UTC' });
  await boss.schedule(EVIDENCE_MONTHLY, '0 6 1 * *', {}, { tz: 'UTC' });

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
  await boss.work<FreeScanJob>(FREE_SCAN, async ([job]) => {
    if (job) await handleFreeScan(job.data);
  });
  await boss.work<EvidenceGenerateJob>(EVIDENCE_GENERATE, async ([job]) => {
    if (job) await handleEvidenceGenerate(job.data);
  });
  await boss.work(EVIDENCE_MONTHLY, async () => {
    await scheduleMonthlyEvidence(boss);
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
