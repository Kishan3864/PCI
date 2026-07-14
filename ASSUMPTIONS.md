# ASSUMPTIONS

Decisions made where the brief is silent. Newest at the bottom.

1. **Internal packages ship TS source, no build step.** `packages/*` export TypeScript
   directly (`main: ./src/index.ts`). `apps/web` uses Next `transpilePackages`;
   `apps/worker` runs via `tsx` (dev and prod container). Simplest reliable monorepo
   setup; `pnpm build` = Next build + `tsc --noEmit` elsewhere.
2. **Better Auth organization plugin** backs `orgs` / `org_members` (model names mapped
   to the brief's table names) instead of hand-rolled org code — battle-tested invite
   and role logic. `plan` and `billingCustomerId` are extra columns on `orgs` read/written
   via Drizzle. New signups get `plan = 'starter'` with a `trialEndsAt` 14 days out;
   real plan state is driven by the billing webhook in Phase 2.
3. **Script identity:** external scripts are identified by absolute URL **without query
   string or fragment** (cache-buster queries like `app.js?v=123` would otherwise create
   a new inventory row per deploy; content changes still surface via hash →
   `script_modified`). Inline scripts are identified by their SHA-256 — an edited inline
   script therefore appears as `new_script` (pending) + eventual `script_removed` of the
   old hash, which is the honest representation since there is no stable identity for
   inline code.
4. **Scan unit = site, not page.** The queue job is `scan.site`; the handler scans that
   site's due pages sequentially with ≥2s spacing between page fetches (hard rule 3).
   Per-page jobs could run concurrently and violate the 1-fetch/2s/site etiquette.
   pg-boss `singletonKey = siteId` prevents double-queuing a site.
5. **`script_removed` tracking** uses a `missingStreak` counter column on `scripts`,
   incremented by the diff runner when an authorized script is absent, reset when seen.
   The change fires when the streak reaches exactly 3 (no re-fire at 4+).
6. **Test mode** (`SCRIPTPROOF_TEST_MODE=1`): domain verification reads TXT records from
   the `MOCK_TXT_RECORDS` env var (JSON `{ "domain": ["scriptproof-verify=..."] }`)
   instead of live DNS, `http://localhost:<port>` domains are allowed for sites, and the
   worker serves fixture checkout pages on `FIXTURE_PORT` (default 4820). Production
   refuses non-HTTPS, localhost and private-network URLs.
7. **First scan enqueue:** creating a page on a verified site (and completing
   verification for a site that already has pages) immediately enqueues a baseline scan,
   so the merchant sees inventory without waiting for the scheduler. A manual "Scan now"
   button exists from Phase 1 (the brief lists it under Phase 3 polish; e2e needs it
   earlier).
8. **Email locally:** mailer abstraction with two providers — `resend` (prod) and `smtp`
   (nodemailer → Mailhog on :1025) selected by `EMAIL_PROVIDER`. Both render the same
   React Email templates.
9. **Header monitoring scope (5.2):** `header_changed` fires only for the six tracked
   security headers (CSP, CSP-Report-Only, HSTS, X-Frame-Options,
   X-Content-Type-Options, Referrer-Policy). The full header set is still stored in
   `header_snapshots` for the Evidence Pack. CSP "weakened" = a directive present before
   is removed, or `'unsafe-inline'` / `'unsafe-eval'` added to any directive; CSP header
   removed entirely = critical.
10. **Checkout-page severity rule:** a page counts as a payment page when its label
    contains "checkout", "payment", "pay" or "cart" (case-insensitive).
11. **Daily digest** is one global cron at 08:00 UTC that groups the last 24h of
    unalerted warning/info changes per org and sends one email per org member.
12. **Email templates:** `@react-email/components` is deprecated/unsupported on npm as of
    2026-07. Templates are plain React TSX (table-based email HTML, inline styles)
    rendered with the still-maintained `@react-email/render`.
13. **SSRF defense (added in the Phase-1 review pass):** every outbound request to a
    customer-controlled URL (domain verification, crawler page load, external script
    fetch) goes through `@scriptproof/core/net-guard`. In production it resolves the
    target host and refuses any that maps to a loopback/RFC1918/link-local/CGNAT address,
    and it re-validates every redirect hop (redirects followed manually, http/https only).
    Test mode bypasses the guard so `localhost` fixtures work. **Residual risk:** Node
    re-resolves DNS at connect time, so a DNS-rebinding attacker could pass the check and
    then connect to a private IP. Fully closing this needs connection-level IP pinning
    (custom dispatcher), deferred beyond Phase 1.
14. **Multiple CSP response headers** are merged by Playwright's `response.headers()` into
    one comma-joined string, which can distort weakening analysis when a site sends more
    than one `Content-Security-Policy` header. This is rare in practice; a proper fix needs
    per-duplicate header access (`response.headersArray()`) and CSP-intersection logic,
    deferred. The full header set is still snapshotted correctly for the Evidence Pack.
15. **Baseline scans never rewrite recorded script state** (Phase-1 review fix): when a page
    is baselined but a script is already in the site inventory (seen on another page), the
    baseline only updates presence bookkeeping — it does not overwrite the recorded
    hash/SRI. This prevents a tamper that predates a newly-added page from being silently
    absorbed and masked on all future scans.
16. **Unfetchable external scripts** (network error, non-2xx, oversized, or blocked by the
    SSRF guard) carry an `unfetchable` flag. The diff engine never treats them as a content
    change and never overwrites the last known good hash, so a transient fetch failure
    cannot raise a false critical `script_modified` alert.
