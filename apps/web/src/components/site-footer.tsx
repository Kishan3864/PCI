import { Fingerprint, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { DISCLAIMER } from '@/lib/constants';

const groups = [
  {
    title: 'Product',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/free-scan', label: 'Free scan' },
      { href: '/signup', label: 'Start free trial' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/security', label: 'Security' },
      { href: '/bot', label: 'About our crawler' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal', label: 'Legal center' },
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/terms', label: 'Terms of service' },
      { href: '/legal/refund', label: 'Refund policy' },
    ],
  },
];

const marks = [
  { icon: ShieldCheck, label: 'PCI DSS 6.4.3 / 11.6.1 controls' },
  { icon: Fingerprint, label: 'SHA-256 script fingerprints' },
  { icon: Lock, label: 'Zero cardholder data stored' },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t border-slate-200 bg-slate-50/70">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-lg font-bold tracking-tight text-navy-900">
                ScriptProof
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Payment-page script monitoring &amp; PCI DSS evidence for merchants and the agencies
              that keep their checkouts safe.
            </p>
            <ul className="mt-5 space-y-2">
              {marks.map((m) => (
                <li key={m.label} className="flex items-center gap-2 text-xs text-slate-500">
                  <m.icon className="h-3.5 w-3.5 text-blue-600" />
                  {m.label}
                </li>
              ))}
            </ul>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-blue-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 max-w-3xl border-t border-slate-200 pt-6 text-xs leading-5 text-slate-400">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
