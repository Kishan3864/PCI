import { annualPrice, PLANS, type PlanId } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { count, eq } from 'drizzle-orm';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FlaskConical,
  LifeBuoy,
  Lock,
  Minus,
  Sparkles,
  Undo2,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
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

const planContent: Record<PlanId, { name: string; blurb: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    blurb: 'For a single store getting its PCI DSS 6.4.3 inventory in order.',
    features: [
      '1 site, 3 monitored pages',
      'Daily scheduled scans',
      'Script inventory + authorization workflow',
      'Change detection with email alerts',
      'Security header monitoring (11.6.1)',
    ],
  },
  pro: {
    name: 'Pro',
    blurb: 'For growing merchants who need evidence and faster checks.',
    features: [
      '5 sites, 10 pages each',
      'Scans every 6 hours',
      'Monthly + on-demand Evidence Pack PDFs',
      'CSP insights + runtime agent snippet',
      'Slack alerts',
      'Everything in Starter',
    ],
  },
  agency: {
    name: 'Agency',
    blurb: 'For agencies managing many client checkouts under one roof.',
    features: [
      '20 sites, 10 pages each',
      'White-label Evidence Packs (your logo)',
      'Excel export of inventory & change log',
      'Priority support',
      'Everything in Pro',
    ],
  },
};

const comparison: Array<{ label: string; value: (p: PlanId) => string | boolean }> = [
  { label: 'Monitored sites', value: (p) => String(PLANS[p].maxSites) },
  { label: 'Pages per site', value: (p) => String(PLANS[p].maxPagesPerSite) },
  {
    label: 'Scan frequency',
    value: (p) => (PLANS[p].frequencies.includes('6h') ? 'Every 6 hours' : 'Daily'),
  },
  {
    label: '"Scan now" cooldown',
    value: (p) => `${Math.round(PLANS[p].manualScanCooldownMs / 60_000)} min`,
  },
  { label: 'Script inventory + email alerts', value: () => true },
  { label: 'Security header monitoring', value: () => true },
  { label: 'Evidence Pack PDF', value: (p) => PLANS[p].evidencePacks },
  { label: 'CSP insights', value: (p) => PLANS[p].cspInsights },
  { label: 'Runtime agent snippet', value: (p) => PLANS[p].agentSnippet },
  { label: 'Slack alerts', value: (p) => PLANS[p].slackAlerts },
  { label: 'White-label reports', value: (p) => PLANS[p].whiteLabel },
  { label: 'Excel export', value: (p) => PLANS[p].csvExport },
];

const billingChips = [
  { icon: Clock, label: '14-day free trial on every plan' },
  { icon: XCircle, label: 'Cancel anytime — no lock-in' },
  { icon: Undo2, label: '14-day money-back on first invoice' },
  { icon: Lock, label: 'Card handled by Dodo Payments, never by us' },
];

