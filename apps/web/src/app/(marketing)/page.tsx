import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Fingerprint,
  Radar,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertMock,
  DashboardMock,
  EvidenceMock,
  TerminalScan,
  ThreatDiagram,
  TrustBar,
} from '@/components/graphics';
import { Button } from '@/components/ui/button';
import {
  AnimatedCounter,
  Aurora,
  GradientText,
  GridGlow,
  Marquee,
  Reveal,
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

const modules = [
  {
    icon: Fingerprint,
    title: 'Script Inventory',
    kicker: 'Requirement 6.4.3',
    body: 'Every script on your checkout, fingerprinted with SHA-256, with a recorded reason each one is authorized.',
  },
  {
    icon: AlertTriangle,
    title: 'Tamper Detection',
    kicker: 'Requirement 11.6.1',
    body: 'Content and security-header changes caught and flagged — the exact surface skimming attacks target.',
  },
  {
    icon: FileText,
    title: 'Evidence Packs',
    kicker: 'Audit-ready PDF',
    body: 'A monthly paper trail of inventory, authorizations, change log and scan cadence to attach to your SAQ.',
  },
  {
    icon: ScanLine,
    title: 'Free Scanner',
    kicker: 'No account needed',
    body: 'Point us at any checkout URL and get a one-page report of its scripts and headers in seconds.',
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

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">{children}</p>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ── Hero: text left, product mock right ─────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-[2px] border border-cyan-400/30 bg-cyan-400/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                PCI DSS v4.0.1 · Req. 6.4.3 &amp; 11.6.1
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                Every script on your checkout.
                <br />
                <GradientText animated>Watched. Fingerprinted. Proven.</GradientText>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
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
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> No agent install
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> 14-day trial
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Never touches card data
                </span>
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} className="justify-self-center lg:justify-self-end">
            <div className="animate-float-slow">
              <DashboardMock />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust / compliance badge bar ─────────────────────────────── */}
      <section className="border-y border-cyan-400/10 bg-surface-850/70">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Reveal>
            <TrustBar />
          </Reveal>
        </div>
      </section>

      {/* ── Stat band ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-slate-400/15 bg-slate-400/15 md:grid-cols-4">
            {[
              { value: 2, suffix: '', label: 'PCI controls supported (6.4.3 · 11.6.1)' },
              { value: 256, prefix: 'SHA-', label: 'fingerprint on every script' },
              { value: 6, suffix: ' KB', label: 'optional snippet — fails silently' },
              { value: 0, suffix: '', label: 'cardholder data ever touched' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-900 p-7 text-center">
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

      {/* ── Product modules (enterprise card grid) ───────────────────── */}
      <section className="relative isolate overflow-hidden py-24">
        <div aria-hidden className="sp-dots absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>The platform</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Monitoring and evidence, without a security team
              </h2>
              <p className="mt-4 text-slate-400">
                The controls auditors ask about — packaged for small merchants and busy agencies.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m, i) => (
              <Reveal key={m.title} delay={i * 90}>
                <SpotlightCard className="card-lift corner-frame h-full rounded-[2px] border border-slate-400/15 bg-surface-800/80 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 text-surface-900 shadow-[0_8px_20px_-8px_rgba(34,211,238,0.7)]">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    {m.kicker}
                  </p>
                  <h3 className="mt-1 font-semibold text-white">{m.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{m.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Threat model (diagram left, copy right) ──────────────────── */}
      <section className="border-y border-cyan-400/10 bg-surface-850/70 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <div className="corner-frame rounded-[2px] border border-slate-400/15 bg-surface-900/80 p-6">
              <ThreatDiagram />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Kicker>The threat</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
              Skimmers hide in the scripts you already trust
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              Since PCI DSS v4.0, requirements 6.4.3 and 11.6.1 ask merchants to maintain an
              authorized inventory of all payment-page scripts and to detect tampering with page
              content and HTTP headers at least weekly. That applies to small shops too — skimming
              attacks overwhelmingly target exactly the scripts these requirements cover.
              ScriptProof gives you the monitoring and the paper trail without hiring a security
              team.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                'One injected script can read every card typed into your checkout',
                'Changes are invisible to shoppers — and to you, without monitoring',
                'Your acquirer can ask for proof of these controls at any time',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── What you get (graphics trio) ─────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-24">
        <Aurora muted />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>What lands in your hands</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                From live scan to bank-ready evidence
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid items-start gap-8 lg:grid-cols-3">
            <Reveal>
              <div className="flex flex-col items-center gap-4">
                <TerminalScan />
                <p className="text-center text-sm text-slate-400">
                  <span className="font-semibold text-white">1 · Scheduled scans</span> fingerprint
                  every script &amp; header
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="flex flex-col items-center gap-4">
                <AlertMock />
                <p className="text-center text-sm text-slate-400">
                  <span className="font-semibold text-white">2 · Instant alerts</span> with
                  before/after hashes when something changes
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col items-center gap-4">
                <EvidenceMock />
                <p className="text-center text-sm text-slate-400">
                  <span className="font-semibold text-white">3 · Monthly Evidence Pack</span> —
                  the paper trail for your SAQ
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="border-y border-cyan-400/10 bg-surface-850/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>How it works</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
                Four steps to a signed, dated paper trail
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <div className="card-lift h-full rounded-[2px] border border-slate-400/15 bg-surface-900/80 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-2xl font-bold text-surface-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Monitored tech marquee ───────────────────────────────────── */}
      <section className="py-16">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Watches the scripts &amp; headers that matter
        </p>
        <Marquee>
          {monitored.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-[2px] border border-slate-400/15 bg-surface-800/80 px-4 py-2 text-sm font-medium text-slate-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── Agencies strip ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <Reveal>
          <div className="corner-frame flex flex-col items-start gap-6 rounded-[2px] border border-slate-400/15 bg-surface-800/80 p-8 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 text-surface-900">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-white">Run an agency?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Manage many client stores from one place, with white-label Evidence Packs and CSV
                export on the Agency plan. Zero performance hit — monitoring runs on our servers,
                and the optional snippet is under 6&nbsp;KB and fails silently.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                Agency plan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <div className="text-center">
            <Kicker>FAQ</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
              Frequently asked questions
            </h2>
          </div>
        </Reveal>
        <dl className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 60}>
              <div className="rounded-[2px] border border-slate-400/15 bg-surface-800/80 p-6">
                <dt className="font-semibold text-white">{faq.q}</dt>
                <dd className="mt-2 leading-7 text-slate-400">{faq.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="corner-frame relative isolate overflow-hidden rounded-[2px] border border-cyan-400/30 bg-surface-850 px-8 py-16 text-center sm:px-16">
            <div aria-hidden className="sp-grid absolute inset-0 -z-10" />
            <div
              aria-hidden
              className="absolute -bottom-24 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl"
            />
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start protecting your checkout <GradientText animated>today</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Run a free scan in seconds, or start a 14-day trial and get your first Evidence Pack
              this month.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/signup">
                  Start 14-day free trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
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
