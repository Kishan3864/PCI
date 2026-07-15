import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Braces,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Fingerprint,
  Layers,
  Mail,
  Radar,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
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

const personas = [
  {
    image: '/images/ecommerce-store.jpg',
    alt: 'Small online shop owner preparing orders',
    kicker: 'Small merchants',
    title: 'You run the store. We run the checks.',
    points: [
      'Your acquirer sent an SAQ mentioning 6.4.3 and 11.6.1 — with no explanation of how to actually do it',
      'No security team and no time to hand-audit checkout scripts every week',
      'Verify your domain once; scans, alerts and evidence run on their own after that',
      'A monthly Evidence Pack you can forward to your bank instead of writing one yourself',
    ],
  },
  {
    image: '/images/team-work.jpg',
    alt: 'Agency team collaborating around a table',
    kicker: 'Agencies & freelancers',
    title: 'Every client store, one pane of glass.',
    points: [
      'Clients forward compliance letters from their bank and expect you to make them go away',
      'Dozens of storefronts, each with its own theme, apps and third-party tags',
      'Per-client alerts and white-label Evidence Packs turn compliance into a billable service',
      'CSV export and one dashboard across every site you manage',
    ],
  },
  {
    image: '/images/code-screen.jpg',
    alt: 'Developer reviewing code on screen',
    kicker: 'Developers',
    title: 'Provable diffs, not vague warnings.',
    points: [
      'That tag you didn’t add? Marketing pasted it in six months ago — now it’s on the payment page',
      'Every script is fingerprinted with SHA-256, so “changed” is a fact you can verify',
      'Alerts carry before/after hashes and the exact header deltas, not just “something changed”',
      'Nothing to deploy: monitoring runs from outside, and the optional snippet is under 6 KB',
    ],
  },
];

const deliverables = [
  {
    icon: CalendarClock,
    title: 'Daily scheduled scans',
    body: 'Your payment pages are crawled every day — every 6 hours on Pro — and each run is logged with a timestamp, comfortably inside the weekly cadence 11.6.1 asks for.',
  },
  {
    icon: Fingerprint,
    title: 'SHA-256 script inventory',
    body: 'Every script on your checkout is hashed and catalogued, so your inventory is always current, exportable, and provable rather than guessed.',
  },
  {
    icon: ClipboardCheck,
    title: 'Authorization log',
    body: 'Record why each script is on the page and who approved it — the written justification requirement 6.4.3 expects to see.',
  },
  {
    icon: Layers,
    title: 'Security-header monitoring',
    body: 'CSP, HSTS and other security headers are captured on every scan and diffed against the previous run, so silent weakening gets caught.',
  },
  {
    icon: Braces,
    title: 'CSP insights',
    body: 'See which scripts your Content-Security-Policy actually allows — and where policy and what is really loading have drifted apart.',
  },
  {
    icon: BellRing,
    title: 'Instant change alerts',
    body: 'A new or modified script triggers an immediate email with before/after fingerprints and a one-click review link.',
  },
  {
    icon: Mail,
    title: 'Daily digest',
    body: 'Lower-severity changes are grouped into one readable daily summary, so you stay informed without alert fatigue.',
  },
  {
    icon: FileText,
    title: 'Monthly Evidence Pack PDF',
    body: 'A dated PDF compiling inventory, authorizations, change log and scan history — formatted to attach straight to your SAQ.',
  },
  {
    icon: ScanLine,
    title: 'Free checkout scanner',
    body: 'Point it at any checkout URL and get a one-page report of its scripts and headers in seconds — no account needed.',
  },
  {
    icon: Building2,
    title: 'Agency white-label',
    body: 'Put your agency’s branding on Evidence Packs and manage every client store from a single dashboard on the Agency plan.',
  },
];

