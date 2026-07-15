import { planAllows } from '@scriptproof/core';
import { ImageIcon, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import { removeLogo, removeSlackWebhook, sendSlackTest } from '@/actions/organization';
import { ActionButton } from '@/components/action-button';
import { LogoUploadForm, SlackWebhookForm } from '@/components/org-settings-forms';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
import { requireOrg } from '@/lib/org';

export const metadata: Metadata = { title: 'Organization settings' };

export default async function OrganizationSettingsPage() {
  const { org } = await requireOrg();
  const slackAllowed = planAllows(org.plan, 'slackAlerts');
  const logoAllowed = planAllows(org.plan, 'whiteLabel');

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Organization <GradientText>settings</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Alerting and branding for {org.name}. These settings apply to every site in the
            organization.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        {slackAllowed ? (
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-base">Slack alerts</CardTitle>
                  <CardDescription>
                    Critical tamper alerts are posted to this webhook in addition to email.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SlackWebhookForm currentUrl={org.slackWebhookUrl} />
              {org.slackWebhookUrl ? (
                <div className="flex flex-wrap items-start gap-2 border-t border-slate-200 pt-4">
                  <Badge variant="brand">Connected</Badge>
                  <span className="flex-1" />
                  <ActionButton
                    action={sendSlackTest}
                    fields={{}}
                    variant="outline"
                    size="sm"
                    showResult
                  >
                    Send test message
                  </ActionButton>
                  <ActionButton
                    action={removeSlackWebhook}
                    fields={{}}
                    variant="ghost"
                    size="sm"
                    showResult
                  >
                    Remove
                  </ActionButton>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <UpgradePrompt feature="Slack alerts" requiredPlan="pro" />
        )}
      </Reveal>

      <Reveal delay={160}>
        {logoAllowed ? (
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-base">White-label logo</CardTitle>
                  <CardDescription>
                    Your logo replaces the ScriptProof brand on Evidence Pack covers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {org.logo ? (
                <div className="flex flex-wrap items-center gap-4 rounded-[2px] border border-slate-200 bg-slate-50/70 p-4">
                  {/* Plain <img>: logo is served by a same-app route handler, not next/image. */}
                  <img
                    src="/app/settings/organization/logo"
                    alt={`${org.name} logo`}
                    className="max-h-12 max-w-[200px] object-contain"
                  />
                  <span className="flex-1" />
                  <ActionButton
                    action={removeLogo}
                    fields={{}}
                    variant="ghost"
                    size="sm"
                    showResult
                  >
                    Remove logo
                  </ActionButton>
                </div>
              ) : null}
              <LogoUploadForm hasLogo={Boolean(org.logo)} />
            </CardContent>
          </Card>
        ) : (
          <UpgradePrompt feature="White-label branding" requiredPlan="agency" />
        )}
      </Reveal>
    </div>
  );
}
