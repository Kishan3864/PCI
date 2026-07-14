import Link from 'next/link';
import type { ReactNode } from 'react';

// Wraps every blog article (blog/<slug>/page.mdx) in a readable prose column.
export default function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/blog" className="text-sm font-medium text-navy-700 hover:underline">
        ← All articles
      </Link>
      <article className="prose prose-slate mt-6 max-w-none">{children}</article>
      <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <p className="font-semibold text-navy-900">Want this handled automatically?</p>
        <p className="mt-1 text-sm text-slate-600">
          ScriptProof builds and monitors your payment-page script inventory and generates the
          supporting evidence for you.
        </p>
        <Link
          href="/signup"
          className="mt-3 inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
        >
          Start a free trial
        </Link>
      </div>
    </div>
  );
}
