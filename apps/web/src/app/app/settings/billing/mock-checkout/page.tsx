import { PLANS, type PlanId } from '@scriptproof/core';
import { CreditCard } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { confirmMockCheckout } from '@/actions/billing';
import { PlanChooseButton } from '@/components/plan-choose-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isMockBilling } from '@/lib/billing';
import { requireOrg } from '@/lib/org';

export const metadata: Metadata = { title: 'Mock checkout' };

/** Local/dev-only simulated checkout page (mock billing provider). */
export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  if (!isMockBilling()) redirect('/app/settings/billing');
  await requireOrg();

  const { plan } = await searchParams;
  const validPlan = (['starter', 'pro', 'agency'] as PlanId[]).find((p) => p === plan);
  if (!validPlan) redirect('/app/settings/billing');

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-navy-600" /> Simulated checkout
          </CardTitle>
          <CardDescription>
            This stands in for the payment provider's hosted checkout while billing runs in local
            mode. Confirming activates the plan as if payment succeeded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold capitalize text-navy-900">{validPlan} plan</p>
            <p className="text-sm text-slate-600">${PLANS[validPlan].priceMonthly}/month</p>
          </div>
          <PlanChooseButton
            plan={validPlan}
            action={confirmMockCheckout}
            label="Complete mock payment"
          />
        </CardContent>
      </Card>
    </div>
  );
}
