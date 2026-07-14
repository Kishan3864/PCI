import { annualPrice, PLANS, type PlanId } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { count, eq } from 'drizzle-orm';
import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import { cancelSubscription, startCheckout } from '@/actions/billing';
import { ActionButton } from '@/components/action-button';
import { PlanChooseButton } from '@/components/plan-choose-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { isMockBilling } from '@/lib/billing';
import { requireOrg } from '@/lib/org';

export const metadata: Metadata = { title: 'Billing' };

const planOrder: PlanId[] = ['starter', 'pro', 'agency'];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string }>;
}) {
  const { activated } = await searchParams;
  const { org, role } = await requireOrg();

  const sub = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.orgId, org.id),
  });
  const [{ value: siteCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(schema.sites)
    .where(eq(schema.sites.orgId, org.id));

  const limits = PLANS[org.plan];
  const isOwner = role === 'owner';
  const hasActiveSub = sub?.status === 'active';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Billing &amp; plan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your subscription. {isOwner ? '' : 'Only the organization owner can make changes.'}
        </p>
      </div>

      {activated ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Subscription active — your plan is now {org.plan}.
        </div>
      ) : null}

      {isMockBilling() ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Billing is in local/mock mode (no payment provider configured). Choosing a plan simulates
          a successful checkout so you can test the flow. Set <code>DODO_API_KEY</code> and the plan
          product ids to use real Dodo Payments checkout.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current plan</CardTitle>
          <CardDescription>
            <span className="font-semibold capitalize text-navy-900">{org.plan}</span>
            {org.trialEndsAt && !hasActiveSub ? (
              <> · trial ends {new Date(org.trialEndsAt).toLocaleDateString('en-GB')}</>
            ) : null}
            {sub ? <> · subscription {sub.status}</> : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageMeter label="Sites" used={siteCount} limit={limits.maxSites} />
          <p className="text-xs text-slate-500">
            Pages per site: up to {limits.maxPagesPerSite} · Scans:{' '}
            {limits.frequencies.includes('6h') ? 'daily or 6-hourly' : 'daily'}
          </p>
          {hasActiveSub && isOwner ? (
            <ActionButton
              action={cancelSubscription}
              fields={{}}
              variant="outline"
              size="sm"
              showResult
            >
              Cancel subscription
            </ActionButton>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {planOrder.map((p) => {
          const plan = PLANS[p];
          const current = org.plan === p && hasActiveSub;
          return (
            <Card key={p} className={p === 'pro' ? 'border-navy-300' : ''}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{p}</CardTitle>
                <p>
                  <span className="text-2xl font-bold text-navy-900">${plan.priceMonthly}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </p>
                <p className="text-xs text-slate-400">or ${annualPrice(p)}/year</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> {plan.maxSites} site
                    {plan.maxSites === 1 ? '' : 's'}, {plan.maxPagesPerSite} pages each
                  </li>
                  {plan.evidencePacks ? (
                    <li className="flex gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Evidence Packs
                    </li>
                  ) : null}
                  {plan.cspInsights ? (
                    <li className="flex gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> CSP insights + agent
                    </li>
                  ) : null}
                  {plan.whiteLabel ? (
                    <li className="flex gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> White-label + CSV
                    </li>
                  ) : null}
                </ul>
                {current ? (
                  <Badge variant="success">Current plan</Badge>
                ) : (
                  <PlanChooseButton
                    plan={p}
                    disabled={!isOwner}
                    action={startCheckout}
                    label={`Choose ${p}`}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${pct >= 100 ? 'bg-red-500' : 'bg-navy-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
