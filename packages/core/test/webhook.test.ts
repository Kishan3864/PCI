import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyHmacSignature } from '../src/webhook';

const secret = 'whsec_test';
const body = '{"type":"subscription.active","data":{"id":"sub_1"}}';
const validSig = createHmac('sha256', secret).update(body).digest('hex');

describe('verifyHmacSignature', () => {
  it('accepts a correct signature', () => {
    expect(verifyHmacSignature(body, validSig, secret)).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(verifyHmacSignature(body + ' ', validSig, secret)).toBe(false);
  });

  it('rejects a wrong secret', () => {
    expect(verifyHmacSignature(body, validSig, 'whsec_other')).toBe(false);
  });

  it('rejects missing signature or secret', () => {
    expect(verifyHmacSignature(body, null, secret)).toBe(false);
    expect(verifyHmacSignature(body, validSig, null)).toBe(false);
    expect(verifyHmacSignature(body, '', '')).toBe(false);
  });
});
