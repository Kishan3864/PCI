'use client';

import { AlertCircle, ArrowRight, Globe } from 'lucide-react';
import { useActionState } from 'react';
import { submitFreeScan } from '@/actions/free-scan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FreeScanForm() {
  const [state, formAction, pending] = useActionState(submitFreeScan, null);

  return (
    <form action={formAction} className="mx-auto max-w-xl">
      <div className="glass-strong corner-frame rounded-[2px] p-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              name="url"
              type="url"
              required
              placeholder="https://yourstore.com/checkout"
              className="h-12 w-full pl-10 text-base"
            />
          </div>
          <Button type="submit" size="xl" disabled={pending} className="shrink-0">
            {pending ? (
              'Starting…'
            ) : (
              <>
                Scan for free <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      {state && !state.ok ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 rounded-[2px] bg-rose-400/10 px-3 py-2 text-center text-sm font-medium text-rose-300 ring-1 ring-inset ring-rose-400/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
