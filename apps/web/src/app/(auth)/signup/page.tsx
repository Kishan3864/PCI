'use client';

import { signUpSchema } from '@scriptproof/core/schemas';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientText, Reveal } from '@/components/visual';
import { authClient } from '@/lib/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setPending(true);
    const { error: apiError } = await authClient.signUp.email({
      ...parsed.data,
      callbackURL: '/app',
    });
    setPending(false);

    if (apiError) {
      setError(apiError.message ?? 'Sign up failed');
      return;
    }
    router.push('/check-email');
  }

  return (
    <Reveal>
      <Card className="glass-strong p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Create your <GradientText>account</GradientText>
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            14-day free trial. No card required to look around.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name or business name</Label>
            <Input id="name" name="name" required maxLength={80} autoComplete="name" />
          </div>
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </Reveal>
  );
}
