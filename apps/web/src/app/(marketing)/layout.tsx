import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';

const menus = [
  {
    label: 'Product',
    items: [
      { href: '/how-it-works', label: 'How it works', desc: 'From verification to evidence' },
      { href: '/free-scan', label: 'Free scan', desc: 'Check any checkout in seconds' },
      { href: '/pricing', label: 'Pricing', desc: 'Starter, Pro & Agency plans' },
      { href: '/security', label: 'Security', desc: 'How we protect your data' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/blog', label: 'Blog', desc: 'PCI DSS guides for merchants' },
      { href: '/bot', label: 'About our crawler', desc: 'What ScriptProofBot does' },
      { href: '/legal', label: 'Legal center', desc: 'Terms, privacy & policies' },
    ],
  },
] as const;

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-lg font-bold tracking-tight text-navy-900">
              ScriptProof
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            {menus.map((menu) => (
              <div key={menu.label} className="group relative hidden md:block">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-[2px] px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                >
                  {menu.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-72 rounded-[2px] border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(11,37,69,0.3)]">
                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-[2px] px-3 py-2.5 transition-colors hover:bg-blue-50"
                      >
                        <span className="block text-sm font-semibold text-navy-900">
                          {item.label}
                        </span>
                        <span className="block text-xs text-slate-500">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" asChild className="md:hidden">
              <Link href="/pricing">Pricing</Link>
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
