'use client';

import { useActionState } from 'react';
import { createSite } from '@/actions/sites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function NewSiteForm() {
  const [state, formAction, pending] = useActionState(createSite, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="domain">Domain</Label>
        <Input id="domain" name="domain" placeholder="shop.example.com" required autoFocus />
        <p className="text-xs text-slate-500">
          The exact host serving your checkout — subdomains count as separate sites.
        </p>
      </div>
      {state && !state.ok ? <p className="text-sm text-red-600">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add site'}
      </Button>
    </form>
  );
}
