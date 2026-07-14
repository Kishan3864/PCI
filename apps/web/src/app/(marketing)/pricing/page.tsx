import { annualPrice, PLANS, type PlanId } from '@scriptproof/core';
import { Check, Minus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-navy-900">Simple, honest pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Every plan includes a 14-day free trial. Annual billing is 10× the monthly price — two
          months free. No setup fees.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={card.featured ? 'border-navy-300 shadow-md ring-1 ring-navy-200' : ''}
          >
            <CardHeader>
              {card.featured ? (
                <span className="mb-2 inline-block w-fit rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">
                  Most popular
                </span>
              ) : null}
              <CardTitle className="text-lg">{card.name}</CardTitle>
              <p className="text-sm text-slate-500">{card.blurb}</p>
              <p className="pt-2">
                <span className="text-3xl font-bold text-navy-900">
                  ${PLANS[card.id].priceMonthly}
                </span>
                <span className="text-sm text-slate-500">/month</span>
              </p>
              <p className="text-xs text-slate-400">or ${annualPrice(card.id)}/year</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600">
                {card.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={card.featured ? 'default' : 'outline'} asChild>
                <Link href="/signup">Start free trial</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold text-navy-900">Compare plans</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 text-left font-medium text-slate-500" />
                {planOrder.map((p) => (
                  <th key={p} className="py-3 text-center font-semibold capitalize text-navy-900">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label} className="border-b border-slate-100">
                  <td className="py-3 text-slate-600">{row.label}</td>
                  {planOrder.map((p) => {
                    const v = row.value(p);
                    return (
                      <td key={p} className="py-3 text-center">
                        {typeof v === 'boolean' ? (
                          v ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-600" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-slate-300" />
                          )
                        ) : (
                          <span className="text-slate-700">{v}</span>
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

      <p className="mt-12 text-center text-sm text-slate-500">
        Not sure which plan? Start on any plan's free trial and change later — nothing is charged
        until the trial ends.
      </p>
    </div>
  );
}
