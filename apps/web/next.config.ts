import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

// Load the repo-root .env so one env file drives web + worker + db.
// `next dev/build` runs with cwd = apps/web.
const rootEnv = path.resolve(process.cwd(), '../../.env');
if (existsSync(rootEnv)) {
  config({ path: rootEnv, quiet: true });
}

// Hardened response headers served on every route (defense-in-depth on top of
// nginx/TLS). HSTS only matters over HTTPS; harmless in local dev.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  transpilePackages: ['@scriptproof/core', '@scriptproof/db', '@scriptproof/email'],
  serverExternalPackages: ['pg', 'pg-boss'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
