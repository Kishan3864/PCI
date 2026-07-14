'use server';

import { z } from 'zod';
import { applySubscription, getBillingProvider, isMockBilling } from '@/lib/billing';
import { appUrl } from '@/lib/env';
import { requireOrg } from '@/lib/org';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from './types';

const planSchema = z.object({ plan: z.enum(['starter', 'pro', 'agency']) });

/** Starts checkout for the chosen plan and redirects to the hosted checkout. */
export async function startCheckout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = planSchema.safeParse({ plan: formData.get('plan') });
  if (!parsed.success) return { ok: false, message: 'Invalid plan' };

  const { org, session, role } = await requireOrg();
  if (role !== 'owner') return { ok: false, message: 'Only the owner can change billing.' };

  const provider = getBillingProvider();
  let url: string;
  try {
    url = await provider.createCheckoutLink({
      orgId: org.id,
      plan: parsed.data.plan,
      email: session.user.email,
      successUrl: `${appUrl()}/app/settings/billing?activated=1`,
      cancelUrl: `${appUrl()}/app/settings/billing`,
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Checkout failed.' };
  }
  redirect(url);
}

/** Mock-only: completes a simulated checkout so the flow works without real keys. */
export async function confirmMockCheckout(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isMockBilling()) return { ok: false, message: 'Mock checkout is disabled.' };
  const parsed = planSchema.safeParse({ plan: formData.get('plan') });
  if (!parsed.success) return { ok: false, message: 'Invalid plan' };

  const { org, role } = await requireOrg();
  if (role !== 'owner') return { ok: false, message: 'Only the owner can change billing.' };

  await applySubscription({
    type: 'activated',
    providerSubId: `mock_${org.id}`,
    orgId: org.id,
    plan: parsed.data.plan,
    status: 'active',
    renewsAt: null,
  });

  revalidatePath('/app', 'layout');
  redirect('/app/settings/billing?activated=1');
}

/** Cancels the subscription (downgrades to Starter). */
export async function cancelSubscription(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const { org, role } = await requireOrg();
  if (role !== 'owner') return { ok: false, message: 'Only the owner can change billing.' };

  await applySubscription({
    type: 'canceled',
    providerSubId: org.billingCustomerId ?? `mock_${org.id}`,
    orgId: org.id,
    plan: 'starter',
    status: 'canceled',
    renewsAt: null,
  });

  revalidatePath('/app', 'layout');
  return { ok: true, message: 'Subscription canceled. Your plan is now Starter.' };
}
