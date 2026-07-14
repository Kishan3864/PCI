# ScriptProof

Script monitoring & evidence for PCI DSS v4.0.1 requirements **6.4.3** and **11.6.1**,
built for small merchants and the agencies that maintain their sites.

ScriptProof crawls your verified payment pages on a schedule, fingerprints every script,
detects unauthorized changes to scripts and security headers, alerts you by email, and
generates a monthly PDF Evidence Pack you can attach to your SAQ.

> ScriptProof is a monitoring and evidence tool. It is not a Qualified Security Assessor
> (QSA) service and does not certify PCI DSS compliance. Consult your acquirer or a QSA
> for validation requirements.

## Quick start (local)

```bash
pnpm install
pnpm --filter worker exec playwright install chromium   # crawler browser (one-time)
docker compose up -d          # Postgres 16 (host port 5433) + Mailhog
cp .env.example .env          # fill in BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:migrate
pnpm db:seed
pnpm dev                      # web on :3000, worker + fixture shop on :4820
```

Mailhog UI (local email): http://localhost:8025

Demo login: `demo@scriptproof.local` / `demo-password-123`. The seeded site
`localhost:4820` is a fake checkout served by the worker — open its Inventory tab,
press **Scan now**, and the baseline appears. Simulate a skimmer injection with:

```bash
curl -X POST http://localhost:4820/__fixture/variant -d '{"variant":"modified"}'
```

then rescan and check the Changes tab (and Mailhog for the critical alert).

## Repository layout

| Path             | What                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `apps/web`       | Next.js 15 app — marketing, dashboard, auth, server actions      |
| `apps/worker`    | Node 22 worker — pg-boss queue, Playwright crawler, alerts, PDFs |
| `packages/db`    | Drizzle ORM schema, migrations, seed                             |
| `packages/core`  | Pure logic: diff engine, CSP analysis, hashing, plan gates       |
| `packages/email` | Mailer abstraction (Resend / SMTP) + React Email templates       |

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `pnpm db:generate` — generate Drizzle migrations from schema
- `pnpm db:migrate` / `pnpm db:seed`
- `pnpm e2e` — Playwright end-to-end happy path

## Deploying to Railway

Three services from this one repo: **web**, **worker**, and **Postgres**.

1. **Postgres** — add a Railway Postgres plugin. Copy its connection string.
2. **web service** — deploy from the repo using `Dockerfile.web` (see `railway.web.json`).
3. **worker service** — deploy from the repo using `Dockerfile.worker` (ships Playwright
   Chromium). Attach a **volume** mounted at `/app/storage` so Evidence Pack / free-scan
   PDFs persist. See `railway.worker.json`.
4. Run migrations once against the Railway database: `pnpm db:migrate`
   (with `DATABASE_URL` pointed at Railway), or add it as a one-off/release command.

### Environment variables (both services)

Set these on **web and worker** (see `.env.example` for the full annotated list):

| Var                                        | Notes                                      |
| ------------------------------------------ | ------------------------------------------ |
| `DATABASE_URL`                             | Railway Postgres connection string         |
| `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL`  | Public URL of the web service              |
| `BETTER_AUTH_SECRET`                       | `openssl rand -base64 32`                  |
| `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` | Production email                           |
| `EMAIL_FROM`                               | Verified sender                            |
| `BOT_INFO_URL`                             | `https://<your-domain>/bot`                |
| `STORAGE_DIR=/app/storage`                 | Worker only (matches the mounted volume)   |
| `BILLING_PROVIDER=dodo` + Dodo keys        | See below (omit keys → local mock billing) |

Leave `SCRIPTPROOF_TEST_MODE` **unset** in production.

### Dodo Payments webhook setup

1. Create the three products (Starter / Pro / Agency) in the Dodo dashboard and set
   `DODO_PRODUCT_STARTER` / `DODO_PRODUCT_PRO` / `DODO_PRODUCT_AGENCY` to their ids.
2. Set `DODO_API_KEY` and `DODO_WEBHOOK_SECRET`.
3. Add a webhook endpoint pointing at `https://<your-domain>/api/webhooks/billing`.
   The handler verifies the HMAC signature, maps the event, and syncs the
   `subscriptions` table and the org's plan. Subscribe to the subscription
   lifecycle events (created/active/renewed/updated/cancelled).

> Until a real provider key is set, billing runs in **mock mode**: choosing a plan
> routes to an in-app simulated checkout so the whole flow is testable locally.

See `PLAN.md` (roadmap), `ASSUMPTIONS.md` (decisions), `CHANGELOG.md`,
`PHASE1_REVIEW.md`, `PHASE2_REVIEW.md`.
