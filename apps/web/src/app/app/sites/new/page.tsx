import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { NewSiteForm } from '@/components/new-site-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';

export const metadata: Metadata = { title: 'Add site' };

export default function NewSitePage() {
  return (
    <div className="mx-auto max-w-lg">
      <Reveal>
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">
              Add a <GradientText>site</GradientText>
            </CardTitle>
            <CardDescription>
              You'll verify ownership next — monitoring only starts on verified domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewSiteForm />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