const auditorQuestions = [
  {
    q: '“Can you show me an inventory of all scripts on your payment pages?”',
    a: 'Yes — a live, timestamped inventory of every script on your checkout, each fingerprinted with SHA-256 and exportable for any point in time.',
  },
  {
    q: '“Is there a documented business justification for each script?”',
    a: 'Every script carries a recorded authorization — what it does, why it’s there, and who approved it — kept alongside the inventory.',
  },
  {
    q: '“How would you detect tampering with page content or headers?”',
    a: 'Every scan diffs script hashes and security headers against the previous run. Any unexpected change raises an alert with before/after evidence.',
  },
  {
    q: '“Are those checks performed at least weekly?”',
    a: 'Scans run daily — or every 6 hours on Pro — and every run is logged, so the cadence is something you can demonstrate, not just claim.',
  },
  {
    q: '“Can you produce evidence covering the assessment period?”',
    a: 'The monthly Evidence Pack compiles inventory, authorizations, change log and scan history into a dated PDF you can hand over as-is.',
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{children}</p>;
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
              <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                PCI DSS v4.0.1 · Req. 6.4.3 &amp; 11.6.1
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.06] tracking-tight text-navy-950 sm:text-5xl lg:text-[3.4rem]">
                Every script on your checkout.
                <br />
                <GradientText animated>Watched. Fingerprinted. Proven.</GradientText>
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
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> No agent install
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> 14-day trial
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> Never touches card data
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
      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Reveal>
            <TrustBar />
          </Reveal>
        </div>
      </section>

      {/* ── Stat band ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-slate-200 bg-slate-200 md:grid-cols-4">
            {[
              { value: 2, suffix: '', label: 'PCI controls supported (6.4.3 · 11.6.1)' },
              { value: 256, prefix: 'SHA-', label: 'fingerprint on every script' },
              { value: 6, suffix: ' KB', label: 'optional snippet — fails silently' },
              { value: 0, suffix: '', label: 'cardholder data ever touched' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-7 text-center">
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

      {/* ── Who it's for (personas) ──────────────────────────────────── */}
      <section className="mt-20 border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Who it&apos;s for</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Built for the people who actually get the compliance email
              </h2>
              <p className="mt-4 text-slate-600">
                Whether you own the store, manage twenty of them, or wrote the checkout yourself —
                ScriptProof does the monitoring and the paperwork.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {personas.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="card-lift flex h-full flex-col overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-44 w-full">
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {p.kicker}
                    </p>
                    <h3 className="mt-1 font-semibold text-navy-900">{p.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {p.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                        >
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product modules (enterprise card grid) ───────────────────── */}
      <section className="relative isolate overflow-hidden py-24">
        <div aria-hidden className="sp-dots absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>The platform</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Monitoring and evidence, without a security team
              </h2>
              <p className="mt-4 text-slate-600">
                The controls auditors ask about — packaged for small merchants and busy agencies.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m, i) => (
              <Reveal key={m.title} delay={i * 90}>
                <SpotlightCard className="card-lift corner-frame h-full rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {m.kicker}
                  </p>
                  <h3 className="mt-1 font-semibold text-navy-900">{m.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{m.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Threat model (dark diagram panel left, copy right) ───────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <div className="corner-frame corner-frame-dark rounded-[2px] border border-navy-800 bg-surface-900 p-6 shadow-[0_30px_80px_-30px_rgba(11,37,69,0.55)]">
              <ThreatDiagram />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Kicker>The threat</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
              Skimmers hide in the scripts you already trust
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
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
                <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── The stakes: e-skimming & PCI DSS v4 ──────────────────────── */}
      <section className="py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <Kicker>The stakes</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              E-skimming turned the checkout into the front line
            </h2>
            <div className="mt-5 space-y-4 leading-7 text-slate-600">
              <p>
                In a Magecart-style attack, criminals don&apos;t break into your database — they
                slip a few lines of JavaScript into a script your payment page already loads, often
                through a compromised third-party tag or plugin. The skimmer copies card details as
                your customer types them, sends them to a server the attacker controls, and lets the
                order complete normally. Nothing looks wrong to the shopper, and nothing looks wrong
                to you.
              </p>
              <p>
                The card brands responded. PCI DSS v4.0 added requirements 6.4.3 and 11.6.1, which
                became mandatory on 31 March 2025: merchants must keep an authorized, justified
                inventory of all payment-page scripts, and detect tampering with page content and
                security headers at least weekly. Even merchants who validate with a short SAQ are
                increasingly asked by their acquirer to show how their payment page is protected
                against script attacks.
              </p>
              <p>
                Doing that by hand means diffing scripts and headers on a schedule, keeping a
                written justification for every tag, and filing the results where an assessor can
                find them. ScriptProof automates the whole loop — and keeps the receipts.
              </p>
            </div>
            <ul className="mt-7 space-y-3">
              {[
                'An inventory with recorded justifications — the core of requirement 6.4.3',
                'Tamper detection on scripts and headers — the mechanism 11.6.1 describes',
                'Dated logs and reports, so “we monitor it” comes with proof attached',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="corner-frame overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
              <Image
                src="/images/security-lock.jpg"
                alt="Padlock resting on a laptop keyboard, symbolizing payment page security"
                width={1600}
                height={1067}
                className="h-full w-full rounded-[2px] object-cover"
              />
            </div>
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
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                From live scan to bank-ready evidence
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid items-start gap-8 lg:grid-cols-3">
            <Reveal>
              <div className="flex flex-col items-center gap-4">
                <TerminalScan />
                <p className="text-center text-sm text-slate-600">
                  <span className="font-semibold text-navy-900">1 · Scheduled scans</span>{' '}
                  fingerprint every script &amp; header
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="flex flex-col items-center gap-4">
                <AlertMock />
                <p className="text-center text-sm text-slate-600">
                  <span className="font-semibold text-navy-900">2 · Instant alerts</span> with
                  before/after hashes when something changes
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col items-center gap-4">
                <EvidenceMock />
                <p className="text-center text-sm text-slate-600">
                  <span className="font-semibold text-navy-900">3 · Monthly Evidence Pack</span> —
                  the paper trail for your SAQ
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>How it works</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
                Four steps to a signed, dated paper trail
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <div className="card-lift h-full rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-2xl font-bold text-slate-200">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Everything you get (deliverables checklist) ──────────────── */}
      <section className="relative isolate overflow-hidden py-24">
        <div aria-hidden className="sp-dots absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Everything you get</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                One subscription, the whole control loop
              </h2>
              <p className="mt-4 text-slate-600">
                No modules to bolt on, no per-report fees. Every plan covers the full cycle from
                scan to evidence.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {deliverables.map((d, i) => (
              <Reveal key={d.title} delay={(i % 2) * 90}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <d.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{d.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{d.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What your auditor will ask ───────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <Kicker>Assessment day</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
                What your auditor will ask — and what you&apos;ll answer
              </h2>
              <p className="mt-4 text-slate-600">
                Five questions that come up in almost every review of payment-page controls, and how
                ScriptProof lets you answer each one with a document instead of a shrug.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <dl className="corner-frame mt-12 divide-y divide-slate-200 rounded-[2px] border border-slate-200 bg-white shadow-sm">
              {auditorQuestions.map((item) => (
                <div key={item.q} className="flex items-start gap-4 p-6">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <dt className="font-semibold text-navy-900">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
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
              className="inline-flex items-center gap-2 rounded-[2px] border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── Agencies strip ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <Reveal>
          <div className="corner-frame flex flex-col items-start gap-6 rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-navy-950">Run an agency?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
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
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
              Frequently asked questions
            </h2>
          </div>
        </Reveal>
        <dl className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 60}>
              <div className="rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                <dt className="font-semibold text-navy-900">{faq.q}</dt>
                <dd className="mt-2 leading-7 text-slate-600">{faq.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ── Trust band: bank-ready evidence ──────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <div className="corner-frame overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
              <Image
                src="/images/trust-handshake.jpg"
                alt="Two professionals shaking hands over a signed agreement"
                width={1600}
                height={1067}
                className="h-full w-full rounded-[2px] object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Kicker>Built for scrutiny</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Evidence your bank can actually accept
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              The monthly Evidence Pack isn&apos;t a screenshot of a dashboard. It&apos;s a dated
              PDF that reads the way an assessor expects: your script inventory with fingerprints,
              the authorization behind each script, the full change log, and the scan history that
              proves your cadence. Attach it to your SAQ, forward it to your acquirer, or hand it to
              a QSA as-is.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              And because ScriptProof watches payment pages for a living, we hold ourselves to the
              same bar: we never request, process, or store cardholder data — only URLs, hashes,
              headers, and your account details.
            </p>
            <Link
              href="/security"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              How we protect your data <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── CTA (dark contrast band — enterprise style) ──────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="corner-frame corner-frame-dark relative isolate overflow-hidden rounded-[2px] border border-navy-800 bg-navy-950 px-8 py-16 text-center shadow-[0_30px_80px_-30px_rgba(11,37,69,0.6)] sm:px-16">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(103,232,249,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(103,232,249,0.06) 1px, transparent 1px)',
                backgroundSize: '46px 46px',
              }}
            />
            <div
              aria-hidden
              className="absolute -bottom-24 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl"
            />
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start protecting your checkout today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Run a free scan in seconds, or start a 14-day trial and get your first Evidence Pack
              this month.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/signup">
                  Start 14-day free trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                asChild
                className="border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10 hover:text-white"
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
