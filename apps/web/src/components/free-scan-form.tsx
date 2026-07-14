'use client';

import { useActionState } from 'react';
import { submitFreeScan } from '@/actions/free-scan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FreeScanForm() {
  const [state, formAction, pending] = useActionState(submitFreeScan, null);

  return (
    <form action={formAction} className="mx-auto max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          name="url"
          type="url"
          required
          placeholder="https://yourstore.com/checkout"
          className="h-11 flex-1"
        />
        <Button type="submit" size="lg" disabled={pending} className="h-11">
          {pending ? 'Starting…' : 'Scan for free'}
        </Button>
      </div>
      {state && !state.ok ? (
        <p className="mt-3 text-center text-sm text-red-600">{state.message}</p>
      ) : null}
    </form>
  );
}
