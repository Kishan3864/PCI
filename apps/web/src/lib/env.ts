/** Typed accessors for server-side env. next.config.ts loads the root .env. */

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function isTestMode(): boolean {
  return process.env.SCRIPTPROOF_TEST_MODE === '1';
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
