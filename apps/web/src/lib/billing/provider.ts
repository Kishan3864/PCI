import 'server-only';
import type { PlanId } from '@scriptproof/core';

export interface CheckoutParams {
  orgId: string;
  plan: PlanId;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

/** Normalized subscription event, mapped from a provider-specific webhook. */
export interface MappedSubscriptionEvent {
  type: 'activated' | 'updated' | 'canceled' | 'ignored';
  providerSubId: string;
  orgId: string;
  plan: PlanId;
  status: string;
  renewsAt: Date | null;
}

/**
 * Merchant-of-record billing behind one interface so the provider (Dodo by
 * default, Lemon Squeezy as an alternative) is swappable via BILLING_PROVIDER.
 */
export interface BillingProvider {
  readonly id: string;
  /** Returns a hosted checkout URL for the chosen plan. */
  createCheckoutLink(params: CheckoutParams): Promise<string>;
  /** Verifies a webhook's signature. */
  verifyWebhook(rawBody: string, headers: Headers): boolean;
  /** Maps a verified webhook body to a normalized subscription event. */
  mapEvent(rawBody: string): MappedSubscriptionEvent | null;
}
