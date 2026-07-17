'use client';

import { Building2, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/app/settings/organization', label: 'Organization', icon: Building2 },
  { href: '/app/settings/account', label: 'Account & security', icon: ShieldCheck },
  { href: '/app/settings/billing', label: 'Billing & plan', icon: CreditCard },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-slate-200 pb-px">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 rounded-t-[2px] border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'border-blue-600 bg-blue-50/60 text-blue-700'
                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-navy-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
