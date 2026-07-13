'use client';

import { useActionState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import type { ActionState } from '@/actions/types';

interface ActionButtonProps extends Omit<ButtonProps, 'type'> {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Hidden fields submitted with the action. */
  fields: Record<string, string>;
  children: React.ReactNode;
  showResult?: boolean;
}

/** One-click server-action button (acknowledge, scan now, delete, …). */
export function ActionButton({
  action,
  fields,
  children,
  showResult = false,
  ...buttonProps
}: ActionButtonProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button type="submit" disabled={pending} {...buttonProps}>
        {children}
      </Button>
      {showResult && state ? (
        <p className={`text-xs ${state.ok ? 'text-emerald-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
