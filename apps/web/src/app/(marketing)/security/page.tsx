import type { Metadata } from 'next';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cookie,
  Database,
  FileWarning,
  Globe,
  KeyRound,
  Lock,
  MailCheck,
  Server,
  ShieldCheck,
  Timer,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TrustBar } from '@/components/graphics';
import { DISCLAIMER } from '@/lib/constants';
import { Aurora, GridGlow, Reveal } from '@/components/visual';

export const metadata: Metadata = { title: 'Security' };

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{children}</p>;
}

const weStore = [
  {
    title: 'Your account email',
    detail: 'Verified at signup before any account exists. Used for alerts and login only.',
  },
  {
    title: 'Site URLs you register',
    detail:
      'The payment-page addresses you explicitly ask us to monitor, after domain verification.',
  },
  {
    title: 'Script metadata & SHA-256 hashes',
    detail:
      'Script URLs, sizes and content fingerprints — never the pages your customers type into.',
  },
  {
    title: 'HTTP response headers',
    detail: 'The security headers your pages serve (CSP, HSTS, etc.), snapshotted per scan.',
  },
  {
    title: 'Alerts & evidence records',
    detail: 'Change events, before/after hashes, authorizations and the monthly Evidence Pack.',
  },
];

const weNeverTouch = [
  {
    title: 'Cardholder data',
    detail:
      'No PANs, no CVVs, no expiry dates. The crawler never submits forms or touches payment fields.',
  },
  {
    title: 'Your customers’ PII',
    detail: 'No names, addresses, or emails of your shoppers ever reach our systems.',
  },
  {
    title: 'Form input of any kind',
    detail:
      'ScriptProofBot only reads pages the way a browser loads them — it never types or clicks.',
  },
  {
    title: 'Cookies or sessions of your shoppers',
    detail: 'We monitor from the outside. Nothing runs inside your customers’ browsing sessions.',
  },
];

const appSecurity = [
  {
    icon: MailCheck,
    title: 'Verified-email-only accounts',
    body: 'Every signup email is vetted before an account row exists: disposable-domain blocklist, provider-typo detection, and a live DNS/MX check on company domains — then a verification link proves mailbox ownership.',
  },
  {
    icon: KeyRound,
    title: 'Strong password policy',
    body: 'Minimum 10 characters, and passwords that appear on common cracking wordlists are rejected outright at signup, before they are ever hashed.',
  },
  {
    icon: Timer,
    title: 'Database-backed rate limiting',
    body: 'Login, signup and password-reset endpoints have tight per-endpoint limits stored in the database — they survive restarts and are shared across instances.',
  },
  {
    icon: Cookie,
    title: 'Hardened session cookies',
    body: 'Sessions are managed by Better Auth with secure, server-issued cookies. No tokens in local storage, no roll-your-own session logic.',
  },
  {
    icon: ShieldCheck,
    title: 'Strict security headers',
    body: 'Every response ships HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, a strict Referrer-Policy and a locked-down Permissions-Policy.',
  },
  {
    icon: Globe,
    title: 'SSRF-guarded crawling',
    body: 'Every outbound fetch to a customer URL resolves DNS first and refuses private or internal IPs — and every redirect hop is re-validated before it is followed.',
  },
  {
    icon: CheckCircle2,
    title: 'Domain verification before monitoring',
    body: 'We never scan a site until you prove you control it with a DNS record or meta tag. Nobody can point ScriptProof at a domain they do not own.',
  },
  {
    icon: Lock,
    title: 'TLS for all traffic',
    body: 'All traffic to and from ScriptProof is encrypted in transit, and HSTS with a two-year max-age instructs browsers to never downgrade.',
  },
];

