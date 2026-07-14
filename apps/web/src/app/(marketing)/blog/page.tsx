import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, formatPostDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Plain-English guides to PCI DSS 6.4.3 and 11.6.1 for small merchants and the agencies that support them.',
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-navy-900">Blog</h1>
      <p className="mt-4 text-lg text-slate-600">
        Practical, no-fluff guides to the PCI DSS script requirements — written for store owners,
        not auditors.
      </p>

      <div className="mt-10 space-y-8">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="border-b border-slate-100 pb-8 last:border-0">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {formatPostDate(post.date)} · {post.readingMinutes} min read
            </p>
            <h2 className="mt-2 text-xl font-semibold text-navy-900">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 leading-7 text-slate-600">{post.description}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 inline-block text-sm font-medium text-navy-700 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
