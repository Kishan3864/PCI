import { describe, expect, it } from 'vitest';
import { analyzeCspWeakening, parseCsp } from '../src/csp';

describe('parseCsp', () => {
  it('parses directives and tokens, lowercasing both', () => {
    const parsed = parseCsp("Default-Src 'SELF'; script-src https://cdn.example.com 'unsafe-inline'");
    expect(parsed.get('default-src')).toEqual(["'self'"]);
    expect(parsed.get('script-src')).toEqual(['https://cdn.example.com', "'unsafe-inline'"]);
  });

  it('tolerates extra whitespace and empty segments', () => {
    const parsed = parseCsp("  default-src   'self' ;; script-src 'none' ; ");
    expect([...parsed.keys()]).toEqual(['default-src', 'script-src']);
  });

  it('keeps the first occurrence of a duplicated directive (per CSP spec)', () => {
    const parsed = parseCsp("script-src 'self'; script-src 'unsafe-inline'");
    expect(parsed.get('script-src')).toEqual(["'self'"]);
  });
});

describe('analyzeCspWeakening', () => {
  it('returns null for identical policies and pure reorderings', () => {
    expect(
      analyzeCspWeakening("default-src 'self'; script-src 'self'", "script-src 'self'; default-src 'self'"),
    ).toBeNull();
  });

  it('detects removed directives', () => {
    const result = analyzeCspWeakening("default-src 'self'; frame-ancestors 'none'", "default-src 'self'");
    expect(result?.removedDirectives).toEqual(['frame-ancestors']);
  });

  it('detects added unsafe-inline and unsafe-eval tokens', () => {
    const result = analyzeCspWeakening(
      "script-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    );
    expect(result?.addedUnsafeTokens).toEqual([
      { directive: 'script-src', token: "'unsafe-inline'" },
      { directive: 'script-src', token: "'unsafe-eval'" },
    ]);
  });

  it('does not flag unsafe tokens that were already present', () => {
    expect(
      analyzeCspWeakening("script-src 'unsafe-inline'", "script-src 'unsafe-inline' https://x.example"),
    ).toBeNull();
  });

  it('does not flag added directives or added safe sources', () => {
    expect(
      analyzeCspWeakening("default-src 'self'", "default-src 'self' https://cdn.example.com; img-src *"),
    ).toBeNull();
  });
});
