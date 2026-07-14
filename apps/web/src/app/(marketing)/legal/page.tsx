import type { Metadata } from 'next';
import { Database, FileText, ScrollText, Trash2, UserCheck } from 'lucide-react';
import { DISCLAIMER } from '@/lib/constants';
import { Aurora, GradientText, GridGlow, Reveal } from '@/components/visual';

export const metadata: Metadata = { title: 'Terms & privacy' };

export default function LegalPage() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
              <ScrollText className="h-3.5 w-3.5" />
              Plain-English, no fine print
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
              Terms &amp; <GradientText animated>privacy</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Plain-English summary. The full terms will be published before general availability.
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
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    What ScriptProof is
                  </h2>
                </div>
                <p className="mt-4 leading-7 text-slate-600">{DISCLAIMER}</p>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                    <Database className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    What we store
                  </h2>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-600 marker:text-emerald-500">
                  <li>Your account details: name, email, password hash.</li>
                  <li>
                    Monitoring data for sites you verify: page URLs, script URLs and content hashes,
                    HTTP response headers, and change history.
                  </li>
                  <li>We never request, process, or store cardholder data. Ever.</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    Your responsibilities
                  </h2>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-600 marker:text-emerald-500">
                  <li>Only add domains you own or are authorized to monitor.</li>
                  <li>
                    Review and act on alerts; ScriptProof detects changes, it does not remediate
                    them.
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    Data deletion
                  </h2>
                </div>
                <p className="mt-4 leading-7 text-slate-600">
                  Deleting a site removes its scans, inventory, and change history. Deleting your
                  account removes your organization and all associated data.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
