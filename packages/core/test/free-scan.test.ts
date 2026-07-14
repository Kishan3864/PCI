import { describe, expect, it } from 'vitest';
import { buildFreeScanReport } from '../src/free-scan';
import type { ObservedScript } from '../src/types';

function obs(overrides: Partial<ObservedScript> = {}): ObservedScript {
  return {
    urlKey: 'https://cdn.example.com/a.js',
    srcUrl: 'https://cdn.example.com/a.js',
    isInline: false,
    sha256: 'h',
    byteSize: 10,
    sriPresent: false,
    unfetchable: false,
    attrs: {},
    ...overrides,
  };
}

describe('buildFreeScanReport', () => {
  it('counts external vs inline scripts and unique external domains', () => {
    const report = buildFreeScanReport(
      'https://shop.example.com/checkout',
      200,
      [
        obs({ srcUrl: 'https://cdn.a.com/x.js', urlKey: 'https://cdn.a.com/x.js' }),
        obs({ srcUrl: 'https://cdn.a.com/y.js', urlKey: 'https://cdn.a.com/y.js' }),
        obs({ srcUrl: 'https://cdn.b.com/z.js', urlKey: 'https://cdn.b.com/z.js' }),
        obs({ isInline: true, srcUrl: null, urlKey: 'inline:1' }),
      ],
      {},
    );
    expect(report.scriptCount).toBe(4);
    expect(report.externalScriptCount).toBe(3);
    expect(report.inlineScriptCount).toBe(1);
    expect(report.externalDomains).toEqual(['cdn.a.com', 'cdn.b.com']);
  });

  it('tallies SRI coverage across external scripts', () => {
    const report = buildFreeScanReport(
      'https://shop.example.com/',
      200,
      [
        obs({ sriPresent: true }),
        obs({ sriPresent: false, urlKey: 'k2', srcUrl: 'https://cdn.example.com/b.js' }),
      ],
      {},
    );
    expect(report.scriptsWithSri).toBe(1);
    expect(report.scriptsWithoutSri).toBe(1);
  });

  it('reports which tracked security headers are present or missing', () => {
    const report = buildFreeScanReport('https://shop.example.com/', 200, [], {
      'content-security-policy': "default-src 'self'",
      'x-frame-options': 'DENY',
      'strict-transport-security': '   ', // blank counts as absent
    });
    expect(report.headersTotal).toBe(6);
    expect(report.headersPresent).toBe(2);
    const csp = report.securityHeaders.find((h) => h.header === 'content-security-policy');
    expect(csp?.present).toBe(true);
    const hsts = report.securityHeaders.find((h) => h.header === 'strict-transport-security');
    expect(hsts?.present).toBe(false);
  });
});
