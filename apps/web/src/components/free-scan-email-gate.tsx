'use client';

import { Download } from 'lucide-react';
import { useActionState } from 'react';
import { emailFreeScanPdf } from '@/actions/free-scan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FreeScanEmailGate({ scanId }: { scanId: string }) {
  const [state, formAction, pending] = useActionState(emailFreeScanPdf, null);

  if (state?.ok) {
    return (
      <Button asChild>
        <a href={`/free-scan/${scanId}/pdf`} download>
          <Download className="h-4 w-4" /> Download PDF summary
        </a>
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <input type="hidden" name="scanId" value={scanId} />
      <div className="flex-1">
        <Input name="email" type="email" required placeholder="you@yourstore.com" />
        {state && !state.ok ? <p className="mt-1 text-xs text-red-600">{state.message}</p> : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Preparing…' : 'Get PDF summary'}
      </Button>
    </form>
  );
}
