'use client';

import { Ban, ShieldCheck } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { justifyScript } from '@/actions/scripts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JustifyDialogProps {
  scriptId: string;
  scriptName: string;
  action: 'authorized' | 'blocked';
}

export function JustifyDialog({ scriptId, scriptName, action }: JustifyDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(justifyScript, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const verb = action === 'authorized' ? 'Authorize' : 'Block';
  const authorize = action === 'authorized';
  const Icon = authorize ? ShieldCheck : Ban;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={authorize ? 'default' : 'outline'}>
          <Icon className="h-4 w-4" />
          {verb}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[2px] ring-1 ring-inset ${
                authorize
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/25'
                  : 'bg-rose-50 text-rose-700 ring-rose-600/25'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle>{verb} script</DialogTitle>
          </div>
          <DialogDescription className="break-all font-mono text-xs">
            {scriptName}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="scriptId" value={scriptId} />
          <input type="hidden" name="action" value={action} />
          <div className="space-y-1.5">
            <Label htmlFor={`justification-${scriptId}`}>
              Written justification <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id={`justification-${scriptId}`}
              name="justification"
              required
              minLength={10}
              rows={4}
              placeholder={
                action === 'authorized'
                  ? 'e.g. Stripe.js — required to tokenize card input on the checkout form.'
                  : 'e.g. Legacy chat widget — no longer in use, must not load on checkout.'
              }
            />
            <p className="text-xs text-slate-500">
              Required for your 6.4.3 evidence (minimum 10 characters). Recorded with your name and
              a timestamp.
            </p>
          </div>
          {state && !state.ok ? <p className="text-sm text-rose-600">{state.message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={authorize ? 'default' : 'destructive'}
              disabled={pending}
            >
              {pending ? 'Saving…' : verb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
