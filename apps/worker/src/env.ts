import { loadRootEnv } from '@scriptproof/db';

loadRootEnv();

export function isTestMode(): boolean {
  return process.env.SCRIPTPROOF_TEST_MODE === '1';
}

export function fixturePort(): number {
  return Number(process.env.FIXTURE_PORT ?? 4820);
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function botInfoUrl(): string {
  return process.env.BOT_INFO_URL ?? `${appUrl()}/bot`;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
