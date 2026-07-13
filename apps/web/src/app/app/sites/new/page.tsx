import type { Metadata } from 'next';
import { NewSiteForm } from '@/components/new-site-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Add site' };

export default function NewSitePage() {
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add a site</CardTitle>
          <CardDescription>
            You'll verify ownership next — monitoring only starts on verified domains.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewSiteForm />
        </CardContent>
      </Card>
    </div>
  );
}