const billingFaqs = [
  {
    q: 'What happens when I upgrade?',
    a: 'Higher limits and features unlock immediately after checkout. Your existing sites, scans, inventory and evidence history stay exactly as they are.',
  },
  {
    q: 'What happens when I downgrade or cancel?',
    a: 'Monitoring continues until the end of the paid period. If you then have more sites than the new plan allows, extra sites pause (nothing is deleted) until you remove some or upgrade again.',
  },
  {
    q: 'Do you charge per scan or have hidden fees?',
    a: 'No. Every plan is a flat monthly price with scheduled scans included at your plan’s cadence. No per-scan charges, no overage, no setup fees.',
  },
  {
    q: 'How does annual billing work?',
    a: 'Annual billing is 10× the monthly price — you get two months free. You can switch between monthly and annual at any time from this page.',
  },
  {
    q: 'Is my payment data safe?',
    a: 'Payments are processed by Dodo Payments, our merchant of record. Your card details go directly to them — ScriptProof never sees or stores your card number.',
  },
];

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
    <div className="mx-auto max-w-5xl space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Billing &amp; <GradientText>plan</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your subscription, compare plans and see exactly what you pay for.{' '}
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

      {/* ── Current plan ─────────────────────────────────────────────── */}
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
                  {sub?.renewsAt ? (
                    <span>· renews {new Date(sub.renewsAt).toLocaleDateString('en-GB')}</span>
                  ) : null}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter label="Sites" used={siteCount} limit={limits.maxSites} />
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              <span>Pages per site: up to {limits.maxPagesPerSite}</span>
              <span>Scans: {limits.frequencies.includes('6h') ? 'daily or 6-hourly' : 'daily'}</span>
              <span>
                Manual scan cooldown: {Math.round(limits.manualScanCooldownMs / 60_000)} min
              </span>
            </div>
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

      {/* ── Billing clarity strip ────────────────────────────────────── */}
      <Reveal delay={120}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {billingChips.map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-3 rounded-[2px] border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                <chip.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium leading-5 text-slate-700">{chip.label}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Plan cards ───────────────────────────────────────────────── */}
      <div className="grid items-stretch gap-4 md:grid-cols-3">
        {planOrder.map((p, i) => {
          const plan = PLANS[p];
          const content = planContent[p];
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
                    <CardTitle className="text-base">{content.name}</CardTitle>
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
                  <p className="text-xs leading-5 text-slate-500">{content.blurb}</p>
                  <p className="pt-1">
                    <span className="font-display text-3xl font-bold text-navy-900">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-sm text-slate-500">/mo</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    or ${annualPrice(p)}/year — two months free
                  </p>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col gap-4">
                  <ul className="space-y-2 text-xs text-slate-600">
                    {content.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>{f}</span>
                      </li>
                    ))}
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
                        label={`Choose ${content.name}`}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      {/* ── Full comparison table ────────────────────────────────────── */}
      <Reveal delay={200}>
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-navy-900">
            Compare plans <GradientText>in detail</GradientText>
          </h2>
          <div className="mt-4 overflow-x-auto rounded-[2px] border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3.5 text-left font-medium text-slate-500">Feature</th>
                  {planOrder.map((p) => (
                    <th
                      key={p}
                      className={`px-5 py-3.5 text-center font-semibold capitalize ${
                        org.plan === p ? 'text-blue-700' : 'text-navy-900'
                      }`}
                    >
                      {p}
                      {org.plan === p ? (
                        <span className="ml-1.5 align-middle text-[10px] font-bold uppercase tracking-wider text-blue-500">
                          you
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-200 transition-colors last:border-0 hover:bg-blue-50/50"
                  >
                    <td className="px-5 py-3 text-slate-600">{row.label}</td>
                    {planOrder.map((p) => {
                      const v = row.value(p);
                      return (
                        <td key={p} className="px-5 py-3 text-center">
                          {typeof v === 'boolean' ? (
                            v ? (
                              <Check className="mx-auto h-4 w-4 text-blue-600" />
                            ) : (
                              <Minus className="mx-auto h-4 w-4 text-slate-300" />
                            )
                          ) : (
                            <span className="font-medium text-slate-700">{v}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ── Payments & security ──────────────────────────────────────── */}
      <Reveal delay={240}>
        <div className="flex flex-col items-start gap-5 rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-navy-900">We never see your card</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              Payments are handled by Dodo Payments, our merchant of record. Your card details go
              directly to them — ScriptProof never sees or stores your card number. VAT/GST is
              calculated at checkout where applicable. Read our{' '}
              <Link
                href="/legal/refund"
                className="font-semibold text-blue-700 underline-offset-4 hover:underline"
              >
                refund policy
              </Link>{' '}
              and{' '}
              <Link
                href="/security"
                className="font-semibold text-blue-700 underline-offset-4 hover:underline"
              >
                security practices
              </Link>
              .
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Billing FAQ ──────────────────────────────────────────────── */}
      <Reveal delay={280}>
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-navy-900">
            Billing questions, <GradientText>answered</GradientText>
          </h2>
          <dl className="mt-4 space-y-3">
            {billingFaqs.map((faq) => (
              <div key={faq.q} className="rounded-[2px] border border-slate-200 bg-white p-5 shadow-sm">
                <dt className="text-sm font-semibold text-navy-900">{faq.q}</dt>
                <dd className="mt-1.5 text-sm leading-6 text-slate-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {/* ── Support CTA ──────────────────────────────────────────────── */}
      <Reveal delay={320}>
        <div className="flex flex-col items-start gap-4 rounded-[2px] border border-blue-200 bg-blue-50/60 p-6 sm:flex-row sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <p className="flex-1 text-sm leading-6 text-slate-700">
            <span className="font-semibold text-navy-900">Questions about plans or billing?</span>{' '}
            Our team answers every ticket — usually within one business day.
          </p>
          <Link
            href="/app/support"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
          >
            Contact support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
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
