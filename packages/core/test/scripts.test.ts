import { describe, expect, it } from 'vitest';
import {
  dedupeObserved,
  inlineUrlKey,
  isPaymentPage,
  normalizeScriptUrl,
  scriptUrlKey,
} from '../src/scripts';
import type { ObservedScript } from '../src/types';

describe('normalizeScriptUrl', () => {
  it('resolves relative srcs against the page URL', () => {
    expect(normalizeScriptUrl('/js/app.js', 'https://shop.example.com/checkout')).toBe(
      'https://shop.example.com/js/app.js',
    );
    expect(normalizeScriptUrl('//cdn.example.com/a.js', 'https://shop.example.com/')).toBe(
      'https://cdn.example.com/a.js',
    );
  });

  it('returns null for unparseable srcs', () => {
    expect(normalizeScriptUrl('http://', 'not a url')).toBeNull();
  });
});

describe('scriptUrlKey', () => {
  it('strips query strings and fragments so cache-busters keep one identity', () => {
    expect(scriptUrlKey('https://cdn.example.com/app.js?v=123#x')).toBe(
      'https://cdn.example.com/app.js',
    );
  });

  it('preserves path, port and case-sensitivity of the path', () => {
    expect(scriptUrlKey('http://localhost:4820/JS/App.js')).toBe('http://localhost:4820/JS/App.js');
  });
});

describe('inlineUrlKey', () => {
  it('prefixes the content hash', () => {
    expect(inlineUrlKey('abc')).toBe('inline:abc');
  });
});

describe('dedupeObserved', () => {
  const base: ObservedScript = {
    urlKey: 'https://cdn.example.com/app.js',
    srcUrl: 'https://cdn.example.com/app.js',
    isInline: false,
    sha256: 'aaa',
    byteSize: 1,
    sriPresent: true,
    unfetchable: false,
    attrs: {},
  };

  it('keeps one entry per identity key', () => {
    expect(dedupeObserved([base, { ...base }])).toHaveLength(1);
  });

  it('only reports SRI when every duplicate tag has integrity', () => {
    expect(dedupeObserved([base, { ...base, sriPresent: false }])[0]?.sriPresent).toBe(false);
    expect(dedupeObserved([base, { ...base }])[0]?.sriPresent).toBe(true);
  });
});

describe('isPaymentPage', () => {
  it.each(['Checkout', 'payment page', 'Pay now', 'Cart', 'Billing', 'Order confirmation'])(
    'matches %s',
    (label) => expect(isPaymentPage(label)).toBe(true),
  );

  it.each(['Home', 'About us', 'Product listing'])('does not match %s', (label) =>
    expect(isPaymentPage(label)).toBe(false),
  );
});
