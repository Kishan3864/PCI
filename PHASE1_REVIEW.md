# PHASE 1 REVIEW — Core loop

Status: ✅ complete. All quality gates green, full loop verified live on this machine
(crawl → baseline → tamper → change detection → critical alert email in Mailhog), e2e passing.

## What works end-to-end

1. **Signup & orgs** — Better Auth email+password with mandatory email verification
   (Resend in prod, Mailhog locally). Every new user gets an org (role `owner`);
   sessions carry an active org. Plan column on `orgs` (default `starter`,
   14-day `trialEndsAt`; billing drives it in Phase 2).
2. **Sites & domain verification** — add a domain → DNS TXT (`scriptproof-verify=<token>`)
   or meta-tag verification. Monitoring is impossible before verification (hard rule 2):
   the scan runner independently refuses unverified sites. Production policy blocks
   localhost/private/IP/port domains (SSRF guard, `packages/core/src/verification.ts`).
3. **Pages CRUD** — label, daily/6h frequency, pause/resume, delete. Plan gates enforced
   server-side (sites per org, pages per site, 6h = Pro+). Page URLs must live exactly on
   the verified host. Creating a page on a verified site queues its baseline scan instantly.
4. **Crawler (5.1)** — Playwright Chromium, `ScriptProofBot/1.0 (+<bot page>)` UA,
   `networkidle` + 3s settle, 30s timeout, MutationObserver catches runtime-injected tags,
   external scripts fetched server-side (SHA-256, byte size, SRI presence), full response
   header set captured. One page per 2s per site — pages scan sequentially in one job.
5. **Diff engine (5.2)** — pure, in `packages/core`, 90 unit tests. Baseline = pending
   inventory + zero alerts. new_script / script_modified / script_removed (3-scan streak)
   / sri_removed / header_changed with CSP-weakening analysis, severities per spec.
   Baseline scans never rewrite a known script's recorded hash/SRI, and unfetchable
   scripts never masquerade as content changes (both hardened in the review pass).
6. **Alerting (5.3)** — critical → immediate email to all org members (before/after hash,
   review link); warning/info → daily 08:00 UTC digest; 24h dedupe (per script site-wide,
   or per page+header). Alerts recorded in `alerts` (sent / failed / skipped_dedupe).
7. **App UI** — dashboard (sites, open criticals, last scan), site tabs: Inventory
   (authorize/block with **required ≥10-char justification**, recorded with user + time),
   Changes (timeline + acknowledge), Headers (tracked six + full snapshot), Settings
   (pages, verification, scan-now). Disclaimer footer on every page.
8. **Fixture site** — the worker serves a deterministic fake checkout on :4820 with
   switchable variants (`baseline`/`modified`) to demo/tests change detection, plus a
   verify-token endpoint so e2e exercises the real meta verification path.

## How to run locally

```bash
pnpm install
docker compose up -d                  # Postgres 16 (host port 5433) + Mailhog (:8025)
cp .env.example .env                  # set BETTER_AUTH_SECRET; keep SCRIPTPROOF_TEST_MODE=1
pnpm db:migrate && pnpm db:seed
pnpm dev                              # web :3000, worker (+fixture :4820)
```

Demo: log in as `demo@scriptproof.local` / `demo-password-123` → site `localhost:4820`
is pre-verified → Inventory → "Scan now" → baseline appears in ~15s. Simulate a skimmer:

```bash
curl -X POST http://localhost:4820/__fixture/variant -d '{"variant":"modified"}'
```

authorize `checkout.js` first, rescan, and watch the critical email land in Mailhog
(http://localhost:8025). Or run everything at once: `pnpm e2e`.

## Quality gates (all green)

| Gate                                        | Result     |
| ------------------------------------------- | ---------- |
| `pnpm lint` (ESLint 9, `--max-warnings 0`)  | clean      |
| `pnpm typecheck` (tsc strict, 5 workspaces) | clean      |
| `pnpm test` (Vitest: 90 core + 4 worker)    | 94 passing |
| `pnpm format:check` (Prettier)              | clean      |
| `next build` (production)                   | success    |
| `pnpm e2e` (Playwright happy path)          | passing    |

## Verified live on this machine

Baseline scan → 3 scripts inventoried on Checkout (SRI detected on checkout.js), 0 changes →
authorize `checkout.js` → fixture flipped to `modified` → `new_script` (critical, injected.js
on the payment page), `script_modified` (critical, the authorized checkout.js), 2× CSP
`header_changed` (warning) detected → 2 critical alert emails delivered to Mailhog, alert rows
`sent`. An identical rescan produced **0** new changes and every scan row stayed `success`
(no hash churn, no false positives).

## Review pass (step 1.18)

A multi-agent review ran against the full tree; 10 findings surfaced. Nine were confirmed and
fixed, each with a regression test where testable; one is documented as a deferred limitation.

| #   | Sev  | Issue                                                                                  | Fix                                                                                                              |
| --- | ---- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | high | SSRF in meta verification (redirect-follow / DNS→private-IP)                           | New `@scriptproof/core/net-guard` `safeFetch`: resolves host, blocks private IPs, re-validates each redirect hop |
| 2   | med  | SSRF in crawler script fetch / page load                                               | Same guard on external-script fetches and a pre-`goto` host check                                                |
| 3   | high | New-page baseline silently overwrote a known script's hash/SRI, masking tampers        | Baseline now does presence-only bookkeeping for already-known scripts                                            |
| 4   | med  | In-browser dedup by exact `src` defeated the "any unprotected tag kills SRI" rule      | Duplicate `src` tags merge with integrity AND-ed                                                                 |
| 5   | med  | `'unfetchable'` sentinel fired false critical `script_modified`                        | `unfetchable` flag; diff ignores it and preserves the last good hash                                             |
| 6   | low  | CSP emptied to blank classified "modified" not "removed"                               | Blank/whitespace tracked-header value treated as absent                                                          |
| 7   | low  | Multiple CSP headers comma-joined distorts weakening analysis                          | Documented limitation (ASSUMPTIONS.md #14); needs per-duplicate header access                                    |
| 8   | high | Alert-enqueue failure flipped a committed `success` scan to `error` and lost the alert | Enqueue moved outside the scan try/catch, isolated per alert                                                     |
| 9   | med  | Dedupe scoped per-page re-alerted the same script seen on another page                 | Script changes now dedupe by `scriptId` site-wide; headers by page+header                                        |
| 10  | med  | Digest send failure dropped warning/info alerts forever                                | Wider digest lookback + rethrow so pg-boss retries                                                               |

## Known limitations / deferred (see ASSUMPTIONS.md for rationale)

- Marketing site is a minimal Phase-1 landing; full landing, /pricing, /blog, free scanner
  arrive in Phase 2. `/free-scan` is an honest placeholder.
- Evidence Packs, billing/plan upgrades, CSP ingest: Phase 2. Agent snippet, Slack,
  white-label/CSV, admin: Phase 3.
- Inline scripts are identified by content hash: an edited inline script shows as
  new_script + eventual removal of the old hash (documented in ASSUMPTIONS.md #3).
- Domain verification is checked once; periodic re-verification is a future hardening item.
- SSRF guard resolves DNS and blocks private targets, but Node re-resolves at connect time,
  so DNS-rebinding is a documented residual (ASSUMPTIONS.md #13); full fix needs IP pinning.
- Multiple `Content-Security-Policy` response headers are comma-merged by Playwright
  (ASSUMPTIONS.md #14) — a rare edge case, deferred.
