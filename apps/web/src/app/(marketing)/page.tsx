import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Fingerprint,
  Gauge,
  Radar,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AnimatedCounter,
  Aurora,
  GradientText,
  GridGlow,
  Marquee,
  Reveal,
  ScanRadar,
  SpotlightCard,
} from '@/components/visual';

const steps = [
  {
    icon: CheckCircle2,
    title: 'Verify your site',
    body: 'Prove you own the domain with a DNS record or meta tag. We only ever monitor sites you control.',
  },
  {
    icon: Radar,
    title: 'We watch your payment pages',
    body: 'Our crawler fingerprints every script and security header on your checkout, on a daily or 6-hourly schedule.',
  },
  {
    icon: ShieldCheck,
    title: 'You get alerted on changes',
    body: 'A new or modified script triggers an immediate email with before/after hashes and a one-click review link.',
  },
  {
    icon: FileText,
    title: 'Evidence, ready for your SAQ',
    body: 'A monthly PDF Evidence Pack documents your script inventory, authorizations, change log and scan cadence.',
  },
];

const features = [
  {
    icon: Fingerprint,
    title: 'Script inventory & justification',
    body: 'Every script on your checkout, fingerprinted with SHA-256, with a recorded reason each one is authorized — the heart of requirement 6.4.3.',
  },
  {
    icon: AlertTriangle,
    title: 'Tamper & change detection',
    body: 'Content and security-header changes are caught and flagged, supporting 11.6.1 — the exact surface skimming attacks target.',
  },
  {
    icon: FileText,
    title: 'Monthly Evidence Pack',
    body: 'A clean PDF of your inventory, authorizations, change log and scan cadence — the paper trail to attach to your SAQ.',
  },
  {
    icon: ScanLine,
    title: 'Free instant scan',
    body: 'Point us at any checkout URL and get a one-page report of its scripts and headers in seconds — no account needed.',
  },
  {
    icon: Building2,
    title: 'Built for agencies',
    body: 'Manage many client stores from one place, with white-label Evidence Packs and CSV export on the Agency plan.',
  },
  {
    icon: Gauge,
    title: 'Zero performance hit',
    body: 'Monitoring runs on our servers, not your customers’ browsers. The optional snippet is under 6 KB and fails silently.',
  },
];

const monitored = [
  'Stripe.js',
  'PayPal SDK',
  'Google Pay',
  'Apple Pay',
  'Checkout scripts',
  'Analytics tags',
  'CSP headers',
  'SRI hashes',
  'Third-party pixels',
  'Inline scripts',
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                PCI DSS v4.0.1 · Requirements 6.4.3 &amp; 11.6.1
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
                Know <GradientText animated>every script</GradientText> on your checkout — and{' '}
                <GradientText animated>prove it</GradientText>.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                ScriptProof keeps an inventory of every script on your payment pages, records why
                each one is authorized, detects tampering, and turns it all into evidence you can
                hand to your bank — no agent install required to start.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Button size="xl" asChild>
                  <Link href="/signup">
                    Start 14-day free trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/free-scan">Run a free scan</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No agent install
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 14-day trial
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Never touches card data
                </span>
              </p>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <ScanRadar />
          </Reveal>
        </div>
      </section>

      {/* ── Stat band ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 rounded-3xl border border-emerald-100/70 bg-white/70 p-8 shadow-sm backdrop-blur-sm md:grid-cols-4">
            {[
              { value: 2, suffix: '', label: 'PCI controls supported (6.4.3 · 11.6.1)' },
              { value: 256, prefix: 'SHA-', label: 'fingerprint on every script' },
              { value: 6, suffix: ' KB', label: 'optional snippet — fails silently' },
              { value: 0, suffix: '', label: 'cardholder data ever touched' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold sm:text-4xl">
                  <GradientText>
                    <AnimatedCounter
                      value={stat.value}
                      prefix={stat.prefix ?? ''}
                      suffix={stat.suffix ?? ''}
                    />
                  </GradientText>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Monitored tech marquee ───────────────────────────────────── */}
      <section className="mt-16">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          Watches the scripts &amp; headers that matter
        </p>
        <Marquee>
          {monitored.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-navy-900">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Four steps from "I think we're fine" to a signed, dated paper trail.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <SpotlightCard className="card-lift h-full rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)]">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-sm font-bold text-emerald-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-semibold text-navy-900">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-24">
        <Aurora muted />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" /> Everything in one place
              </span>
              <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-navy-900">
                Monitoring and evidence, without a security team
              </h2>
              <p className="mt-3 text-slate-600">
                The controls auditors ask about — script inventory, tamper detection, and a clean
                paper trail — packaged for small merchants and busy agencies.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 90}>
                <SpotlightCard className="card-lift h-full rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold text-navy-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why now ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/70 p-8 shadow-sm backdrop-blur-sm sm:p-12">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
            />
            <h2 className="font-display text-2xl font-bold text-navy-900">Why this matters now</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Since PCI DSS v4.0, requirements 6.4.3 and 11.6.1 ask merchants to maintain an
              authorized inventory of all payment-page scripts and to detect tampering with page
              content and HTTP headers at least weekly. That applies to small shops too — skimming
              attacks overwhelmingly target exactly the scripts these requirements cover.
              ScriptProof gives you the monitoring and the paper trail without hiring a security
              team.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-navy-900">
            Frequently asked questions
          </h2>
        </Reveal>
        <dl className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 60}>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                <dt className="font-semibold text-navy-900">{faq.q}</dt>
                <dd className="mt-2 leading-7 text-slate-600">{faq.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-16 text-center shadow-[0_30px_80px_-30px_rgba(16,185,129,0.7)] sm:px-16">
            <div aria-hidden className="sp-grid absolute inset-0 opacity-20" />
            <div
              aria-hidden
              className="absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl"
            />
            <h2 className="relative font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start protecting your checkout today
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-emerald-50">
              Run a free scan in seconds, or start a 14-day trial and get your first Evidence Pack
              this month.
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-4">
              <Button
                size="xl"
                variant="outline"
                asChild
                className="border-white/30 bg-white text-emerald-700 hover:bg-emerald-50"
              >
                <Link href="/signup">
                  Start 14-day free trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/free-scan">Run a free scan</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

const faqs = [
  {
    q: 'Does ScriptProof make me PCI compliant?',
    a: 'No. ScriptProof is a monitoring and evidence tool. It supports your 6.4.3 and 11.6.1 controls and produces supporting evidence, but it is not a QSA service and does not certify compliance. Your validation requirements are set by your acquirer or a QSA.',
  },
  {
    q: 'Do I need to install anything on my site?',
    a: 'No. ScriptProof monitors your pages from the outside after you verify you own the domain. There is an optional lightweight snippet on Pro and Agency plans for catching scripts injected at runtime, but it is not required to start.',
  },
  {
    q: 'Will it slow down my checkout?',
    a: 'No. Monitoring happens on our servers, not in your customers’ browsers. The optional snippet is under 6 KB and fails silently — it never blocks or breaks your page.',
  },
  {
    q: 'What happens when a script changes?',
    a: 'A new or modified script on a payment page triggers an immediate email with the before and after fingerprints and a one-click review link. Lower-severity changes are grouped into a daily digest.',
  },
  {
    q: 'Do you ever see card data?',
    a: 'Never. ScriptProof only handles URLs, script metadata and content hashes, HTTP headers, and your account details. It does not request, process, or store cardholder data.',
  },
];
