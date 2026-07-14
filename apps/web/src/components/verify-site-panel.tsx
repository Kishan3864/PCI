'use client';

import { AlertCircle, Code2, Server } from 'lucide-react';
import { useActionState } from 'react';
import { verifySite } from '@/actions/sites';
import { CopyBlock } from '@/components/copy-block';
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

export function VerifySitePanel({ siteId, domain, txtRecord, metaTag }: VerifySitePanelProps) {
  const [dnsState, dnsAction, dnsPending] = useActionState(verifySite, null);
  const [metaState, metaAction, metaPending] = useActionState(verifySite, null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SpotlightCard className="h-full rounded-2xl">
        <Card className="card-lift h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                <Server className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <Badge variant="brand">Option A</Badge>
                <CardTitle className="text-base">DNS TXT record</CardTitle>
              </div>
            </div>
            <CardDescription>
              Add this TXT record to <span className="font-medium">{domain.split(':')[0]}</span> at
              your DNS provider, then check.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyBlock label="TXT record value" value={txtRecord} />
            <form action={dnsAction}>
              <input type="hidden" name="siteId" value={siteId} />
              <input type="hidden" name="method" value="dns" />
              <Button type="submit" disabled={dnsPending}>
                {dnsPending ? 'Checking DNS…' : 'Check DNS record'}
              </Button>
            </form>
            {dnsState && !dnsState.ok ? (
              <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/15">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{dnsState.message}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </SpotlightCard>

      <SpotlightCard className="h-full rounded-2xl">
        <Card className="card-lift h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                <Code2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <Badge variant="brand">Option B</Badge>
                <CardTitle className="text-base">Meta tag</CardTitle>
              </div>
            </div>
            <CardDescription>
              Add this tag to the <code>&lt;head&gt;</code> of your homepage, then check.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyBlock label="Meta tag" value={metaTag} />
            <form action={metaAction}>
              <input type="hidden" name="siteId" value={siteId} />
              <input type="hidden" name="method" value="meta" />
              <Button type="submit" disabled={metaPending}>
                {metaPending ? 'Checking page…' : 'Check meta tag'}
              </Button>
            </form>
            {metaState && !metaState.ok ? (
              <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/15">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{metaState.message}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </SpotlightCard>
    </div>
  );
}
