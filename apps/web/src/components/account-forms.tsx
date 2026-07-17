'use client';

import { CheckCircle2, KeyRound, Save } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { changePassword, updateProfileName } from '@/actions/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionState } from '@/actions/types';

function ResultLine({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p
      className={`flex items-center gap-1.5 text-sm ${
        state.ok ? 'text-emerald-700' : 'text-rose-600'
      }`}
    >
      {state.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
      {state.message}
    </p>
  );
}

export function ProfileNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(updateProfileName, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Display name</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={currentName}
          required
          minLength={2}
          maxLength={100}
        />
      </div>
      <ResultLine state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        <Save className="h-4 w-4" />
        {pending ? 'Saving…' : 'Save name'}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
          />
          <p className="text-xs text-slate-500">At least 10 characters, not a common password.</p>
        </div>
      </div>
      <ResultLine state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        <KeyRound className="h-4 w-4" />
        {pending ? 'Changing…' : 'Change password'}
      </Button>
    </form>
  );
}
