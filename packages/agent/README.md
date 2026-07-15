# @scriptproof/agent

The ScriptProof **runtime agent**: a dependency-free, fail-silent browser snippet
(<6KB, ES2017 IIFE) that catches scripts injected at runtime in real shoppers'
browsers — the ones a scheduled crawl can never see.

## Embed

Add the tag to every monitored payment page (Pro and Agency plans):

```html
<script src="https://YOUR_APP_ORIGIN/agent.js" data-site-key="YOUR_SITE_KEY" async></script>
```

- `src` — the deployed ScriptProof app serves the snippet at `/agent.js`.
- `data-site-key` — the site key shown under **Site settings → Runtime agent**.

## What it does

1. On page load, inventories `document.scripts` (external `src`s; inline scripts
   are fingerprinted with SHA-256 via `crypto.subtle` when available).
2. A `MutationObserver` watches for `<script>` elements injected after load and
   reports them with runtime provenance (`injected: true`).
3. Sends at most **5 batches per page view** (1 on load + throttled follow-ups),
   capped at 100 scripts each, via `navigator.sendBeacon` (falling back to
   `fetch` with `keepalive`) as `text/plain` JSON — no CORS preflight — to
   `<origin-of-this-script>/api/ingest/agent/<siteKey>`.

## Guarantees

- **Fail-silent**: every code path is wrapped; the snippet can never throw into
  the host page and never logs to the console.
- **Dumb by design**: all validation, plan gating, page matching and rate
  limiting happen server-side in the ingest route.

## Deployment

The snippet source is `src/agent.js`. A copy is checked in at
`apps/web/public/agent.js` so Next.js serves it at `/agent.js` — keep the two
files in sync when editing.
