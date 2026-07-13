import { describe, expect, it } from 'vitest';
import { isPageDue } from '../src/scheduler';

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-07-13T12:00:00Z');
const hoursAgo = (h: number) => new Date(now.getTime() - h * HOUR);

describe('isPageDue', () => {
  it('is due when never scanned', () => {
    expect(isPageDue(null, 'daily', now)).toBe(true);
    expect(isPageDue(null, '6h', now)).toBe(true);
  });

  it('daily pages are due after ~24h, not before', () => {
    expect(isPageDue(hoursAgo(25), 'daily', now)).toBe(true);
    expect(isPageDue(hoursAgo(24), 'daily', now)).toBe(true);
    expect(isPageDue(hoursAgo(12), 'daily', now)).toBe(false);
  });

  it('6h pages are due after ~6h, not before', () => {
    expect(isPageDue(hoursAgo(7), '6h', now)).toBe(true);
    expect(isPageDue(hoursAgo(3), '6h', now)).toBe(false);
  });

  it('tolerates a slightly-early scheduler tick (5 min)', () => {
    expect(isPageDue(new Date(now.getTime() - 24 * HOUR + 4 * 60 * 1000), 'daily', now)).toBe(true);
    expect(isPageDue(new Date(now.getTime() - 24 * HOUR + 6 * 60 * 1000), 'daily', now)).toBe(false);
  });
});
