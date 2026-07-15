import { ArrowRight, Bot, CreditCard, Fingerprint, Gauge, Lock, Network } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AlertMock, DashboardMock, EvidenceMock, TerminalScan } from '@/components/graphics';
import { Button } from '@/components/ui/button';
import { Aurora, GradientText, GridGlow, Reveal } from '@/components/visual';
import { DISCLAIMER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'From domain verification to a monthly Evidence Pack: how ScriptProof inventories, fingerprints, and monitors every script on your payment pages for PCI DSS 6.4.3 and 11.6.1.',
};

interface Step {
  number: string;
  kicker: string;
  heading: string;
  paragraphs: [string, string];
  bullets: [string, string, string];
  visual: React.ReactNode;
}

const steps: Step[] = [
  {
    number: '01',
    kicker: 'Setup',
    heading: 'Add & verify your site',
    paragraphs: [
      'You start by telling ScriptProof which domain to watch and proving that you control it. We support two verification methods: a DNS TXT record — you add a short token like scriptproof-verify=… to your DNS zone, and we check for it — or an HTML meta tag placed in the <head> of your homepage. DNS verification survives theme changes and replatforms; the meta tag is quicker if you can edit your storefront but not your DNS.',
      'Ownership verification matters for two reasons. First, it keeps the platform honest: nobody can point ScriptProof at a site they do not control and harvest details about its scripts and headers. Second, it anchors your evidence — every scan result and every Evidence Pack is tied to a domain you demonstrably owned at the time, which is exactly the kind of provenance an assessor or acquirer wants to see.',
    ],
    bullets: [
      'DNS TXT or meta-tag verification — pick whichever your setup makes easier',
      'Verification is re-checked periodically, so evidence stays anchored to a domain you control',
      'Then list your payment pages: checkout, payment method entry, and any page that can affect them',
    ],
    visual: (
      <div className="corner-frame overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
        <Image
          src="/images/office-docs.jpg"
          alt="Reviewing domain verification records"
          width={1600}
          height={1067}
          className="h-auto w-full"
        />
      </div>
    ),
  },
  {
    number: '02',
    kicker: 'Baseline',
    heading: 'First scan builds your baseline',
    paragraphs: [
      'Once verified, our crawler visits your payment pages from our servers — there is nothing to install on your site. A headless browser loads each page the way a real shopper’s browser would, so we see not just the HTML but every script the page actually pulls in: first-party bundles, payment SDKs like Stripe.js or the PayPal SDK, tag managers, and the scripts those scripts load in turn.',
      'Every discovered script is fingerprinted with a SHA-256 hash of its content, alongside its URL, load method, and where it appeared. We also snapshot the security-relevant HTTP headers on each page — Content-Security-Policy, and the rest of the hardening set — because requirement 11.6.1 covers tampering with headers, not just page content. This first scan becomes your baseline: the known-good state that every future scan is compared against.',
    ],
    bullets: [
      'Headless-browser crawl from our servers — no agent, no code change, zero page weight',
      'SHA-256 content fingerprint recorded for every script, including dynamically loaded ones',
      'HTTP security headers snapshotted per page, so header tampering is caught too',
    ],
    visual: <TerminalScan />,
  },
  {
    number: '03',
    kicker: 'Authorize',
    heading: 'Review & authorize your inventory',
    paragraphs: [
      'PCI DSS 6.4.3 asks for more than a list: each script on a payment page needs written justification for why it is necessary, and a method to confirm it is authorized. ScriptProof turns that into a short review workflow. Your baseline scan produces the inventory; you walk through it once, mark each script as authorized, and record the reason — “Stripe.js processes card entry”, “GA4 tag for conversion tracking” — in a sentence or two.',
      'That justification is stored with the script’s fingerprint, who authorized it, and when. Anything you do not recognize can be flagged for investigation instead. From then on, the inventory is a living document: new scripts arrive as “pending review” rather than silently joining the authorized set, so your written-justification record never drifts out of date.',
    ],
    bullets: [
      'One-click authorize with a recorded justification, reviewer, and timestamp per script',
      'Wording aligned to 6.4.3 — inventory, justification, and confirmation of authorization',
      'Unknown scripts stay quarantined as pending until a human signs them off',
    ],
    visual: <DashboardMock />,
  },
  {
    number: '04',
    kicker: 'Monitor',
    heading: 'Continuous change detection',
    paragraphs: [
      'After the baseline, ScriptProof re-scans your payment pages on a schedule — daily on Starter, every 6 hours on Pro and Agency — and compares each script’s SHA-256 fingerprint and each page’s headers against the authorized state. Requirement 11.6.1 asks for this detection at least weekly; a daily cadence gives you a comfortable margin and a much smaller window for a skimmer to operate unnoticed.',
      'Not every change is an emergency, so alerts carry severity. A brand-new script or a content change to an authorized payment script is critical and triggers an immediate email with the before/after hashes and a one-click review link. Weakened security headers rate high. Routine, lower-risk changes are batched into a daily digest so your inbox reflects risk, not noise. On Pro and Agency, an optional snippet — under 6 KB, and it fails silently — adds runtime detection of scripts injected in the browser that a crawl alone might miss.',
    ],
    bullets: [
      'Daily or 6-hourly scans — comfortably inside 11.6.1’s at-least-weekly expectation',
      'Severity-ranked alerts: instant email for critical changes, a daily digest for the rest',
      'Every change is logged with before/after fingerprints, building your audit trail automatically',
    ],
    visual: <AlertMock />,
  },
  {
    number: '05',
    kicker: 'Prove it',
    heading: 'Monthly Evidence Pack',
    paragraphs: [
      'Monitoring only helps at assessment time if you can prove it happened. Once a month, ScriptProof compiles everything into a dated PDF Evidence Pack: Section A is your current script inventory with fingerprints; Section B is the authorization record — each script’s written justification, who approved it, and when; Section C is the change log for the period, including how each change was resolved; Section D documents your scan cadence and coverage.',
      'The pack is designed to sit behind your SAQ answers for 6.4.3 and 11.6.1 — when your acquirer or an assessor asks how you meet those requirements, you attach the PDFs instead of assembling screenshots. Packs accumulate month over month into a continuous history, and Agency plans can white-label them for client deliverables.',
    ],
    bullets: [
      'Sections A–D: inventory, authorizations, change log, and scan-cadence attestation',
      'Generated monthly (plus on-demand on Pro and Agency) and archived for a running history',
      'Attach directly to your SAQ or hand to your acquirer when they ask for proof',
    ],
    visual: <EvidenceMock />,
  },
];

