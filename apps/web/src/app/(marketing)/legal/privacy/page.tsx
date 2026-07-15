import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { LegalDoc, type LegalSection } from '../legal-doc';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How ScriptProof collects, uses, shares, and protects your data — and the rights you have over it.',
};

const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          ScriptProof is a software-as-a-service monitoring tool that keeps an inventory of the
          scripts on your payment pages, detects changes to page content and HTTP headers, and
          produces evidence reports in support of PCI DSS requirements 6.4.3 and 11.6.1. The service
          is operated by the ScriptProof operator (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;), which acts as the data controller for the personal data described in
          this policy.
        </p>
        <p>
          This policy explains what data we collect, why we collect it, who we share it with, how
          long we keep it, and the rights you have over it. If anything is unclear, contact us at{' '}
          <strong>support@scriptproof.com</strong>.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Data we collect',
    body: (
      <>
        <p>We collect four categories of data:</p>
        <ul>
          <li>
            <strong>Account data.</strong> Your name, email address, and a salted hash of your
            password (we never store your password in plain text), plus your organization name and
            plan.
          </li>
          <li>
            <strong>Site and scan data.</strong> The site URLs you register, page URLs we crawl,
            script URLs and metadata, SHA-256 content hashes, HTTP response headers, change history,
            and the PDF Evidence Packs we generate for you.
          </li>
          <li>
            <strong>Billing data.</strong> Payments are processed by Dodo Payments as merchant of
            record. We receive and store your subscription status, plan, and invoice references —{' '}
            <strong>
              we never receive, process, or store card numbers or other cardholder data
            </strong>
            .
          </li>
          <li>
            <strong>Logs and usage data.</strong> IP addresses, browser user agent, timestamps, and
            request logs generated when you use the application, kept for security and debugging.
          </li>
        </ul>
        <p>
          Our crawler, ScriptProofBot, only scans domains a customer has verified they own or
          control, plus individual URLs submitted to the public one-off free scanner. It reads
          publicly served page content; it does not log into sites or submit forms.
        </p>
      </>
    ),
  },
  {
    id: 'purposes',
    title: 'Purposes and legal bases',
    body: (
      <>
        <p>We process your data for the following purposes, on the following legal bases:</p>
        <ul>
          <li>
            <strong>Providing the service</strong> — running scans, maintaining your script
            inventory, generating alerts and Evidence Packs (performance of our contract with you).
          </li>
          <li>
            <strong>Communicating with you</strong> — email verification, change alerts, and digest
            emails you have configured (performance of contract).
          </li>
          <li>
            <strong>Billing and account management</strong> — managing subscriptions through Dodo
            Payments (performance of contract and compliance with legal obligations).
          </li>
          <li>
            <strong>Security and anti-abuse</strong> — protecting the service and our crawler from
            misuse, as described in section 4 (our legitimate interest in running a safe service).
          </li>
          <li>
            <strong>Improving the service</strong> — analyzing aggregate, non-identifying usage
            patterns (legitimate interest).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'anti-abuse',
    title: 'Anti-abuse processing',
    body: (
      <>
        <p>
          To keep the service safe and to prevent our crawler from being pointed at sites the
          requester does not control, we apply automated anti-abuse measures:
        </p>
        <ul>
          <li>
            <strong>Signup email vetting.</strong> When you sign up, we check that your email domain
            has valid mail (MX) records and screen it against lists of disposable email providers.
            Addresses that fail these checks may be rejected.
          </li>
          <li>
            <strong>Rate limiting.</strong> We limit the frequency of requests per IP address and
            per account — including free-scan submissions — to prevent abuse of the service.
          </li>
        </ul>
        <p>
          These measures process your email address and IP address and are based on our legitimate
          interest in preventing fraud and abuse. They do not involve profiling that produces legal
          effects for you.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <>
        <p>
          We use <strong>session cookies only</strong>, set by our authentication system (Better
          Auth) to keep you signed in. These are strictly necessary for the service to work.
        </p>
        <p>
          We do not use advertising cookies, third-party tracking pixels, or cross-site analytics
          trackers anywhere on the site or in the application.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share data with',
    body: (
      <>
        <p>
          We never sell your personal data and we never share it for advertising. We share data only
          with the service providers we need to operate ScriptProof:
        </p>
        <ul>
          <li>
            <strong>Dodo Payments</strong> — our merchant of record, which processes payments and
            handles cardholder data on its own systems.
          </li>
          <li>
            <strong>Our transactional email provider</strong> — to deliver verification emails,
            alerts, and digests to the address on your account.
          </li>
          <li>
            <strong>Our hosting and infrastructure providers</strong> — which store the databases
            and files that make up the service.
          </li>
        </ul>
        <p>
          Each provider processes data only on our instructions and under contractual
          confidentiality and data-protection commitments. We may also disclose data where required
          by law or to protect our legal rights.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Data retention',
    body: (
      <>
        <ul>
          <li>
            <strong>Account data</strong> is kept for as long as your account is active.
          </li>
          <li>
            <strong>Scan history, script inventory, and Evidence Packs</strong> are kept while the
            related site remains configured. Deleting a site removes its scans, inventory, and
            change history.
          </li>
          <li>
            <strong>Deleting your account</strong> removes your organization and all associated data
            from our production systems; residual copies in encrypted backups expire on a rolling
            schedule shortly afterwards.
          </li>
          <li>
            <strong>Logs</strong> are retained for a limited period for security and debugging, then
            deleted or anonymized.
          </li>
          <li>
            <strong>Invoicing records</strong> are retained by Dodo Payments as merchant of record
            for as long as tax and accounting laws require.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect your data',
    body: (
      <>
        <ul>
          <li>All traffic to and from the service is encrypted in transit with TLS.</li>
          <li>Data is encrypted at rest on our infrastructure providers&rsquo; systems.</li>
          <li>Passwords are stored only as salted hashes.</li>
          <li>
            Access to production systems is limited to the people who need it to operate the
            service.
          </li>
          <li>
            By design, the service never requests, processes, or stores cardholder data, which keeps
            the most sensitive category of payment information entirely off our systems.
          </li>
        </ul>
        <p>
          No system is perfectly secure, but if we become aware of a breach affecting your personal
          data we will notify you and the relevant authorities as required by law.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          You can exercise the following rights over your personal data at any time by emailing{' '}
          <strong>support@scriptproof.com</strong>:
        </p>
        <ul>
          <li>
            <strong>Access</strong> — ask for a copy of the personal data we hold about you.
          </li>
          <li>
            <strong>Rectification</strong> — correct inaccurate data (most account details can be
            edited directly in the app).
          </li>
          <li>
            <strong>Deletion</strong> — delete individual sites or your entire account, in the app
            or by request.
          </li>
          <li>
            <strong>Export / portability</strong> — receive your data in a structured,
            machine-readable format.
          </li>
          <li>
            <strong>Objection and restriction</strong> — object to or ask us to restrict processing
            based on legitimate interests.
          </li>
        </ul>
        <p>
          We respond to verified requests within 30 days. If you are in a jurisdiction with a data
          protection authority, you also have the right to lodge a complaint with that authority.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'International transfers',
    body: (
      <p>
        Our infrastructure and service providers may store or process data in countries other than
        your own. Where data protection law requires it, we rely on appropriate safeguards for such
        transfers — such as standard contractual clauses or equivalent commitments from our
        providers — so that your data receives a consistent level of protection wherever it is
        processed.
      </p>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        ScriptProof is a business tool and is not directed at children. You must be at least 16
        years old to create an account. We do not knowingly collect personal data from anyone under
        16; if you believe a child has provided us with personal data, contact us and we will delete
        it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We may update this policy as the service evolves. We will post the updated version on this
        page with a new &ldquo;last updated&rdquo; date, and if a change materially affects how we
        handle your personal data we will notify you by email before it takes effect. Continued use
        of the service after a change takes effect means you accept the updated policy.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions, requests, or concerns about this policy or your data:{' '}
        <strong>support@scriptproof.com</strong>. We aim to reply within two business days.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDoc
      icon={Lock}
      kicker="Legal center"
      titleLead="Privacy"
      titleAccent="policy"
      intro="What we collect, why we collect it, who we share it with, and the rights you have over it — without the fine print runaround."
      sections={sections}
    />
  );
}
