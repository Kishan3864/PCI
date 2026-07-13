import Link from 'next/link';
import { DISCLAIMER } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <span className="font-semibold text-navy-900">ScriptProof</span>
          <Link href="/bot" className="hover:text-navy-700">
            About our crawler
          </Link>
          <Link href="/legal" className="hover:text-navy-700">
            Terms &amp; privacy
          </Link>
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-5 text-slate-500">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
