import type { Metadata } from 'next';
import { DISCLAIMER } from '@/lib/constants';

export const metadata: Metadata = { title: 'Terms & privacy' };

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-navy-900">Terms &amp; privacy</h1>
      <p className="mt-4 text-sm text-slate-500">
        Plain-English summary. The full terms will be published before general availability.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-navy-900">What ScriptProof is</h2>
      <p className="mt-3 leading-7 text-slate-600">{DISCLAIMER}</p>

      <h2 className="mt-8 text-xl font-semibold text-navy-900">What we store</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-slate-600">
        <li>Your account details: name, email, password hash.</li>
        <li>
          Monitoring data for sites you verify: page URLs, script URLs and content hashes, HTTP
          response headers, and change history.
        </li>
        <li>We never request, process, or store cardholder data. Ever.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-navy-900">Your responsibilities</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-slate-600">
        <li>Only add domains you own or are authorized to monitor.</li>
        <li>Review and act on alerts; ScriptProof detects changes, it does not remediate them.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-navy-900">Data deletion</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Deleting a site removes its scans, inventory, and change history. Deleting your account
        removes your organization and all associated data.
      </p>
    </div>
  );
}
