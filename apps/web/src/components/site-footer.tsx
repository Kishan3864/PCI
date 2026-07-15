import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { DISCLAIMER } from '@/lib/constants';

const groups = [
  {
    title: 'Product',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/free-scan', label: 'Free scan' },
      { href: '/signup', label: 'Start free trial' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/bot', label: 'About our crawler' },
      { href: '/legal', label: 'Terms & privacy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t border-cyan-400/10 bg-surface-950/80">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                ScriptProof
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Payment-page script monitoring &amp; PCI DSS evidence for merchants and the agencies
              that keep their checkouts safe.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-cyan-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 max-w-3xl border-t border-slate-400/10 pt-6 text-xs leading-5 text-slate-500">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
