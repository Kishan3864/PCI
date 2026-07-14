import Link from 'next/link';
import type { ReactNode } from 'react';
import { SignOutButton } from '@/components/sign-out-button';
import { DISCLAIMER } from '@/lib/constants';
import { requireOrg } from '@/lib/org';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { org, session } = await requireOrg();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/app" className="font-bold text-navy-900">
              ScriptProof
            </Link>
            <span className="text-sm text-slate-500">{org.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/app/settings/billing"
              className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium capitalize text-navy-700 hover:bg-navy-100"
            >
              {org.plan} plan
            </Link>
            <span className="hidden text-slate-500 sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs leading-5 text-slate-400">{DISCLAIMER}</p>
      </footer>
    </div>
  );
}
