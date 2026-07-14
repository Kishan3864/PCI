export const SCAN_SITE = 'scan.site';
export const SCAN_SCHEDULE = 'scan.schedule';
export const ALERT_DISPATCH = 'alert.dispatch';
export const DIGEST_DAILY = 'digest.daily';
export const FREE_SCAN = 'free.scan';
export const EVIDENCE_GENERATE = 'evidence.generate';
export const EVIDENCE_MONTHLY = 'evidence.monthly';

export const ALL_QUEUES = [
  SCAN_SITE,
  SCAN_SCHEDULE,
  ALERT_DISPATCH,
  DIGEST_DAILY,
  FREE_SCAN,
  EVIDENCE_GENERATE,
  EVIDENCE_MONTHLY,
] as const;

export interface ScanSiteJob {
  siteId: string;
  pageIds?: string[];
  force?: boolean;
}

export interface AlertDispatchJob {
  changeId: string;
}

export interface FreeScanJob {
  freeScanId: string;
}

export interface EvidenceGenerateJob {
  siteId: string;
  periodStart: string; // ISO
  periodEnd: string; // ISO
}
