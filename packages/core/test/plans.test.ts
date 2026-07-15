import { describe, expect, it } from 'vitest';
import {
  annualPrice,
  canAddPage,
  canAddSite,
  frequencyAllowed,
  manualScanCooldownMs,
  planAllows,
  PLANS,
} from '../src/plans';

describe('plan limits (section 7)', () => {
  it('starter: 1 site, 3 pages, daily scans only, no pro features', () => {
    expect(canAddSite('starter', 0)).toBe(true);
    expect(canAddSite('starter', 1)).toBe(false);
    expect(canAddPage('starter', 2)).toBe(true);
    expect(canAddPage('starter', 3)).toBe(false);
    expect(frequencyAllowed('starter', 'daily')).toBe(true);
    expect(frequencyAllowed('starter', '6h')).toBe(false);
    expect(planAllows('starter', 'evidencePacks')).toBe(false);
    expect(planAllows('starter', 'agentSnippet')).toBe(false);
    expect(planAllows('starter', 'slackAlerts')).toBe(false);
    expect(planAllows('starter', 'cspInsights')).toBe(false);
  });

  it('pro: 5 sites, 10 pages each, 6-hourly, evidence packs + slack + agent + csp', () => {
    expect(canAddSite('pro', 4)).toBe(true);
    expect(canAddSite('pro', 5)).toBe(false);
    expect(canAddPage('pro', 9)).toBe(true);
    expect(canAddPage('pro', 10)).toBe(false);
    expect(frequencyAllowed('pro', '6h')).toBe(true);
    expect(planAllows('pro', 'evidencePacks')).toBe(true);
    expect(planAllows('pro', 'whiteLabel')).toBe(false);
    expect(planAllows('pro', 'csvExport')).toBe(false);
  });

  it('agency: 20 sites, everything in pro, white label + csv', () => {
    expect(canAddSite('agency', 19)).toBe(true);
    expect(canAddSite('agency', 20)).toBe(false);
    expect(planAllows('agency', 'whiteLabel')).toBe(true);
    expect(planAllows('agency', 'csvExport')).toBe(true);
  });

  it('manual scan cooldown: starter 30 min, pro 10 min, agency 5 min', () => {
    expect(manualScanCooldownMs('starter')).toBe(30 * 60_000);
    expect(manualScanCooldownMs('pro')).toBe(10 * 60_000);
    expect(manualScanCooldownMs('agency')).toBe(5 * 60_000);
    expect(manualScanCooldownMs('agency')).toBeLessThan(manualScanCooldownMs('pro'));
    expect(manualScanCooldownMs('pro')).toBeLessThan(manualScanCooldownMs('starter'));
  });

  it('prices: 29 / 79 / 199 monthly, annual = 10x monthly', () => {
    expect(PLANS.starter.priceMonthly).toBe(29);
    expect(PLANS.pro.priceMonthly).toBe(79);
    expect(PLANS.agency.priceMonthly).toBe(199);
    expect(annualPrice('pro')).toBe(790);
  });
});
