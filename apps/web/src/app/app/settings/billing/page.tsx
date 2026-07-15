import { annualPrice, PLANS, type PlanId } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { count, eq } from 'drizzle-orm';
import { Check, CheckCircle2, CreditCard, FlaskConical, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import { cancelSubscription, startCheckout } from '@/actions/billing';
import { ActionButton } from '@/components/action-button';
import { PlanChooseButton } from '@/components/plan-choose-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
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
    <div className="mx-auto max-w-4xl space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Billing &amp; <GradientText>plan</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your subscription.{' '}
            {isOwner ? '' : 'Only the organization owner can make changes.'}
          </p>
        </div>
      </Reveal>

      {activated ? (
        <Reveal>
          <div className="flex items-start gap-3 rounded-[2px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>Subscription active — your plan is now {org.plan}.</span>
          </div>
        </Reveal>
      ) : null}

      {isMockBilling() ? (
        <Reveal>
          <div className="flex items-start gap-3 rounded-[2px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Billing is in local/mock mode (no payment provider configured). Choosing a plan
              simulates a successful checkout so you can test the flow. Set{' '}
              <code>DODO_API_KEY</code> and the plan product ids to use real Dodo Payments checkout.
            </span>
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={80}>
        <Card className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
          />
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Current plan</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="capitalize">
                    {org.plan}
                  </Badge>
                  {org.trialEndsAt && !hasActiveSub ? (
                    <span>trial ends {new Date(org.trialEndsAt).toLocaleDateString('en-GB')}</span>
                  ) : null}
                  {sub ? <span>subscription {sub.status}</span> : null}
                </CardDescription>
              </div>
            </div>
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
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {planOrder.map((p, i) => {
          const plan = PLANS[p];
          const current = org.plan === p && hasActiveSub;
          const highlight = p === 'pro';
          return (
            <Reveal key={p} delay={160 + i * 80}>
              <Card
                className={`card-lift relative isolate flex h-full flex-col overflow-hidden ${
                  current
                    ? 'glow-ring border-blue-300'
                    : highlight
                      ? 'glow-ring border-blue-200'
                      : ''
                }`}
              >
                {highlight ? (
                  <div
                    aria-hidden
                    className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"
                  />
                ) : null}
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{p}</CardTitle>
                    {current ? (
                      <Badge variant="brand">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Current
                      </Badge>
                    ) : highlight ? (
                      <Badge variant="brand">
                        <Sparkles className="h-3.5 w-3.5" /> Popular
                      </Badge>
                    ) : null}
                  </div>
                  <p className="pt-1">
                    <span className="font-display text-3xl font-bold text-navy-900">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-sm text-slate-500">/mo</span>
                  </p>
                  <p className="text-xs text-slate-500">or ${annualPrice(p)}/year</p>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col gap-4">
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                      <span>
                        {plan.maxSites} site{plan.maxSites === 1 ? '' : 's'}, {plan.maxPagesPerSite}{' '}
                        pages each
                      </span>
                    </li>
                    {plan.evidencePacks ? (
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" /> Evidence
                        Packs
                      </li>
                    ) : null}
                    {plan.cspInsights ? (
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" /> CSP insights
                        + agent
                      </li>
                    ) : null}
                    {plan.whiteLabel ? (
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" /> White-label
                        + CSV
                      </li>
                    ) : null}
                  </ul>
                  <div className="mt-auto pt-1">
                    {current ? (
                      <div className="flex items-center justify-center gap-1.5 rounded-[2px] border border-blue-200 bg-blue-50 py-2 text-xs font-semibold text-blue-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Your current plan
                      </div>
                    ) : (
                      <PlanChooseButton
                        plan={p}
                        disabled={!isOwner}
                        action={startCheckout}
                        label={`Choose ${p}`}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
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
        <span className="font-medium text-navy-900">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-[1px] bg-slate-200">
        <div
          className={`h-full rounded-[1px] ${
            pct >= 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
