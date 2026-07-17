import { annualPrice, PLANS, type PlanId } from '@scriptproof/core';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Briefcase,
  Check,
  Clock,
  CreditCard,
  Lock,
  Minus,
  ShieldCheck,
  Sparkles,
  Store,
  Timer,
  TrendingUp,
  Undo2,
  XCircle,
} from 'lucide-react';
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
      'Excel export of inventory & change log',
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
  { label: 'Excel export', value: (p) => PLANS[p].csvExport },
];

const planOrder: PlanId[] = ['starter', 'pro', 'agency'];

const billingChips = [
  { icon: Clock, label: '14-day free trial' },
  { icon: CreditCard, label: 'No card required' },
  { icon: XCircle, label: 'Cancel anytime' },
  { icon: Undo2, label: '14-day money-back on first invoice' },
];

const personas = [
  {
    icon: Store,
    plan: 'Starter',
    title: 'You run a single store',
    bullets: [
      'One checkout to watch — up to 3 payment pages',
      'You need a 6.4.3 script inventory with recorded authorizations',
      'Daily scans and email alerts cover your monitoring cadence',
    ],
  },
  {
    icon: TrendingUp,
    plan: 'Pro',
    title: 'You are growing and need evidence',
    bullets: [
      'Up to 5 sites with 6-hourly scans for faster detection',
      'Runtime agent snippet catches scripts injected in the browser',
      'Monthly + on-demand Evidence Packs, CSP insights, Slack alerts',
    ],
  },
  {
    icon: Briefcase,
    plan: 'Agency',
    title: 'You manage client stores',
    bullets: [
      'Up to 20 client sites in one dashboard',
      'White-label Evidence Packs carry your logo, not ours',
      'CSV export of inventories plus priority support',
    ],
  },
];

const alternatives = [
  {
    icon: Timer,
    kicker: 'Time cost',
    title: 'Manual weekly checks',
    body: 'Viewing source, diffing script tags by hand, and writing up what you found — every week, for every payment page. Minified or dynamically loaded changes are easy to miss, and the paper trail only exists if you write it yourself.',
  },
  {
    icon: Banknote,
    kicker: 'Money cost',
    title: 'One-off consultant audits',
    body: 'A point-in-time snapshot that starts going stale the day after the engagement ends. Scripts change between audits, and the evidence you can show your acquirer is limited to the audit date.',
  },
  {
    icon: AlertTriangle,
    kicker: 'Risk',
    title: 'Doing nothing',
    body: 'Skimming changes are invisible to shoppers — and to you. Your acquirer can ask for proof of 6.4.3 and 11.6.1 controls at any time, and a breach means forensic investigation and potential card-brand fines.',
  },
];

const included = [
  'Daily scans on every plan',
  'SHA-256 fingerprint inventory of every script',
  'Justification workflow for each authorization',
  'Security header monitoring (11.6.1 surface)',
  'Instant alerts on critical changes',
  'Daily digest of lower-severity changes',
  'CSP insights (per plan)',
  'Evidence Packs (per plan)',
  'Email support',
  'No card data ever touched',
];

