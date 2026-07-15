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
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-all hover:gap-2.5 hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4" />
              All articles
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <article className="prose prose-invert prose-slate mt-8 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-white prose-h1:text-4xl prose-h1:leading-tight prose-lead:text-slate-400 prose-p:text-slate-400 prose-p:leading-7 prose-a:font-medium prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:rounded-[2px] prose-code:bg-cyan-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-cyan-300 prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-cyan-400/40 prose-blockquote:text-slate-400 prose-li:text-slate-400 prose-li:marker:text-cyan-400">
              {children}
            </article>
          </Reveal>

          <Reveal delay={160}>
            <div className="corner-frame relative mt-14 overflow-hidden rounded-[2px] border border-slate-400/15 bg-surface-800/80 p-8">
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl"
              />
              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 text-surface-900 shadow-[0_8px_20px_-8px_rgba(34,211,238,0.7)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-white">
                    Want this handled automatically?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    ScriptProof builds and monitors your payment-page script inventory and generates
                    the supporting evidence for you.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 px-4 py-2 text-sm font-semibold text-surface-900 shadow-[0_8px_20px_-8px_rgba(34,211,238,0.7)] transition hover:brightness-110"
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
