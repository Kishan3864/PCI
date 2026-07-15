'use client';

import { AlertCircle, Check, Code2, Copy, Server } from 'lucide-react';
import { useActionState, useState } from 'react';
import { verifySite } from '@/actions/sites';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpotlightCard } from '@/components/visual';

interface VerifySitePanelProps {
  siteId: string;
  domain: string;
  txtRecord: string;
  metaTag: string;
}

/** Numbered step marker — sharp, mono, Sentinel style. */
function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 font-mono text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
      {String(n).padStart(2, '0')}
    </span>
  );
}

/** Mono value block (DNS TXT / meta tag) with copy-to-clipboard. */
function MonoCopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-700">
        {label}
      </p>
      <div className="flex items-start gap-2 rounded-[2px] border border-navy-800 bg-navy-950 p-3.5 font-mono">
        <code className="flex-1 break-all text-xs leading-5 text-cyan-200">{value}</code>
        <button
          type="button"
          aria-label="Copy to clipboard"
          className="shrink-0 rounded-[2px] bg-cyan-400/10 p-1.5 text-cyan-300 ring-1 ring-inset ring-cyan-400/30 transition-colors hover:bg-cyan-400/20 active:bg-cyan-400/25"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function VerifyError({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-[2px] bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function VerifySitePanel({ siteId, domain, txtRecord, metaTag }: VerifySitePanelProps) {
  const [dnsState, dnsAction, dnsPending] = useActionState(verifySite, null);
  const [metaState, metaAction, metaPending] = useActionState(verifySite, null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SpotlightCard className="h-full rounded-[2px]">
        <Card className="card-lift h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                <Server className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <Badge variant="brand">Option A</Badge>
                <CardTitle className="text-base">DNS TXT record</CardTitle>
              </div>
            </div>
            <CardDescription>
              Prove ownership at the DNS level — works even if you can’t edit the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <StepNumber n={1} />
              <p className="pt-0.5 text-sm leading-6 text-slate-600">
                Open the DNS settings for{' '}
                <span className="font-mono text-navy-800">{domain.split(':')[0]}</span> at your DNS
                provider.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={2} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="mb-3 text-sm leading-6 text-slate-600">
                  Add a TXT record with this exact value.
                </p>
                <MonoCopyBlock label="TXT record value" value={txtRecord} />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={3} />
              <div className="flex-1 pt-0.5">
                <p className="mb-3 text-sm leading-6 text-slate-600">
                  Wait for DNS to propagate (usually minutes), then check.
                </p>
                <form action={dnsAction}>
                  <input type="hidden" name="siteId" value={siteId} />
                  <input type="hidden" name="method" value="dns" />
                  <Button type="submit" disabled={dnsPending}>
                    {dnsPending ? 'Checking DNS…' : 'Check DNS record'}
                  </Button>
                </form>
              </div>
            </div>
            {dnsState && !dnsState.ok ? <VerifyError message={dnsState.message} /> : null}
          </CardContent>
        </Card>
      </SpotlightCard>

      <SpotlightCard className="h-full rounded-[2px]">
        <Card className="card-lift h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                <Code2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <Badge variant="brand">Option B</Badge>
                <CardTitle className="text-base">Meta tag</CardTitle>
              </div>
            </div>
            <CardDescription>
              Prove ownership in the page itself — no DNS access needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <StepNumber n={1} />
              <p className="pt-0.5 text-sm leading-6 text-slate-600">
                Open the template that renders the{' '}
                <code className="font-mono text-navy-800">&lt;head&gt;</code> of your homepage.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={2} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="mb-3 text-sm leading-6 text-slate-600">
                  Paste this tag anywhere inside the{' '}
                  <code className="font-mono text-navy-800">&lt;head&gt;</code>.
                </p>
                <MonoCopyBlock label="Meta tag" value={metaTag} />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={3} />
              <div className="flex-1 pt-0.5">
                <p className="mb-3 text-sm leading-6 text-slate-600">
                  Deploy the change so it’s live on your homepage, then check.
                </p>
                <form action={metaAction}>
                  <input type="hidden" name="siteId" value={siteId} />
                  <input type="hidden" name="method" value="meta" />
                  <Button type="submit" disabled={metaPending}>
                    {metaPending ? 'Checking page…' : 'Check meta tag'}
                  </Button>
                </form>
              </div>
            </div>
            {metaState && !metaState.ok ? <VerifyError message={metaState.message} /> : null}
          </CardContent>
        </Card>
      </SpotlightCard>
    </div>
  );
}
