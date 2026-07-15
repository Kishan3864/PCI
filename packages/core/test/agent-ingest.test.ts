import { describe, expect, it } from 'vitest';
import {
  AGENT_MAX_BODY_BYTES,
  AGENT_MAX_SCRIPTS,
  AGENT_MAX_URL_LENGTH,
  agentIngestSchema,
  agentScriptReportSchema,
} from '../src/schemas';

const validExternal = { src: 'https://cdn.example.com/app.js' };
const validInline = { sha256: 'a'.repeat(64), size: 512 };

describe('agentScriptReportSchema', () => {
  it('accepts an external script report', () => {
    expect(agentScriptReportSchema.safeParse(validExternal).success).toBe(true);
  });

  it('accepts an inline script report with hash + size', () => {
    expect(agentScriptReportSchema.safeParse(validInline).success).toBe(true);
  });

  it('accepts the injected flag', () => {
    expect(agentScriptReportSchema.safeParse({ ...validExternal, injected: true }).success).toBe(
      true,
    );
  });

  it('rejects a report with neither src nor sha256 (unidentifiable)', () => {
    expect(agentScriptReportSchema.safeParse({ size: 10 }).success).toBe(false);
    expect(agentScriptReportSchema.safeParse({}).success).toBe(false);
  });

  it('rejects src URLs over the 2KB cap', () => {
    const src = `https://cdn.example.com/${'a'.repeat(AGENT_MAX_URL_LENGTH)}.js`;
    expect(agentScriptReportSchema.safeParse({ src }).success).toBe(false);
  });

  it('rejects malformed sha256 values', () => {
    expect(agentScriptReportSchema.safeParse({ sha256: 'not-a-hash' }).success).toBe(false);
    expect(agentScriptReportSchema.safeParse({ sha256: 'A'.repeat(64) }).success).toBe(false);
    expect(agentScriptReportSchema.safeParse({ sha256: 'a'.repeat(63) }).success).toBe(false);
  });

  it('rejects negative or non-integer sizes', () => {
    expect(agentScriptReportSchema.safeParse({ ...validInline, size: -1 }).success).toBe(false);
    expect(agentScriptReportSchema.safeParse({ ...validInline, size: 1.5 }).success).toBe(false);
  });
});

describe('agentIngestSchema', () => {
  const valid = {
    v: 1,
    url: 'https://shop.example.com/checkout',
    scripts: [validExternal, validInline],
  };

  it('accepts a well-formed payload', () => {
    const parsed = agentIngestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.scripts).toHaveLength(2);
  });

  it('rejects unknown payload versions', () => {
    expect(agentIngestSchema.safeParse({ ...valid, v: 2 }).success).toBe(false);
  });

  it('rejects payloads with no scripts', () => {
    expect(agentIngestSchema.safeParse({ ...valid, scripts: [] }).success).toBe(false);
  });

  it(`caps scripts at ${AGENT_MAX_SCRIPTS} per payload`, () => {
    const atCap = Array.from({ length: AGENT_MAX_SCRIPTS }, () => validExternal);
    expect(agentIngestSchema.safeParse({ ...valid, scripts: atCap }).success).toBe(true);
    const overCap = [...atCap, validExternal];
    expect(agentIngestSchema.safeParse({ ...valid, scripts: overCap }).success).toBe(false);
  });

  it('rejects page URLs over the 2KB cap', () => {
    const url = `https://shop.example.com/${'p'.repeat(AGENT_MAX_URL_LENGTH)}`;
    expect(agentIngestSchema.safeParse({ ...valid, url }).success).toBe(false);
  });

  it('rejects payloads missing required fields', () => {
    expect(agentIngestSchema.safeParse({ v: 1, scripts: [validExternal] }).success).toBe(false);
    expect(agentIngestSchema.safeParse({ v: 1, url: valid.url }).success).toBe(false);
  });

  it('exposes a 64KB body cap for the ingest route', () => {
    expect(AGENT_MAX_BODY_BYTES).toBe(64 * 1024);
  });
});
