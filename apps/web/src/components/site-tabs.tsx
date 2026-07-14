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
    <nav className="flex flex-wrap gap-1 border-b border-slate-200">
      {items.map((tab) => {
        const href = `${base}/${tab.slug}`;
        const active = pathname === href || (tab.slug === 'inventory' && pathname === base);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-navy-700 text-navy-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
