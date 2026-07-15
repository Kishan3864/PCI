import {
  createMailerFromEnv,
  renderCriticalAlertEmail,
  renderDailyDigestEmail,
  type DigestItem,
} from '@scriptproof/email';
import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, eq, gte, inArray } from 'drizzle-orm';
import { db } from './db';
import { appUrl } from './env';
import type { AlertDispatchJob } from './queues';

const mailer = createMailerFromEnv();

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
/**
 * Digest lookback is wider than one day so a missed or failed daily run is
 * recovered by the next one instead of silently dropping those changes. Already
 * digested changes carry an alert row and are filtered out, so the overlap
 * never double-sends.
 */
const DIGEST_LOOKBACK_MS = 3 * 24 * 60 * 60 * 1000;

async function orgMemberEmails(orgId: string): Promise<string[]> {
  const members = await db.query.orgMembers.findMany({
    where: eq(schema.orgMembers.organizationId, orgId),
    with: { user: true },
  });
  return members.map((m) => m.user.email);
}

interface ChangeContext {
  change: typeof schema.changes.$inferSelect;
  page: typeof schema.pages.$inferSelect;
  site: typeof schema.sites.$inferSelect;
}

async function loadChangeContext(changeId: string): Promise<ChangeContext | null> {
  const change = await db.query.changes.findFirst({ where: eq(schema.changes.id, changeId) });
  if (!change) return null;
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, change.pageId) });
  if (!page) return null;
  const site = await db.query.sites.findFirst({ where: eq(schema.sites.id, page.siteId) });
  if (!site) return null;
  return { change, page, site };
}

/**
 * True when an identical change already had an alert sent in the last 24 hours
 * (spec 5.3 dedupe). Script changes dedupe by scriptId across the whole site —
 * the same tampered script detected on two pages must not double-alert. Header
 * changes (no script) dedupe by page + header name.
 */
async function isDuplicateAlert(ctx: ChangeContext): Promise<boolean> {
  const since = new Date(ctx.change.detectedAt.getTime() - DEDUPE_WINDOW_MS);
  const filters = [eq(schema.changes.type, ctx.change.type), gte(schema.changes.detectedAt, since)];
  if (ctx.change.scriptId) {
    filters.push(eq(schema.changes.scriptId, ctx.change.scriptId));
  } else {
    filters.push(eq(schema.changes.pageId, ctx.change.pageId));
  }
  const siblings = await db.query.changes.findMany({ where: and(...filters) });

  const header = ctx.change.detail.header;
  const candidates = siblings.filter((sibling) => {
    if (sibling.id === ctx.change.id) return false;
    if (ctx.change.scriptId) return true; // already scoped to this script site-wide
    if (typeof header === 'string') return sibling.detail.header === header;
    return true;
  });
  if (candidates.length === 0) return false;

  const sent = await db.query.alerts.findFirst({
    where: and(
      inArray(
        schema.alerts.changeId,
        candidates.map((c) => c.id),
      ),
      eq(schema.alerts.status, 'sent'),
    ),
  });
  return Boolean(sent);
}

/**
 * Posts a message to an org's Slack webhook when configured and the plan allows
 * it. Fully fail-safe: any error (bad URL, timeout, Slack 4xx/5xx, DB write) is
 * caught and logged so Slack can never affect the email path or scan status.
 */
