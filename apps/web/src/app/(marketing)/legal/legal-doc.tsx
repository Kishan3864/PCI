import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Aurora, GradientText, GridGlow, Reveal } from '@/components/visual';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * Shared shell for the individual legal documents (privacy, terms, refund).
 * Renders the Sentinel Light hero, a table of contents with anchor links,
 * numbered sections inside a single white panel, and the template note.
 */
export function LegalDoc({
  icon: Icon,
  kicker,
  titleLead,
  titleAccent,
  intro,
  sections,
}: {
  icon: LucideIcon;
  kicker: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              <Icon className="h-3.5 w-3.5" />
              {kicker}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">
              {titleLead} <GradientText animated>{titleAccent}</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-sm font-medium text-slate-500">Last updated: 15 July 2026</p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">{intro}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Document panel ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Reveal delay={80}>
          <div className="corner-frame rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            {/* Table of contents */}
            <nav aria-label="Table of contents" className="border-b border-slate-200 pb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                On this page
              </p>
              <ol className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                {sections.map((section, i) => (
                  <li key={section.id} className="flex gap-2 text-sm leading-6">
                    <span className="w-5 shrink-0 font-semibold tabular-nums text-slate-400">
                      {i + 1}.
                    </span>
                    <a
                      href={`#${section.id}`}
                      className="font-medium text-slate-600 transition-colors hover:text-blue-700 hover:underline"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Numbered sections */}
            <div className="mt-10 space-y-12">
              {sections.map((section, i) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    <span className="mr-2 text-blue-600">{i + 1}.</span>
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 leading-7 text-slate-600 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-navy-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-blue-600">
                    {section.body}
                  </div>
                </section>
              ))}
            </div>

            {/* Template note */}
            <p className="mt-12 border-t border-slate-200 pt-8 text-sm italic leading-6 text-slate-500">
              This document is provided as a general template for this service and is not legal
              advice; consult a qualified lawyer for your jurisdiction.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
