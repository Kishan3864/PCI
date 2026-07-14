import { MailCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';

export const metadata: Metadata = { title: 'Check your email' };

export default function CheckEmailPage() {
  return (
    <Reveal>
      <Card className="glass-strong flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
          Check your <GradientText>inbox</GradientText>
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          We sent you a confirmation link. Click it to activate your account — you will be signed in
          automatically.
        </p>
        <p className="text-xs text-slate-400">
          Running locally? Emails land in Mailhog at{' '}
          <code className="rounded bg-slate-100 px-1">localhost:8025</code>.
        </p>
      </Card>
    </Reveal>
  );
}
