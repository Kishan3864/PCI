'use client';

import { CheckCircle2, Send } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { createSupportTicket } from '@/actions/support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionState } from '@/actions/types';

const categories = [
  { value: 'technical', label: 'Technical problem' },
  { value: 'billing', label: 'Billing & plans' },
  { value: 'compliance', label: 'Compliance / Evidence Packs' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'other', label: 'Something else' },
];

const priorities = [
  { value: 'low', label: 'Low — general question' },
  { value: 'normal', label: 'Normal — needs attention' },
  { value: 'high', label: 'High — blocking my work' },
  { value: 'urgent', label: 'Urgent — possible security issue' },
];

function ResultLine({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p
      className={`flex items-start gap-1.5 text-sm ${
        state.ok ? 'text-emerald-700' : 'text-rose-600'
      }`}
    >
      {state.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
      {state.message}
    </p>
  );
}

const selectClass =
  'h-10 w-full rounded-[2px] border border-slate-300 bg-white px-3 text-sm text-navy-900 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

export function SupportTicketForm() {
  const [state, formAction, pending] = useActionState(createSupportTicket, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ticket-subject">Subject</Label>
        <Input
          id="ticket-subject"
          name="subject"
          placeholder="Short summary — e.g. “Evidence Pack missing for June”"
          required
          minLength={4}
          maxLength={200}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ticket-category">Category</Label>
          <select id="ticket-category" name="category" className={selectClass} defaultValue="technical">
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ticket-priority">Priority</Label>
          <select id="ticket-priority" name="priority" className={selectClass} defaultValue="normal">
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-message">What happened?</Label>
        <textarea
          id="ticket-message"
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder="Describe the issue: which site or page, what you expected, what you saw instead. Screenshots can be sent by replying to the confirmation email."
          className="w-full rounded-[2px] border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <p className="text-xs text-slate-500">
          Include the site domain and roughly when it happened — it speeds up the first reply.
        </p>
      </div>

      <ResultLine state={state} />
      <Button type="submit" disabled={pending}>
        <Send className="h-4 w-4" />
        {pending ? 'Submitting…' : 'Raise ticket'}
      </Button>
    </form>
  );
}
