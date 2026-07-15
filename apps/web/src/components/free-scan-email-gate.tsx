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
      <div className="flex flex-col gap-3 rounded-[2px] border border-emerald-400/30 bg-emerald-400/10 p-4 sm:flex-row sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 text-surface-900">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <p className="flex-1 text-sm font-medium text-white">Your summary is ready.</p>
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
        {state && !state.ok ? <p className="mt-1 text-xs text-rose-300">{state.message}</p> : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Preparing…' : 'Get PDF summary'}
      </Button>
    </form>
  );
}
