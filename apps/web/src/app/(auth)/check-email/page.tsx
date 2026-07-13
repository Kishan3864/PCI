import { MailCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Check your email' };

export default function CheckEmailPage() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <MailCheck className="h-10 w-10 text-navy-600" />
        <h1 className="text-xl font-semibold text-navy-900">Check your inbox</h1>
        <p className="text-sm leading-6 text-slate-600">
          We sent you a confirmation link. Click it to activate your account — you will be signed
          in automatically.
        </p>
        <p className="text-xs text-slate-400">
          Running locally? Emails land in Mailhog at{' '}
          <code className="rounded bg-slate-100 px-1">localhost:8025</code>.
        </p>
      </CardContent>
    </Card>
  );
}
