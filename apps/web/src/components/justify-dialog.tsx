'use client';

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={action === 'authorized' ? 'default' : 'outline'}>
          {verb}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{verb} script</DialogTitle>
          <DialogDescription className="break-all">{scriptName}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="scriptId" value={scriptId} />
          <input type="hidden" name="action" value={action} />
          <div className="space-y-1.5">
            <Label htmlFor={`justification-${scriptId}`}>
              Written justification <span className="text-red-600">*</span>
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
          {state && !state.ok ? <p className="text-sm text-red-600">{state.message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : verb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
