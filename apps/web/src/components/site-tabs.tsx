'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { slug: 'inventory', label: 'Inventory' },
  { slug: 'changes', label: 'Changes' },
  { slug: 'headers', label: 'Headers' },
  { slug: 'csp', label: 'CSP Insights' },
  { slug: 'evidence', label: 'Evidence Packs' },
  { slug: 'settings', label: 'Settings' },
] as const;

export function SiteTabs({ siteId, verified }: { siteId: string; verified: boolean }) {
  const pathname = usePathname();
  const base = `/app/sites/${siteId}`;

  const items = verified ? tabs : ([{ slug: 'verify', label: 'Verification' }, ...tabs] as const);

  return (
    <nav className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 shadow-sm backdrop-blur-sm">
      {items.map((tab) => {
        const href = `${base}/${tab.slug}`;
        const active = pathname === href || (tab.slug === 'inventory' && pathname === base);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all',
              active
                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_6px_16px_-8px_rgba(16,185,129,0.8)]'
                : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
