import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import type { NextConfig } from 'next';

// Load the repo-root .env so one env file drives web + worker + db.
// `next dev/build` runs with cwd = apps/web.
const rootEnv = path.resolve(process.cwd(), '../../.env');
if (existsSync(rootEnv)) {
  config({ path: rootEnv, quiet: true });
}

const nextConfig: NextConfig = {
  transpilePackages: ['@scriptproof/core', '@scriptproof/db', '@scriptproof/email'],
  serverExternalPackages: ['pg', 'pg-boss'],
};

export default nextConfig;
