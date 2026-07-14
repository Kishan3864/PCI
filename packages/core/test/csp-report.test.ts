import { describe, expect, it } from 'vitest';
import { parseCspReports } from '../src/csp-report';

describe('parseCspReports', () => {
  it('parses the legacy application/csp-report shape', () => {
    const result = parseCspReports({
      'csp-report': {
        'document-uri': 'https://shop.example.com/checkout',
        'violated-directive': 'script-src',
        'blocked-uri': 'https://evil.example.com/skim.js',
      },
    });
    expect(result).toEqual([
      {
        blockedUri: 'https://evil.example.com/skim.js',
        violatedDirective: 'script-src',
        documentUri: 'https://shop.example.com/checkout',
      },
    ]);
  });

  it('parses the Reporting API array shape and camelCase keys', () => {
    const result = parseCspReports([
      {
        type: 'csp-violation',
        body: {
          documentURL: 'https://shop.example.com/checkout',
          effectiveDirective: 'script-src-elem',
          blockedURL: 'https://cdn.bad.example/x.js',
        },
      },
      { type: 'deprecation', body: {} }, // ignored (not a csp-violation)
    ]);
    expect(result).toEqual([
      {
        blockedUri: 'https://cdn.bad.example/x.js',
        violatedDirective: 'script-src-elem',
        documentUri: 'https://shop.example.com/checkout',
      },
    ]);
  });

  it('returns empty for junk or empty payloads', () => {
    expect(parseCspReports(null)).toEqual([]);
    expect(parseCspReports({})).toEqual([]);
    expect(parseCspReports('nope')).toEqual([]);
    expect(parseCspReports([{ type: 'csp-violation', body: {} }])).toEqual([]);
  });
});
