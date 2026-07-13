import Link from 'next/link';
import type { ReactNode } from 'react';
import { DISCLAIMER } from '@/lib/constants';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-bold text-navy-900">
        ScriptProof
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-10 max-w-md text-center text-xs leading-5 text-slate-400">{DISCLAIMER}</p>
    </div>
  );
}
