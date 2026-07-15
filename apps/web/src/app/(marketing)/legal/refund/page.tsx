import { ReceiptText } from 'lucide-react';
import type { Metadata } from 'next';
import { LegalDoc, type LegalSection } from '../legal-doc';

export const metadata: Metadata = {
  title: 'Refund & cancellation policy',
  description:
    'How the 14-day free trial, cancellations, and the 14-day money-back guarantee work at ScriptProof.',
};

const sections: LegalSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <>
        <p>
          We want trying and leaving ScriptProof to be as low-risk as staying. This policy explains
          the free trial, how cancellation works, and when you can get your money back.
        </p>
        <p>
          All payments for ScriptProof are processed by{' '}
          <strong>Dodo Payments, acting as merchant of record</strong>. That means Dodo Payments is
          the seller on the payment transaction, appears on your card statement, and issues refunds
          back to your original payment method. We never see or store your card number.
        </p>
      </>
    ),
  },
  {
    id: 'free-trial',
    title: '14-day free trial',
    body: (
      <p>
        Every new account starts with a <strong>14-day free trial</strong>.{' '}
        <strong>No payment card is required</strong>, so there is nothing to refund and nothing to
        cancel to avoid a charge — if you do nothing, the trial simply ends and you are never
        billed. You only pay if you actively choose a paid plan.
      </p>
    ),
  },
  {
    id: 'cancellation',
    title: 'Cancelling a paid subscription',
    body: (
      <>
        <ul>
          <li>
            You can cancel your subscription <strong>at any time</strong> from your account
            settings, or by emailing support@scriptproof.com.
          </li>
          <li>
            Cancellation takes effect at the <strong>end of your current billing period</strong>:
            monitoring, alerts, and Evidence Packs keep working until then, and you are simply not
            billed again.
          </li>
          <li>There are no cancellation fees, phone calls, or retention hoops.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'money-back',
    title: '14-day money-back guarantee',
    body: (
      <p>
        Your <strong>first paid invoice</strong> is covered by a{' '}
        <strong>14-day money-back guarantee</strong>. If ScriptProof is not right for you, tell us
        within 14 days of that first charge and we will refund it in full — no justification
        required. The guarantee applies once per customer, to the first invoice of your first paid
        subscription (it does not apply to renewals or later re-subscriptions).
      </p>
    ),
  },
  {
    id: 'how-to-request',
    title: 'How to request a refund',
    body: (
      <>
        <p>
          Email <strong>support@scriptproof.com</strong> from the address on your account, with the
          subject &ldquo;Refund request&rdquo;. Include your account email and, if you have it, the
          invoice reference. That is all we need.
        </p>
        <p>
          Approved refunds are issued by Dodo Payments to your original payment method. Depending on
          your bank, the money typically appears within 5&ndash;10 business days.
        </p>
      </>
    ),
  },
  {
    id: 'no-pro-rata',
    title: 'What is not refunded',
    body: (
      <>
        <p>Outside the 14-day money-back guarantee, payments are non-refundable. In particular:</p>
        <ul>
          <li>
            <strong>No pro-rata refunds</strong> for the unused remainder of a billing period after
            you cancel — your plan runs to the end of the period instead.
          </li>
          <li>Renewal invoices, once more than 14 days old, are not refundable.</li>
        </ul>
        <p>
          We may still issue a refund at our discretion where something on our side went wrong (for
          example, a billing error or an extended outage), and nothing in this policy limits any
          non-waivable refund rights you have under the consumer law of your jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: 'chargebacks',
    title: 'Chargebacks',
    body: (
      <p>
        If a charge looks wrong, please contact us <strong>before</strong> disputing it with your
        bank — almost every issue is resolved faster with a direct refund than through a chargeback.
        Payment disputes are handled together with Dodo Payments as merchant of record. We reserve
        the right to suspend accounts with fraudulent or plainly unfounded chargebacks while the
        dispute is investigated.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Billing questions, cancellations, and refund requests:{' '}
        <strong>support@scriptproof.com</strong>. We aim to reply within two business days.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalDoc
      icon={ReceiptText}
      kicker="Legal center"
      titleLead="Refund &"
      titleAccent="cancellation"
      intro="Try free without a card, cancel anytime in one click, and get your first paid invoice back within 14 days if it's not for you."
      sections={sections}
    />
  );
}
