/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { render } from '@react-email/render';
import type { CSSProperties, ReactNode } from 'react';

// Plain-TSX email templates (table-based, inline styles), rendered with
// @react-email/render. See ASSUMPTIONS.md #12.

const colors = {
  navy: '#0b2545',
  slate: '#334155',
  muted: '#64748b',
  border: '#e2e8f0',
  bg: '#f1f5f9',
  critical: '#b91c1c',
  warning: '#b45309',
  info: '#0369a1',
};

const bodyStyle: CSSProperties = {
  margin: 0,
  backgroundColor: colors.bg,
  fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: colors.slate,
};

const cardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: '28px 32px',
};

const buttonStyle: CSSProperties = {
  display: 'inline-block',
  backgroundColor: colors.navy,
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: 6,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14,
};

const codeStyle: CSSProperties = {
  fontFamily: 'Consolas, Menlo, monospace',
  fontSize: 12,
  backgroundColor: colors.bg,
  padding: '2px 6px',
  borderRadius: 4,
  wordBreak: 'break-all',
};

const DISCLAIMER =
  'ScriptProof is a monitoring and evidence tool. It is not a Qualified Security Assessor (QSA) service and does not certify PCI DSS compliance. Consult your acquirer or a QSA for validation requirements.';

function Shell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={bodyStyle}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '32px 16px' }}>
                <table role="presentation" width={560} cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: 16 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: colors.navy }}>ScriptProof</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={cardStyle}>{children}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '20px 8px 0' }}>
                        <p style={{ fontSize: 11, lineHeight: '16px', color: colors.muted, margin: 0 }}>{DISCLAIMER}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

function severityColor(severity: string): string {
  if (severity === 'critical') return colors.critical;
  if (severity === 'warning') return colors.warning;
  return colors.info;
}

export const CHANGE_TYPE_LABELS: Record<string, string> = {
  new_script: 'New script detected',
  script_modified: 'Script content changed',
  script_removed: 'Authorized script missing',
  header_changed: 'Security header changed',
  sri_removed: 'SRI integrity attribute removed',
};

// ── Verification email ───────────────────────────────────────────────────────

export interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <Shell>
      <h1 style={{ fontSize: 20, color: colors.navy, margin: '0 0 12px' }}>Confirm your email</h1>
      <p style={{ fontSize: 14, lineHeight: '22px' }}>
        Hi {name}, confirm this address to finish setting up your ScriptProof account.
      </p>
      <p style={{ margin: '24px 0' }}>
        <a href={verifyUrl} style={buttonStyle}>
          Confirm email
        </a>
      </p>
      <p style={{ fontSize: 12, color: colors.muted, lineHeight: '18px' }}>
        If the button does not work, open this link: <span style={codeStyle}>{verifyUrl}</span>
        <br />
        If you did not create an account, you can ignore this email.
      </p>
    </Shell>
  );
}

export async function renderVerifyEmail(props: VerifyEmailProps) {
  const element = <VerifyEmail {...props} />;
  return {
    subject: 'Confirm your ScriptProof email',
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}

// ── Critical change alert ────────────────────────────────────────────────────

export interface CriticalAlertProps {
  pageLabel: string;
  pageUrl: string;
  changeType: string;
  scriptUrl: string | null;
  beforeHash: string | null;
  afterHash: string | null;
  detectedAt: string;
  reviewUrl: string;
}

function CriticalAlert(props: CriticalAlertProps) {
  const label = CHANGE_TYPE_LABELS[props.changeType] ?? props.changeType;
  return (
    <Shell>
      <p style={{ margin: '0 0 8px' }}>
        <span
          style={{
            color: '#ffffff',
            backgroundColor: colors.critical,
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Critical
        </span>
      </p>
      <h1 style={{ fontSize: 20, color: colors.navy, margin: '0 0 12px' }}>{label}</h1>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ fontSize: 13, lineHeight: '22px' }}>
        <tbody>
          <tr>
            <td style={{ color: colors.muted, paddingRight: 12, verticalAlign: 'top' }}>Page</td>
            <td>
              {props.pageLabel} — <span style={codeStyle}>{props.pageUrl}</span>
            </td>
          </tr>
          {props.scriptUrl ? (
            <tr>
              <td style={{ color: colors.muted, paddingRight: 12, verticalAlign: 'top' }}>Script</td>
              <td>
                <span style={codeStyle}>{props.scriptUrl}</span>
              </td>
            </tr>
          ) : null}
          {props.beforeHash ? (
            <tr>
              <td style={{ color: colors.muted, paddingRight: 12, verticalAlign: 'top' }}>Before</td>
              <td>
                <span style={codeStyle}>{props.beforeHash}</span>
              </td>
            </tr>
          ) : null}
          {props.afterHash ? (
            <tr>
              <td style={{ color: colors.muted, paddingRight: 12, verticalAlign: 'top' }}>After</td>
              <td>
                <span style={codeStyle}>{props.afterHash}</span>
              </td>
            </tr>
          ) : null}
          <tr>
            <td style={{ color: colors.muted, paddingRight: 12 }}>Detected</td>
            <td>{props.detectedAt}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ margin: '24px 0 8px' }}>
        <a href={props.reviewUrl} style={buttonStyle}>
          Review change
        </a>
      </p>
      <p style={{ fontSize: 12, color: colors.muted, lineHeight: '18px' }}>
        If this change is expected, review and authorize it with a written justification to keep
        your 6.4.3 inventory current. If it is not expected, treat it as a potential compromise.
      </p>
    </Shell>
  );
}

export async function renderCriticalAlertEmail(props: CriticalAlertProps) {
  const element = <CriticalAlert {...props} />;
  return {
    subject: `[ScriptProof] Critical: ${CHANGE_TYPE_LABELS[props.changeType] ?? props.changeType} on ${props.pageLabel}`,
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}

// ── Daily digest ─────────────────────────────────────────────────────────────

export interface DigestItem {
  pageLabel: string;
  pageUrl: string;
  changeType: string;
  severity: string;
  summary: string;
  detectedAt: string;
}

export interface DailyDigestProps {
  orgName: string;
  items: DigestItem[];
  dashboardUrl: string;
}

function DailyDigest({ orgName, items, dashboardUrl }: DailyDigestProps) {
  return (
    <Shell>
      <h1 style={{ fontSize: 20, color: colors.navy, margin: '0 0 12px' }}>Daily change digest</h1>
      <p style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 16px' }}>
        {items.length} non-critical change{items.length === 1 ? '' : 's'} detected for {orgName} in
        the last 24 hours.
      </p>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: 13 }}>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={{ borderTop: `1px solid ${colors.border}`, padding: '10px 0' }}>
                <span style={{ color: severityColor(item.severity), fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                  {item.severity}
                </span>{' '}
                <strong>{CHANGE_TYPE_LABELS[item.changeType] ?? item.changeType}</strong>
                <br />
                <span style={{ color: colors.muted }}>
                  {item.pageLabel} · {item.summary} · {item.detectedAt}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: '20px 0 0' }}>
        <a href={dashboardUrl} style={buttonStyle}>
          Open dashboard
        </a>
      </p>
    </Shell>
  );
}

export async function renderDailyDigestEmail(props: DailyDigestProps) {
  const element = <DailyDigest {...props} />;
  return {
    subject: `[ScriptProof] Daily digest: ${props.items.length} change${props.items.length === 1 ? '' : 's'}`,
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}
