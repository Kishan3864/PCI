'use client';

import { CheckCircle2, Download } from 'lucide-react';
import { useActionState } from 'react';
import { emailFreeScanPdf } from '@/actions/free-scan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FreeScanEmailGate({ scanId }: { scanId: string }) {
  const [state, formAction, pending] = useActionState(emailFreeScanPdf, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 sm:flex-row sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <p className="flex-1 text-sm font-medium text-navy-900">Your summary is ready.</p>
        <Button asChild>
          <a href={`/free-scan/${scanId}/pdf`} download>
            <Download className="h-4 w-4" /> Download PDF summary
          </a>
        </Button>
      </div>
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
