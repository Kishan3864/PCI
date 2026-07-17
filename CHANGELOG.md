# CHANGELOG

All notable changes, newest first. Format: date — feature (commit type).

## Trust & support release (2026-07-17)

- fix(verify): DNS TXT verification now queries Google DoH + Cloudflare DoH + system resolver
  in parallel and unions the answers — a freshly added record verifies as soon as any public
  resolver sees it; failure message now distinguishes "no record yet" from "stale token from
  an earlier add-site attempt" (with count)
- fix(storage): relative `STORAGE_DIR` resolves against the monorepo root in both web and
  worker — Evidence Pack PDFs written by the worker are now found by the web download route
  in dev (was: 404 → browser saved `download.txt`); download filename is now
  `scriptproof-evidence-<domain>-<YYYY-MM>.pdf`
- feat(export): CSV exports replaced with styled XLSX (exceljs) — brand banner (white-label
  org name on Agency), PCI requirement in title, sized columns, color-coded status/severity
  cells, zebra rows, freeze panes, auto-filter; applies to inventory + change log
- feat(support): full support system — `support_tickets` table + migration, `/app/support`
  page (ticket form with category/priority, contact channels, resources, ticket history),
  emails to `SUPPORT_EMAIL` inbox + confirmation to the requester, Support link in the app
  header, admin queue with open-ticket tile and resolve/reopen actions
- feat(settings): settings tab navigation (Organization / Account & security / Billing);
  organization rename (owner-gated); new Account & security page — display name, password
  change via Better Auth (revokes other sessions), active-session list with per-device
  sign-out
- feat(billing-page): in-app plans page rebuilt — billing-clarity chips, detailed plan cards,
  12-row comparison table with current-plan highlight, Dodo "we never see your card" note,
  billing FAQ, support CTA; renewal date shown on the current-plan card
- fix(dev): web drizzle client rebuilt per hot-reload (pool stays singleton) so schema changes
  appear in `db.query.*` without a dev-server restart

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
