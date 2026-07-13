'use client';

import { signInSchema } from '@scriptproof/core';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Welcome back.</CardDescription>
      </CardHeader>
      <CardContent>
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {unverified ? (
            <Button type="button" variant="outline" className="w-full" onClick={resend}>
              Resend verification email
            </Button>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here?{' '}
          <Link href="/signup" className="font-medium text-navy-700 hover:underline">
            Start your free trial
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
