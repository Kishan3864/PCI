# PHASE 2 REVIEW — Money layer

Status: ✅ complete. All quality gates green; every new flow verified live on this machine.

## What ships in Phase 2

1. **Billing (2.1)** — `BillingProvider` interface (`createCheckoutLink`, `verifyWebhook`,
   `mapEvent`) with three implementations: **Dodo Payments** (default), **Lemon Squeezy**
   (proves the interface is swappable via `BILLING_PROVIDER`), and a **local mock** used
   when no provider key is set. Webhook route `/api/webhooks/billing` verifies the HMAC
   signature (shared, unit-tested `verifyHmacSignature`), maps the event, and syncs the
   `subscriptions` table + the org's `plan`. Billing settings page: current plan, usage
   meters, plan cards → checkout, cancel. Owner-only mutations.
2. **Plan gates (2.2)** — server-side everywhere: site/page counts and scan frequency
   (Phase 1), plus feature gates for Evidence Packs and CSP Insights (`planAllows`), with
   an upgrade prompt for Starter.
3. **Evidence Pack PDF (2.3)** — Playwright HTML→PDF (A4, print CSS, navy/white), cover +
   Section A (inventory & authorization, 6.4.3) + Section B (change/tamper log, 11.6.1) +
   Section C (header monitoring) + Section D (scan cadence) + disclaimer on every page.
   On-demand button (Pro+) and a monthly cron (1st, 06:00 UTC). Stored to a volume, row in
   `evidence_reports`, download route with org-ownership checks. White-label logo for Agency.
4. **Free scanner (2.4)** — `/free-scan`: URL → queued job → live status (poll) → results
   (script count, external domains, SRI coverage, security headers present/missing) + a
   blurred "changes over time" teaser with signup CTA. Email-gated one-page PDF download.
   DB-based rate limit of 3 scans/IP/day. SSRF-guarded (arbitrary public URL; private hosts
   refused in production).
5. **Marketing (2.5)** — full landing with how-it-works + FAQ, `/pricing` (plan cards +
   comparison table), `/blog` (MDX, 3 seeded 800+-word articles), `/legal`, `/bot`.
   Disclaimer footer on every page.
6. **CSP endpoint (2.6)** — `POST /api/ingest/csp/:siteKey` accepts both the legacy
   `application/csp-report` body and the Reporting-API array; aggregates into `csp_reports`
   (upsert + count). CSP Insights tab lists blocked URIs; site provides a copy-paste
   `Content-Security-Policy-Report-Only` header.

## How to try it locally

Follow the Quick start in the README (`docker compose up -d`, migrate, seed, `pnpm dev`),
then log in as `demo@scriptproof.local` / `demo-password-123`.

- **Free scan:** open `/free-scan`, enter `http://localhost:4820/checkout` (test mode allows
  localhost), watch it complete, gate the PDF with an email.
- **Evidence Pack:** on the demo site → **Evidence Packs** tab → **Generate now** → download.
- **Billing (mock):** click the plan badge → choose a plan → simulated checkout → plan changes.
- **CSP:** copy the Report-Only header from the **CSP Insights** tab; POST a sample report to
  `/api/ingest/csp/<siteId>` and watch it appear.

## Quality gates (all green)

| Gate                                        | Result      |
| ------------------------------------------- | ----------- |
| `pnpm lint` (ESLint 9, `--max-warnings 0`)  | clean       |
| `pnpm typecheck` (tsc strict, 5 workspaces) | clean       |
| `pnpm test` (Vitest: 100 core + 4 worker)   | 104 passing |
| `next build` (production)                   | success     |

## Verified live on this machine

- **CSP ingest** — legacy report upserted to count 2; Reporting-API report aggregated
  separately; both returned 204.
- **Billing webhook (mock)** — org upgraded pro → agency, `subscriptions` row written
  (mock / agency / active).
- **Free scan** — fixture checkout scanned: status `done`, 3 scripts, 4/6 headers, valid
  52 KB PDF written to storage.
- **Evidence Pack** — generated for the demo site: valid 64 KB PDF written to storage,
  `evidence_reports` row created.

## Deployment

Railway: three services (web, worker, Postgres) via `Dockerfile.web` / `Dockerfile.worker`
(+ `railway.web.json` / `railway.worker.json`). Worker image ships Playwright Chromium and
mounts a volume at `/app/storage`. Full env var list and Dodo webhook setup are in the README.

## Known limitations / deferred

- **Dodo API specifics** (exact checkout request/response and webhook field names) follow
  Dodo's documented model but should be confirmed against their current docs; see
  ASSUMPTIONS.md #17. The mock provider makes the full flow testable without keys.
- In-app **cancel** downgrades to Starter immediately; in production the provider's
  cancellation webhook is the source of truth.
- The multiple-CSP-header edge case from the Phase 1 review remains documented, not fixed
  (ASSUMPTIONS.md #14).
- Phase 3 (agent snippet, Slack alerts, Agency CSV export, admin page) is not started.
