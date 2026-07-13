import { CheckCircle2, FileText, Radar, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRODUCT_TAGLINE } from '@/lib/constants';

const steps = [
  {
    icon: CheckCircle2,
    title: '1. Verify your site',
    body: 'Prove you own the domain with a DNS record or meta tag. We only ever monitor sites you control.',
  },
  {
    icon: Radar,
    title: '2. We watch your payment pages',
    body: 'Our crawler fingerprints every script and security header on your checkout pages, on a daily or 6-hourly schedule.',
  },
  {
    icon: ShieldAlert,
    title: '3. You get alerted on changes',
    body: 'A new or modified script on a payment page triggers an immediate email with before/after hashes and a one-click review link.',
  },
  {
    icon: FileText,
    title: '4. Evidence, ready for your SAQ',
    body: 'A monthly PDF Evidence Pack documents your script inventory, authorizations, change log and scan cadence.',
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-500">
          PCI DSS v4.0.1 · Requirements 6.4.3 &amp; 11.6.1
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
          {PRODUCT_TAGLINE}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          ScriptProof keeps an inventory of every script on your checkout, records why each one is
          authorized, detects tampering, and turns it all into evidence you can hand to your bank.
          It supports your 6.4.3 and 11.6.1 controls — no agent install required to start.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Start 14-day free trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/free-scan">Run a free scan</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-navy-900">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.title}>
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <step.icon className="h-6 w-6 shrink-0 text-navy-600" />
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-slate-600">{step.body}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-bold text-navy-900">Why this matters now</h2>
        <p className="mt-4 leading-7 text-slate-600">
          Since PCI DSS v4.0, requirements 6.4.3 and 11.6.1 ask merchants to maintain an authorized
          inventory of all payment page scripts and to detect tampering with page content and HTTP
          headers at least weekly. That applies to small shops too — skimming attacks
          overwhelmingly target exactly the scripts these requirements cover. ScriptProof gives you
          the monitoring and the paper trail without hiring a security team.
        </p>
      </section>
    </>
  );
}
