'use client';

import { AlertCircle, ArrowRight } from 'lucide-react';
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
      {state && !state.ok ? (
        <p className="flex items-center gap-1.5 rounded-[2px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add site'}
        {pending ? null : <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
