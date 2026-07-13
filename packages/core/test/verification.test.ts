import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/hash';
import {
  extractVerificationMetaContents,
  generateVerifyToken,
  isForbiddenHost,
  isPrivateIp,
  isValidSiteDomain,
  normalizeDomain,
  pageUrlWithinSite,
  txtRecordsContainToken,
  txtRecordValue,
} from '../src/verification';

describe('sha256Hex', () => {
  it('produces the known digest of "hello"', () => {
    expect(sha256Hex('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });
});

describe('verify tokens', () => {
  it('generates 32-char hex tokens', () => {
    expect(generateVerifyToken()).toMatch(/^[0-9a-f]{32}$/);
  });

  it('matches TXT records exactly, including chunked records', () => {
    const token = 'abc123';
    expect(txtRecordsContainToken(['scriptproof-verify=abc123'], token)).toBe(true);
    expect(txtRecordsContainToken([['scriptproof-', 'verify=abc123']], token)).toBe(true);
    expect(txtRecordsContainToken([' scriptproof-verify=abc123 '], token)).toBe(true);
    expect(txtRecordsContainToken(['scriptproof-verify=other'], token)).toBe(false);
    expect(txtRecordsContainToken(['v=spf1 include:example.com ~all'], token)).toBe(false);
    expect(txtRecordValue(token)).toBe('scriptproof-verify=abc123');
  });
});

describe('extractVerificationMetaContents', () => {
  it('finds the tag regardless of attribute order and quote style', () => {
    expect(
      extractVerificationMetaContents('<meta name="scriptproof-verify" content="tok1">'),
    ).toEqual(['tok1']);
    expect(
      extractVerificationMetaContents("<meta content='tok2' name='scriptproof-verify' />"),
    ).toEqual(['tok2']);
    expect(extractVerificationMetaContents('<META NAME=scriptproof-verify CONTENT=tok3>')).toEqual([
      'tok3',
    ]);
  });

  it('ignores unrelated meta tags', () => {
    expect(
      extractVerificationMetaContents(
        '<meta charset="utf-8"><meta name="description" content="shop">',
      ),
    ).toEqual([]);
  });
});

describe('normalizeDomain', () => {
  it('strips scheme, path, credentials and lowercases', () => {
    expect(normalizeDomain('https://Shop.Example.COM/checkout?a=1')).toBe('shop.example.com');
    expect(normalizeDomain('user:pass@shop.example.com')).toBe('shop.example.com');
    expect(normalizeDomain('shop.example.com.')).toBe('shop.example.com');
  });

  it('keeps explicit ports (needed for localhost fixtures)', () => {
    expect(normalizeDomain('http://localhost:4820')).toBe('localhost:4820');
  });

  it('returns null for garbage', () => {
    expect(normalizeDomain('   ')).toBeNull();
    expect(normalizeDomain('ht!tp://???')).toBeNull();
  });
});

describe('isPrivateIp', () => {
  it.each(['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.1.1', '100.64.0.1', '::1', 'fc00::1', 'fe80::1', '::ffff:10.0.0.1'])(
    'flags %s as private',
    (ip) => expect(isPrivateIp(ip)).toBe(true),
  );

  it.each(['8.8.8.8', '172.32.0.1', '1.1.1.1', '2606:4700::1111'])('allows %s', (ip) =>
    expect(isPrivateIp(ip)).toBe(false),
  );
});

describe('isForbiddenHost / isValidSiteDomain', () => {
  it('blocks localhost, .local/.internal, bare hostnames and private IPs', () => {
    expect(isForbiddenHost('localhost')).toBe(true);
    expect(isForbiddenHost('nas.local')).toBe(true);
    expect(isForbiddenHost('router.internal')).toBe(true);
    expect(isForbiddenHost('intranet')).toBe(true);
    expect(isForbiddenHost('10.0.0.5')).toBe(true);
    expect(isForbiddenHost('shop.example.com')).toBe(false);
  });

  it('production policy: public domains only, no ports', () => {
    const policy = { testMode: false };
    expect(isValidSiteDomain('shop.example.com', policy)).toBe(true);
    expect(isValidSiteDomain('localhost', policy)).toBe(false);
    expect(isValidSiteDomain('localhost:4820', policy)).toBe(false);
    expect(isValidSiteDomain('shop.example.com:8443', policy)).toBe(false);
  });

  it('test policy additionally allows localhost with port', () => {
    const policy = { testMode: true };
    expect(isValidSiteDomain('localhost:4820', policy)).toBe(true);
    expect(isValidSiteDomain('shop.example.com', policy)).toBe(true);
  });
});

describe('pageUrlWithinSite', () => {
  it('requires https and exact host match in production', () => {
    const policy = { testMode: false };
    expect(pageUrlWithinSite('https://shop.example.com/checkout', 'shop.example.com', policy)).toBe(
      true,
    );
    expect(pageUrlWithinSite('http://shop.example.com/checkout', 'shop.example.com', policy)).toBe(
      false,
    );
    expect(pageUrlWithinSite('https://evil.example.com/x', 'shop.example.com', policy)).toBe(false);
    expect(pageUrlWithinSite('https://sub.shop.example.com/x', 'shop.example.com', policy)).toBe(
      false,
    );
  });

  it('allows http on the exact fixture host in test mode', () => {
    const policy = { testMode: true };
    expect(pageUrlWithinSite('http://localhost:4820/checkout', 'localhost:4820', policy)).toBe(true);
    expect(pageUrlWithinSite('http://localhost:9999/checkout', 'localhost:4820', policy)).toBe(false);
  });
});