async function dispatchSlack(orgId: string, text: string, changeIds: string[]): Promise<void> {
  try {
    const org = await db.query.orgs.findFirst({ where: eq(schema.orgs.id, orgId) });
    if (!org?.slackWebhookUrl || !planAllows(org.plan, 'slackAlerts')) return;

    const res = await fetch(org.slackWebhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
    const status = res.ok ? ('sent' as const) : ('failed' as const);
    if (changeIds.length > 0) {
      await db
        .insert(schema.alerts)
        .values(changeIds.map((changeId) => ({ changeId, channel: 'slack' as const, status })));
    }
    if (res.ok) {
      console.log(`[alerts] slack alert sent for org ${orgId}`);
    } else {
      console.error(
        `[alerts] slack webhook rejected message for org ${orgId} (HTTP ${res.status})`,
      );
    }
  } catch (error) {
    console.error(`[alerts] slack dispatch failed for org ${orgId}:`, error);
  }
}

/** Immediate email for a critical change (spec 5.3). */
export async function handleAlertDispatch(job: AlertDispatchJob): Promise<void> {
  const ctx = await loadChangeContext(job.changeId);
  if (!ctx) return;

  if (await isDuplicateAlert(ctx)) {
    await db
      .insert(schema.alerts)
      .values({ changeId: ctx.change.id, channel: 'email', status: 'skipped_dedupe' });
    return;
  }

  const recipients = await orgMemberEmails(ctx.site.orgId);
  if (recipients.length === 0) return;

  const detail = ctx.change.detail;
  const rendered = await renderCriticalAlertEmail({
    pageLabel: ctx.page.label,
    pageUrl: ctx.page.url,
    changeType: ctx.change.type,
    scriptUrl: typeof detail.srcUrl === 'string' ? detail.srcUrl : null,
    beforeHash: typeof detail.before === 'string' ? detail.before : null,
    afterHash:
      typeof detail.after === 'string'
        ? detail.after
        : typeof detail.sha256 === 'string'
          ? detail.sha256
          : null,
    detectedAt: ctx.change.detectedAt.toUTCString(),
    reviewUrl: `${appUrl()}/app/sites/${ctx.site.id}/changes`,
  });

  try {
    await mailer.send({ to: recipients, ...rendered });
    await db
      .insert(schema.alerts)
      .values({ changeId: ctx.change.id, channel: 'email', status: 'sent' });
    console.log(`[alerts] critical alert sent for change ${ctx.change.id}`);
  } catch (error) {
    await db
      .insert(schema.alerts)
      .values({ changeId: ctx.change.id, channel: 'email', status: 'failed' });
    throw error; // let pg-boss retry
  }

  // Slack (Pro+/Agency) — best effort, isolated from the email path above.
  const scriptUrl = typeof detail.srcUrl === 'string' ? detail.srcUrl : null;
  const reviewUrl = `${appUrl()}/app/sites/${ctx.site.id}/changes`;
  await dispatchSlack(
    ctx.site.orgId,
    [
      `:rotating_light: *Critical change detected on ${ctx.site.domain}*`,
      `• Page: ${ctx.page.label} (${ctx.page.url})`,
      scriptUrl ? `• Script: ${scriptUrl}` : null,
      `• Change: ${ctx.change.type}`,
      `<${reviewUrl}|Review this change>`,
    ]
      .filter(Boolean)
      .join('\n'),
    [ctx.change.id],
  );
}

/** Daily digest of warning/info changes that never triggered an alert. */
export async function handleDailyDigest(): Promise<void> {
  const since = new Date(Date.now() - DIGEST_LOOKBACK_MS);
  const recent = await db.query.changes.findMany({
    where: and(
      gte(schema.changes.detectedAt, since),
      inArray(schema.changes.severity, ['warning', 'info']),
    ),
    with: { alerts: true, page: { with: { site: true } } },
  });
  const unalerted = recent.filter((c) => c.alerts.length === 0);
  if (unalerted.length === 0) return;

  const byOrg = new Map<string, typeof unalerted>();
  for (const change of unalerted) {
    const orgId = change.page.site.orgId;
    const list = byOrg.get(orgId) ?? [];
    list.push(change);
    byOrg.set(orgId, list);
  }

  let failures = 0;
  for (const [orgId, orgChanges] of byOrg) {
    const org = await db.query.orgs.findFirst({ where: eq(schema.orgs.id, orgId) });
    const recipients = await orgMemberEmails(orgId);
    if (!org || recipients.length === 0) continue;

    const items: DigestItem[] = orgChanges.map((c) => ({
      pageLabel: c.page.label,
      pageUrl: c.page.url,
      changeType: c.type,
      severity: c.severity,
      summary:
        typeof c.detail.srcUrl === 'string'
          ? c.detail.srcUrl
          : typeof c.detail.header === 'string'
            ? String(c.detail.header)
            : ((c.detail.urlKey as string | undefined) ?? c.page.url),
      detectedAt: c.detectedAt.toUTCString(),
    }));

    const rendered = await renderDailyDigestEmail({
      orgName: org.name,
      items,
      dashboardUrl: `${appUrl()}/app`,
    });

    try {
      await mailer.send({ to: recipients, ...rendered });
      await db.insert(schema.alerts).values(
        orgChanges.map((c) => ({
          changeId: c.id,
          channel: 'email' as const,
          status: 'sent' as const,
        })),
      );
      console.log(`[alerts] digest sent to org ${orgId} (${orgChanges.length} changes)`);
      // Slack copy of the digest — best effort, never fails the email path.
      await dispatchSlack(
        orgId,
        `:memo: *ScriptProof daily digest for ${org.name}* — ${orgChanges.length} non-critical change${orgChanges.length === 1 ? '' : 's'} detected.\n<${appUrl()}/app|Open dashboard>`,
        [],
      );
    } catch (error) {
      failures += 1;
      console.error(`[alerts] digest failed for org ${orgId}:`, error);
    }
  }

  // Rethrow so pg-boss retries this job. Orgs that already sent have alert rows
  // and are filtered out of the retry, so the retry only re-attempts failures.
  if (failures > 0) {
    throw new Error(`daily digest failed for ${failures} org(s); will retry`);
  }
}
