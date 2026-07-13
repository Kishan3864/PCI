import type { PlanId, ScanFrequency } from './types';

export interface PlanLimits {
  priceMonthly: number;
  maxSites: number;
  maxPagesPerSite: number;
  frequencies: ScanFrequency[];
  agentSnippet: boolean;
  cspInsights: boolean;
  evidencePacks: boolean;
  slackAlerts: boolean;
  whiteLabel: boolean;
  csvExport: boolean;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  starter: {
    priceMonthly: 29,
    maxSites: 1,
    maxPagesPerSite: 3,
    frequencies: ['daily'],
    agentSnippet: false,
    cspInsights: false,
    evidencePacks: false,
    slackAlerts: false,
    whiteLabel: false,
    csvExport: false,
  },
  pro: {
    priceMonthly: 79,
    maxSites: 5,
    maxPagesPerSite: 10,
    frequencies: ['daily', '6h'],
    agentSnippet: true,
    cspInsights: true,
    evidencePacks: true,
    slackAlerts: true,
    whiteLabel: false,
    csvExport: false,
  },
  agency: {
    priceMonthly: 199,
    maxSites: 20,
    maxPagesPerSite: 10,
    frequencies: ['daily', '6h'],
    agentSnippet: true,
    cspInsights: true,
    evidencePacks: true,
    slackAlerts: true,
    whiteLabel: true,
    csvExport: true,
  },
};

/** Annual price = 10x monthly (2 months free). */
export function annualPrice(plan: PlanId): number {
  return PLANS[plan].priceMonthly * 10;
}

export function canAddSite(plan: PlanId, currentSiteCount: number): boolean {
  return currentSiteCount < PLANS[plan].maxSites;
}

export function canAddPage(plan: PlanId, currentPageCount: number): boolean {
  return currentPageCount < PLANS[plan].maxPagesPerSite;
}

export function frequencyAllowed(plan: PlanId, frequency: ScanFrequency): boolean {
  return PLANS[plan].frequencies.includes(frequency);
}

export type PlanFeature = keyof Pick<
  PlanLimits,
  'agentSnippet' | 'cspInsights' | 'evidencePacks' | 'slackAlerts' | 'whiteLabel' | 'csvExport'
>;

export function planAllows(plan: PlanId, feature: PlanFeature): boolean {
  return PLANS[plan][feature];
}
