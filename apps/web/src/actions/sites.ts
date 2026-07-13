'use server';

import {
  canAddSite,
  createSiteSchema,
  generateVerifyToken,
  isValidSiteDomain,
  normalizeDomain,
  verifySiteSchema,
  scanNowSchema,
} from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, count, eq } from 'drizzle-orm';
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

  const { site } = await requireSite(parsed.data.siteId);
  if (!site.verifiedAt) {
    return { ok: false, message: 'Verify domain ownership before scanning.' };
  }

  await enqueueSiteScan({
    siteId: site.id,
    pageIds: parsed.data.pageId ? [parsed.data.pageId] : undefined,
    force: true,
  });

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return { ok: true, message: 'Scan queued. Results appear here in under a minute.' };
}
