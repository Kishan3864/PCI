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

      <Card className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl"
        />
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)]">
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
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <div>
              <p className="font-display font-semibold capitalize text-navy-900">
                {validPlan} plan
              </p>
              <p className="text-sm text-slate-500">Billed monthly</p>
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
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> No real card is charged in mock mode
          </p>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> ScriptProof never touches card data
      </p>
    </div>
  );
}
