'use server';

import { acknowledgeChangeSchema } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import type { ActionState } from './types';

export async function acknowledgeChange(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = acknowledgeChangeSchema.safeParse({ changeId: formData.get('changeId') });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const { org, session } = await requireOrg();

  const change = await db.query.changes.findFirst({
    where: eq(schema.changes.id, parsed.data.changeId),
  });
  if (!change) return { ok: false, message: 'Change not found' };

  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, change.pageId) });
  const site = page
    ? await db.query.sites.findFirst({
        where: and(eq(schema.sites.id, page.siteId), eq(schema.sites.orgId, org.id)),
      })
    : undefined;
  if (!site) return { ok: false, message: 'Change not found' };

  if (!change.acknowledgedAt) {
    await db
      .update(schema.changes)
      .set({ acknowledgedAt: new Date(), acknowledgedBy: session.user.id })
      .where(eq(schema.changes.id, change.id));
  }

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return { ok: true, message: 'Change acknowledged.' };
}
