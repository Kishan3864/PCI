'use server';

import {
  canAddSite,
  createSiteSchema,
  generateVerifyToken,
  isValidSiteDomain,
  manualScanCooldownMs,
  normalizeDomain,
  verifySiteSchema,
  scanNowSchema,
} from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, count, desc, eq, gte, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isTestMode } from '@/lib/env';
import { requireOrg, requireSite } from '@/lib/org';
import { enqueueSiteScan } from '@/lib/queue';
import { checkDnsVerification, checkMetaVerification } from '@/lib/verification-server';
import type { ActionState } from './types';

export async function createSite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { org } = await requireOrg();

  const parsed = createSiteSchema.safeParse({ domain: formData.get('domain') });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid domain' };
  }

  const domain = normalizeDomain(parsed.data.domain);
  if (!domain || !isValidSiteDomain(domain, { testMode: isTestMode() })) {
    return {
      ok: false,
      message: 'Enter a public domain you control, like shop.example.com (no paths or ports).',
    };
  }

  const [{ value: siteCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(schema.sites)
    .where(eq(schema.sites.orgId, org.id));
  if (!canAddSite(org.plan, siteCount)) {
    return {
      ok: false,
      message: `Your ${org.plan} plan allows ${siteCount} site${siteCount === 1 ? '' : 's'}. Upgrade to add more.`,
    };
  }

  const existing = await db.query.sites.findFirst({
    where: and(eq(schema.sites.orgId, org.id), eq(schema.sites.domain, domain)),
  });
  if (existing) {
    return { ok: false, message: 'This domain is already added.' };
  }

  const [site] = await db
    .insert(schema.sites)
    .values({ orgId: org.id, domain, verifyToken: generateVerifyToken() })
    .returning();
  if (!site) return { ok: false, message: 'Could not create the site. Try again.' };

  redirect(`/app/sites/${site.id}/verify`);
}

export async function verifySite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = verifySiteSchema.safeParse({
    siteId: formData.get('siteId'),
    method: formData.get('method'),
  });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const { site } = await requireSite(parsed.data.siteId);
  if (site.verifiedAt) return { ok: true, message: 'Site is already verified.' };

  const verified =
    parsed.data.method === 'dns'
      ? await checkDnsVerification(site.domain, site.verifyToken)
      : await checkMetaVerification(site.domain, site.verifyToken);

  if (!verified) {
    return {
      ok: false,
      message:
        parsed.data.method === 'dns'
          ? 'TXT record not found yet. DNS changes can take a few minutes to propagate.'
          : 'Meta tag not found on your homepage yet. Deploy it, then check again.',
    };
  }

  await db
    .update(schema.sites)
    .set({ verifiedAt: new Date(), verifyMethod: parsed.data.method, updatedAt: new Date() })
    .where(eq(schema.sites.id, site.id));

  // Baseline scan for any pages added before verification.
  const existingPages = await db.query.pages.findMany({
    where: and(eq(schema.pages.siteId, site.id), eq(schema.pages.isActive, true)),
  });
  if (existingPages.length > 0) {
    await enqueueSiteScan({ siteId: site.id, force: true });
  }

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  redirect(`/app/sites/${site.id}/settings?verified=1`);
}

export async function scanNow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = scanNowSchema.safeParse({
    siteId: formData.get('siteId'),
    pageId: formData.get('pageId') || undefined,
  });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const { site, org } = await requireSite(parsed.data.siteId);
  if (!site.verifiedAt) {
    return { ok: false, message: 'Verify domain ownership before scanning.' };
  }

  const now = Date.now();

  // Duplicate cap: a scan for this site is already queued or running (last 10 min).
  const [inProgress] = await db
    .select({ id: schema.scans.id })
    .from(schema.scans)
    .innerJoin(schema.pages, eq(schema.scans.pageId, schema.pages.id))
    .where(
      and(
        eq(schema.pages.siteId, site.id),
        inArray(schema.scans.status, ['queued', 'running']),
        gte(schema.scans.startedAt, new Date(now - 10 * 60_000)),
      ),
    )
    .limit(1);
  if (inProgress) {
    return { ok: false, message: 'A scan is already in progress. Results appear in a minute.' };
  }

  // Per-site cooldown enforced from the DB, by plan (starter 30m / pro 10m / agency 5m).
  const cooldownMs = manualScanCooldownMs(org.plan);
  const [latest] = await db
    .select({ startedAt: schema.scans.startedAt })
    .from(schema.scans)
    .innerJoin(schema.pages, eq(schema.scans.pageId, schema.pages.id))
    .where(eq(schema.pages.siteId, site.id))
    .orderBy(desc(schema.scans.startedAt))
    .limit(1);
  if (latest) {
    const elapsed = now - latest.startedAt.getTime();
    if (elapsed < cooldownMs) {
      const waitMin = Math.max(1, Math.ceil((cooldownMs - elapsed) / 60_000));
      return {
        ok: false,
        message: `Please wait ${waitMin} minute${waitMin === 1 ? '' : 's'} between manual scans.`,
      };
    }
  }

  await enqueueSiteScan({
    siteId: site.id,
    pageIds: parsed.data.pageId ? [parsed.data.pageId] : undefined,
    force: true,
  });

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return { ok: true, message: 'Scan queued. Results appear here in under a minute.' };
}