const infrastructure = [
  {
    icon: Server,
    title: 'Single-tenant VPS deployment',
    body: 'ScriptProof runs on dedicated single-tenant infrastructure — your monitoring data does not sit in a shared multi-tenant application pool.',
  },
  {
    icon: Database,
    title: 'PostgreSQL with role-based access',
    body: 'All data lives in PostgreSQL with role-based database access. Backups are taken at the database layer.',
  },
  {
    icon: KeyRound,
    title: 'Secrets outside the repository',
    body: 'Credentials and signing secrets are kept in environment files outside the codebase — never committed, never bundled into the client.',
  },
  {
    icon: FileWarning,
    title: 'SOC 2: on the roadmap, not claimed',
    body: 'We are not SOC 2 certified today and will not pretend otherwise. A formal audit is on our roadmap; until then, this page describes exactly what we do.',
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <Reveal>
              <Kicker>Trust &amp; security</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
                Security at ScriptProof
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                How we protect your data — and why we never touch your customers&rsquo;. A security
                product has to hold itself to the standard it monitors. This page describes, in
                plain terms, exactly what we store, how the platform is built, and where our limits
                are.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> No cardholder data, ever
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> No agent required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> Outside-in monitoring only
                </span>
              </p>
            </Reveal>
          </div>
          <Reveal delay={200} className="justify-self-center lg:justify-self-end">
            <div className="corner-frame overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
              <Image
                src="/images/security-lock.jpg"
                alt="Padlock resting on a laptop keyboard, representing encrypted, locked-down data"
                width={1600}
                height={1067}
                priority
                className="h-auto w-full max-w-lg object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Data we handle vs data we never touch ────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>The core promise</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Data we handle vs. data we never touch
              </h2>
              <p className="mt-4 text-slate-600">
                ScriptProof is deliberately designed so that the most sensitive data on your site —
                your customers&rsquo; — has no path into our systems.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="corner-frame h-full rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <Database className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                    What we store
                  </h3>
                </div>
                <ul className="mt-6 space-y-5">
                  {weStore.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="corner-frame corner-frame-dark h-full rounded-[2px] border border-navy-800 bg-navy-950 p-8 shadow-[0_30px_80px_-30px_rgba(11,37,69,0.6)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-400/30">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    What we never touch
                  </h3>
                </div>
                <ul className="mt-6 space-y-5">
                  {weNeverTouch.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Application security ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-24">
        <div aria-hidden className="sp-dots absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Application security</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Controls built into the product
              </h2>
              <p className="mt-4 text-slate-600">
                Every claim below describes a control that exists in our codebase today — not an
                aspiration.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {appSecurity.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
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

      {/* ── Infrastructure & operations ──────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Infrastructure &amp; operations</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Where your data lives
              </h2>
              <p className="mt-4 text-slate-600">
                We would rather tell you exactly how it works than hide behind a badge wall.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {infrastructure.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
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

      {/* ── Transparent crawling ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="corner-frame flex flex-col items-start gap-6 rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-navy-950">Transparent crawling</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Our crawler never hides. It identifies itself with the honest user agent{' '}
                <code className="rounded-[2px] border border-navy-800 bg-navy-950 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
                  ScriptProofBot/1.0
                </code>{' '}
                pointing back to a public page that documents exactly what it does, how often it
                fetches, and how to report unexpected traffic. It only visits domains whose
                ownership has been verified, never submits forms, and never interacts with payment
                fields.
              </p>
            </div>
            <Link
              href="/bot"
              className="inline-flex items-center gap-2 rounded-[2px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
            >
              About ScriptProofBot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Responsible disclosure ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="corner-frame corner-frame-dark relative isolate overflow-hidden rounded-[2px] border border-navy-800 bg-navy-950 p-8 shadow-[0_30px_80px_-30px_rgba(11,37,69,0.6)] sm:p-12">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(103,232,249,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(103,232,249,0.06) 1px, transparent 1px)',
                backgroundSize: '46px 46px',
              }}
            />
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Responsible disclosure
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
                Found a vulnerability? Tell us.
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                If you believe you have found a security issue in ScriptProof, email{' '}
                <code className="rounded-[2px] border border-navy-800 bg-navy-900 px-1.5 py-0.5 font-mono text-sm text-cyan-300">
                  security@
                </code>{' '}
                our domain with the details and steps to reproduce. We commit to acknowledging every
                good-faith report within 72 hours and to keeping you informed while we investigate
                and fix. We do not currently run a paid bug bounty program, and we ask that you do
                not access data that is not yours or degrade the service while testing.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Trust bar + disclaimer ───────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <Reveal>
            <TrustBar />
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-5 text-slate-500">
              {DISCLAIMER}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
