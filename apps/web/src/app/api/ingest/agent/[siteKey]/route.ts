import {
  AGENT_MAX_BODY_BYTES,
  agentIngestSchema,
  inlineUrlKey,
  normalizeScriptUrl,
  planAllows,
  scriptUrlKey,
  type AgentIngestPayload,
} from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Runtime-agent ingest (Phase 3.1). The browser snippet is dumb and fail-silent;
 * EVERYTHING is enforced here: strict zod schema + size caps, site lookup,
 * server-side plan gate, DB-backed per-site rate limit, page matching, and
 * inventory/observation writes. Responses are deliberately uninformative:
 * 413 for oversize bodies, generic 404 for unknown/unverified sites, 200 no-op
 * when gated or rate-limited, 204 otherwise — internals never leak.
 */

const RATE_LIMIT_PER_HOUR = 100;
const RATE_WINDOW_MS = 60 * 60 * 1000;

/** Sentinel hash used when content is unknown (same convention as the crawler). */
const UNFETCHABLE = 'unfetchable';

const empty = (status: number) => new NextResponse(null, { status });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> },
): Promise<NextResponse> {
  const { siteKey } = await params;

  // ── Body caps + strict parse (reject before touching the DB) ──────────────
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return empty(204);
  }
  if (Buffer.byteLength(raw, 'utf8') > AGENT_MAX_BODY_BYTES) return empty(413);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return empty(204);
  }
  const parsed = agentIngestSchema.safeParse(json);
  if (!parsed.success) return empty(204);

  try {
    // ── Site + plan gate ─────────────────────────────────────────────────────
    const site = await db.query.sites.findFirst({ where: eq(schema.sites.id, siteKey) });
    if (!site || !site.verifiedAt) return empty(404);

    const org = await db.query.orgs.findFirst({ where: eq(schema.orgs.id, site.orgId) });
    if (!org) return empty(404);
    // Starter plans get a silent no-op so the response leaks nothing.
    if (!planAllows(org.plan, 'agentSnippet')) return empty(200);

    // ── DB-backed rate limit: ≥100 payloads/hour per site → silent no-op ────
    if (!(await consumeRateLimit(site.id))) return empty(200);

    await ingest(site.id, parsed.data);
    return empty(204);
  } catch {
    // Never leak internals to an unauthenticated beacon endpoint.
    return empty(204);
  }
}

/**
 * Fixed-window counter persisted in the shared `rate_limits` table (survives
 * restarts, applies across instances). Returns false when the site is over.
 */
async function consumeRateLimit(siteId: string): Promise<boolean> {
  const key = `agent-ingest:${siteId}`;
  const now = Date.now();
  const row = await db.query.rateLimits.findFirst({ where: eq(schema.rateLimits.key, key) });

  if (!row) {
    await db.insert(schema.rateLimits).values({ key, count: 1, lastRequest: now });
    return true;
  }
  if (row.lastRequest === null || now - row.lastRequest >= RATE_WINDOW_MS) {
    // Window expired — restart it.
    await db
      .update(schema.rateLimits)
      .set({ count: 1, lastRequest: now })
      .where(eq(schema.rateLimits.id, row.id));
    return true;
  }
  if (row.count >= RATE_LIMIT_PER_HOUR) return false;
  await db
    .update(schema.rateLimits)
    .set({ count: sql`${schema.rateLimits.count} + 1` })
    .where(eq(schema.rateLimits.id, row.id));
  return true;
}

interface NormalizedReport {
  urlKey: string;
  srcUrl: string | null;
  isInline: boolean;
  sha256: string;
  byteSize: number | null;
  injected: boolean;
}

