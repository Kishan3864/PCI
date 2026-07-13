import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

/**
 * Loads the repo-root .env regardless of which workspace the process was
 * started from, then falls back to a local .env. Never overrides variables
 * already present in the environment.
 */
export function loadRootEnv(): void {
  let dir = process.cwd();
  for (let i = 0; i < 5; i += 1) {
    const candidate = path.join(dir, '.env');
    if (existsSync(candidate)) {
      config({ path: candidate, quiet: true });
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  config({ quiet: true });
}
