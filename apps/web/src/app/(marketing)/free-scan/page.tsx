import type { Metadata } from 'next';
import { FreeScanForm } from '@/components/free-scan-form';

export const metadata: Metadata = {
  title: 'Free payment-page script scan',
  description:
    'Scan any checkout page for free: see every script, external domain, SRI coverage and missing security headers. No account needed.',
};

export default function FreeScanPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-navy-900">Free payment-page scan</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Enter a checkout or payment page URL. We'll show you every script it loads, which external
          domains they come from, SRI coverage, and which security headers are missing — no account
          needed.
        </p>
      </div>
      <div className="mt-10">
        <FreeScanForm />
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">
        We only fetch the page you enter and store the report. We never collect card data. Limited
        to 3 scans per day.
      </p>
    </div>
  );
}
