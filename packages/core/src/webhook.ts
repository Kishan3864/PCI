import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Constant-time verification of a hex HMAC-SHA256 signature over `rawBody`.
 * Used by billing webhook handlers (Dodo, Lemon Squeezy).
 */
export function verifyHmacSignature(
  rawBody: string,
  signatureHex: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  if (!signatureHex || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(signatureHex);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
