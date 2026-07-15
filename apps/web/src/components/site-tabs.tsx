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
    <nav className="flex flex-wrap gap-1 rounded-[2px] border border-slate-200 bg-white p-1 shadow-sm">
      {items.map((tab) => {
        const href = `${base}/${tab.slug}`;
        const active = pathname === href || (tab.slug === 'inventory' && pathname === base);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              'rounded-[2px] px-3.5 py-1.5 text-sm font-medium transition-all',
              active
                ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_6px_16px_-8px_rgba(37,99,235,0.7)]'
                : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
