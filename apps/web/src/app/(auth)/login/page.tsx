'use client';

import { signInSchema } from '@scriptproof/core/schemas';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientText, Reveal } from '@/components/visual';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUnverified(null);

    const form = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get('email'),
      password: form.get('password'),
    });
    if (!parsed.success) {
      setError('Enter your email and password');
      return;
    }

    setPending(true);
    const { error: apiError } = await authClient.signIn.email({
      ...parsed.data,
      callbackURL: '/app',
    });
    setPending(false);

    if (apiError) {
      if (apiError.status === 403) {
        setUnverified(parsed.data.email);
        setError('Please confirm your email address first.');
      } else {
        setError(apiError.message ?? 'Login failed');
      }
    }
  }

  async function resend() {
    if (!unverified) return;
    await authClient.sendVerificationEmail({ email: unverified, callbackURL: '/app' });
    setError('Verification email sent again — check your inbox.');
  }

  return (
    <Reveal>
      <Card className="glass-strong p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Welcome <GradientText>back</GradientText>
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">Log in to your ScriptProof account.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {unverified ? (
            <Button type="button" variant="outline" className="w-full" onClick={resend}>
              Resend verification email
            </Button>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{' '}
          <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
            Start your free trial
          </Link>
        </p>
      </Card>
    </Reveal>
  );
}
