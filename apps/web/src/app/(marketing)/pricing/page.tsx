import { annualPrice, PLANS, type PlanId } from '@scriptproof/core';
import { ArrowRight, Check, Minus, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Aurora, GradientText, GridGlow, Reveal, SpotlightCard } from '@/components/visual';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple monthly plans for payment-page script monitoring. 14-day free trial on every plan.',
};

interface PlanCard {
  id: PlanId;
  name: string;
  blurb: string;
  featured?: boolean;
  features: string[];
}

const cards: PlanCard[] = [
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'For a single store getting its 6.4.3 inventory in order.',
    features: [
      '1 site, 3 pages',
      'Daily scans',
      'Script inventory + authorization',
      'Change detection + email alerts',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'For growing merchants who need evidence and faster checks.',
    featured: true,
    features: [
      '5 sites, 10 pages each',
      '6-hourly scans',
      'Monthly + on-demand Evidence Packs',
      'CSP insights + runtime agent snippet',
      'Slack alerts',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    blurb: 'For agencies managing many client checkouts.',
    features: [
      '20 sites, everything in Pro',
      'White-label Evidence Packs (your logo)',
      'CSV export of inventory',
      'Priority support',
    ],
  },
];

const comparison: Array<{ label: string; value: (p: PlanId) => string | boolean }> = [
  { label: 'Sites', value: (p) => String(PLANS[p].maxSites) },
  { label: 'Pages per site', value: (p) => String(PLANS[p].maxPagesPerSite) },
  {
    label: 'Scan frequency',
    value: (p) => (PLANS[p].frequencies.includes('6h') ? 'Every 6 hours' : 'Daily'),
  },
  { label: 'Script inventory + alerts', value: () => true },
  { label: 'Evidence Pack PDF', value: (p) => PLANS[p].evidencePacks },
  { label: 'CSP insights', value: (p) => PLANS[p].cspInsights },
  { label: 'Runtime agent snippet', value: (p) => PLANS[p].agentSnippet },
  { label: 'Slack alerts', value: (p) => PLANS[p].slackAlerts },
  { label: 'White-label', value: (p) => PLANS[p].whiteLabel },
  { label: 'CSV export', value: (p) => PLANS[p].csvExport },
];

const planOrder: PlanId[] = ['starter', 'pro', 'agency'];

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              14-day free trial on every plan
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
              Simple, <GradientText animated>honest pricing</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Every plan includes a 14-day free trial. Annual billing is 10× the monthly price — two
              months free. No setup fees.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Plan tiers ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-4">
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.id} delay={i * 80}>
              <SpotlightCard className="h-full rounded-2xl">
                <Card
                  className={
                    card.featured
                      ? 'glow-ring aurora-border card-lift relative h-full bg-white/90'
                      : 'card-lift h-full'
                  }
                >
                  <CardHeader>
                    {card.featured ? (
                      <Badge variant="brand" className="mb-2 w-fit">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </Badge>
                    ) : null}
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <p className="text-sm text-slate-500">{card.blurb}</p>
                    <p className="pt-2">
                      <span className="font-display text-4xl font-bold text-navy-900">
                        ${PLANS[card.id].priceMonthly}
                      </span>
                      <span className="text-sm text-slate-500">/month</span>
                    </p>
                    <p className="text-xs text-slate-400">or ${annualPrice(card.id)}/year</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <ul className="space-y-2.5 text-sm text-slate-600">
                      {card.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                            <Check className="h-3 w-3" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={card.featured ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/signup">
                        Start free trial
                        {card.featured ? <ArrowRight className="h-4 w-4" /> : null}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-navy-900">
            Compare <GradientText>plans</GradientText>
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left font-medium text-slate-500" />
                  {planOrder.map((p) => (
                    <th
                      key={p}
                      className="px-6 py-4 text-center font-semibold capitalize text-navy-900"
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-100 last:border-0 transition-colors hover:bg-emerald-50/40"
                  >
                    <td className="px-6 py-3.5 text-slate-600">{row.label}</td>
                    {planOrder.map((p) => {
                      const v = row.value(p);
                      return (
                        <td key={p} className="px-6 py-3.5 text-center">
                          {typeof v === 'boolean' ? (
                            v ? (
                              <Check className="mx-auto h-4 w-4 text-emerald-600" />
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
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-12 text-center text-sm text-slate-500">
            Not sure which plan? Start on any plan's free trial and change later — nothing is
            charged until the trial ends.
          </p>
        </Reveal>
      </section>
    </>
  );
}
