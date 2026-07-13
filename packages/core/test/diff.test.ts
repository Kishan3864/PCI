import { describe, expect, it } from 'vitest';
import { diffScan, REMOVAL_STREAK_THRESHOLD } from '../src/diff';
import type { DiffInput, KnownScript, ObservedScript } from '../src/types';

function obs(overrides: Partial<ObservedScript> = {}): ObservedScript {
  return {
    urlKey: 'https://cdn.example.com/app.js',
    srcUrl: 'https://cdn.example.com/app.js?v=1',
    isInline: false,
    sha256: 'aaa',
    byteSize: 100,
    sriPresent: false,
    attrs: {},
    ...overrides,
  };
}

function known(overrides: Partial<KnownScript> = {}): KnownScript {
  return {
    id: 'script-1',
    urlKey: 'https://cdn.example.com/app.js',
    isInline: false,
    status: 'authorized',
    latestSha256: 'aaa',
    latestSriPresent: false,
    missingStreak: 0,
    expectedOnPage: true,
    ...overrides,
  };
}

function input(overrides: Partial<DiffInput> = {}): DiffInput {
  return {
    pageLabel: 'Checkout',
    isBaseline: false,
    observed: [],
    known: [],
    headers: {},
    prevHeaders: {},
    ...overrides,
  };
}

describe('baseline scans', () => {
  it('creates all observed scripts as new inventory rows without any changes', () => {
    const result = diffScan(
      input({
        isBaseline: true,
        observed: [
          obs(),
          obs({ urlKey: 'inline:bbb', srcUrl: null, isInline: true, sha256: 'bbb' }),
        ],
        prevHeaders: null,
      }),
    );
    expect(result.changes).toEqual([]);
    expect(result.toCreate).toHaveLength(2);
    expect(result.updates).toEqual([]);
  });

  it('does not recreate scripts already known site-wide, but marks them seen', () => {
    const result = diffScan(
      input({
        isBaseline: true,
        observed: [obs()],
        known: [known({ expectedOnPage: false })],
        prevHeaders: null,
      }),
    );
    expect(result.toCreate).toHaveLength(0);
    expect(result.updates).toEqual([
      expect.objectContaining({ scriptId: 'script-1', seen: true, missingStreak: 0 }),
    ]);
  });
});

describe('new_script', () => {
  it('is critical on payment-labelled pages', () => {
    const result = diffScan(input({ pageLabel: 'Checkout', observed: [obs()] }));
    expect(result.changes).toEqual([
      expect.objectContaining({ type: 'new_script', severity: 'critical' }),
    ]);
    expect(result.toCreate).toHaveLength(1);
  });

  it('is warning on non-payment pages', () => {
    const result = diffScan(input({ pageLabel: 'Home', observed: [obs()] }));
    expect(result.changes[0]).toMatchObject({ type: 'new_script', severity: 'warning' });
  });

  it('does not fire for scripts already known on the site (seen on another page)', () => {
    const result = diffScan(
      input({ observed: [obs()], known: [known({ expectedOnPage: false })] }),
    );
    expect(result.changes).toEqual([]);
    expect(result.toCreate).toEqual([]);
  });
});

describe('script_modified', () => {
  it('is critical when an authorized script hash changes', () => {
    const result = diffScan(
      input({ observed: [obs({ sha256: 'bbb' })], known: [known({ status: 'authorized' })] }),
    );
    expect(result.changes).toEqual([
      expect.objectContaining({
        type: 'script_modified',
        severity: 'critical',
        scriptId: 'script-1',
        detail: expect.objectContaining({ before: 'aaa', after: 'bbb' }),
      }),
    ]);
  });

  it('is warning when a pending script hash changes', () => {
    const result = diffScan(
      input({ observed: [obs({ sha256: 'bbb' })], known: [known({ status: 'pending' })] }),
    );
    expect(result.changes[0]).toMatchObject({ type: 'script_modified', severity: 'warning' });
  });

  it('does not fire when the hash is unchanged', () => {
    const result = diffScan(input({ observed: [obs()], known: [known()] }));
    expect(result.changes).toEqual([]);
  });

  it('does not fire for a known script with no recorded hash yet', () => {
    const result = diffScan(
      input({ observed: [obs({ sha256: 'bbb' })], known: [known({ latestSha256: null })] }),
    );
    expect(result.changes).toEqual([]);
  });
});

describe('sri_removed', () => {
  it('fires as warning when integrity was present before and is now absent', () => {
    const result = diffScan(
      input({ observed: [obs({ sriPresent: false })], known: [known({ latestSriPresent: true })] }),
    );
    expect(result.changes).toEqual([
      expect.objectContaining({ type: 'sri_removed', severity: 'warning', scriptId: 'script-1' }),
    ]);
  });

  it('does not fire when SRI is added', () => {
    const result = diffScan(
      input({ observed: [obs({ sriPresent: true })], known: [known({ latestSriPresent: false })] }),
    );
    expect(result.changes).toEqual([]);
  });

  it('treats a script as unprotected when any duplicate tag lacks integrity', () => {
    const result = diffScan(
      input({
        observed: [obs({ sriPresent: true }), obs({ sriPresent: false })],
        known: [known({ latestSriPresent: true })],
      }),
    );
    expect(result.changes).toEqual([expect.objectContaining({ type: 'sri_removed' })]);
  });
});

