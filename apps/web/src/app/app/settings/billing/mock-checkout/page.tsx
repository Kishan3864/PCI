import { PLANS, type PlanId } from '@scriptproof/core';
import { CreditCard, FlaskConical, Lock, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { confirmMockCheckout } from '@/actions/billing';
import { PlanChooseButton } from '@/components/plan-choose-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/visual';
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
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Badge variant="warning">
          <FlaskConical className="h-3.5 w-3.5" /> Simulated environment
        </Badge>
      </div>

      <Card className="relative isolate overflow-hidden border-amber-300 bg-amber-50/60">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
        />
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-lg">
                Simulated <GradientText>checkout</GradientText>
              </CardTitle>
              <CardDescription>
                This stands in for the payment provider's hosted checkout while billing runs in
                local mode. Confirming activates the plan as if payment succeeded.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-[2px] border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-display font-semibold capitalize text-navy-900">
                {validPlan} plan
              </p>
              <p className="text-sm text-slate-600">Billed monthly</p>
            </div>
            <p className="text-right">
              <span className="text-2xl font-bold text-navy-900">
                ${PLANS[validPlan].priceMonthly}
              </span>
              <span className="text-sm text-slate-500">/mo</span>
            </p>
          </div>
          <PlanChooseButton
            plan={validPlan}
            action={confirmMockCheckout}
            label="Complete mock payment"
          />
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" /> No real card is charged in mock mode
          </p>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> ScriptProof never touches card data
      </p>
    </div>
  );
}
