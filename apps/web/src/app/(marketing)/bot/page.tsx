import type { Metadata } from 'next';
import { Bot, ListChecks, ShieldQuestion } from 'lucide-react';
import { Aurora, GradientText, GridGlow, Reveal } from '@/components/visual';

export const metadata: Metadata = { title: 'About ScriptProofBot' };

export default function BotPage() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
              <Bot className="h-3.5 w-3.5" />
              The crawler behind ScriptProof
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
              <GradientText animated>ScriptProofBot</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
              ScriptProofBot is the crawler behind ScriptProof, a monitoring service that helps
              merchants watch their own payment pages for unauthorized script and header changes
              (PCI DSS 6.4.3 and 11.6.1 support).
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Prose panel ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Reveal delay={80}>
          <div className="glass rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-sm sm:p-12">
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">What it does</h2>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-600 marker:text-emerald-500">
                  <li>
                    Identifies itself with the user agent{' '}
                    <code className="rounded bg-emerald-50 px-1.5 py-0.5 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                      ScriptProofBot/1.0 (+this page)
                    </code>
                  </li>
                  <li>
                    Only visits pages whose owners verified domain control via DNS or a meta tag
                  </li>
                  <li>
                    Fetches at most one page every 2 seconds per site, with a 30-second timeout
                  </li>
                  <li>Never submits forms, never interacts with payment fields or iframes</li>
                  <li>
                    Never collects or stores cardholder data — only script metadata, hashes and
                    headers
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                    <ShieldQuestion className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    Seeing unexpected traffic?
                  </h2>
                </div>
                <p className="mt-4 leading-7 text-slate-600">
                  If you see ScriptProofBot on a site you own and did not sign up, someone may have
                  verified a domain they should not have. Contact us and we will investigate and
                  block the site.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
