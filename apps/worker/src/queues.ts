export const SCAN_SITE = 'scan.site';
export const SCAN_SCHEDULE = 'scan.schedule';
export const ALERT_DISPATCH = 'alert.dispatch';
export const DIGEST_DAILY = 'digest.daily';

export const ALL_QUEUES = [SCAN_SITE, SCAN_SCHEDULE, ALERT_DISPATCH, DIGEST_DAILY] as const;

export interface ScanSiteJob {
  siteId: string;
  pageIds?: string[];
  force?: boolean;
}

export interface AlertDispatchJob {
  changeId: string;
}
