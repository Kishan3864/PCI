import 'server-only';
import { verifyHmacSignature, type PlanId } from '@scriptproof/core';
import type { BillingProvider, CheckoutParams, MappedSubscriptionEvent } from './provider';

function variantToPlan(variantId: string | undefined): PlanId | null {
  if (!variantId) return null;
  if (variantId === process.env.LEMON_VARIANT_STARTER) return 'starter';
  if (variantId === process.env.LEMON_VARIANT_PRO) return 'pro';
  if (variantId === process.env.LEMON_VARIANT_AGENCY) return 'agency';
  return null;
}

/**
 * Lemon Squeezy provider — the swappable alternative to Dodo, selected via
 * BILLING_PROVIDER=lemonsqueezy. Demonstrates the interface is provider-agnostic.
 */
export class LemonSqueezyProvider implements BillingProvider {
  readonly id = 'lemonsqueezy';

  async createCheckoutLink(params: CheckoutParams): Promise<string> {
    const apiKey = process.env.LEMON_API_KEY;
    const storeId = process.env.LEMON_STORE_ID;
    const variant = {
      starter: process.env.LEMON_VARIANT_STARTER,
      pro: process.env.LEMON_VARIANT_PRO,
      agency: process.env.LEMON_VARIANT_AGENCY,
    }[params.plan];
    if (!apiKey || !storeId || !variant) {
      throw new Error('Lemon Squeezy billing is not configured.');
    }

    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/vnd.api+json',
        accept: 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: params.email,
              custom: { org_id: params.orgId, plan: params.plan },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variant } },
          },
        },
      }),
    });
    if (!res.ok) throw new Error(`Lemon Squeezy checkout failed (${res.status})`);
    const data = (await res.json()) as { data?: { attributes?: { url?: string } } };
    const url = data.data?.attributes?.url;
    if (!url) throw new Error('Lemon Squeezy checkout response had no URL');
    return url;
  }

  verifyWebhook(rawBody: string, headers: Headers): boolean {
    return verifyHmacSignature(
      rawBody,
      headers.get('x-signature'),
      process.env.LEMON_WEBHOOK_SECRET,
    );
  }

  mapEvent(rawBody: string): MappedSubscriptionEvent | null {
    let event: {
      meta?: { event_name?: string; custom_data?: { org_id?: string; plan?: PlanId } };
      data?: { id?: string; attributes?: Record<string, unknown> };
    };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return null;
    }
    const name = event.meta?.event_name ?? '';
    const attrs = event.data?.attributes ?? {};
    const orgId = event.meta?.custom_data?.org_id ?? '';
    const plan =
      event.meta?.custom_data?.plan ??
      variantToPlan(
        typeof attrs.variant_id === 'string' ? attrs.variant_id : String(attrs.variant_id ?? ''),
      );
    const providerSubId = String(event.data?.id ?? '');
    if (!orgId || !plan || !providerSubId) return null;

    let type: MappedSubscriptionEvent['type'] = 'ignored';
    if (name === 'subscription_created' || name === 'subscription_resumed') type = 'activated';
    else if (name === 'subscription_updated') type = 'updated';
    else if (name === 'subscription_cancelled' || name === 'subscription_expired')
      type = 'canceled';

    const renewsAt = typeof attrs.renews_at === 'string' ? new Date(attrs.renews_at) : null;

    return { type, providerSubId, orgId, plan, status: String(attrs.status ?? name), renewsAt };
  }
}
