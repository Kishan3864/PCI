# CHANGELOG

All notable changes, newest first. Format: date — feature (commit type).

## Phase 2 — Money layer (2026-07-14)

- feat(billing): `BillingProvider` interface + Dodo Payments + Lemon Squeezy + local mock;
  webhook route with HMAC verification (shared, unit-tested), subscriptions + org plan sync;
  billing settings (plan cards, usage meters, cancel); server-side feature plan gates
- feat(evidence): Evidence Pack PDF via Playwright HTML→PDF (cover + Sections A–D + disclaimer),
  on-demand (Pro+) + monthly cron, volume storage, ownership-checked download; Agency white-label
- feat(free-scan): rate-limited (3/IP/day) queued one-off scanner, live status, results with
  blurred changes teaser, email-gated one-page PDF; SSRF-guarded arbitrary-URL crawl
- feat(csp): ingest endpoint (legacy `csp-report` + Reporting-API), upsert+count into
  `csp_reports`, CSP Insights tab, copy-paste Report-Only header
- feat(marketing): full landing + FAQ, `/pricing` with comparison table, MDX `/blog` with 3
  seeded 800+-word articles, disclaimer everywhere
- chore(deploy): `Dockerfile.web`, `Dockerfile.worker` (Playwright base), `railway.*.json`,
  README Railway + Dodo webhook guide
- 100 core + 4 worker unit tests; all flows verified live

## Phase 1 — Core loop (2026-07-13)

- fix(review): nine confirmed findings from the multi-agent review pass —
  - security: SSRF guard (`@scriptproof/core/net-guard`) on domain verification, crawler page
    loads, and external script fetches — resolves the host, blocks private/loopback targets,
    and re-validates every redirect hop (production; test mode bypasses for localhost fixtures)
  - diff: new-page baseline no longer overwrites a known script's recorded hash/SRI (was
    masking pre-existing tampers); unfetchable scripts no longer fire false `script_modified`
  - crawler: duplicate `src` tags merge integrity with AND so one unprotected tag can't hide
    a missing SRI; blank tracked-header value treated as removed
  - worker: critical-alert enqueue isolated from the scan transaction (a queue error no longer
    flips a committed `success` scan to `error` or drops the alert); alert dedupe scoped by
    script site-wide (not per-page); daily digest widened + retried so a failed run recovers
  - 9 new regression tests (diff baseline/unfetchable/blank-CSP, net-guard); 94 tests total

- test(e2e): Playwright happy path — signup, email verify via Mailhog, add site, real
  meta-tag domain verification, automatic baseline scan, authorize with justification
- fix(worker,email): browser-context scripts shipped as raw strings (tsx/esbuild `__name`
  helper breaks serialized closures); email templates force automatic JSX runtime;
  client-safe `@scriptproof/core/schemas` subpath (node:crypto out of client bundles)
- feat(worker): Playwright crawler (bot UA, networkidle+3s, MutationObserver,
  server-side script fetch + SHA-256), scan runner with transactional persistence,
  10-min scheduler cron, critical alert dispatch with 24h dedupe, daily digest cron,
  fixture checkout server with baseline/modified variants
- feat(web): Better Auth (email verification required) + auto org bootstrap, dashboard,
  add site + DNS/meta verification flow, pages CRUD with server-side plan gates,
  inventory with authorize/block justification workflow (min 10 chars), change timeline
  with acknowledge, headers tab, site settings; disclaimer on every page
- feat(email): mailer abstraction (Resend | SMTP/Mailhog) + verify/critical-alert/digest templates
- feat(core): pure diff engine (spec 5.2) with 81 unit tests, CSP parse + weakening
  analysis, script identity rules, plan limits (§7), zod boundary schemas, domain
  verification + SSRF guards
- feat(db): full Drizzle schema (19 tables incl. Phase-2/3), migrations, seed
  (demo org + pre-verified fixture site)
- chore: monorepo scaffold — pnpm workspaces + Turborepo, ESLint 9 flat + Prettier +
  strict tsc gates, docker-compose (Postgres 16 on host port 5433, Mailhog)
