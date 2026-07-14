'use client';

import { CheckCircle2, Plus } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { addPage } from '@/actions/pages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddPageFormProps {
  siteId: string;
  domain: string;
  allow6h: boolean;
}

export function AddPageForm({ siteId, domain, allow6h }: AddPageFormProps) {
  const [state, formAction, pending] = useActionState(addPage, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem_9rem]">
        <div className="space-y-1.5">
          <Label htmlFor="page-url">Page URL</Label>
          <Input id="page-url" name="url" placeholder={`https://${domain}/checkout`} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="page-label">Label</Label>
          <Input
            id="page-label"
            name="label"
            placeholder="Checkout"
            defaultValue="Checkout"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="page-frequency">Scan frequency</Label>
          <select
            id="page-frequency"
            name="scanFrequency"
            defaultValue="daily"
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <option value="daily">Daily</option>
            <option value="6h" disabled={!allow6h}>
              Every 6 hours{allow6h ? '' : ' (Pro)'}
            </option>
          </select>
        </div>
      </div>
      {state ? (
        <p
          className={`flex items-center gap-1.5 text-sm ${
            state.ok ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {state.ok ? <CheckCircle2 className="h-4 w-4" /> : null}
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? 'Adding…' : 'Add page'}
      </Button>
    </form>
  );
}