const pricingFaqs = [
  {
    q: 'What happens after the 14-day trial?',
    a: 'Your trial runs with the full features of the plan you picked, and nothing is charged until it ends. Add a payment method to keep monitoring running; if you cancel or do nothing, you are never billed.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades unlock the higher limits right away, and billing is adjusted by our payment provider at checkout.',
  },
  {
    q: 'What counts as a "page"?',
    a: 'A page is a URL on your verified site that we scan — typically your checkout, cart, and payment pages. Starter includes 3 pages on 1 site; Pro and Agency include 10 pages per site.',
  },
  {
    q: 'Do you charge per scan?',
    a: 'No. Every plan is a flat monthly price. Scheduled scans at your plan’s cadence — daily, or every 6 hours on Pro and Agency — are included, with no per-scan or overage charges.',
  },
  {
    q: 'What is your refund policy?',
    a: 'If ScriptProof is not right for you, we offer a 14-day money-back guarantee on your first invoice. The full policy is published in our legal center.',
  },
  {
    q: 'Is the Agency plan white-label?',
    a: 'Evidence Packs are — the client-facing PDFs carry your agency’s logo instead of ours, and inventories export to CSV for your own reporting. The ScriptProof dashboard itself stays ScriptProof-branded.',
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{children}</p>;
}

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Pricing</p>
          </Reveal>
          <Reveal delay={60}>
            <span className="mt-5 inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              14-day free trial on every plan
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">
              Simple, <GradientText animated>honest pricing</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Every plan includes a 14-day free trial. Annual billing is 10× the monthly price — two
              months free. No setup fees.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Billing clarity strip ────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {billingChips.map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-3 rounded-[2px] border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                  <chip.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700">{chip.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Plan tiers ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-4">
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.id} delay={i * 80}>
              <SpotlightCard className="h-full rounded-[2px]">
                <Card
                  className={
                    card.featured
                      ? 'glow-ring corner-frame card-lift relative h-full border-blue-300 bg-white'
                      : 'card-lift h-full bg-white'
                  }
                >
                  <CardHeader>
                    {card.featured ? (
                      <Badge variant="brand" className="mb-2 w-fit">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </Badge>
                    ) : null}
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <p className="text-sm text-slate-600">{card.blurb}</p>
                    <p className="pt-2">
                      <span className="font-display text-4xl font-bold text-navy-950">
                        ${PLANS[card.id].priceMonthly}
                      </span>
                      <span className="text-sm text-slate-500">/month</span>
                    </p>
                    <p className="text-xs text-slate-500">or ${annualPrice(card.id)}/year</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      {card.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
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

      {/* ── Which plan fits you? ─────────────────────────────────────── */}
      <section className="mt-16 border-y border-slate-200 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Fit check</Kicker>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                Which plan <GradientText>fits you?</GradientText>
              </h2>
              <p className="mt-4 text-slate-600">
                Match your situation, not a feature list. Every plan starts with the same 14-day
                free trial.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {personas.map((persona, i) => (
              <Reveal key={persona.plan} delay={i * 90}>
                <SpotlightCard className="card-lift corner-frame flex h-full flex-col rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <persona.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Best on {persona.plan}
                  </p>
                  <h3 className="mt-1 font-semibold text-navy-900">{persona.title}</h3>
                  <ul className="mt-4 flex-1 space-y-2.5 text-sm text-slate-600">
                    {persona.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-600"
                  >
                    Choose {persona.plan} <ArrowRight className="h-4 w-4" />
                  </Link>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Side by side
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy-950">
              Compare <GradientText>plans</GradientText>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 overflow-x-auto rounded-[2px] border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
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
                    className="border-b border-slate-200 last:border-0 transition-colors hover:bg-blue-50/50"
                  >
                    <td className="px-6 py-3.5 text-slate-600">{row.label}</td>
                    {planOrder.map((p) => {
                      const v = row.value(p);
                      return (
                        <td key={p} className="px-6 py-3.5 text-center">
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
        </Reveal>
      </section>

      {/* ── What monitoring replaces ─────────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-20">
        <div aria-hidden className="sp-dots absolute inset-0 -z-10" />
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Honest value</Kicker>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                What monitoring <GradientText>replaces</GradientText>
              </h2>
              <p className="mt-4 text-slate-600">
                There are three ways merchants typically weigh handling 6.4.3 and 11.6.1 without a
                tool. Each has a real cost.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {alternatives.map((alt, i) => (
              <Reveal key={alt.title} delay={i * 90}>
                <div className="card-lift h-full rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <alt.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {alt.kicker}
                  </p>
                  <h3 className="mt-1 font-semibold text-navy-900">{alt.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{alt.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={280}>
            <div className="mt-8 flex flex-col items-center gap-4 rounded-[2px] border border-blue-200 bg-blue-50/60 p-6 text-center sm:flex-row sm:text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-navy-900">ScriptProof</span> runs the checks
                continuously and writes the paper trail automatically — from $
                {PLANS.starter.priceMonthly}/month, with a 14-day free trial to see it on your own
                checkout first.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Every plan includes ──────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Included everywhere</Kicker>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                Every plan <GradientText>includes</GradientText>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-10 grid gap-x-8 gap-y-3 rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Payments & security note ─────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="corner-frame flex flex-col items-start gap-6 rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm sm:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Payments &amp; security
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-navy-950">
                We never see your card
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Payments are handled by Dodo Payments, our merchant of record. Your card details go
                directly to them — ScriptProof never sees or stores your card number. VAT/GST is
                calculated and collected at checkout where applicable.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Read our{' '}
                <Link
                  href="/legal/refund"
                  className="font-semibold text-blue-700 underline-offset-4 transition-colors hover:text-blue-600 hover:underline"
                >
                  refund policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/security"
                  className="font-semibold text-blue-700 underline-offset-4 transition-colors hover:text-blue-600 hover:underline"
                >
                  how we secure your data
                </Link>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Pricing FAQ ──────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <Kicker>Pricing FAQ</Kicker>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                Billing questions, <GradientText>answered</GradientText>
              </h2>
            </div>
          </Reveal>
          <dl className="mt-10 space-y-3">
            {pricingFaqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <div className="rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                  <dt className="font-semibold text-navy-900">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-7 text-slate-600">{faq.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Closing reassurance + final CTA ──────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <p className="text-center text-sm text-slate-500">
            Not sure which plan? Start on any plan's free trial and change later — nothing is
            charged until the trial ends.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="xl" asChild>
              <Link href="/signup">
                Start 14-day free trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/free-scan">Run a free scan first</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
