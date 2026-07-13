import { defineConfig } from '@playwright/test';

/**
 * E2E happy path. Preconditions: docker compose up (Postgres + Mailhog) and
 * migrations applied. Web + worker are started automatically (or reused when
 * already running locally). SCRIPTPROOF_TEST_MODE=1 must be set in the root .env.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter worker start',
      url: 'http://localhost:4820',
      reuseExistingServer: true,
      timeout: 120_000,
      cwd: '../..',
    },
  ],
});