const hood = [
  {
    icon: Bot,
    title: 'A transparent crawler',
    body: (
      <>
        Our scanner identifies itself with a clear user-agent and a published IP policy, so you can
        allowlist or verify it. Details on the{' '}
        <Link href="/bot" className="font-medium text-blue-700 underline underline-offset-2">
          bot page
        </Link>
        .
      </>
    ),
  },
  {
    icon: Network,
    title: 'SSRF-guarded fetching',
    body: 'Every URL we fetch is validated against private, loopback, and link-local ranges before and after DNS resolution — the scanner cannot be pointed at internal infrastructure.',
  },
  {
    icon: Fingerprint,
    title: 'SHA-256 fingerprints',
    body: 'Script integrity is tracked by content hash, not by URL alone — so a script that keeps its address but changes its behavior is caught immediately.',
  },
  {
    icon: Lock,
    title: 'TLS everywhere',
    body: 'Scans, the dashboard, alert delivery, and Evidence Pack downloads all run over TLS. Data is encrypted in transit end to end.',
  },
  {
    icon: CreditCard,
    title: 'No card data, ever',
    body: (
      <>
        ScriptProof handles URLs, script metadata, hashes, and headers — never cardholder data. Read
        the full policy on our{' '}
        <Link href="/security" className="font-medium text-blue-700 underline underline-offset-2">
          security page
        </Link>
        .
      </>
    ),
  },
  {
    icon: Gauge,
    title: 'Zero page weight',
    body: 'Scanning runs entirely on our servers, so your shoppers load nothing extra. The optional runtime snippet on Pro+ is under 6 KB and fails silently.',
  },
];

const mapping = [
  {
    req: '6.4.3',
    asks: 'Maintain an inventory of all scripts loaded and executed on payment pages.',
    gives:
      'Every scan rebuilds a live inventory of first- and third-party scripts on your payment pages, each with a SHA-256 fingerprint, URL, and load context.',
  },
  {
    req: '6.4.3',
    asks: 'Record written justification for why each of those scripts is necessary.',
    gives:
      'The authorization workflow stores a written justification per script, along with who approved it and when — exportable as Section B of the Evidence Pack.',
  },
  {
    req: '6.4.3',
    asks: 'Implement a method to confirm each script is authorized and to assure its integrity.',
    gives:
      'Fingerprints are compared against your authorized baseline on every scan; unauthorized or modified scripts are flagged as pending and alerted, never silently accepted.',
  },
  {
    req: '11.6.1',
    asks: 'Detect and alert on unauthorized changes to payment-page content and the HTTP headers received by the browser, evaluated at least weekly.',
    gives:
      'Daily (or 6-hourly) scans diff page scripts and security headers against the baseline, send severity-ranked alerts, and log a dated change history that documents your cadence.',
  },
];

