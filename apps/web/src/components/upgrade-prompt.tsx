import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function UpgradePrompt({
  feature,
  requiredPlan,
}: {
  feature: string;
  requiredPlan: string;
}) {
  return (
    <Card className="card-lift relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <CardContent className="relative flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.8)]">
          <Lock className="h-6 w-6" />
        </div>
        <Badge variant="brand" className="capitalize">
          <Sparkles className="h-3.5 w-3.5" /> {requiredPlan} feature
        </Badge>
        <p className="font-display text-lg font-semibold text-navy-900">
          {feature} is a {requiredPlan} feature
        </p>
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Upgrade your plan to unlock {feature.toLowerCase()}.
        </p>
        <Button className="mt-1" asChild>
          <Link href="/app/settings/billing">
            View plans <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