describe('script_removed', () => {
  it('increments the streak without firing before the threshold', () => {
    const result = diffScan(input({ known: [known({ missingStreak: 1 })] }));
    expect(result.changes).toEqual([]);
    expect(result.updates).toEqual([
      expect.objectContaining({ scriptId: 'script-1', seen: false, missingStreak: 2 }),
    ]);
  });

  it(`fires info exactly when the streak reaches ${REMOVAL_STREAK_THRESHOLD}`, () => {
    const result = diffScan(
      input({ known: [known({ missingStreak: REMOVAL_STREAK_THRESHOLD - 1 })] }),
    );
    expect(result.changes).toEqual([
      expect.objectContaining({ type: 'script_removed', severity: 'info' }),
    ]);
  });

  it('does not re-fire past the threshold', () => {
    const result = diffScan(input({ known: [known({ missingStreak: REMOVAL_STREAK_THRESHOLD })] }));
    expect(result.changes).toEqual([]);
    expect(result.updates[0]).toMatchObject({ missingStreak: REMOVAL_STREAK_THRESHOLD + 1 });
  });

  it('does not fire for pending or blocked scripts', () => {
    for (const status of ['pending', 'blocked'] as const) {
      const result = diffScan(input({ known: [known({ status, missingStreak: 2 })] }));
      expect(result.changes).toEqual([]);
    }
  });

  it('ignores scripts anchored to other pages', () => {
    const result = diffScan(input({ known: [known({ expectedOnPage: false, missingStreak: 2 })] }));
    expect(result.changes).toEqual([]);
    expect(result.updates).toEqual([]);
  });

  it('resets the streak when the script reappears', () => {
    const result = diffScan(input({ observed: [obs()], known: [known({ missingStreak: 2 })] }));
    expect(result.updates).toEqual([
      expect.objectContaining({ scriptId: 'script-1', seen: true, missingStreak: 0 }),
    ]);
    expect(result.changes).toEqual([]);
  });
});

describe('header_changed', () => {
  it('is critical when the CSP header is removed entirely', () => {
    const result = diffScan(
      input({
        prevHeaders: { 'content-security-policy': "default-src 'self'" },
        headers: {},
      }),
    );
    expect(result.changes).toEqual([
      expect.objectContaining({
        type: 'header_changed',
        severity: 'critical',
        detail: expect.objectContaining({ header: 'content-security-policy', kind: 'removed' }),
      }),
    ]);
  });

  it('is warning with weakening detail when a CSP directive is dropped', () => {
    const result = diffScan(
      input({
        prevHeaders: { 'content-security-policy': "default-src 'self'; script-src 'self'" },
        headers: { 'content-security-policy': "default-src 'self'" },
      }),
    );
    expect(result.changes[0]).toMatchObject({
      type: 'header_changed',
      severity: 'warning',
      detail: expect.objectContaining({
        weakening: expect.objectContaining({ removedDirectives: ['script-src'] }),
      }),
    });
  });

  it('is warning when unsafe-inline is added to the CSP', () => {
    const result = diffScan(
      input({
        prevHeaders: { 'content-security-policy': "script-src 'self'" },
        headers: { 'content-security-policy': "script-src 'self' 'unsafe-inline'" },
      }),
    );
    expect(result.changes[0]).toMatchObject({
      severity: 'warning',
      detail: expect.objectContaining({
        weakening: expect.objectContaining({
          addedUnsafeTokens: [{ directive: 'script-src', token: "'unsafe-inline'" }],
        }),
      }),
    });
  });

  it('is warning for other tracked header value changes and removals', () => {
    const result = diffScan(
      input({
        prevHeaders: {
          'strict-transport-security': 'max-age=63072000',
          'x-frame-options': 'DENY',
        },
        headers: { 'strict-transport-security': 'max-age=300' },
      }),
    );
    expect(result.changes).toHaveLength(2);
    expect(result.changes.every((c) => c.severity === 'warning')).toBe(true);
  });

  it('is info when a tracked header is newly added', () => {
    const result = diffScan(
      input({ prevHeaders: {}, headers: { 'x-content-type-options': 'nosniff' } }),
    );
    expect(result.changes[0]).toMatchObject({ severity: 'info' });
  });

  it('ignores untracked headers and identical values', () => {
    const result = diffScan(
      input({
        prevHeaders: { server: 'nginx', 'x-frame-options': 'DENY' },
        headers: { server: 'apache', 'x-frame-options': 'DENY' },
      }),
    );
    expect(result.changes).toEqual([]);
  });

  it('emits no header changes when there is no previous header snapshot', () => {
    const result = diffScan(input({ prevHeaders: null, headers: { 'x-frame-options': 'DENY' } }));
    expect(result.changes).toEqual([]);
  });
});
