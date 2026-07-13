'use client';

import { useActionState } from 'react';
import { verifySite } from '@/actions/sites';
import { CopyBlock } from '@/components/copy-block';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Option A — DNS TXT record</CardTitle>
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
            <p className="text-sm text-red-600">{dnsState.message}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Option B — Meta tag</CardTitle>
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
            <p className="text-sm text-red-600">{metaState.message}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
