import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { Aurora, GridGlow } from '@/components/visual';
import { DISCLAIMER } from '@/lib/constants';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <Aurora />
      <GridGlow />
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <BrandMark />
        <span className="font-display text-xl font-bold tracking-tight text-navy-900">
          ScriptProof
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-10 max-w-md text-center text-xs leading-5 text-slate-400">{DISCLAIMER}</p>
    </div>
  );
}
