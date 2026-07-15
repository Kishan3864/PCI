import { ArrowRight, CheckCircle2, Lock, ReceiptText, ScrollText, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DISCLAIMER } from '@/lib/constants';
import { Aurora, GradientText, GridGlow, Reveal } from '@/components/visual';

export const metadata: Metadata = {
  title: 'Legal center',
  description:
    'ScriptProof legal documents: privacy policy, terms of service, and refund & cancellation policy.',
};

const documents = [
  {
    href: '/legal/privacy',
    icon: Lock,
    title: 'Privacy policy',
    summary:
      'What data we collect (account details, site URLs, script hashes, headers), why we collect it, who we share it with, and the rights you have over it.',
  },
  {
    href: '/legal/terms',
    icon: ScrollText,
    title: 'Terms of service',
    summary:
      'The rules of using ScriptProof: your account obligations, acceptable use of the crawler, billing via Dodo Payments, and the limits of our liability.',
  },
  {
    href: '/legal/refund',
    icon: ReceiptText,
    title: 'Refund & cancellation',
    summary:
      'How the 14-day free trial works, how to cancel anytime, and the 14-day money-back guarantee on your first paid invoice.',
  },
] as const;

const essentials = [
  'We only monitor domains you have verified you own — and we never request, process, or store cardholder data.',
  'Payments are handled by Dodo Payments as merchant of record; your card number never touches our servers.',
  'The 14-day free trial needs no card, you can cancel anytime, and your first paid invoice carries a 14-day money-back guarantee.',
  'We use session cookies only — no advertising trackers — and we never sell your data.',
  'You can access, export, correct, or delete your data at any time; deleting your account removes your organization and everything in it.',
] as const;

export default function LegalPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              <Scale className="h-3.5 w-3.5" />
              Legal center
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">
              The paperwork, in <GradientText animated>plain English</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Everything that governs your use of ScriptProof — written to be read, not skimmed
              past.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Document cards ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {documents.map((doc, i) => (
            <Reveal key={doc.href} delay={i * 90}>
              <Link
                href={doc.href}
                className="card-lift corner-frame group flex h-full flex-col rounded-[2px] border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                  <doc.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-lg font-semibold text-navy-900">
                  {doc.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{doc.summary}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">Last updated: 15 July 2026</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                    Read
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Plain-language essentials ────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <Reveal>
          <div className="corner-frame rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              The essentials in plain language
            </p>
            <ul className="mt-6 space-y-4">
              {essentials.map((point) => (
                <li key={point} className="flex items-start gap-3 leading-7 text-slate-600">
                  <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-blue-600" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ── QSA disclaimer ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Reveal>
          <div className="rounded-[2px] border border-slate-200 bg-slate-50/70 p-6">
            <p className="text-sm leading-6 text-slate-600">{DISCLAIMER}</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
