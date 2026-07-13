'use server';

import {
  canAddPage,
  createPageSchema,
  deletePageSchema,
  frequencyAllowed,
  pageUrlWithinSite,
  updatePageSchema,
} from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isTestMode } from '@/lib/env';
import { requireOrg, requireSite } from '@/lib/org';
import { enqueueSiteScan } from '@/lib/queue';
import type { ActionState } from './types';

export async function addPage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = createPageSchema.safeParse({
    siteId: formData.get('siteId'),
    url: formData.get('url'),
    label: formData.get('label'),
    scanFrequency: formData.get('scanFrequency'),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { org, site } = await requireSite(parsed.data.siteId);

  if (!pageUrlWithinSite(parsed.data.url, site.domain, { testMode: isTestMode() })) {
    return {
      ok: false,
      message: `Page URLs must be https:// URLs on ${site.domain}.`,
    };
  }

  if (!frequencyAllowed(org.plan, parsed.data.scanFrequency)) {
    return { ok: false, message: '6-hourly scans require the Pro plan or higher.' };
  }

  const [{ value: pageCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(schema.pages)
    .where(eq(schema.pages.siteId, site.id));
  if (!canAddPage(org.plan, pageCount)) {
    return {
      ok: false,
      message: `Your ${org.plan} plan allows ${pageCount} page${pageCount === 1 ? '' : 's'} per site. Upgrade for more.`,
    };
  }

  const existing = await db.query.pages.findFirst({
    where: and(eq(schema.pages.siteId, site.id), eq(schema.pages.url, parsed.data.url)),
  });
  if (existing) return { ok: false, message: 'This page is already monitored.' };

  const [page] = await db
    .insert(schema.pages)
    .values({
      siteId: site.id,
      url: parsed.data.url,
      label: parsed.data.label,
      scanFrequency: parsed.data.scanFrequency,
    })
    .returning();

  // Baseline scan right away so the inventory shows up without waiting.
  if (site.verifiedAt && page) {
    await enqueueSiteScan({ siteId: site.id, pageIds: [page.id], force: true });
  }

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return { ok: true, message: 'Page added.' };
}

export async function updatePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = updatePageSchema.safeParse({
    pageId: formData.get('pageId'),
    label: formData.get('label') ?? undefined,
    scanFrequency: formData.get('scanFrequency') ?? undefined,
    isActive: formData.has('isActive') ? formData.get('isActive') === 'true' : undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { org } = await requireOrg();
  const page = await db.query.pages.findFirst({
    where: eq(schema.pages.id, parsed.data.pageId),
  });
  if (!page) return { ok: false, message: 'Page not found' };
  const site = await db.query.sites.findFirst({
    where: and(eq(schema.sites.id, page.siteId), eq(schema.sites.orgId, org.id)),
  });
  if (!site) return { ok: false, message: 'Page not found' };

  if (parsed.data.scanFrequency && !frequencyAllowed(org.plan, parsed.data.scanFrequency)) {
    return { ok: false, message: '6-hourly scans require the Pro plan or higher.' };
  }

  await db
    .update(schema.pages)
    .set({
      ...(parsed.data.label !== undefined && { label: parsed.data.label }),
      ...(parsed.data.scanFrequency !== undefined && { scanFrequency: parsed.data.scanFrequency }),
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(schema.pages.id, page.id));

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return { ok: true, message: 'Page updated.' };
}

export async function deletePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = deletePageSchema.safeParse({ pageId: formData.get('pageId') });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const { org } = await requireOrg();
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, parsed.data.pageId) });
  if (!page) return { ok: false, message: 'Page not found' };
  const site = await db.query.sites.findFirst({
    where: and(eq(schema.sites.id, page.siteId), eq(schema.sites.orgId, org.id)),
  });
  if (!site) return { ok: false, message: 'Page not found' };

  await db.delete(schema.pages).where(eq(schema.pages.id, page.id));

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return { ok: true, message: 'Page removed, including its scan history.' };
}