const faqs = [
  {
    q: 'How often do scans run?',
    a: 'Daily on the Starter plan and every 6 hours on Pro and Agency. Both comfortably exceed the at-least-weekly cadence 11.6.1 expects, and every scan is logged so your Evidence Pack can document the actual frequency.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Verification is a DNS record or meta tag, and all scanning runs from our servers using a headless browser. Pro and Agency plans offer an optional runtime snippet — under 6 KB, fails silently — for catching scripts injected in the browser, but it is never required.',
  },
  {
    q: 'What counts as a critical change?',
    a: 'A new script appearing on a payment page, a content change to an authorized script (its SHA-256 no longer matches), or a weakened security header. Critical changes trigger an immediate email with before/after fingerprints; lower-severity changes go into the daily digest.',
  },
  {
    q: 'Can my agency manage multiple stores?',
    a: 'Yes. The Agency plan covers up to 20 sites from one dashboard, with per-client script inventories, white-label Evidence Packs carrying your logo, and CSV export for your own reporting.',
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{children}</p>;
}

export default function HowItWorksPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">
          <Reveal>
            <Kicker>How it works</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
              From first scan to <GradientText animated>bank-ready evidence</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Five steps take you from an unverified domain to a monitored checkout with a monthly,
              dated paper trail for PCI DSS requirements 6.4.3 and 11.6.1 — with nothing to install
              on your site.
            </p>
          </Reveal>
          <Reveal delay={240}>
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
          </Reveal>
        </div>
      </section>

      {/* ── Five-step walkthrough ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="space-y-24 lg:space-y-28">
          {steps.map((step, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={step.number} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal className={flip ? 'lg:order-2' : undefined}>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold tracking-widest text-slate-400">
                      {step.number}
                    </span>
                    <span className="h-px w-10 bg-slate-300" aria-hidden />
                    <Kicker>{step.kicker}</Kicker>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                    {step.heading}
                  </h2>
                  <p className="mt-5 leading-7 text-slate-600">{step.paragraphs[0]}</p>
                  <p className="mt-4 leading-7 text-slate-600">{step.paragraphs[1]}</p>
                  <ul className="mt-6 space-y-3">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-slate-700">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"
                          aria-hidden
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal
                  delay={120}
                  className={
                    flip
                      ? 'justify-self-center lg:order-1 lg:justify-self-start'
                      : 'justify-self-center lg:justify-self-end'
                  }
                >
                  {step.visual}
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Under the hood ───────────────────────────────────────────── */}
      <section className="mt-24 border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Under the hood</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
                Built like security software, because it is
              </h2>
              <p className="mt-4 text-slate-600">
                The engineering decisions behind the scanner — the parts you would ask about in a
                vendor review.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hood.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <div className="card-lift h-full rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance mapping ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Requirement mapping</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
              What PCI DSS asks — and what you get
            </h2>
            <p className="mt-4 text-slate-600">
              A plain-English paraphrase of the v4.0.1 sub-requirements ScriptProof supports, mapped
              to the feature that answers each one.
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-10 overflow-x-auto rounded-[2px] border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 font-semibold text-navy-900">Requirement</th>
                  <th className="px-6 py-4 font-semibold text-navy-900">
                    What the requirement asks
                  </th>
                  <th className="px-6 py-4 font-semibold text-navy-900">
                    What ScriptProof gives you
                  </th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((row) => (
                  <tr
                    key={row.asks}
                    className="border-b border-slate-200 align-top transition-colors last:border-0 hover:bg-blue-50/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-[2px] bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {row.req}
                      </span>
                    </td>
                    <td className="px-6 py-4 leading-6 text-slate-600">{row.asks}</td>
                    <td className="px-6 py-4 leading-6 text-slate-700">{row.gives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <Kicker>FAQ</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
                Common questions about the process
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
        </div>
      </section>

      {/* ── CTA (dark contrast band) ─────────────────────────────────── */}
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
              See it work on your own checkout
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Run a free scan in seconds, or start a 14-day trial and have your baseline, authorized
              inventory, and first Evidence Pack within the month.
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
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-slate-500">
          {DISCLAIMER}
        </p>
      </section>
    </>
  );
}