async function ingest(siteId: string, payload: AgentIngestPayload): Promise<void> {
  // ── Match the reported page against the site's monitored pages ────────────
  const pageUrl = safeUrl(payload.url);
  if (!pageUrl) return;

  const sitePages = await db.query.pages.findMany({
    where: and(eq(schema.pages.siteId, siteId), eq(schema.pages.isActive, true)),
  });
  const page = sitePages.find((p) => {
    const monitored = safeUrl(p.url);
    return (
      monitored !== null &&
      normalizeHost(monitored) === normalizeHost(pageUrl) &&
      normalizePath(monitored) === normalizePath(pageUrl)
    );
  });
  if (!page) return;

  // ── Normalize reports to inventory identity keys, dedupe within payload ───
  const byKey = new Map<string, NormalizedReport>();
  for (const s of payload.scripts) {
    let report: NormalizedReport | null = null;
    if (s.src !== undefined) {
      const absolute = normalizeScriptUrl(s.src, payload.url);
      if (!absolute) continue;
      report = {
        urlKey: scriptUrlKey(absolute),
        srcUrl: absolute,
        isInline: false,
        sha256: UNFETCHABLE, // the agent cannot read cross-origin script bodies
        byteSize: null,
        injected: s.injected === true,
      };
    } else if (s.sha256 !== undefined) {
      report = {
        urlKey: inlineUrlKey(s.sha256),
        srcUrl: null,
        isInline: true,
        sha256: s.sha256,
        byteSize: s.size ?? null,
        injected: s.injected === true,
      };
    }
    if (!report) continue;
    const existing = byKey.get(report.urlKey);
    // An "injected" sighting outranks a plain on-load one for the same script.
    if (!existing || (report.injected && !existing.injected)) byKey.set(report.urlKey, report);
  }
  if (byKey.size === 0) return;

  const known = await db.query.scripts.findMany({
    where: and(
      eq(schema.scripts.siteId, siteId),
      inArray(schema.scripts.urlKey, [...byKey.keys()]),
    ),
  });
  const knownByKey = new Map(known.map((k) => [k.urlKey, k]));
  const now = new Date();

  const observations: (typeof schema.scriptObservations.$inferInsert)[] = [];

  // ── Known scripts reported as runtime-injected → flag them ────────────────
  const knownInjectedIds = [...byKey.values()]
    .filter((r) => r.injected && knownByKey.has(r.urlKey))
    .map((r) => {
      const script = knownByKey.get(r.urlKey)!;
      observations.push(observationFor(script.id, r, page.id));
      return script.id;
    });
  if (knownInjectedIds.length > 0) {
    await db
      .update(schema.scripts)
      .set({ runtimeSeen: true, lastSeenAt: now })
      .where(inArray(schema.scripts.id, knownInjectedIds));
  }

  // ── Unknown scripts → create pending inventory rows with runtime provenance ─
  const unknown = [...byKey.values()].filter((r) => !knownByKey.has(r.urlKey));
  if (unknown.length > 0) {
    const created = await db
      .insert(schema.scripts)
      .values(
        unknown.map((r) => ({
          siteId,
          urlKey: r.urlKey,
          srcUrl: r.srcUrl,
          isInline: r.isInline,
          status: 'pending' as const,
          firstSeenAt: now,
          lastSeenAt: now,
          lastSeenPageId: page.id,
          latestSha256: r.isInline ? r.sha256 : null,
          latestByteSize: r.byteSize,
          latestSriPresent: false,
          runtimeSeen: true,
        })),
      )
      // Concurrent payloads may race on (siteId, urlKey) — converge, don't fail.
      .onConflictDoUpdate({
        target: [schema.scripts.siteId, schema.scripts.urlKey],
        set: { runtimeSeen: true, lastSeenAt: now },
      })
      .returning({ id: schema.scripts.id, urlKey: schema.scripts.urlKey });

    const createdByKey = new Map(created.map((c) => [c.urlKey, c.id]));
    for (const r of unknown) {
      const scriptId = createdByKey.get(r.urlKey);
      if (scriptId) observations.push(observationFor(scriptId, r, page.id));
    }
  }

  if (observations.length > 0) {
    await db.insert(schema.scriptObservations).values(observations);
  }
}

function observationFor(
  scriptId: string,
  report: NormalizedReport,
  pageId: string,
): typeof schema.scriptObservations.$inferInsert {
  return {
    scanId: null, // runtime-agent observation — not produced by a crawler scan
    scriptId,
    sha256: report.sha256,
    byteSize: report.byteSize,
    sriPresent: false,
    attrs: {
      source: 'agent',
      injected: report.injected ? 'true' : 'false',
      pageId,
    },
  };
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** Host comparison ignoring case and a leading `www.`. */
function normalizeHost(u: URL): string {
  return u.hostname.toLowerCase().replace(/^www\./, '');
}

/** Path comparison ignoring query, fragment, and a trailing slash. */
function normalizePath(u: URL): string {
  const path = u.pathname.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}
