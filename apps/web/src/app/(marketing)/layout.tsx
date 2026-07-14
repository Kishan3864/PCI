import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-navy-900">
            ScriptProof
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start free trial</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
