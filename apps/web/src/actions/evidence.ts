'use server';

import { planAllows } from '@scriptproof/core';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSite } from '@/lib/org';
import { enqueueEvidence } from '@/lib/queue';
import type { ActionState } from './types';

const schema = z.object({ siteId: z.string().min(1) });

/** On-demand Evidence Pack (Pro+). Generates for the current month to date. */
export async function generateEvidence(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({ siteId: formData.get('siteId') });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const { org, site } = await requireSite(parsed.data.siteId);

  if (!planAllows(org.plan, 'evidencePacks')) {
    return { ok: false, message: 'Evidence Packs require the Pro plan or higher.' };
  }
  if (!site.verifiedAt) {
    return { ok: false, message: 'Verify the domain before generating evidence.' };
  }

  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  await enqueueEvidence({
    siteId: site.id,
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
  });

  revalidatePath(`/app/sites/${site.id}/evidence`);
  return {
    ok: true,
    message: 'Generating your Evidence Pack — it appears here in under a minute.',
  };
}
