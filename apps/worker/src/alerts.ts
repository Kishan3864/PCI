import {
  createMailerFromEnv,
  renderCriticalAlertEmail,
  renderDailyDigestEmail,
  type DigestItem,
} from '@scriptproof/email';
import { schema } from '@scriptproof/db';
import { and, eq, gte, inArray } from 'drizzle-orm';
import { db } from './db';
import { appUrl } from './env';
import type { AlertDispatchJob } from './queues';

const mailer = createMailerFromEnv();

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

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
 * True when an identical change (same script — or same header for header
 * changes — and same type on this page) already had an alert sent in the
 * last 24 hours (spec 5.3 dedupe).
 */
async function isDuplicateAlert(ctx: ChangeContext): Promise<boolean> {
  const since = new Date(ctx.change.detectedAt.getTime() - DEDUPE_WINDOW_MS);
  const siblings = await db.query.changes.findMany({
    where: and(
      eq(schema.changes.pageId, ctx.change.pageId),
      eq(schema.changes.type, ctx.change.type),
      gte(schema.changes.detectedAt, since),
    ),
  });

  const header = ctx.change.detail.header;
  const candidates = siblings.filter((sibling) => {
    if (sibling.id === ctx.change.id) return false;
    if (ctx.change.scriptId) return sibling.scriptId === ctx.change.scriptId;
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
}

/** Daily digest of warning/info changes that never triggered an alert. */
export async function handleDailyDigest(): Promise<void> {
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
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
            : (c.detail.urlKey as string | undefined) ?? c.page.url,
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
        orgChanges.map((c) => ({ changeId: c.id, channel: 'email' as const, status: 'sent' as const })),
      );
      console.log(`[alerts] digest sent to org ${orgId} (${orgChanges.length} changes)`);
    } catch (error) {
      console.error(`[alerts] digest failed for org ${orgId}:`, error);
    }
  }
}
