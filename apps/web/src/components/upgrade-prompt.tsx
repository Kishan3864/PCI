import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function UpgradePrompt({
  feature,
  requiredPlan,
}: {
  feature: string;
  requiredPlan: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Lock className="h-9 w-9 text-slate-300" />
        <p className="font-medium text-slate-700">
          {feature} is a {requiredPlan} feature
        </p>
        <p className="max-w-sm text-sm text-slate-500">
          Upgrade your plan to unlock {feature.toLowerCase()}.
        </p>
        <Button className="mt-1" asChild>
          <Link href="/app/settings/billing">View plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
