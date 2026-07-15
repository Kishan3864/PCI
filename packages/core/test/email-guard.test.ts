import { describe, expect, it } from 'vitest';
import { assessSignupEmail, normalizeEmail, splitEmail } from '../src/email-guard';

const prod = { testMode: false };
const test = { testMode: true };

describe('splitEmail / syntax', () => {
  it('accepts a normal address', () => {
    expect(splitEmail('user.name+tag@example.com')).toEqual({
      local: 'user.name+tag',
      domain: 'example.com',
    });
  });
  it.each(['no-at-sign', '@nolocal.com', 'trailing@', 'sp ace@x.com', 'a@b', 'a..b@x.com'])(
    'rejects %s',
    (bad) => {
      expect(splitEmail(bad)).toBeNull();
    },
  );
  it('normalizes case and whitespace', () => {
    expect(normalizeEmail('  User@GMAIL.com ')).toBe('user@gmail.com');
  });
});

describe('assessSignupEmail', () => {
  it('accepts trusted providers without DNS', async () => {
    const v = await assessSignupEmail('someone@gmail.com', prod);
    expect(v).toMatchObject({ ok: true, kind: 'trusted-provider' });
  });

  it('rejects disposable domains', async () => {
    const v = await assessSignupEmail('x@mailinator.com', prod);
    expect(v).toMatchObject({ ok: false, reason: 'disposable' });
  });

  it('rejects provider typos with a suggestion', async () => {
    const v = await assessSignupEmail('x@gmial.com', prod);
    expect(v).toMatchObject({ ok: false, reason: 'typo', suggestion: 'gmail.com' });
  });

  it('rejects invalid syntax', async () => {
    const v = await assessSignupEmail('not-an-email', prod);
    expect(v).toMatchObject({ ok: false, reason: 'syntax' });
  });

  it('rejects reserved TLDs in production', async () => {
    const v = await assessSignupEmail('demo@scriptproof.local', prod);
    expect(v).toMatchObject({ ok: false });
  });

  it('accepts .local fixtures in test mode (seed/e2e)', async () => {
    const v = await assessSignupEmail('demo@scriptproof.local', test);
    expect(v).toMatchObject({ ok: true, kind: 'company-domain' });
  });

  it('rejects company domains that cannot receive mail (live DNS)', async () => {
    const v = await assessSignupEmail('x@this-domain-definitely-does-not-exist-4820.com', prod);
    expect(v).toMatchObject({ ok: false, reason: 'no-mx' });
  });
});
