import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Free scan' };

// Placeholder: the full one-off scanner ships in Phase 2 (see PLAN.md §2.4).
export default function FreeScanPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-navy-900">Free payment page scan</h1>
      <p className="mt-4 leading-7 text-slate-600">
        The free one-off scanner is almost ready. It will show you every script on your checkout
        page, which external domains they load from, and which security headers you are missing —
        no account needed.
      </p>
      <p className="mt-2 leading-7 text-slate-600">
        Until then, the full monitoring product is available on a 14-day free trial.
      </p>
      <Button size="lg" className="mt-8" asChild>
        <Link href="/signup">Start free trial</Link>
      </Button>
    </div>
  );
}
