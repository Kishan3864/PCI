import 'server-only';
import type { PlanId } from '@scriptproof/core';
import { appUrl } from '@/lib/env';
import type { BillingProvider, CheckoutParams, MappedSubscriptionEvent } from './provider';

/**
 * Local/dev provider used when no real billing provider is configured. Checkout
 * routes to an in-app page that simulates a successful subscription so the whole
 * flow is testable without external keys. Never selected when DODO/LEMON is set.
 */
export class MockProvider implements BillingProvider {
  readonly id = 'mock';

  async createCheckoutLink(params: CheckoutParams): Promise<string> {
    const u = new URL(`${appUrl()}/app/settings/billing/mock-checkout`);
    u.searchParams.set('plan', params.plan);
    u.searchParams.set('org', params.orgId);
    return u.toString();
  }

  verifyWebhook(): boolean {
    return true;
  }

  mapEvent(rawBody: string): MappedSubscriptionEvent | null {
    try {
      const e = JSON.parse(rawBody) as {
        type?: MappedSubscriptionEvent['type'];
        orgId?: string;
        plan?: PlanId;
      };
      if (!e.orgId || !e.plan) return null;
      return {
        type: e.type ?? 'activated',
        providerSubId: `mock_${e.orgId}`,
        orgId: e.orgId,
        plan: e.plan,
        status: 'active',
        renewsAt: null,
      };
    } catch {
      return null;
    }
  }
}
