import type { Metadata } from 'next';
import { ArrowUpRight, Clock, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Aurora, GradientText, GridGlow, Reveal, SpotlightCard } from '@/components/visual';
import { BLOG_POSTS, formatPostDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Plain-English guides to PCI DSS 6.4.3 and 11.6.1 for small merchants and the agencies that support them.',
};

export default function BlogIndexPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Newspaper className="h-3.5 w-3.5" />
              The ScriptProof blog
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-navy-950 sm:text-5xl">
              Plain-English <GradientText animated>PCI DSS</GradientText> guides
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Practical, no-fluff guides to the PCI DSS script requirements — written for store
              owners, not auditors.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Article list ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="space-y-6">
          {BLOG_POSTS.map((post, i) => (
            <Reveal key={post.slug} delay={i * 80}>
              <SpotlightCard className="card-lift corner-frame rounded-[2px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{formatPostDate(post.date)}</Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingMinutes} min read
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-navy-900">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:text-blue-700"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 leading-7 text-slate-600">{post.description}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-all hover:gap-2.5 hover:text-blue-700"
                >
                  Read more
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
