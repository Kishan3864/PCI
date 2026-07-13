import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface Mailer {
  send(input: SendEmailInput): Promise<void>;
}

export interface MailerConfig {
  /** 'resend' for production, 'smtp' for local dev (Mailhog). */
  provider: 'resend' | 'smtp';
  from: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
}

class ResendMailer implements Mailer {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(input: SendEmailInput): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  }
}

class SmtpMailer implements Mailer {
  private readonly transport: nodemailer.Transporter;

  constructor(
    host: string,
    port: number,
    private readonly from: string,
  ) {
    this.transport = nodemailer.createTransport({ host, port, secure: false });
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}

export function createMailer(config: MailerConfig): Mailer {
  if (config.provider === 'resend') {
    if (!config.resendApiKey) throw new Error('RESEND_API_KEY is required when EMAIL_PROVIDER=resend');
    return new ResendMailer(config.resendApiKey, config.from);
  }
  return new SmtpMailer(config.smtpHost ?? 'localhost', config.smtpPort ?? 1025, config.from);
}

/** Builds a mailer from standard env vars (see .env.example). */
export function createMailerFromEnv(env: NodeJS.ProcessEnv = process.env): Mailer {
  return createMailer({
    provider: env.EMAIL_PROVIDER === 'resend' ? 'resend' : 'smtp',
    from: env.EMAIL_FROM ?? 'ScriptProof <notify@scriptproof.local>',
    resendApiKey: env.RESEND_API_KEY,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT ? Number(env.SMTP_PORT) : undefined,
  });
}
