'use server';

import { justifyScriptSchema } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import type { ActionState } from './types';

/**
 * 6.4.3 authorization workflow: sets a script to authorized/blocked with a
 * mandatory written justification, recording who decided and when.
 */
export async function justifyScript(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = justifyScriptSchema.safeParse({
    scriptId: formData.get('scriptId'),
    action: formData.get('action'),
    justification: formData.get('justification'),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { org, session } = await requireOrg();

  const script = await db.query.scripts.findFirst({
    where: eq(schema.scripts.id, parsed.data.scriptId),
  });
  if (!script) return { ok: false, message: 'Script not found' };
  const site = await db.query.sites.findFirst({
    where: and(eq(schema.sites.id, script.siteId), eq(schema.sites.orgId, org.id)),
  });
  if (!site) return { ok: false, message: 'Script not found' };

  await db
    .update(schema.scripts)
    .set({
      status: parsed.data.action,
      justification: parsed.data.justification,
      justifiedBy: session.user.id,
      justifiedAt: new Date(),
    })
    .where(eq(schema.scripts.id, script.id));

  revalidatePath(`/app/sites/${site.id}`, 'layout');
  return {
    ok: true,
    message: parsed.data.action === 'authorized' ? 'Script authorized.' : 'Script blocked.',
  };
}
