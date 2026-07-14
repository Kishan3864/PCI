import { describe, expect, it } from 'vitest';
import { isHostConnectable, safeFetch } from '../src/net-guard';

describe('isHostConnectable', () => {
  it('allows any host in test mode (local fixtures)', async () => {
    expect(await isHostConnectable('localhost:4820', { testMode: true })).toBe(true);
    expect(await isHostConnectable('127.0.0.1', { testMode: true })).toBe(true);
  });

  it('rejects forbidden hosts in production without needing DNS', async () => {
    expect(await isHostConnectable('localhost', { testMode: false })).toBe(false);
    expect(await isHostConnectable('127.0.0.1', { testMode: false })).toBe(false);
    expect(await isHostConnectable('169.254.169.254', { testMode: false })).toBe(false);
    expect(await isHostConnectable('10.0.0.5', { testMode: false })).toBe(false);
    expect(await isHostConnectable('nas.local', { testMode: false })).toBe(false);
  });
});

describe('safeFetch', () => {
  it('refuses non-http(s) schemes', async () => {
    await expect(safeFetch('file:///etc/passwd', {}, { testMode: false })).rejects.toThrow(
      /non-http/,
    );
  });

  it('refuses a private-IP target in production before connecting', async () => {
    await expect(
      safeFetch('http://169.254.169.254/latest/meta-data/', {}, { testMode: false }),
    ).rejects.toThrow(/non-public host/);
  });
});
