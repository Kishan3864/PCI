import 'server-only';
import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { DodoProvider } from './dodo';
import { LemonSqueezyProvider } from './lemonsqueezy';
import { MockProvider } from './mock';
import type { BillingProvider, MappedSubscriptionEvent } from './provider';

export type { BillingProvider, CheckoutParams, MappedSubscriptionEvent } from './provider';

/** True when no real provider is configured — checkout is simulated locally. */
export function isMockBilling(): boolean {
  const configured = process.env.BILLING_PROVIDER;
  if (configured === 'dodo') return !process.env.DODO_API_KEY;
  if (configured === 'lemonsqueezy') return !process.env.LEMON_API_KEY;
  return true;
}

let cached: BillingProvider | undefined;

export function getBillingProvider(): BillingProvider {
  if (cached) return cached;
  if (isMockBilling()) {
    cached = new MockProvider();
  } else if (process.env.BILLING_PROVIDER === 'lemonsqueezy') {
    cached = new LemonSqueezyProvider();
  } else {
    cached = new DodoProvider();
  }
  return cached;
}

/**
 * Applies a mapped subscription event to the DB: upserts the subscription row
 * and updates the org's plan. Shared by the webhook and the mock checkout.
 */
export async function applySubscription(event: MappedSubscriptionEvent): Promise<void> {
  if (event.type === 'ignored') return;
  const now = new Date();

  if (event.type === 'canceled') {
    await db
      .update(schema.subscriptions)
      .set({ status: 'canceled', updatedAt: now })
      .where(eq(schema.subscriptions.orgId, event.orgId));
    // Downgrade access to Starter on cancellation.
    await db.update(schema.orgs).set({ plan: 'starter' }).where(eq(schema.orgs.id, event.orgId));
    return;
  }

  await db
    .insert(schema.subscriptions)
    .values({
      orgId: event.orgId,
      provider: getBillingProvider().id,
      providerSubId: event.providerSubId,
      plan: event.plan,
      status: 'active',
      renewsAt: event.renewsAt,
    })
    .onConflictDoUpdate({
      target: schema.subscriptions.orgId,
      set: {
        provider: getBillingProvider().id,
        providerSubId: event.providerSubId,
        plan: event.plan,
        status: 'active',
        renewsAt: event.renewsAt,
        updatedAt: now,
      },
    });

  await db
    .update(schema.orgs)
    .set({ plan: event.plan, billingCustomerId: event.providerSubId })
    .where(eq(schema.orgs.id, event.orgId));
}
