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
docker compose up -d          # Postgres 16 + Mailhog
cp .env.example .env          # fill in BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:migrate
pnpm db:seed
pnpm dev                      # web on :3000, worker + fixture pages
```

Mailhog UI (local email): http://localhost:8025

## Repository layout

| Path             | What                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `apps/web`       | Next.js 15 app — marketing, dashboard, auth, server actions       |
| `apps/worker`    | Node 22 worker — pg-boss queue, Playwright crawler, alerts, PDFs  |
| `packages/db`    | Drizzle ORM schema, migrations, seed                              |
| `packages/core`  | Pure logic: diff engine, CSP analysis, hashing, plan gates        |
| `packages/email` | Mailer abstraction (Resend / SMTP) + React Email templates        |

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `pnpm db:generate` — generate Drizzle migrations from schema
- `pnpm db:migrate` / `pnpm db:seed`
- `pnpm e2e` — Playwright end-to-end happy path

See `PLAN.md` (roadmap), `ASSUMPTIONS.md` (decisions), `CHANGELOG.md`.
