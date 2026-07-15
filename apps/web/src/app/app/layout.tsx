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
      <header className="sticky top-0 z-50 border-b border-cyan-400/10 bg-surface-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display font-bold tracking-tight text-white">ScriptProof</span>
            </Link>
            <span className="hidden text-sm text-slate-600 sm:inline">/</span>
            <span className="hidden text-sm font-medium text-slate-300 sm:inline">{org.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/app/settings/billing"
              className="rounded-[2px] bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300 ring-1 ring-inset ring-cyan-400/30 transition-colors hover:bg-cyan-400/20"
            >
              {org.plan} plan
            </Link>
            <span className="hidden text-slate-400 sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-slate-400/10 bg-surface-950/60">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs leading-5 text-slate-500">{DISCLAIMER}</p>
      </footer>
    </div>
  );
}
