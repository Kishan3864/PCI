import { Settings } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { SignOutButton } from '@/components/sign-out-button';
import { Aurora } from '@/components/visual';
import { DISCLAIMER } from '@/lib/constants';
import { requireOrg } from '@/lib/org';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { org, session } = await requireOrg();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Aurora muted className="fixed" />
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display font-bold tracking-tight text-navy-900">
                ScriptProof
              </span>
            </Link>
            <span className="hidden text-sm text-slate-300 sm:inline">/</span>
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">{org.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/app/settings/billing"
              className="rounded-[2px] bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-600/20 transition-colors hover:bg-blue-100"
            >
              {org.plan} plan
            </Link>
            <Link
              href="/app/settings/organization"
              className="flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
            <span className="hidden text-slate-500 sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50/70">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs leading-5 text-slate-400">{DISCLAIMER}</p>
      </footer>
    </div>
  );
}
