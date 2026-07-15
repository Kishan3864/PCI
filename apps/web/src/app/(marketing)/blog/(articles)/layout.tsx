import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Aurora, Reveal } from '@/components/visual';

// Wraps every blog article (blog/<slug>/page.mdx) in a readable prose column.
export default function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Soft aurora wash behind the reading column. */}
      <div className="relative isolate overflow-hidden">
        <Aurora muted />
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-all hover:gap-2.5 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              All articles
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <article className="prose prose-slate mt-8 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-900 prose-h1:text-4xl prose-h1:leading-tight prose-lead:text-slate-600 prose-p:text-slate-600 prose-p:leading-7 prose-a:font-medium prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-navy-900 prose-code:rounded-[2px] prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-blue-700 prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-blue-200 prose-blockquote:text-slate-600 prose-li:text-slate-600 prose-li:marker:text-blue-600">
              {children}
            </article>
          </Reveal>

          <Reveal delay={160}>
            <div className="corner-frame relative mt-14 overflow-hidden rounded-[2px] border border-slate-200 bg-white p-8 shadow-sm">
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl"
              />
              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-navy-950">
                    Want this handled automatically?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    ScriptProof builds and monitors your payment-page script inventory and generates
                    the supporting evidence for you.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] transition hover:brightness-110"
                  >
                    Start a free trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
