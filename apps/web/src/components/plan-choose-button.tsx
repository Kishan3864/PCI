'use client';

import type { PlanId } from '@scriptproof/core';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import type { ActionState } from '@/actions/types';

interface PlanChooseButtonProps {
  plan: PlanId;
  label: string;
  disabled?: boolean;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}

export function PlanChooseButton({ plan, label, disabled, action }: PlanChooseButtonProps) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="plan" value={plan} />
      <Button type="submit" size="sm" className="w-full" disabled={disabled || pending}>
        {pending ? 'Starting…' : label}
      </Button>
      {state && !state.ok ? <p className="mt-1 text-xs text-rose-600">{state.message}</p> : null}
    </form>
  );
}
