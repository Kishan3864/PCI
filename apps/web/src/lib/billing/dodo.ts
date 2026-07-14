import 'server-only';
import { verifyHmacSignature, type PlanId } from '@scriptproof/core';
import type { BillingProvider, CheckoutParams, MappedSubscriptionEvent } from './provider';

const DODO_API_BASE = process.env.DODO_API_BASE ?? 'https://api.dodopayments.com';

/** Env-configured Dodo product id per plan (set once the products exist). */
function productId(plan: PlanId): string | undefined {
  return {
    starter: process.env.DODO_PRODUCT_STARTER,
    pro: process.env.DODO_PRODUCT_PRO,
    agency: process.env.DODO_PRODUCT_AGENCY,
  }[plan];
}

function planFromProduct(id: string | undefined): PlanId | null {
  if (!id) return null;
  if (id === process.env.DODO_PRODUCT_STARTER) return 'starter';
  if (id === process.env.DODO_PRODUCT_PRO) return 'pro';
  if (id === process.env.DODO_PRODUCT_AGENCY) return 'agency';
  return null;
}

/**
 * Dodo Payments provider. Requires DODO_API_KEY + DODO_WEBHOOK_SECRET and the
 * per-plan product ids. The exact request/response and webhook field names
 * should be confirmed against Dodo's current docs (see ASSUMPTIONS.md); the
 * shape here follows their documented checkout + webhook model.
 */
export class DodoProvider implements BillingProvider {
  readonly id = 'dodo';

  async createCheckoutLink(params: CheckoutParams): Promise<string> {
    const apiKey = process.env.DODO_API_KEY;
    const product = productId(params.plan);
    if (!apiKey || !product) {
      throw new Error('Dodo billing is not configured (missing DODO_API_KEY or product id).');
    }

    const res = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        product_id: product,
        customer_email: params.email,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        // Round-trips the org + plan so the webhook can map back.
        metadata: { orgId: params.orgId, plan: params.plan },
      }),
    });
    if (!res.ok) {
      throw new Error(`Dodo checkout failed (${res.status})`);
    }
    const data = (await res.json()) as { url?: string; checkout_url?: string };
    const url = data.url ?? data.checkout_url;
    if (!url) throw new Error('Dodo checkout response had no URL');
    return url;
  }

  verifyWebhook(rawBody: string, headers: Headers): boolean {
    const signature = headers.get('webhook-signature') ?? headers.get('dodo-signature');
    return verifyHmacSignature(rawBody, signature, process.env.DODO_WEBHOOK_SECRET);
  }

  mapEvent(rawBody: string): MappedSubscriptionEvent | null {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return null;
    }

    const type = String(event.type ?? '');
    const data = (event.data ?? {}) as Record<string, unknown>;
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const orgId = typeof metadata.orgId === 'string' ? metadata.orgId : '';
    const plan =
      (typeof metadata.plan === 'string' ? (metadata.plan as PlanId) : null) ??
      planFromProduct(typeof data.product_id === 'string' ? data.product_id : undefined);
    const providerSubId = String(data.subscription_id ?? data.id ?? '');
    if (!orgId || !plan || !providerSubId) return null;

    const renewsAt =
      typeof data.next_billing_date === 'string' ? new Date(data.next_billing_date) : null;
    const status = String(data.status ?? type);

    let mapped: MappedSubscriptionEvent['type'] = 'ignored';
    if (type.includes('active') || type.includes('renewed') || type.includes('succeeded')) {
      mapped = 'activated';
    } else if (type.includes('updated')) {
      mapped = 'updated';
    } else if (type.includes('cancel')) {
      mapped = 'canceled';
    }

    return { type: mapped, providerSubId, orgId, plan, status, renewsAt };
  }
}
