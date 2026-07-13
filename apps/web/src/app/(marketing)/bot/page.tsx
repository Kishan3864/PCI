import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About ScriptProofBot' };

export default function BotPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-navy-900">ScriptProofBot</h1>
      <p className="mt-6 leading-7 text-slate-600">
        ScriptProofBot is the crawler behind ScriptProof, a monitoring service that helps merchants
        watch their own payment pages for unauthorized script and header changes (PCI DSS 6.4.3 and
        11.6.1 support).
      </p>
      <h2 className="mt-10 text-xl font-semibold text-navy-900">What it does</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-600">
        <li>
          Identifies itself with the user agent{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            ScriptProofBot/1.0 (+this page)
          </code>
        </li>
        <li>Only visits pages whose owners verified domain control via DNS or a meta tag</li>
        <li>Fetches at most one page every 2 seconds per site, with a 30-second timeout</li>
        <li>Never submits forms, never interacts with payment fields or iframes</li>
        <li>Never collects or stores cardholder data — only script metadata, hashes and headers</li>
      </ul>
      <h2 className="mt-10 text-xl font-semibold text-navy-900">Seeing unexpected traffic?</h2>
      <p className="mt-4 leading-7 text-slate-600">
        If you see ScriptProofBot on a site you own and did not sign up, someone may have verified a
        domain they should not have. Contact us and we will investigate and block the site.
      </p>
    </div>
  );
}
