import { ScrollText } from 'lucide-react';
import type { Metadata } from 'next';
import { DISCLAIMER } from '@/lib/constants';
import { LegalDoc, type LegalSection } from '../legal-doc';

export const metadata: Metadata = {
  title: 'Terms of service',
  description:
    'The terms that govern your use of ScriptProof: accounts, acceptable use, billing, and liability.',
};

const sections: LegalSection[] = [
  {
    id: 'service',
    title: 'The service',
    body: (
      <p>
        ScriptProof (&ldquo;the service&rdquo;) is a software-as-a-service monitoring tool operated
        by the ScriptProof operator (&ldquo;we&rdquo;, &ldquo;us&rdquo;). It maintains an inventory
        of the scripts on your payment pages, records why each script is authorized, detects changes
        to page content and HTTP response headers, sends alerts and digests, and generates PDF
        Evidence Packs in support of PCI DSS requirements 6.4.3 and 11.6.1. By creating an account
        or using the service, you agree to these terms.
      </p>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    body: (
      <p>
        The service is offered to businesses and professionals. You must be at least 16 years old
        and legally capable of entering into a binding contract to use it. If you use the service on
        behalf of a company or a client, you confirm that you are authorized to bind that
        organization to these terms, and &ldquo;you&rdquo; refers to that organization.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and accurate information',
    body: (
      <>
        <ul>
          <li>
            You must provide a <strong>real, working email address</strong> that you control. We
            verify email deliverability at signup and reject disposable addresses; alerts and
            security notices go to this address, so keeping it accurate is your responsibility.
          </li>
          <li>You are responsible for safeguarding your password and account credentials.</li>
          <li>
            Everything done through your account is treated as done by you; tell us immediately at
            support@scriptproof.com if you suspect unauthorized access.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>
          <strong>
            You may only monitor domains that you own or control, and that you have verified through
            the service&rsquo;s domain-verification process.
          </strong>{' '}
          Pointing the service, or the public free scanner, at systems you are not authorized to
          scan is prohibited and may be unlawful in your jurisdiction. You are solely responsible
          for having the authority to scan every URL you submit.
        </p>
        <p>In addition, you must not:</p>
        <ul>
          <li>use the service to break the law or infringe anyone&rsquo;s rights;</li>
          <li>
            attempt to probe, overload, or interfere with the service, or circumvent rate limits,
            plan limits, or the domain-verification process;
          </li>
          <li>
            resell, sublicense, or provide the service to third parties except as expressly
            permitted by your plan (for example, agency use on client sites you are authorized to
            monitor);
          </li>
          <li>reverse engineer the service except where the law grants you that right; or</li>
          <li>use the service to build a directly competing product.</li>
        </ul>
        <p>We may suspend or terminate accounts that violate this section (see section 13).</p>
      </>
    ),
  },
  {
    id: 'billing',
    title: 'Subscriptions and billing',
    body: (
      <>
        <p>
          Paid subscriptions are offered on <strong>Starter, Pro, and Agency</strong> plans, billed
          in advance on a recurring basis. Payments are processed by{' '}
          <strong>Dodo Payments, acting as merchant of record</strong> — your payment relationship
          for the transaction is with Dodo Payments, and card details are handled entirely on its
          systems. We never receive or store card numbers.
        </p>
        <ul>
          <li>
            Subscriptions renew automatically at the end of each billing period until cancelled.
          </li>
          <li>
            You can cancel at any time; cancellation takes effect at the end of the current billing
            period (see our Refund &amp; cancellation policy).
          </li>
          <li>
            Prices may change; we will give you advance notice by email, and changes apply from your
            next billing period.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'trial',
    title: 'Free trial',
    body: (
      <p>
        New accounts receive a <strong>14-day free trial</strong>. No payment card is required to
        start the trial, and nothing is charged unless you choose a paid plan. When the trial ends
        without an upgrade, monitoring stops but your account and configuration are retained so you
        can pick up where you left off. We may modify or withdraw the trial offer for future signups
        at any time.
      </p>
    ),
  },
  {
    id: 'plan-limits',
    title: 'Plan limits and fair use',
    body: (
      <p>
        Each plan includes defined limits — such as the number of monitored sites, pages, and scan
        frequency — described on the pricing page. We may enforce these limits technically,
        including through rate limiting. If your usage substantially exceeds what is reasonable for
        your plan, we will contact you about upgrading before taking any restrictive action, except
        where immediate action is needed to protect the service.
      </p>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    body: (
      <p>
        We own the service, including its software, design, documentation, and branding. These terms
        give you a limited, non-exclusive, non-transferable right to use the service for your
        internal business purposes during your subscription — they do not transfer any ownership to
        you. If you send us feedback or suggestions, we may use them without obligation to you.
      </p>
    ),
  },
  {
    id: 'customer-data',
    title: 'Your data',
    body: (
      <p>
        You retain all rights in the data you submit to the service and in the data we collect from
        your verified sites on your behalf (site URLs, script inventory, scan results, Evidence
        Packs). You grant us a license to host, process, and display that data{' '}
        <strong>only as needed to operate, secure, and improve the service</strong> — not to sell it
        or use it for advertising. Our handling of personal data is described in the Privacy policy.
      </p>
    ),
  },
  {
    id: 'no-compliance-guarantee',
    title: 'No compliance guarantee',
    body: (
      <>
        <p>{DISCLAIMER}</p>
        <p>
          In plain terms: the service supports your PCI DSS 6.4.3 and 11.6.1 controls by providing
          monitoring, alerting, and supporting evidence, but{' '}
          <strong>
            using ScriptProof does not make you PCI DSS compliant and we do not certify, warrant, or
            guarantee your compliance
          </strong>
          . Your validation requirements are determined by your acquirer, payment brands, or a
          Qualified Security Assessor, and acting on alerts and maintaining your controls remains
          your responsibility.
        </p>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and disclaimers',
    body: (
      <p>
        The service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>.
        We make reasonable efforts to keep it running, to perform scans on schedule, and to deliver
        alerts promptly, but we do not warrant that the service will be uninterrupted, error-free,
        or that it will detect every change or every malicious script. Scheduled maintenance and
        factors outside our control (including your site blocking our crawler) can affect
        monitoring. To the maximum extent permitted by law, we disclaim all implied warranties,
        including merchantability and fitness for a particular purpose.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <>
        <p>To the maximum extent permitted by law:</p>
        <ul>
          <li>
            our total aggregate liability arising out of or relating to the service is capped at{' '}
            <strong>
              the fees you paid to us for the service in the 12 months before the event giving rise
              to the claim
            </strong>{' '}
            (or, if you have paid nothing, 100 US dollars); and
          </li>
          <li>
            we are not liable for indirect, incidental, special, consequential, or punitive damages,
            or for lost profits, revenue, data, or goodwill — including losses arising from a
            skimming attack, a compliance finding, or a missed detection.
          </li>
        </ul>
        <p>
          Nothing in these terms excludes liability that cannot be excluded by law, such as
          liability for fraud or for death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    body: (
      <>
        <ul>
          <li>
            <strong>By you:</strong> you may cancel your subscription at any time; it remains active
            until the end of the paid period. You may delete your account at any time, which removes
            your organization and its data.
          </li>
          <li>
            <strong>By us:</strong> we may suspend or terminate your access if you materially breach
            these terms (in particular the acceptable-use rules in section 4), if required by law,
            or if we discontinue the service — in which case we will give reasonable notice and a
            pro-rata refund of prepaid, unused fees.
          </li>
        </ul>
        <p>
          Sections that by their nature should survive termination (including sections 8&ndash;12
          and 15) survive it.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms as the service evolves. We will post the updated version on this
        page with a new &ldquo;last updated&rdquo; date and, for material changes, notify you by
        email at least 14 days before they take effect. If you do not agree to the updated terms,
        cancel before they take effect; continued use afterwards means you accept them.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <p>
        These terms are governed by the laws of the jurisdiction in which the ScriptProof operator
        is established, and the courts of that jurisdiction have exclusive jurisdiction over
        disputes arising from them — subject to any mandatory consumer or local-law protections that
        apply to you and cannot be contracted away.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms: <strong>support@scriptproof.com</strong>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      icon={ScrollText}
      kicker="Legal center"
      titleLead="Terms of"
      titleAccent="service"
      intro="The rules of the road: what you can expect from ScriptProof, what we expect from you, and where responsibility sits."
      sections={sections}
    />
  );
}
