import { FileSearch, Globe2, ScanLine, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { FreeScanForm } from '@/components/free-scan-form';
import { Aurora, GradientText, GridGlow, Reveal, ScanRadar } from '@/components/visual';

export const metadata: Metadata = {
  title: 'Free payment-page script scan',
  description:
    'Scan any checkout page for free: see every script, external domain, SRI coverage and missing security headers. No account needed.',
};

const seen = [
  { icon: ScanLine, label: 'Every script it loads' },
  { icon: Globe2, label: 'External domains' },
  { icon: FileSearch, label: 'SRI coverage' },
  { icon: ShieldAlert, label: 'Missing security headers' },
];

export default function FreeScanPage() {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <GridGlow />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ScanLine className="h-3.5 w-3.5" />
              Instant scan · No account needed
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
              Free <GradientText animated>payment-page</GradientText> scan
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Enter a checkout or payment page URL. We'll show you every script it loads, which
              external domains they come from, SRI coverage, and which security headers are missing
              — no account needed.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9">
              <FreeScanForm />
            </div>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              {seen.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  <item.icon className="h-4 w-4 text-blue-600" /> {item.label}
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal delay={360}>
            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600/70" />
              <span>
                We only fetch the page you enter and store the report. We never collect card data.
                Limited to 3 scans per day.
              </span>
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="justify-self-center lg:justify-self-end">
          <div className="animate-float-slow">
            <ScanRadar />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
