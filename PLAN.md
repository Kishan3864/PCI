# ScriptProof — Build Plan

PCI DSS 6.4.3 / 11.6.1 script monitoring SaaS for small e-commerce merchants.
This file is the working checklist. It is updated as tasks complete. See `ASSUMPTIONS.md`
for decisions made where the brief is silent, and `CHANGELOG.md` for the feature log.

## Architecture summary

```
pnpm workspaces + Turborepo
│
├── apps/web        Next.js 15 (App Router, TS, Tailwind, shadcn/ui-style components)
│                   Better Auth (email+password, email verification), org-scoped app,
│                   Server Actions for mutations, route handlers for ingest/webhooks.
│
├── apps/worker     Node 22 + TS. pg-boss (Postgres-backed queue — no Redis).
│                   Playwright Chromium crawler, diff runner, alert dispatcher,
│                   daily digest cron, scan scheduler cron.
│                   Test mode: serves local fixture pages for e2e/dev.
│
├── packages/db     Drizzle ORM + PostgreSQL 16. Full schema (all product tables,
│                   incl. Phase-2/3 tables so migrations don't churn). drizzle-kit
│                   migrations, seed script.
│
├── packages/core   Pure, unit-tested logic shared by web + worker:
│                   diff engine (5.2), CSP parse/weakening detection, hashing,
│                   script identity, plan gates (7), zod boundary schemas,
│                   domain-verification token logic.
│
├── packages/email  Mailer abstraction: Resend (prod) | SMTP/Mailhog (local dev).
│                   React Email templates: verify-email, critical alert, daily digest.
│
└── packages/agent  (Phase 3) runtime MutationObserver snippet, <6KB gzip IIFE.
```

Data flow: scheduler cron (worker) → `scan.site` job → Playwright crawl of due pages
(1 fetch / 2s per site, bot UA, 30s timeout) → persist `scans` + `script_observations` +
`header_snapshots` → diff engine (pure) vs previous scan → persist `changes` + upsert
`scripts` inventory → `alert.dispatch` job → immediate email (critical) or daily digest
(warning/info), 24h dedupe per (script, change type).

Web: signup → org auto-created (owner) → add site → domain verification (DNS TXT or
meta tag; mockable in test mode) → pages CRUD → first scan = baseline (all scripts
`pending`, no alerts) → inventory review: authorize/block + justification (min 10 chars)
→ change timeline with acknowledge.

## Phase 1 — Core loop

- [x] 1.1 Monorepo scaffold: pnpm-workspace, turbo, tsconfig, ESLint 9 flat + Prettier, .gitignore, .env.example, docker-compose (Postgres 16 + Mailhog), git init
- [x] 1.2 packages/db: full Drizzle schema (all tables §4), client, drizzle-kit config, migrations
- [x] 1.3 packages/core: script identity + hashing, diff engine (5.2), CSP analysis, plan gates, zod schemas
- [x] 1.4 packages/core: unit tests for diff engine, CSP, hashing, plan gates (Vitest)
- [x] 1.5 packages/email: mailer abstraction (Resend | SMTP), React Email templates
- [x] 1.6 apps/web: Next.js scaffold, Tailwind, base UI components, marketing landing (minimal Phase-1 version) + /bot page
- [x] 1.7 apps/web: Better Auth (email+password, email verification), org bootstrap, protected /app layout
- [x] 1.8 apps/web: sites — add site, verification flow (DNS TXT / meta tag, test-mode mock), site list/dashboard
- [x] 1.9 apps/web: pages CRUD (label, frequency, active) with plan-gate stubs
- [x] 1.10 apps/worker: pg-boss setup, scan scheduler cron, scan.site job
- [x] 1.11 apps/worker: Playwright crawler (5.1) + fixture server (test mode)
- [x] 1.12 apps/worker: diff runner (applies packages/core diff), baseline flow
- [x] 1.13 apps/worker: alert dispatch (critical immediate email, dedupe 24h) + daily digest cron
- [x] 1.14 apps/web: inventory UI (authorize/block + justification modal), changes timeline (acknowledge), headers tab, site settings (pages, verification status), "Scan now"
- [x] 1.15 packages/db: seed script (demo org/user, fixture site, baseline scan)
- [x] 1.16 e2e: Playwright happy path (signup → add site → verify mocked → scan fixture → inventory)
- [x] 1.17 Quality gates green: pnpm lint, pnpm typecheck, pnpm test
- [x] 1.18 Multi-agent review pass (diff engine, schema, auth, spec compliance) + fixes
- [x] 1.19 PHASE1_REVIEW.md + README run instructions
- [x] ✅ CHECKPOINT 1

## Phase 2 — Money layer

- [ ] 2.1 BillingProvider interface + Dodo Payments impl (createCheckoutLink, verifyWebhook, mapEvent), webhook route, subscriptions table sync
- [ ] 2.2 Plan gates enforced server-side on all mutations (sites/pages/frequency/features)
- [ ] 2.3 Evidence Pack: HTML report → Playwright PDF (A4, print CSS, navy/white), monthly cron + on-demand, storage + evidence_reports rows, dashboard download
- [ ] 2.4 Free scanner /free-scan: queued job, live status, results page, blurred CTA section, email-gated PDF, 3 scans/IP/day (DB rate limit)
- [ ] 2.5 Marketing: full landing, /pricing, /blog (MDX, 3 seeded articles 800+ words), /legal, footer disclaimers everywhere
- [ ] 2.6 CSP ingest endpoint (csp-report + Reporting-API) + CSP Insights tab + copy-paste Report-Only header
- [ ] 2.7 PHASE2_REVIEW.md + README Railway deploy guide (Dockerfiles, railway.json, Dodo webhook setup)
- [ ] ✅ CHECKPOINT 2

## Phase 3 — Growth layer

- [ ] 3.1 packages/agent: <6KB gzip IIFE, MutationObserver, POST /api/ingest/agent, fail-silent; "runtime-injected" badge in inventory
- [ ] 3.2 Slack incoming-webhook alerts (Pro+), org settings field
- [ ] 3.3 Agency white-label (logo on Evidence Pack cover) + CSV inventory export
- [ ] 3.4 On-demand scan button polish (rate-limited)
- [ ] 3.5 Admin page (env-gated): orgs + subscriptions list
- [ ] ✅ CHECKPOINT 3

## Definition of done (whole project)

Fresh clone → `pnpm i` → `docker compose up -d` → `pnpm db:migrate && pnpm db:seed` →
`pnpm dev` → sign up, verify fixture site, run scan, authorize scripts, mutate fixture,
receive alert (Mailhog locally), download Evidence Pack.
