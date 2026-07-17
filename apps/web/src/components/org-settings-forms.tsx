'use client';

import { CheckCircle2, Save, Upload } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { renameOrganization, saveSlackWebhook, uploadLogo } from '@/actions/organization';
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

export function OrgNameForm({ currentName, isOwner }: { currentName: string; isOwner: boolean }) {
  const [state, formAction, pending] = useActionState(renameOrganization, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="org-name">Organization name</Label>
        <Input
          id="org-name"
          name="name"
          defaultValue={currentName}
          required
          minLength={2}
          maxLength={100}
          disabled={!isOwner}
        />
        <p className="text-xs text-slate-500">
          Shown in the dashboard header, alert emails and white-label reports.
          {isOwner ? '' : ' Only the owner can change it.'}
        </p>
      </div>
      <ResultLine state={state} />
      <Button type="submit" size="sm" disabled={pending || !isOwner}>
        <Save className="h-4 w-4" />
        {pending ? 'Saving…' : 'Save name'}
      </Button>
    </form>
  );
}

export function SlackWebhookForm({ currentUrl }: { currentUrl: string | null }) {
  const [state, formAction, pending] = useActionState(saveSlackWebhook, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="slack-webhook-url">Slack incoming-webhook URL</Label>
        <Input
          id="slack-webhook-url"
          name="webhookUrl"
          type="url"
          placeholder="https://hooks.slack.com/services/T000/B000/xxxx"
          defaultValue={currentUrl ?? ''}
          required
        />
        <p className="text-xs text-slate-500">
          Create one in Slack under Apps → Incoming Webhooks, then paste it here.
        </p>
      </div>
      <ResultLine state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        <Save className="h-4 w-4" />
        {pending ? 'Saving…' : currentUrl ? 'Update webhook' : 'Save webhook'}
      </Button>
    </form>
  );
}

export function LogoUploadForm({ hasLogo }: { hasLogo: boolean }) {
  const [state, formAction, pending] = useActionState(uploadLogo, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="org-logo">Logo file</Label>
        <Input
          id="org-logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg"
          required
          className="h-auto py-2 file:mr-3 file:rounded-[2px] file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
        />
        <p className="text-xs text-slate-500">PNG or JPEG, up to 1 MB.</p>
      </div>
      <ResultLine state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        <Upload className="h-4 w-4" />
        {pending ? 'Uploading…' : hasLogo ? 'Replace logo' : 'Upload logo'}
      </Button>
    </form>
  );
}
